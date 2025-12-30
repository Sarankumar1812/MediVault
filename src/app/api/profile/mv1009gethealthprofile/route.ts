// app/api/profile/mv1009gethealthprofile/route.ts
import { NextRequest } from 'next/server';
import { getHealthProfileByUserId } from '@/lib/database';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { extractUserIdFromToken } from '@/lib/auth';

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET Health Profile API called');
    
    // Check for token in header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.log('❌ No authorization header');
      return sendResponse(ApiResponse.unauthorized('No authorization header'), 401);
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid authorization format');
      return sendResponse(ApiResponse.unauthorized('Invalid authorization format'), 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    if (!token || token.trim().length === 0) {
      console.log('❌ Empty token');
      return sendResponse(ApiResponse.unauthorized('Empty token'), 401);
    }

    console.log('✅ Token received, extracting user ID...');
    
    // Extract user ID from token
    const userId = extractUserIdFromToken(token);
    
    if (!userId) {
      console.log('❌ Failed to extract user ID from token');
      return sendResponse(ApiResponse.unauthorized('Invalid or expired token'), 401);
    }

    console.log(`✅ Extracted user ID: ${userId}`);
    
    // Get health profile
    const profile = await getHealthProfileByUserId(userId);
    
    if (!profile) {
      console.log(`ℹ️ No health profile found for user ${userId}`);
      return sendResponse(
        ApiResponse.success('No health profile found', { 
          profile: null,
          exists: false 
        }),
        200
      );
    }

    // Format response
    const formattedProfile = {
      height: profile.mv_hp_height.toString(),
      weight: profile.mv_hp_weight.toString(),
      bloodGroup: profile.mv_hp_blood_group,
      conditions: profile.mv_hp_conditions || '',
      allergies: profile.mv_hp_allergies || '',
      chronicIllnesses: profile.mv_hp_chronic_illnesses || '',
      emergencyContactName: profile.mv_hp_emergency_contact_name,
      emergencyContactPhone: profile.mv_hp_emergency_contact_phone,
      lastUpdated: profile.mv_hp_updated_at
    };

    console.log('✅ Health profile retrieved successfully');
    
    return sendResponse(
      ApiResponse.success('Health profile retrieved successfully', {
        profile: formattedProfile,
        exists: true,
        isComplete: true
      }),
      200
    );

  } catch (error) {
    console.error('💥 GET Health Profile Error:', error);
    return sendResponse(
      ApiResponse.error('Failed to retrieve health profile'),
      500
    );
  }
}