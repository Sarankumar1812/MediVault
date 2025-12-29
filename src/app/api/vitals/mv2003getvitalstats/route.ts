// app/api/vitals/mv2003getvitalstats/route.ts
import { NextRequest } from 'next/server';
import { getVitalStats } from '@/lib/database';
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
    const days = url.searchParams.get('days') ? parseInt(url.searchParams.get('days')!) : 30;

    if (!type) {
      return sendResponse(
        ApiResponse.error('Vital type is required'),
        400
      );
    }

    // Get vital stats
    const stats = await getVitalStats(userId, type, days);

    // Format recent vitals
    const formattedRecent = stats.recent.map(vital => {
      const baseVital = {
        id: vital.mv_vt_id.toString(),
        unit: vital.mv_vt_unit,
        recordedAt: vital.mv_vt_recorded_at
      };

      if (type === 'blood-pressure') {
        return {
          ...baseVital,
          value: `${vital.mv_vt_value_systolic}/${vital.mv_vt_value_diastolic}`
        };
      } else {
        return {
          ...baseVital,
          value: vital.mv_vt_value_numeric?.toString() || '0'
        };
      }
    });

    return sendResponse(
      ApiResponse.success('Vital stats retrieved successfully', {
        stats: {
          avg: parseFloat(stats.avg.toFixed(1)),
          min: stats.min,
          max: stats.max,
          count: stats.count
        },
        recent: formattedRecent
      }),
      200
    );

  } catch (error) {
    console.error('Get vital stats error:', error);
    return sendResponse(
      ApiResponse.error('Failed to retrieve vital stats'),
      500
    );
  }
}