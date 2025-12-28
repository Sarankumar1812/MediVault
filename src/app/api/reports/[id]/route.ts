// app/api/reports/[id]/route.ts
import { getDatabase } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

// Helper function to format report
function formatReport(report: any) {
  return {
    id: report.id,
    title: report.title,
    type: report.report_type,
    category: report.category,
    date: new Date(report.report_date),
    uploadDate: new Date(report.upload_date),
    status: report.status,
    fileUrl: report.file_url,
    fileName: report.file_name,
    fileType: report.file_type,
    fileSize: report.file_size,
    notes: report.notes || "",
    patientName: report.patientName || "User",
    extractedText: report.extracted_text || "",
    publicId: report.public_id || "",
    vitals: report.extracted_text
      ? extractVitalsFromText(report.extracted_text)
      : [],
  };
}

// Helper function to extract vitals from text
function extractVitalsFromText(text: string): string[] {
  if (!text) return [];

  const vitals: string[] = [];
  const lines = text.split("\n");

  const patterns = [
    /([A-Za-z\s]+):\s*([\d.]+)/g,
    /([A-Za-z\s]+)\s*=\s*([\d.]+)/g,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const matches = [...line.matchAll(pattern)];
      for (const match of matches) {
        if (match[1] && match[2]) {
          if (
            match[1].toLowerCase().includes("date") ||
            match[1].toLowerCase().includes("time")
          ) {
            continue;
          }
          vitals.push(`${match[1].trim()}: ${match[2]}`);
        }
      }
    }
  }

  return [...new Set(vitals)].slice(0, 5);
}

// GET - Get single report by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const db = await getDatabase();
    const { id } = await params; // Await the params

    if (!id) {
      return NextResponse.json(
        { error: "Report ID required" },
        { status: 400 }
      );
    }

    // Get report with user info
    const report = await db.get(
      `SELECT hr.*, u.full_name as patientName 
       FROM health_reports hr 
       LEFT JOIN users u ON hr.user_id = u.id 
       WHERE hr.id = ? AND hr.user_id = ?`,
      [id, decoded.userId]
    );

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(formatReport(report));
  } catch (error: any) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update report
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const db = await getDatabase();
    const { id } = await params; // Await the params
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Report ID required" },
        { status: 400 }
      );
    }

    // Check if report belongs to user
    const existingReport = await db.get(
      "SELECT * FROM health_reports WHERE id = ? AND user_id = ?",
      [id, decoded.userId]
    );

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Only update fields that are provided
    if (data.title !== undefined) {
      updateFields.push("title = ?");
      updateValues.push(data.title);
    }
    if (data.notes !== undefined) {
      updateFields.push("notes = ?");
      updateValues.push(data.notes);
    }
    if (data.status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(data.status);
    }
    if (data.category !== undefined) {
      updateFields.push("category = ?");
      updateValues.push(data.category);
    }
    if (data.type !== undefined) {
      updateFields.push("report_type = ?");
      updateValues.push(data.type);
    }
    if (data.reportDate !== undefined) {
      updateFields.push("report_date = ?");
      updateValues.push(data.reportDate);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Add report ID and user ID for WHERE clause
    updateValues.push(id, decoded.userId);

    // Execute update
    await db.run(
      `UPDATE health_reports 
       SET ${updateFields.join(", ")} 
       WHERE id = ? AND user_id = ?`,
      updateValues
    );

    // Fetch updated report
    const updatedReport = await db.get(
      `SELECT hr.*, u.full_name as patientName 
       FROM health_reports hr 
       LEFT JOIN users u ON hr.user_id = u.id 
       WHERE hr.id = ? AND hr.user_id = ?`,
      [id, decoded.userId]
    );

    return NextResponse.json({
      success: true,
      message: "Report updated successfully",
      report: formatReport(updatedReport),
    });
  } catch (error: any) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (same as PUT in this case)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const db = await getDatabase();
    const { id } = await params; // Await the params

    if (!id) {
      return NextResponse.json(
        { error: "Report ID required" },
        { status: 400 }
      );
    }

    // Check if report exists and belongs to user
    const report = await db.get(
      "SELECT * FROM health_reports WHERE id = ? AND user_id = ?",
      [id, decoded.userId]
    );

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await db.run("DELETE FROM health_reports WHERE id = ? AND user_id = ?", [
      id,
      decoded.userId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
