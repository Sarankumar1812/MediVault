// app/api/reports/mv2002getreports/route.ts
import { NextRequest } from 'next/server';
import { getUserReports } from '@/lib/database';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { extractUserIdFromToken } from '@/lib/auth';

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');

    // Get reports
    let reports = await getUserReports(userId);

    // Apply filters
    if (type) {
      reports = reports.filter(report => report.mv_rp_type === type);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      reports = reports.filter(report => new Date(report.mv_rp_date) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      reports = reports.filter(report => new Date(report.mv_rp_date) <= toDate);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      reports = reports.filter(report =>
        report.mv_rp_name.toLowerCase().includes(searchLower) ||
        (report.mv_rp_doctor_lab && report.mv_rp_doctor_lab.toLowerCase().includes(searchLower)) ||
        (report.mv_rp_notes && report.mv_rp_notes.toLowerCase().includes(searchLower))
      );
    }

    // Format response
    const formattedReports = reports.map(report => ({
      id: report.mv_rp_id,
      name: report.mv_rp_name,
      type: report.mv_rp_type,
      typeLabel: formatReportType(report.mv_rp_type),
      date: report.mv_rp_date,
      doctorLab: report.mv_rp_doctor_lab,
      fileUrl: report.mv_rp_file_url,
      fileName: report.mv_rp_file_name,
      fileType: report.mv_rp_file_type,
      fileSize: report.mv_rp_file_size,
      extractedData: report.mv_rp_extracted_data ? JSON.parse(report.mv_rp_extracted_data) : null,
      isExtracted: report.mv_rp_is_extracted === 1,
      createdAt: report.mv_rp_created_at,
      updatedAt: report.mv_rp_updated_at
    }));

    return sendResponse(
      ApiResponse.success('Reports retrieved successfully', {
        reports: formattedReports,
        total: formattedReports.length,
        filters: {
          type,
          dateFrom,
          dateTo,
          search
        }
      }),
      200
    );

  } catch (error) {
    console.error('Get reports error:', error);
    return sendResponse(
      ApiResponse.error('Failed to retrieve reports'),
      500
    );
  }
}

function formatReportType(type: string): string {
  const typeMap: Record<string, string> = {
    'blood_test': 'Blood Test',
    'scan': 'Scan',
    'prescription': 'Prescription',
    'ecg': 'ECG',
    'xray': 'X-Ray',
    'mri': 'MRI',
    'ct_scan': 'CT Scan',
    'ultrasound': 'Ultrasound',
    'discharge_summary': 'Discharge Summary',
    'lab_report': 'Lab Report',
    'doctor_notes': 'Doctor Notes',
    'other': 'Other'
  };
  
  return typeMap[type] || type;
}