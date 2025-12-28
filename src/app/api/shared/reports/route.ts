// app/api/shared/reports/route.ts - COMPLETE FIXED VERSION
import { getDatabase } from '@/lib/database'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'health-wallet-secret-key'

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(authHeader.split(' ')[1])
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const db = await getDatabase()

    // ✅ FIX: Use email directly from token (more reliable)
    const userEmail = decoded.email
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found in token' }, { status: 400 })
    }

    console.log(`🔍 Fetching shared reports for: ${userEmail}`)

    // ✅ CRITICAL FIX: Use INNER JOIN instead of LEFT JOIN
    const sharedReports = await db.all(
      `
      SELECT 
        hr.id,
        hr.title,
        hr.report_type as type,
        hr.category,
        hr.report_date as date,
        u.full_name as sharedByName,
        u.email as sharedByEmail,
        sa.access_level as accessLevel,
        hr.file_url as fileUrl,
        hr.file_name as fileName,
        hr.file_type as fileType,
        hr.file_size as fileSize
      FROM shared_access sa
      INNER JOIN shared_reports sr ON sa.id = sr.shared_access_id  -- ✅ INNER JOIN
      INNER JOIN health_reports hr ON sr.report_id = hr.id
      INNER JOIN users u ON sa.user_id = u.id
      WHERE sa.shared_with_email = ? 
        AND sa.status = 'active'
        AND (sa.expires_at IS NULL OR sa.expires_at > datetime('now'))
      ORDER BY hr.report_date DESC
      `,
      [userEmail]
    )

    console.log(`✅ Found ${sharedReports.length} shared reports for ${userEmail}`)

    return NextResponse.json({
      success: true,
      reports: sharedReports,
      count: sharedReports.length
    })
  } catch (error: any) {
    console.error('❌ GET shared reports error:', error.message)
    return NextResponse.json(
      { 
        error: 'Failed to fetch shared reports',
        details: error.message 
      },
      { status: 500 }
    )
  }
}