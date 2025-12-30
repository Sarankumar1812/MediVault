// app/api/profile/mv1005getprofile/route.ts
import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { verifyToken, extractUserIdFromToken } from '@/lib/auth';

export const runtime = "nodejs";


export async function GET(request: NextRequest) {
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

    const db = await getDatabase();

    // Get user profile with individual details
    const userProfile = await db.get(
      `SELECT 
        u.mv_ut_id, u.mv_ut_email, u.mv_ut_phone, u.mv_ut_account_status,
        i.mv_id_first_name, i.mv_id_last_name, i.mv_id_date_of_birth,
        i.mv_id_gender, i.mv_id_blood_group, i.mv_id_profile_picture_url,
        i.mv_id_is_complete, i.mv_id_created_at
       FROM MV_UT_USERS u
       LEFT JOIN MV_ID_INDIVIDUALS i ON u.mv_ut_id = i.mv_id_user_id
       WHERE u.mv_ut_id = ? AND u.mv_ut_deleted_at IS NULL`,
      [userId]
    );

    if (!userProfile) {
      return sendResponse(ApiResponse.notFound('User not found'), 404);
    }

    // Remove sensitive data
    const { mv_ut_password_hash, ...safeProfile } = userProfile;

    return sendResponse(
      ApiResponse.success('Profile retrieved successfully', {
        profile: safeProfile
      }),
      200
    );

  } catch (error) {
    console.error('Get profile error:', error);
    return sendResponse(
      ApiResponse.error('Failed to fetch profile'),
      500
    );
  }
}