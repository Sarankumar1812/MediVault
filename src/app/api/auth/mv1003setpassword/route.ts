// app/api/auth/mv1003setpassword/route.ts
import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { passwordSchema } from '@/lib/schemas/authSchemas';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { verifyToken, extractUserIdFromToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Check for token in header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(ApiResponse.unauthorized(), 401);
    }

    const token = authHeader.split(' ')[1];
    const userId = extractUserIdFromToken(token);

    if (!userId) {
      return sendResponse(ApiResponse.unauthorized('Invalid token'), 401);
    }

    const body = await request.json();
    const validation = passwordSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return sendResponse(ApiResponse.validationError(errors), 400);
    }

    const { password } = validation.data;
    const db = await getDatabase();

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user with password
    await db.run(
      'UPDATE MV_UT_USERS SET mv_ut_password_hash = ? WHERE mv_ut_id = ?',
      [passwordHash, userId]
    );

    return sendResponse(
      ApiResponse.success('Password set successfully'),
      200
    );

  } catch (error) {
    console.error('Set password error:', error);
    return sendResponse(
      ApiResponse.error('Failed to set password'),
      500
    );
  }
}