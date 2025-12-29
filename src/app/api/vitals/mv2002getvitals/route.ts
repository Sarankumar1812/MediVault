// app/api/vitals/mv2002getvitals/route.ts
import { NextRequest } from 'next/server';
import { getVitalsByUserId } from '@/lib/database';
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

    // Get query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;

    // Get vitals from database
    const vitals = await getVitalsByUserId(userId, type || undefined, startDate || undefined, endDate || undefined, limit);

    // Format response
    const formattedVitals = vitals.map(vital => {
      const baseVital = {
        id: vital.mv_vt_id.toString(),
        type: vital.mv_vt_type,
        unit: vital.mv_vt_unit,
        recordedAt: vital.mv_vt_recorded_at,
        note: vital.mv_vt_note || ''
      };

      if (vital.mv_vt_type === 'blood-pressure') {
        return {
          ...baseVital,
          value: {
            systolic: vital.mv_vt_value_systolic || 0,
            diastolic: vital.mv_vt_value_diastolic || 0
          }
        };
      } else {
        return {
          ...baseVital,
          value: vital.mv_vt_value_numeric || 0
        };
      }
    });

    return sendResponse(
      ApiResponse.success('Vitals retrieved successfully', {
        vitals: formattedVitals,
        count: formattedVitals.length
      }),
      200
    );

  } catch (error) {
    console.error('Get vitals error:', error);
    return sendResponse(
      ApiResponse.error('Failed to retrieve vitals'),
      500
    );
  }
}