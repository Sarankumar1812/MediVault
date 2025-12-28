// app/api/reports/route.ts
import { getDatabase } from "@/lib/database"
import { verifyToken } from "@/lib/auth"
import { extractTextFromUrl } from "@/lib/text-extractor"
import { NextResponse } from "next/server"

// Helper function to extract vitals from text
function extractVitalsFromText(text: string): string[] {
  if (!text) return []
  
  const vitals: string[] = []
  const lines = text.split('\n')
  
  // Look for patterns like: Test: 12.5, Test = 12.5, Test 12.5
  const patterns = [
    /([A-Za-z\s]+(?:Blood|Cells|Hemoglobin|Platelets|Cholesterol|Glucose|ALT|AST|Creatinine|BUN|TSH|T3|T4|Pressure|Rate|Temperature)?):\s*([\d.]+)/gi,
    /([A-Za-z\s]+(?:Blood|Cells|Hemoglobin|Platelets|Cholesterol|Glucose|ALT|AST|Creatinine|BUN|TSH|T3|T4|Pressure|Rate|Temperature)?)\s*=\s*([\d.]+)/gi,
  ]
  
  for (const line of lines) {
    for (const pattern of patterns) {
      const matches = [...line.matchAll(pattern)]
      for (const match of matches) {
        if (match[1] && match[2]) {
          // Skip date/time references
          if (match[1].toLowerCase().includes('date') || 
              match[1].toLowerCase().includes('time')) {
            continue
          }
          
          vitals.push(`${match[1].trim()}: ${match[2]}`)
        }
      }
    }
  }
  
  // Return unique vitals, limit to 5
  return [...new Set(vitals)].slice(0, 5)
}

// GET - Fetch all reports with optional filtering
export async function GET(request: Request) {
  try {
    console.log('GET /api/reports called')
    
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      console.log('No token provided')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log('Invalid token')
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log(`Fetching reports for user ${decoded.userId} (${decoded.email})`)
    
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)

    // Build base query
    let query = `
      SELECT 
        hr.id,
        hr.title,
        hr.report_type as type,
        hr.category,
        hr.file_url as fileUrl,
        hr.file_name as fileName,
        hr.file_type as fileType,
        hr.file_size as fileSize,
        hr.report_date as reportDate,
        hr.upload_date as uploadDate,
        hr.notes,
        hr.status,
        hr.extracted_text as extractedText,
        hr.public_id as publicId,
        u.full_name as patientName
      FROM health_reports hr
      LEFT JOIN users u ON hr.user_id = u.id
      WHERE hr.user_id = ?
    `

    const params: any[] = [decoded.userId]
    const conditions: string[] = []

    // Add filters
    const category = searchParams.get("category")
    if (category && category !== "All") {
      conditions.push("hr.category = ?")
      params.push(category)
    }

    const search = searchParams.get("search")
    if (search) {
      conditions.push("(hr.title LIKE ? OR hr.report_type LIKE ? OR hr.notes LIKE ? OR hr.extracted_text LIKE ?)")
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }
    const type = searchParams.get("type")
if (type && type !== "All") {
  conditions.push("hr.report_type = ?")
  params.push(type)
}

    const status = searchParams.get("status")
    if (status && status !== "All") {
      conditions.push("hr.status = ?")
      params.push(status)
    }

    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ")
    }

    query += " ORDER BY hr.report_date DESC, hr.upload_date DESC"
    
    console.log('Executing query:', query.substring(0, 200) + '...')
    console.log('Params:', params)
    
    const reports = await db.all(query, params)
    console.log(`Found ${reports.length} reports`)

    const formattedReports = reports.map((report: any) => {
      try {
        return {
          id: report.id,
          title: report.title || 'Untitled Report',
          type: report.type || 'Unknown',
          category: report.category || 'Other',
          date: report.reportDate ? new Date(report.reportDate) : new Date(),
          uploadDate: report.uploadDate ? new Date(report.uploadDate) : new Date(),
          status: report.status || 'Pending',
          fileUrl: report.fileUrl || '',
          fileName: report.fileName || 'unknown',
          fileType: report.fileType || 'application/octet-stream',
          fileSize: report.fileSize || 0,
          notes: report.notes || '',
          patientName: report.patientName || 'User',
          extractedText: report.extractedText || '',
          publicId: report.publicId || '',
          vitals: report.extractedText ? extractVitalsFromText(report.extractedText) : []
        }
      } catch (error) {
        console.error('Error formatting report:', error, report)
        return null
      }
    }).filter(Boolean) // Remove any null reports

    console.log(`Returning ${formattedReports.length} formatted reports`)
    return NextResponse.json(formattedReports)
  } catch (error: any) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports. Please try again." },
      { status: 500 }
    )
  }
}

// POST - Create a new report
export async function POST(request: Request) {
  try {
    console.log('POST /api/reports - Creating new report')
    
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDatabase()
    const data = await request.json()

    console.log('Received report data:', {
      title: data.title,
      type: data.reportType || data.type,
      category: data.category,
      hasFileUrl: !!data.fileUrl,
      fileType: data.fileType
    })

    // Validate required fields
    if (!data.title || !data.category || !data.fileUrl) {
      return NextResponse.json(
        { 
          error: "Missing required fields. Please provide: title, category, and file URL" 
        },
        { status: 400 }
      )
    }

    // Extract text from file URL if it's a CSV/text file
    let extractedText = ''
    let extractedVitals: string[] = []
    
    const fileType = data.fileType || ''
    if (data.fileUrl && (fileType.includes('csv') || fileType.includes('text') || fileType.includes('plain'))) {
      try {
        console.log("Attempting to extract text from file URL")
        const extracted = await extractTextFromUrl(data.fileUrl, fileType)
        extractedText = extracted.text
        extractedVitals = extracted.vitals
        console.log(`Extracted ${extractedText.length} characters and ${extractedVitals.length} vitals`)
      } catch (error) {
        console.error("Error extracting text:", error)
        extractedText = `Note: Could not extract text content from file`
      }
    } else {
      console.log("Skipping text extraction for file type:", fileType)
    }

    // Insert report with extracted text
    const result = await db.run(
      `INSERT INTO health_reports 
       (user_id, title, report_type, category, file_url, file_name, file_size, file_type, 
        report_date, notes, status, public_id, extracted_text, extraction_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        decoded.userId,
        data.title,
        data.reportType || data.type || 'General',
        data.category,
        data.fileUrl,
        data.fileName || 'unknown',
        data.fileSize || 0,
        fileType,
        data.reportDate || new Date().toISOString().split('T')[0],
        data.notes || '',
        data.status || 'Pending',
        data.publicId || '',
        extractedText,
        extractedText ? 'completed' : 'skipped'
      ]
    )

    console.log("Report inserted with ID:", result.lastID)

    // Fetch the newly created report to return
    const newReport = await db.get(
      `SELECT hr.*, u.full_name as patientName 
       FROM health_reports hr 
       LEFT JOIN users u ON hr.user_id = u.id 
       WHERE hr.id = ?`,
      [result.lastID]
    )

    const formattedReport = {
      id: newReport.id,
      title: newReport.title,
      type: newReport.report_type,
      category: newReport.category,
      date: new Date(newReport.report_date),
      uploadDate: new Date(newReport.upload_date),
      status: newReport.status,
      fileUrl: newReport.file_url,
      fileName: newReport.file_name,
      fileType: newReport.file_type,
      fileSize: newReport.file_size,
      notes: newReport.notes || '',
      patientName: newReport.patientName || 'User',
      extractedText: newReport.extracted_text || '',
      publicId: newReport.public_id || '',
      vitals: newReport.extracted_text ? extractVitalsFromText(newReport.extracted_text) : []
    }

    return NextResponse.json({
      success: true,
      message: "Report uploaded successfully",
      report: formattedReport,
      extractedVitals: extractedVitals
    })
  } catch (error: any) {
    console.error("Error uploading report:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload report. Please try again." },
      { status: 500 }
    )
  }
}