// app/api/profile/mv1004completeprofile/route.ts
import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { fullProfileSchema } from '@/lib/schemas/authSchemas';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { verifyToken, extractUserIdFromToken } from '@/lib/auth';

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
    const validation = fullProfileSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return sendResponse(ApiResponse.validationError(errors), 400);
    }

    const { firstName, lastName, phone, dateOfBirth, gender, privacyAccepted } = validation.data;
    const db = await getDatabase();

    // Check if individual profile already exists
    const existingProfile = await db.get(
      'SELECT mv_id_id FROM MV_ID_INDIVIDUALS WHERE mv_id_user_id = ?',
      [userId]
    );

    // Update user phone if provided
    if (phone) {
      // Check if phone is already used by another user
      const phoneUser = await db.get(
        'SELECT mv_ut_id FROM MV_UT_USERS WHERE mv_ut_phone = ? AND mv_ut_id != ?',
        [phone, userId]
      );

      if (phoneUser) {
        return sendResponse(
          ApiResponse.conflict('Phone number already registered with another account'),
          409
        );
      }

      await db.run(
        'UPDATE MV_UT_USERS SET mv_ut_phone = ?, mv_ut_is_phone_verified = 1 WHERE mv_ut_id = ?',
        [phone, userId]
      );
    }

    if (existingProfile) {
      // Update existing profile
      await db.run(
        `UPDATE MV_ID_INDIVIDUALS 
         SET mv_id_first_name = ?, mv_id_last_name = ?, mv_id_date_of_birth = ?, 
             mv_id_gender = ?, mv_id_is_complete = 1, mv_id_updated_at = datetime('now')
         WHERE mv_id_user_id = ?`,
        [firstName, lastName, dateOfBirth || null, gender || null, userId]
      );
    } else {
      // Create new profile
      await db.run(
        `INSERT INTO MV_ID_INDIVIDUALS (
          mv_id_user_id, mv_id_first_name, mv_id_last_name, 
          mv_id_date_of_birth, mv_id_gender, mv_id_is_complete
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, firstName, lastName, dateOfBirth || null, gender || null, 1]
      );
    }

    // Get updated user profile
    const userProfile = await db.get(
      `SELECT 
        u.mv_ut_email, u.mv_ut_phone,
        i.mv_id_first_name, i.mv_id_last_name, i.mv_id_date_of_birth,
        i.mv_id_gender, i.mv_id_is_complete
       FROM MV_UT_USERS u
       LEFT JOIN MV_ID_INDIVIDUALS i ON u.mv_ut_id = i.mv_id_user_id
       WHERE u.mv_ut_id = ?`,
      [userId]
    );

    return sendResponse(
      ApiResponse.success('Profile completed successfully', {
        profile: userProfile,
        isProfileComplete: true
      }),
      200
    );

  } catch (error) {
    console.error('Complete profile error:', error);
    return sendResponse(
      ApiResponse.error('Failed to complete profile'),
      500
    );
  }
}