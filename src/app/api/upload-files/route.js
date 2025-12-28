// app/api/upload-files/route.js
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

// Allowed file types
const ALLOWED_FILE_TYPES = {
  'image/jpeg': 'image',
  'image/jpg': 'image', 
  'image/png': 'image',
  'application/pdf': 'auto',
  'text/csv': 'raw',
  'text/plain': 'raw',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'raw',
  'application/vnd.ms-excel': 'raw'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES[file.type]) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File type not allowed. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).map(t => t.split('/')[1]).join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine resource type
    const resourceType = ALLOWED_FILE_TYPES[file.type];
    
    // Create a timestamp for unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    const safeFileName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
    const publicId = `health_reports/${safeFileName}_${timestamp}`;

    // Upload options
    const uploadOptions = {
      folder: "health_wallet",
      resource_type: resourceType,
      public_id: publicId,
      overwrite: false,
      use_filename: true,
      unique_filename: true,
      // For documents, add OCR if needed
      ...(file.type === 'application/pdf' && {
        ocr: 'adv_ocr'
      })
    };

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // For text files, extract content
    let extractedText = null;
    if (file.type === 'text/csv' || file.type === 'text/plain') {
      try {
        extractedText = buffer.toString('utf-8');
      } catch (e) {
        console.warn('Could not extract text:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      resourceType: resourceType,
      extractedText: extractedText,
      metadata: {
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration,
        pages: uploadResult.pages,
        ocr: uploadResult.info?.ocr
      }
    });

  } catch (error) {
    console.error("Upload Error:", error);
    
    // User-friendly error messages
    let errorMessage = error.message || "File upload failed";
    let statusCode = 500;
    
    if (error.message.includes('File size limit')) {
      errorMessage = "File is too large. Maximum size is 10MB.";
      statusCode = 400;
    } else if (error.message.includes('Invalid image file')) {
      errorMessage = "The file appears to be corrupted or not a valid image.";
      statusCode = 400;
    } else if (error.message.includes('Upload preset')) {
      errorMessage = "Cloudinary configuration error. Please contact support.";
      statusCode = 500;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}

// Add DELETE endpoint for removing files
export async function DELETE(request) {
  try {
    const { publicId } = await request.json();
    
    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "No public ID provided" },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto',
      invalidate: true
    });

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: "File deleted successfully"
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to delete file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "File deletion failed" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';