// app/api/auth/mv1007sendloginotp/route.ts
import { NextRequest } from 'next/server';
import { getDatabase, generateOTP, hashOTP, getUserByEmail } from '@/lib/database';
import { emailService } from '@/lib/email-service';
import { contactMethodSchema } from '@/lib/schemas/authSchemas';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = contactMethodSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return sendResponse(ApiResponse.validationError(errors), 400);
    }

    const { contact } = validation.data;
    const db = await getDatabase();

    // Check if contact is email
    const isEmail = contact.includes('@');
    if (!isEmail) {
      return sendResponse(
        ApiResponse.error('Please use email address'),
        400
      );
    }

    const contactValue = contact.toLowerCase();
    
    // Check if user exists
    const user = await getUserByEmail(contactValue);

    if (!user) {
      return sendResponse(
        ApiResponse.error('No account found with this email. Please sign up first.'),
        404
      );
    }

    // Check account status
    if (user.mv_ut_account_status !== 'active') {
      return sendResponse(
        ApiResponse.error(`Account is ${user.mv_ut_account_status}`),
        403
      );
    }

    // Generate OTP
    const otp = generateOTP(6);
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await db.run(
      `INSERT INTO MV_OTP_VERIFICATIONS (
        mv_otp_user_id, mv_otp_contact_type, mv_otp_contact_value, mv_otp_code_hash,
        mv_otp_purpose, mv_otp_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.mv_ut_id,
        'email',
        contactValue,
        otpHash,
        'login',
        expiresAt.toISOString()
      ]
    );

    // Send OTP via Email
    try {
      const emailSent = await emailService.sendOTP(contactValue, otp, 'login');
      
      if (!emailSent) {
        return sendResponse(
          ApiResponse.error('Failed to send OTP email. Please try again.'),
          500
        );
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return sendResponse(
        ApiResponse.error('Email service temporarily unavailable. Please try again later.'),
        503
      );
    }

    return sendResponse(
      ApiResponse.success('Login OTP sent successfully', {
        email: contactValue,
        userId: user.mv_ut_id,
        // In development only - remove in production
        ...(process.env.NODE_ENV === 'development' && { debugOtp: otp })
      }),
      200
    );

  } catch (error) {
    console.error('Send login OTP error:', error);
    return sendResponse(
      ApiResponse.error('Failed to send OTP'),
      500
    );
  }
}