// app/api/auth/mv1002verifyotp/route.ts - UPDATED
import { NextRequest } from 'next/server';
import { getDatabase, verifyOTP } from '@/lib/database';
import { otpVerificationSchema } from '@/lib/schemas/authSchemas';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { generateToken } from '@/lib/auth';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the incoming data for debugging
    console.log('Verify OTP request data:', body);
    
    const validation = otpVerificationSchema.safeParse(body);

    if (!validation.success) {
      console.log('Validation errors:', validation.error.flatten().fieldErrors);
      const errors = validation.error.flatten().fieldErrors;
      return sendResponse(ApiResponse.validationError(errors), 400);
    }

    const { contact, otp, registrationId } = validation.data;
    const db = await getDatabase();

    // Check if contact is email or phone
    const isEmail = contact.includes('@');
    const contactValue = isEmail ? contact.toLowerCase() : contact.replace(/\D/g, '');

    // Find valid OTP
    const otpRecord = await db.get(
      `SELECT mv_otp_id, mv_otp_code_hash, mv_otp_is_used, mv_otp_expires_at 
       FROM MV_OTP_VERIFICATIONS 
       WHERE mv_otp_contact_value = ? 
       AND mv_otp_purpose = 'registration'
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

    // Create user with minimal information
    const userResult = await db.run(
      `INSERT INTO MV_UT_USERS (
        mv_ut_email, mv_ut_phone, mv_ut_account_status,
        mv_ut_is_email_verified, mv_ut_is_phone_verified
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        isEmail ? contactValue : null,
        !isEmail ? contactValue : null,
        'active',
        isEmail ? 1 : 0,
        !isEmail ? 1 : 0
      ]
    );

    const userId = userResult.lastID;
    
    if (!userId) {
      return sendResponse(
        ApiResponse.error('Failed to create user account'),
        500
      );
    }

    // Update registration attempt if registrationId exists
    if (registrationId) {
      try {
        // Convert registrationId to number for database query
        const regId = Number(registrationId);
        if (!isNaN(regId)) {
          await db.run(
            `UPDATE MV_RA_REGATTEMPTS 
             SET mv_ra_status = 'completed', mv_ra_completed_at = datetime('now')
             WHERE mv_ra_id = ?`,
            [regId]
          );
        }
      } catch (updateError) {
        console.error('Failed to update registration attempt:', updateError);
        // Continue even if this fails - it's not critical
      }
    }

    // Generate JWT token with correct parameters
    const token = generateToken(
      userId,
      isEmail ? contactValue : null,
      !isEmail ? contactValue : null
    );

    // Send welcome email asynchronously (don't wait for it)
    if (isEmail) {
      emailService.sendWelcomeEmail(contactValue, 'User')
        .then(success => {
          if (success) {
            console.log(`✅ Welcome email sent to ${contactValue}`);
          } else {
            console.log(`❌ Failed to send welcome email to ${contactValue}`);
          }
        })
        .catch(error => {
          console.error('Error sending welcome email:', error);
        });
    }

    return sendResponse(
      ApiResponse.success('OTP verified successfully', {
        token,
        userId,
        contactType: isEmail ? 'email' : 'phone',
        requiresProfileCompletion: true
      }),
      200
    );

  } catch (error) {
    console.error('Verify OTP error:', error);
    return sendResponse(
      ApiResponse.error('Failed to verify OTP'),
      500
    );
  }
}