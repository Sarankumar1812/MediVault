// app/api/profile/mv1010savehealthprofile/route.ts
import { NextRequest } from 'next/server';
import { saveHealthProfile, getDatabase } from '@/lib/database';
import { healthProfileSchema } from '@/lib/schemas/healthSchemas';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { extractUserIdFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('💾 POST Save Health Profile API called');
    
    // Check for token in header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token');
      return sendResponse(ApiResponse.unauthorized(), 401);
    }

    const token = authHeader.substring(7);
    const userId = extractUserIdFromToken(token);

    if (!userId) {
      console.log('❌ Invalid token - no user ID');
      return sendResponse(ApiResponse.unauthorized('Invalid token'), 401);
    }

    console.log(`✅ User authenticated: ${userId}`);
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('📦 Request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.log('❌ Failed to parse JSON body');
      return sendResponse(ApiResponse.error('Invalid JSON body'), 400);
    }

    // Parse string numbers to actual numbers
    const parsedBody = {
      ...body,
      height: parseFloat(body.height),
      weight: parseFloat(body.weight)
    };

    console.log('🔍 Validating health profile data...');
    
    const validation = healthProfileSchema.safeParse(parsedBody);

    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
      const errors = validation.error.flatten().fieldErrors;
      return sendResponse(ApiResponse.validationError(errors), 400);
    }

    const profileData = validation.data;
    console.log('✅ Validation passed');

    // Save health profile
    console.log('💾 Saving health profile...');
    const profileId = await saveHealthProfile(userId, profileData);
    console.log(`✅ Health profile saved with ID: ${profileId}`);

    // Mark individual profile as complete (if not already)
    const db = await getDatabase();
    await db.run(
      'UPDATE MV_ID_INDIVIDUALS SET mv_id_is_complete = 1 WHERE mv_id_user_id = ?',
      [userId]
    );
    
    console.log('✅ Individual profile marked as complete');

    return sendResponse(
      ApiResponse.success('Health profile saved successfully', {
        profileId,
        profile: profileData
      }),
      200
    );

  } catch (error) {
    console.error('💥 Save Health Profile Error:', error);
    return sendResponse(
      ApiResponse.error('Failed to save health profile'),
      500
    );
  }
}

export async function PUT(request: NextRequest) {
  // Reuse POST logic since it handles both create and update
  return POST(request);
}