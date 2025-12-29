// lib/database.ts - COMPLETE VERSION
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Database interface types
export interface MVUser {
  mv_ut_id: number;
  mv_ut_email: string | null;
  mv_ut_phone: string | null;
  mv_ut_password_hash: string | null;
  mv_ut_account_status: 'pending' | 'active' | 'suspended' | 'deactivated';
  mv_ut_is_email_verified: boolean;
  mv_ut_is_phone_verified: boolean;
  mv_ut_failed_attempts: number;
  mv_ut_locked_until: string | null;
  mv_ut_created_at: string;
  mv_ut_updated_at: string;
  mv_ut_deleted_at: string | null;
}

export interface MVIndividual {
  mv_id_id: number;
  mv_id_user_id: number;
  mv_id_first_name: string;
  mv_id_last_name: string;
  mv_id_date_of_birth: string | null;
  mv_id_gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  mv_id_blood_group: string | null;
  mv_id_emergency_contact_name: string | null;
  mv_id_emergency_contact_phone: string | null;
  mv_id_profile_picture_url: string | null;
  mv_id_is_complete: boolean;
  mv_id_created_at: string;
  mv_id_updated_at: string;
}

export interface MVOTPVerification {
  mv_otp_id: number;
  mv_otp_user_id: number | null;
  mv_otp_contact_type: 'email' | 'phone';
  mv_otp_contact_value: string;
  mv_otp_code_hash: string;
  mv_otp_purpose: 'registration' | 'login' | 'password_reset' | 'email_verification' | 'phone_verification';
  mv_otp_is_used: boolean;
  mv_otp_expires_at: string;
  mv_otp_created_at: string;
}

export interface MVSession {
  mv_sm_id: number;
  mv_sm_user_id: number;
  mv_sm_token_hash: string;
  mv_sm_device_info: string | null;
  mv_sm_ip_address: string | null;
  mv_sm_expires_at: string;
  mv_sm_revoked_at: string | null;
  mv_sm_created_at: string;
}

export interface MVRegistrationAttempt {
  mv_ra_id: number;
  mv_ra_email: string | null;
  mv_ra_phone: string | null;
  mv_ra_country_code: string | null;
  mv_ra_ip_address: string | null;
  mv_ra_user_agent: string | null;
  mv_ra_status: 'in_progress' | 'completed' | 'abandoned' | 'blocked';
  mv_ra_verification_sent: boolean;
  mv_ra_verification_method: string | null;
  mv_ra_created_at: string;
  mv_ra_completed_at: string | null;
}

export interface MVHealthProfile {
  mv_hp_id: number;
  mv_hp_user_id: number;
  mv_hp_height: number;
  mv_hp_weight: number;
  mv_hp_blood_group: string;
  mv_hp_conditions: string | null;
  mv_hp_allergies: string | null;
  mv_hp_chronic_illnesses: string | null;
  mv_hp_emergency_contact_name: string;
  mv_hp_emergency_contact_phone: string;
  mv_hp_created_at: string;
  mv_hp_updated_at: string;
}

export interface MVVital {
  mv_vt_id: number;
  mv_vt_user_id: number;
  mv_vt_type: string; // 'heart-rate', 'blood-pressure', etc.
  mv_vt_value_systolic: number | null;
  mv_vt_value_diastolic: number | null;
  mv_vt_value_numeric: number | null;
  mv_vt_unit: string;
  mv_vt_note: string | null;
  mv_vt_recorded_at: string;
  mv_vt_created_at: string;
}

// ============ OTP UTILITY FUNCTIONS ============

// Helper function to generate OTP
export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

// Helper function to hash OTP
export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// Helper function to verify OTP
export function verifyOTP(inputOTP: string, hashedOTP: string): boolean {
  const inputHash = crypto.createHash('sha256').update(inputOTP).digest('hex');
  return inputHash === hashedOTP;
}


// Get health profile by user ID
export async function getHealthProfileByUserId(userId: number): Promise<MVHealthProfile | null> {
  const db = await getDatabase();
  const profile = await db.get<MVHealthProfile>(
    'SELECT * FROM MV_HP_HEALTHPROFILES WHERE mv_hp_user_id = ?',
    [userId]
  );
  return profile || null;
}

// Create or update health profile
export async function saveHealthProfile(
  userId: number,
  profileData: {
    height: number;
    weight: number;
    bloodGroup: string;
    conditions?: string;
    allergies?: string;
    chronicIllnesses?: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  }
): Promise<number> {
  const db = await getDatabase();
  
  // Check if profile exists
  const existingProfile = await getHealthProfileByUserId(userId);
  
  if (existingProfile) {
    // Update existing profile
    const result = await db.run(
      `UPDATE MV_HP_HEALTHPROFILES 
       SET mv_hp_height = ?, mv_hp_weight = ?, mv_hp_blood_group = ?,
           mv_hp_conditions = ?, mv_hp_allergies = ?, mv_hp_chronic_illnesses = ?,
           mv_hp_emergency_contact_name = ?, mv_hp_emergency_contact_phone = ?,
           mv_hp_updated_at = datetime('now')
       WHERE mv_hp_user_id = ?`,
      [
        profileData.height,
        profileData.weight,
        profileData.bloodGroup,
        profileData.conditions || null,
        profileData.allergies || null,
        profileData.chronicIllnesses || null,
        profileData.emergencyContactName,
        profileData.emergencyContactPhone,
        userId
      ]
    );
    return existingProfile.mv_hp_id;
  } else {
    // Create new profile
    const result = await db.run(
      `INSERT INTO MV_HP_HEALTHPROFILES 
       (mv_hp_user_id, mv_hp_height, mv_hp_weight, mv_hp_blood_group,
        mv_hp_conditions, mv_hp_allergies, mv_hp_chronic_illnesses,
        mv_hp_emergency_contact_name, mv_hp_emergency_contact_phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        profileData.height,
        profileData.weight,
        profileData.bloodGroup,
        profileData.conditions || null,
        profileData.allergies || null,
        profileData.chronicIllnesses || null,
        profileData.emergencyContactName,
        profileData.emergencyContactPhone
      ]
    );
    return result.lastID!;
  }
}

// Delete health profile
export async function deleteHealthProfile(userId: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.run(
    'DELETE FROM MV_HP_HEALTHPROFILES WHERE mv_hp_user_id = ?',
    [userId]
  );
  return result.changes ? result.changes > 0 : false;
}
// ============ DATABASE CONNECTION ============

let db: Database | null = null;
let dbPromise: Promise<Database> | null = null;

export async function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const database = await open({
        filename: path.join(process.cwd(), 'medivault.db'),
        driver: sqlite3.Database,
        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX
      });
      
      // Enable foreign keys and WAL mode for better concurrency
      await database.exec('PRAGMA foreign_keys = ON');
      await database.exec('PRAGMA journal_mode = WAL');
      await database.exec('PRAGMA busy_timeout = 5000');
      await database.exec('PRAGMA synchronous = NORMAL');
      
      // Create tables if they don't exist
      await createTables(database);
      
      db = database;
      return database;
    })();
  }
  
  return dbPromise;
}

async function createTables(database: Database) {
  // Create MV_UT_USERS table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS MV_UT_USERS (
      mv_ut_id INTEGER PRIMARY KEY AUTOINCREMENT,
      mv_ut_email TEXT UNIQUE,
      mv_ut_phone TEXT UNIQUE,
      mv_ut_password_hash TEXT,
      mv_ut_account_status TEXT DEFAULT 'pending' 
        CHECK(mv_ut_account_status IN ('pending', 'active', 'suspended', 'deactivated')),
      mv_ut_is_email_verified BOOLEAN DEFAULT 0,
      mv_ut_is_phone_verified BOOLEAN DEFAULT 0,
      mv_ut_failed_attempts INTEGER DEFAULT 0,
      mv_ut_locked_until DATETIME,
      mv_ut_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      mv_ut_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      mv_ut_deleted_at DATETIME,
      CHECK(mv_ut_email IS NOT NULL OR mv_ut_phone IS NOT NULL)
    )
  `);

  // Create MV_ID_INDIVIDUALS table with FOREIGN KEY to MV_UT_USERS
  await database.exec(`
    CREATE TABLE IF NOT EXISTS MV_ID_INDIVIDUALS (
      mv_id_id INTEGER PRIMARY KEY AUTOINCREMENT,
      mv_id_user_id INTEGER NOT NULL UNIQUE,
      mv_id_first_name TEXT NOT NULL,
      mv_id_last_name TEXT NOT NULL,
      mv_id_date_of_birth DATE,
      mv_id_gender TEXT CHECK(mv_id_gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
      mv_id_blood_group TEXT,
      mv_id_emergency_contact_name TEXT,
      mv_id_emergency_contact_phone TEXT,
      mv_id_profile_picture_url TEXT,
      mv_id_is_complete BOOLEAN DEFAULT 0,
      mv_id_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      mv_id_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mv_id_user_id) REFERENCES MV_UT_USERS(mv_ut_id) ON DELETE CASCADE
    )
  `);

  // Create MV_OTP_VERIFICATIONS table with FOREIGN KEY to MV_UT_USERS
  await database.exec(`
    CREATE TABLE IF NOT EXISTS MV_OTP_VERIFICATIONS (
      mv_otp_id INTEGER PRIMARY KEY AUTOINCREMENT,
      mv_otp_user_id INTEGER,
      mv_otp_contact_type TEXT NOT NULL CHECK(mv_otp_contact_type IN ('email', 'phone')),
      mv_otp_contact_value TEXT NOT NULL,
      mv_otp_code_hash TEXT NOT NULL,
      mv_otp_purpose TEXT NOT NULL 
        CHECK(mv_otp_purpose IN ('registration', 'login', 'password_reset', 'email_verification', 'phone_verification')),
      mv_otp_is_used BOOLEAN DEFAULT 0,
      mv_otp_expires_at DATETIME NOT NULL,
      mv_otp_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mv_otp_user_id) REFERENCES MV_UT_USERS(mv_ut_id) ON DELETE CASCADE
    )
  `);

  // Create MV_SM_SESSIONS table with FOREIGN KEY to MV_UT_USERS
  await database.exec(`
    CREATE TABLE IF NOT EXISTS MV_SM_SESSIONS (
      mv_sm_id INTEGER PRIMARY KEY AUTOINCREMENT,
      mv_sm_user_id INTEGER NOT NULL,
      mv_sm_token_hash TEXT NOT NULL UNIQUE,
      mv_sm_device_info TEXT,
      mv_sm_ip_address TEXT,
      mv_sm_expires_at DATETIME NOT NULL,
      mv_sm_revoked_at DATETIME,
      mv_sm_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mv_sm_user_id) REFERENCES MV_UT_USERS(mv_ut_id) ON DELETE CASCADE
    )
  `);

  // Create MV_RA_REGATTEMPTS table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS MV_RA_REGATTEMPTS (
      mv_ra_id INTEGER PRIMARY KEY AUTOINCREMENT,
      mv_ra_email TEXT,
      mv_ra_phone TEXT,
      mv_ra_country_code TEXT,
      mv_ra_ip_address TEXT,
      mv_ra_user_agent TEXT,
      mv_ra_status TEXT DEFAULT 'in_progress' 
        CHECK(mv_ra_status IN ('in_progress', 'completed', 'abandoned', 'blocked')),
      mv_ra_verification_sent BOOLEAN DEFAULT 0,
      mv_ra_verification_method TEXT,
      mv_ra_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      mv_ra_completed_at DATETIME
    )
  `);

  await database.exec(`
  CREATE TABLE IF NOT EXISTS MV_HP_HEALTHPROFILES (
    mv_hp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mv_hp_user_id INTEGER NOT NULL UNIQUE,
    mv_hp_height REAL NOT NULL,
    mv_hp_weight REAL NOT NULL,
    mv_hp_blood_group TEXT NOT NULL,
    mv_hp_conditions TEXT,
    mv_hp_allergies TEXT,
    mv_hp_chronic_illnesses TEXT,
    mv_hp_emergency_contact_name TEXT NOT NULL,
    mv_hp_emergency_contact_phone TEXT NOT NULL,
    mv_hp_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    mv_hp_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mv_hp_user_id) REFERENCES MV_UT_USERS(mv_ut_id) ON DELETE CASCADE
  )
`);

await database.exec(`
  CREATE TABLE IF NOT EXISTS MV_VT_VITALS (
    mv_vt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mv_vt_user_id INTEGER NOT NULL,
    mv_vt_type TEXT NOT NULL CHECK(mv_vt_type IN (
      'heart-rate', 
      'blood-pressure', 
      'blood-sugar', 
      'weight', 
      'temperature'
    )),
    mv_vt_value_systolic REAL,
    mv_vt_value_diastolic REAL,
    mv_vt_value_numeric REAL,
    mv_vt_unit TEXT NOT NULL,
    mv_vt_note TEXT,
    mv_vt_recorded_at DATETIME NOT NULL,
    mv_vt_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mv_vt_user_id) REFERENCES MV_UT_USERS(mv_ut_id) ON DELETE CASCADE
  )
`);

  // Create indexes for better performance
  await database.exec(`
    CREATE INDEX IF NOT EXISTS idx_mv_ut_email ON MV_UT_USERS(mv_ut_email);
    CREATE INDEX IF NOT EXISTS idx_mv_ut_phone ON MV_UT_USERS(mv_ut_phone);
    CREATE INDEX IF NOT EXISTS idx_mv_ut_status ON MV_UT_USERS(mv_ut_account_status);
    CREATE INDEX IF NOT EXISTS idx_mv_id_user_id ON MV_ID_INDIVIDUALS(mv_id_user_id);
    CREATE INDEX IF NOT EXISTS idx_mv_otp_contact ON MV_OTP_VERIFICATIONS(mv_otp_contact_value, mv_otp_purpose);
    CREATE INDEX IF NOT EXISTS idx_mv_otp_expiry ON MV_OTP_VERIFICATIONS(mv_otp_expires_at);
    CREATE INDEX IF NOT EXISTS idx_mv_sm_user ON MV_SM_SESSIONS(mv_sm_user_id);
    CREATE INDEX IF NOT EXISTS idx_mv_sm_token ON MV_SM_SESSIONS(mv_sm_token_hash);
    CREATE INDEX IF NOT EXISTS idx_mv_sm_expiry ON MV_SM_SESSIONS(mv_sm_expires_at);
    CREATE INDEX IF NOT EXISTS idx_mv_hp_user_id ON MV_HP_HEALTHPROFILES(mv_hp_user_id);
    CREATE INDEX IF NOT EXISTS idx_mv_vt_user_id_type ON MV_VT_VITALS(mv_vt_user_id, mv_vt_type);
    CREATE INDEX IF NOT EXISTS idx_mv_vt_recorded_at ON MV_VT_VITALS(mv_vt_recorded_at);
  `);

  console.log('✅ MediVault Database Schema Initialized');
}



// ============ DATABASE UTILITY FUNCTIONS ============

// Get user by email
export async function getUserByEmail(email: string): Promise<MVUser | null> {
  const db = await getDatabase();
  const user = await db.get<MVUser>('SELECT * FROM MV_UT_USERS WHERE mv_ut_email = ?', [email]);
  return user || null;
}

// Get user by phone
export async function getUserByPhone(phone: string): Promise<MVUser | null> {
  const db = await getDatabase();
  const user = await db.get<MVUser>('SELECT * FROM MV_UT_USERS WHERE mv_ut_phone = ?', [phone]);
  return user || null;
}

// Get user by ID
export async function getUserById(userId: number): Promise<MVUser | null> {
  const db = await getDatabase();
  const user = await db.get<MVUser>('SELECT * FROM MV_UT_USERS WHERE mv_ut_id = ?', [userId]);
  return user || null;
}

// Create new user
export async function createUser(email: string | null, phone: string | null): Promise<number> {
  const db = await getDatabase();
  const result = await db.run(
    `INSERT INTO MV_UT_USERS (mv_ut_email, mv_ut_phone, mv_ut_account_status) 
     VALUES (?, ?, 'active')`,
    [email, phone]
  );
  return result.lastID!;
}

// Create individual profile
export async function createIndividualProfile(
  userId: number,
  firstName: string,
  lastName: string,
  dateOfBirth?: string,
  gender?: string
): Promise<number> {
  const db = await getDatabase();
  const result = await db.run(
    `INSERT INTO MV_ID_INDIVIDUALS 
     (mv_id_user_id, mv_id_first_name, mv_id_last_name, mv_id_date_of_birth, mv_id_gender) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, firstName, lastName, dateOfBirth || null, gender || null]
  );
  return result.lastID!;
}

// Save OTP to database
export async function saveOTP(
  contactType: 'email' | 'phone',
  contactValue: string,
  otpHash: string,
  purpose: 'registration' | 'login' | 'password_reset' | 'email_verification' | 'phone_verification',
  userId?: number
): Promise<number> {
  const db = await getDatabase();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  const result = await db.run(
    `INSERT INTO MV_OTP_VERIFICATIONS 
     (mv_otp_user_id, mv_otp_contact_type, mv_otp_contact_value, mv_otp_code_hash, mv_otp_purpose, mv_otp_expires_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId || null, contactType, contactValue, otpHash, purpose, expiresAt.toISOString()]
  );
  return result.lastID!;
}

// Get valid OTP for verification
export async function getValidOTP(
  contactValue: string,
  purpose: string
): Promise<MVOTPVerification | null> {
  const db = await getDatabase();
  const otp = await db.get<MVOTPVerification>(
    `SELECT * FROM MV_OTP_VERIFICATIONS 
     WHERE mv_otp_contact_value = ? 
     AND mv_otp_purpose = ?
     AND mv_otp_is_used = 0
     AND mv_otp_expires_at > datetime('now')
     ORDER BY mv_otp_created_at DESC LIMIT 1`,
    [contactValue, purpose]
  );
  return otp || null;
}

// Mark OTP as used
export async function markOTPAsUsed(otpId: number): Promise<void> {
  const db = await getDatabase();
  await db.run(
    'UPDATE MV_OTP_VERIFICATIONS SET mv_otp_is_used = 1 WHERE mv_otp_id = ?',
    [otpId]
  );
}

export async function createVital(
  userId: number,
  vitalData: {
    type: string;
    valueSystolic?: number;
    valueDiastolic?: number;
    valueNumeric?: number;
    unit: string;
    note?: string;
    recordedAt: string;
  }
): Promise<number> {
  const db = await getDatabase();
  
  const result = await db.run(
    `INSERT INTO MV_VT_VITALS 
     (mv_vt_user_id, mv_vt_type, mv_vt_value_systolic, 
      mv_vt_value_diastolic, mv_vt_value_numeric, 
      mv_vt_unit, mv_vt_note, mv_vt_recorded_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      vitalData.type,
      vitalData.valueSystolic || null,
      vitalData.valueDiastolic || null,
      vitalData.valueNumeric || null,
      vitalData.unit,
      vitalData.note || null,
      vitalData.recordedAt
    ]
  );
  
  return result.lastID!;
}

export async function getVitalsByUserId(
  userId: number,
  type?: string,
  startDate?: string,
  endDate?: string,
  limit?: number
): Promise<MVVital[]> {
  const db = await getDatabase();
  
  let query = 'SELECT * FROM MV_VT_VITALS WHERE mv_vt_user_id = ?';
  const params: any[] = [userId];
  
  if (type) {
    query += ' AND mv_vt_type = ?';
    params.push(type);
  }
  
  if (startDate) {
    query += ' AND mv_vt_recorded_at >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    query += ' AND mv_vt_recorded_at <= ?';
    params.push(endDate);
  }
  
  query += ' ORDER BY mv_vt_recorded_at DESC';
  
  if (limit) {
    query += ' LIMIT ?';
    params.push(limit);
  }
  
  const vitals = await db.all<MVVital[]>(query, params);
  return vitals;
}

export async function getVitalStats(
  userId: number,
  type: string,
  days: number = 30
): Promise<{
  avg: number;
  min: number;
  max: number;
  count: number;
  recent: MVVital[];
}> {
  const db = await getDatabase();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const vitals = await db.all<MVVital[]>(
    `SELECT * FROM MV_VT_VITALS 
     WHERE mv_vt_user_id = ? 
       AND mv_vt_type = ? 
       AND mv_vt_recorded_at >= ?
     ORDER BY mv_vt_recorded_at DESC`,
    [userId, type, startDate.toISOString()]
  );
  
  if (vitals.length === 0) {
    return { avg: 0, min: 0, max: 0, count: 0, recent: [] };
  }
  
  // Extract numeric values based on type
  const numericValues = vitals.map(v => {
    if (type === 'blood-pressure') {
      return v.mv_vt_value_systolic || 0;
    }
    return v.mv_vt_value_numeric || 0;
  });
  
  const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  
  return {
    avg,
    min,
    max,
    count: vitals.length,
    recent: vitals.slice(0, 7)
  };
}

export async function deleteVital(vitalId: number, userId: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.run(
    'DELETE FROM MV_VT_VITALS WHERE mv_vt_id = ? AND mv_vt_user_id = ?',
    [vitalId, userId]
  );
  return result.changes ? result.changes > 0 : false;
}

// Create session
export async function createSession(
  userId: number,
  tokenHash: string,
  ipAddress?: string,
  deviceInfo?: string
): Promise<number> {
  const db = await getDatabase();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const result = await db.run(
    `INSERT INTO MV_SM_SESSIONS 
     (mv_sm_user_id, mv_sm_token_hash, mv_sm_ip_address, mv_sm_device_info, mv_sm_expires_at) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, tokenHash, ipAddress || null, deviceInfo || null, expiresAt.toISOString()]
  );
  return result.lastID!;
}

// Cleanup functions
export async function cleanupExpiredOTPs(): Promise<void> {
  const db = await getDatabase();
  await db.run(
    "DELETE FROM MV_OTP_VERIFICATIONS WHERE mv_otp_expires_at < datetime('now')"
  );
}

export async function cleanupExpiredSessions(): Promise<void> {
  const db = await getDatabase();
  await db.run(
    "DELETE FROM MV_SM_SESSIONS WHERE mv_sm_expires_at < datetime('now') OR mv_sm_revoked_at IS NOT NULL"
  );
}

export async function cleanupExpiredRegAttempts(): Promise<void> {
  const db = await getDatabase();
  await db.run(
    "DELETE FROM MV_RA_REGATTEMPTS WHERE mv_ra_status = 'in_progress' AND mv_ra_created_at < datetime('now', '-1 hour')"
  );
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    dbPromise = null;
  }
}