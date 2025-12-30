// app/api/auth/mv1001sendotp/route.ts - IMPROVED VERSION
import { NextRequest } from 'next/server';
import { getDatabase, generateOTP, hashOTP } from '@/lib/database';
import { emailService } from '@/lib/email-service';
import { registrationSchema } from '@/lib/schemas/authSchemas';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registrationSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return sendResponse(ApiResponse.validationError(errors), 400);
    }

    const { contact, method } = validation.data;
    const db = await getDatabase();

    // Check if contact is email or phone
    const isEmail = contact.includes('@');
    const contactType = isEmail ? 'email' : 'phone';
    const contactValue = isEmail ? contact.toLowerCase() : contact.replace(/\D/g, '');

    // Only support email for now
    if (!isEmail) {
      return sendResponse(
        ApiResponse.error('Please use email address for registration'),
        400
      );
    }

    // Check if user already exists with retry logic
    let existingUser;
    try {
      existingUser = await db.get(
        'SELECT mv_ut_id FROM MV_UT_USERS WHERE mv_ut_email = ?', 
        [contactValue]
      );
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Retry once
      await new Promise(resolve => setTimeout(resolve, 100));
      existingUser = await db.get(
        'SELECT mv_ut_id FROM MV_UT_USERS WHERE mv_ut_email = ?', 
        [contactValue]
      );
    }

    if (existingUser) {
      return sendResponse(
        ApiResponse.conflict('User with this email already exists. Please login instead.'),
        409
      );
    }

    // Generate OTP
    const otp = generateOTP(6);
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store registration attempt
    const registrationAttempt = await db.run(
      `INSERT INTO MV_RA_REGATTEMPTS (
        mv_ra_email, mv_ra_verification_sent, 
        mv_ra_verification_method, mv_ra_status
      ) VALUES (?, ?, ?, ?)`,
      [contactValue, 1, method, 'in_progress']
    );

    // Store OTP in database
    await db.run(
      `INSERT INTO MV_OTP_VERIFICATIONS (
        mv_otp_contact_type, mv_otp_contact_value, mv_otp_code_hash,
        mv_otp_purpose, mv_otp_expires_at
      ) VALUES (?, ?, ?, ?, ?)`,
      [contactType, contactValue, otpHash, 'registration', expiresAt.toISOString()]
    );

    // Send OTP via Email
    try {
      const emailSent = await emailService.sendOTP(contactValue, otp, 'registration');
      
      if (!emailSent) {
        // Clean up if email fails
        await db.run('DELETE FROM MV_OTP_VERIFICATIONS WHERE mv_otp_contact_value = ?', [contactValue]);
        await db.run('DELETE FROM MV_RA_REGATTEMPTS WHERE mv_ra_email = ?', [contactValue]);
        
        return sendResponse(
          ApiResponse.error('Failed to send OTP email. Please check your email address.'),
          500
        );
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return sendResponse(
        ApiResponse.error('Email service temporarily unavailable. Please try again.'),
        503
      );
    }

    return sendResponse(
      ApiResponse.success('OTP sent successfully to your email', {
        registrationId: registrationAttempt.lastID,
        contactType,
        // In development only - remove in production
        ...(process.env.NODE_ENV === 'development' && { debugOtp: otp })
      }),
      200
    );

  } catch (error: any) {
    console.error('Send OTP error:', error);
    
    // Specific handling for SQLITE_BUSY
    if (error.code === 'SQLITE_BUSY') {
      return sendResponse(
        ApiResponse.error('System is busy. Please try again in a moment.'),
        429
      );
    }
    
    return sendResponse(
      ApiResponse.error('Failed to process your request. Please try again.'),
      500
    );
  }
}