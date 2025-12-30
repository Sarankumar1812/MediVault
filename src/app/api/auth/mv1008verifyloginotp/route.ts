// app/api/auth/mv1008verifyloginotp/route.ts
import { NextRequest } from 'next/server';
import { getDatabase, verifyOTP } from '@/lib/database';
import { otpVerificationSchema } from '@/lib/schemas/authSchemas';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { generateToken, hashToken } from '@/lib/auth';

export const runtime = "nodejs";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = otpVerificationSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return sendResponse(ApiResponse.validationError(errors), 400);
    }

    const { contact, otp } = validation.data;
    const db = await getDatabase();

    // Check if contact is email
    const isEmail = contact.includes('@');
    const contactValue = isEmail ? contact.toLowerCase() : contact.replace(/\D/g, '');

    // Find valid OTP for login
    const otpRecord = await db.get(
      `SELECT mv_otp_id, mv_otp_code_hash, mv_otp_is_used, mv_otp_expires_at, mv_otp_user_id
       FROM MV_OTP_VERIFICATIONS 
       WHERE mv_otp_contact_value = ? 
       AND mv_otp_purpose = 'login'
       AND mv_otp_is_used = 0
       AND mv_otp_expires_at > datetime('now')
       ORDER BY mv_otp_created_at DESC LIMIT 1`,
      [contactValue]
    );

    if (!otpRecord) {
      return sendResponse(
        ApiResponse.error('Invalid or expired OTP. Please request a new one.'),
        400
      );
    }

    // Verify OTP
    const isValid = verifyOTP(otp, otpRecord.mv_otp_code_hash);
    if (!isValid) {
      return sendResponse(
        ApiResponse.error('Invalid OTP. Please check and try again.'),
        400
      );
    }

    // Mark OTP as used
    await db.run(
      'UPDATE MV_OTP_VERIFICATIONS SET mv_otp_is_used = 1 WHERE mv_otp_id = ?',
      [otpRecord.mv_otp_id]
    );

    // Get user details
    const user = await db.get(
      'SELECT mv_ut_id, mv_ut_email, mv_ut_phone FROM MV_UT_USERS WHERE mv_ut_id = ?',
      [otpRecord.mv_otp_user_id]
    );

    if (!user) {
      return sendResponse(
        ApiResponse.error('User not found'),
        404
      );
    }

    // Generate JWT token
    const token = generateToken(
      user.mv_ut_id,
      user.mv_ut_email,
      user.mv_ut_phone
    );

    // Create session
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.run(
      `INSERT INTO MV_SM_SESSIONS (
        mv_sm_user_id, mv_sm_token_hash, mv_sm_ip_address,
        mv_sm_device_info, mv_sm_expires_at
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        user.mv_ut_id,
        tokenHash,
        request.headers.get('x-forwarded-for') || null,
        request.headers.get('user-agent') || null,
        expiresAt.toISOString()
      ]
    );

    // Check if profile is complete
    const profile = await db.get(
      'SELECT mv_id_is_complete FROM MV_ID_INDIVIDUALS WHERE mv_id_user_id = ?',
      [user.mv_ut_id]
    );

    return sendResponse(
      ApiResponse.success('Login successful', {
        token,
        userId: user.mv_ut_id,
        email: user.mv_ut_email,
        profileComplete: profile?.mv_id_is_complete || false,
        requiresProfileCompletion: !profile?.mv_id_is_complete
      }),
      200
    );

  } catch (error) {
    console.error('Verify login OTP error:', error);
    return sendResponse(
      ApiResponse.error('Failed to verify OTP'),
      500
    );
  }
}