// app/api/reports/mv2001savereport/route.ts - CREATE THIS FILE
import { NextRequest } from 'next/server';
import { updateReport } from '@/lib/database';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { extractUserIdFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
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
    
    const { reportId, extractedData, notes } = body;

    if (!reportId) {
      return sendResponse(
        ApiResponse.validationError({ reportId: ['Report ID is required'] }),
        400
      );
    }

    // Update report in database
    const updated = await updateReport(reportId, {
      extractedData,
      notes
    });

    if (!updated) {
      return sendResponse(
        ApiResponse.error('Failed to update report or report not found'),
        404
      );
    }

    return sendResponse(
      ApiResponse.success('Report saved successfully', {
        reportId,
        updated: true
      }),
      200
    );

  } catch (error) {
    console.error('Save report error:', error);
    return sendResponse(
      ApiResponse.error('Failed to save report'),
      500
    );
  }
}