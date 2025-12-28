// app/api/dashboard/route.ts (Updated)
import { getDatabase } from '@/lib/database';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'health-wallet-secret-key';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    
    // Get total reports count
    const reportsCount = await db.get(
      'SELECT COUNT(*) as count FROM health_reports WHERE user_id = ?',
      [decoded.userId]
    );
    
    // Get recent reports count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReportsCount = await db.get(
      `SELECT COUNT(*) as count FROM health_reports 
       WHERE user_id = ? AND report_date >= ?`,
      [decoded.userId, thirtyDaysAgo.toISOString().split('T')[0]]
    );
    
    // Get recent reports for display with full details
    const recentReports = await db.all(
      `SELECT 
        hr.id,
        hr.title,
        hr.report_type as type,
        hr.category,
        hr.report_date,
        hr.upload_date,
        hr.status,
        hr.file_url as fileUrl,
        hr.file_name as fileName,
        hr.file_type as fileType,
        hr.file_size as fileSize,
        hr.notes,
        hr.extracted_text as extractedText,
        hr.public_id as publicId,
        u.full_name as patientName
       FROM health_reports hr
       LEFT JOIN users u ON hr.user_id = u.id
       WHERE hr.user_id = ? 
       ORDER BY hr.report_date DESC, hr.upload_date DESC
       LIMIT 4`,
      [decoded.userId]
    );
    
    // Get shared access count
    const sharedCount = await db.get(
      `SELECT COUNT(*) as count FROM shared_access 
       WHERE user_id = ? AND status IN ('active', 'pending')`,
      [decoded.userId]
    );
    
    // Get vitals count
    const vitalsCount = await db.get(
      'SELECT COUNT(*) as count FROM vital_entries WHERE user_id = ?',
      [decoded.userId]
    );
    
    // Helper function to extract vitals from text
    function extractVitalsFromText(text: string): string[] {
      if (!text) return []
      
      const vitals: string[] = []
      const lines = text.split('\n')
      
      const patterns = [
        /([A-Za-z\s]+(?:Blood|Cells|Hemoglobin|Platelets|Cholesterol|Glucose|ALT|AST|Creatinine|BUN|TSH|T3|T4|Pressure|Rate|Temperature)?):\s*([\d.]+)/gi,
        /([A-Za-z\s]+(?:Blood|Cells|Hemoglobin|Platelets|Cholesterol|Glucose|ALT|AST|Creatinine|BUN|TSH|T3|T4|Pressure|Rate|Temperature)?)\s*=\s*([\d.]+)/gi,
      ]
      
      for (const line of lines) {
        for (const pattern of patterns) {
          const matches = [...line.matchAll(pattern)]
          for (const match of matches) {
            if (match[1] && match[2]) {
              if (match[1].toLowerCase().includes('date') || 
                  match[1].toLowerCase().includes('time')) {
                continue
              }
              vitals.push(`${match[1].trim()}: ${match[2]}`)
            }
          }
        }
      }
      
      return [...new Set(vitals)].slice(0, 5)
    }
    
    // Format recent reports
    const formattedRecentReports = recentReports.map(report => ({
      id: report.id,
      title: report.title || 'Untitled Report',
      type: report.type || 'General',
      category: report.category || 'Other',
      report_date: report.report_date || new Date().toISOString().split('T')[0],
      upload_date: report.upload_date || new Date().toISOString(),
      status: report.status || 'Pending',
      fileUrl: report.fileUrl || '',
      fileName: report.fileName || '',
      fileType: report.fileType || '',
      fileSize: report.fileSize || 0,
      notes: report.notes || '',
      extractedText: report.extractedText || '',
      publicId: report.publicId || '',
      patientName: report.patientName || 'User',
      vitals: report.extractedText ? extractVitalsFromText(report.extractedText) : []
    }));
    
    return NextResponse.json({
      stats: {
        totalReports: reportsCount.count || 0,
        recentReports: recentReportsCount.count || 0,
        sharedWith: sharedCount.count || 0,
        vitalEntries: vitalsCount.count || 0
      },
      recentReports: formattedRecentReports,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}