// app/api/auth/mv1006login/route.ts
import { NextRequest } from 'next/server';
import { getDatabase, getUserByEmail } from '@/lib/database';
import { contactMethodSchema } from '@/lib/schemas/authSchemas';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';

export const runtime = "nodejs";


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
        ApiResponse.error('Please use email address for login'),
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
        ApiResponse.error(`Your account is ${user.mv_ut_account_status}. Please contact support.`),
        403
      );
    }

    // TODO: Send OTP via email service
    console.log(`Login OTP would be sent to: ${contactValue}`);
    
    return sendResponse(
      ApiResponse.success('OTP sent to your email', {
        email: contactValue,
        userId: user.mv_ut_id,
        requiresOTP: true
      }),
      200
    );

  } catch (error) {
    console.error('Login OTP error:', error);
    return sendResponse(
      ApiResponse.error('Failed to process login request'),
      500
    );
  }
}