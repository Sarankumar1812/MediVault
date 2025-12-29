// app/api/reports/mv2003getreport/[id]/route.ts
import { NextRequest } from 'next/server';
import { getReportWithAccess, formatReportType } from '@/lib/database';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { extractUserIdFromToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const reportId = parseInt(params.id);
    if (isNaN(reportId)) {
      return sendResponse(ApiResponse.validationError({ id: ['Invalid report ID'] }), 400);
    }

    // Get report with access check
    const report = await getReportWithAccess(reportId, userId);

    if (!report) {
      return sendResponse(
        ApiResponse.error('Report not found or access denied'),
        404
      );
    }

    // Format response
    const formattedReport = {
      id: report.mv_rp_id,
      name: report.mv_rp_name,
      type: report.mv_rp_type,
      typeLabel: formatReportType(report.mv_rp_type),
      date: report.mv_rp_date,
      doctorLab: report.mv_rp_doctor_lab,
      notes: report.mv_rp_notes,
      fileUrl: report.mv_rp_file_url,
      fileName: report.mv_rp_file_name,
      fileType: report.mv_rp_file_type,
      fileSize: report.mv_rp_file_size,
      extractedData: report.mv_rp_extracted_data ? JSON.parse(report.mv_rp_extracted_data) : null,
      isExtracted: report.mv_rp_is_extracted === 1,
      createdAt: report.mv_rp_created_at,
      updatedAt: report.mv_rp_updated_at
    };

    return sendResponse(
      ApiResponse.success('Report retrieved successfully', {
        report: formattedReport
      }),
      200
    );

  } catch (error) {
    console.error('Get report error:', error);
    return sendResponse(
      ApiResponse.error('Failed to retrieve report'),
      500
    );
  }
}