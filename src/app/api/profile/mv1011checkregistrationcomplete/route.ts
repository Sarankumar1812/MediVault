// app/api/profile/mv1011checkregistrationcomplete/route.ts
import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/database';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { extractUserIdFromToken } from '@/lib/auth';

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

    // Check individual profile completion
    const individualProfile = await db.get(
      'SELECT mv_id_is_complete FROM MV_ID_INDIVIDUALS WHERE mv_id_user_id = ?',
      [userId]
    );

    // Check health profile completion
    const healthProfile = await db.get(
      'SELECT mv_hp_id FROM MV_HP_HEALTHPROFILES WHERE mv_hp_user_id = ?',
      [userId]
    );

    const isIndividualComplete = individualProfile?.mv_id_is_complete === 1;
    const isHealthProfileComplete = !!healthProfile;
    const isRegistrationComplete = isIndividualComplete && isHealthProfileComplete;

    return sendResponse(
      ApiResponse.success('Registration status retrieved', {
        isRegistrationComplete,
        isIndividualComplete,
        isHealthProfileComplete,
        completedSteps: {
          basicProfile: isIndividualComplete,
          healthProfile: isHealthProfileComplete
        },
        nextStep: !isHealthProfileComplete ? 'healthProfile' : 'dashboard'
      }),
      200
    );

  } catch (error) {
    console.error('Check registration complete error:', error);
    return sendResponse(
      ApiResponse.error('Failed to check registration status'),
      500
    );
  }
}