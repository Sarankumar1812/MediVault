// lib/auth.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'medivault-super-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export interface DecodedToken {
  mv_ut_id: number;
  mv_ut_email: string | null;
  mv_ut_phone: string | null;
  iat: number;
  exp: number;
}

export interface TokenPayload {
  mv_ut_id: number;
  mv_ut_email: string | null;
  mv_ut_phone: string | null;
}

// Generate JWT Token (Updated with correct parameters)
export function generateToken(userId: number, email: string | null, phone: string | null): string {
  const payload: TokenPayload = {
    mv_ut_id: userId,
    mv_ut_email: email,
    mv_ut_phone: phone
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Generate Refresh Token
export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

// Hash token for storage
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Verify JWT Token
export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Extract user ID from token (Added this function)
export function extractUserIdFromToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded.mv_ut_id;
  } catch (error) {
    return null;
  }
}

// Extract email from token (Keep existing)
export function extractEmailFromToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded.mv_ut_email;
  } catch (error) {
    return null;
  }
}

// Frontend token management
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('medivault-token') || 
                sessionStorage.getItem('medivault-token');
  return token;
}

export function setAuthToken(token: string, remember = true): void {
  if (typeof window === 'undefined') return;
  
  if (remember) {
    localStorage.setItem('medivault-token', token);
  } else {
    sessionStorage.setItem('medivault-token', token);
  }
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('medivault-token');
  sessionStorage.removeItem('medivault-token');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}