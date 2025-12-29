// app/api/reports/mv2001uploadreport/route.ts - UPDATED
import { NextRequest } from 'next/server';
import { createReport } from '@/lib/database';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { uploadReportSchema } from '@/lib/schemas/reportSchemas';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { extractUserIdFromToken } from '@/lib/auth';

// Use Next.js route config
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for large files

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];

// Helper function to extract data from files (simulated for now)
async function extractDataFromFile(fileBuffer: Buffer, fileName: string, fileType: string): Promise<any> {
  // This is a simulation - in real app, you'd use OCR libraries
  // For now, return mock extracted data based on file type
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = {
        extracted: true,
        parameters: [
          { name: "Blood Sugar", value: "98", unit: "mg/dL", normalRange: "70-140", status: "normal" },
          { name: "Cholesterol", value: "180", unit: "mg/dL", normalRange: "<200", status: "normal" },
          { name: "Hemoglobin", value: "14.5", unit: "g/dL", normalRange: "13.5-17.5", status: "normal" },
          { name: "White Blood Cells", value: "7.2", unit: "10³/µL", normalRange: "4.5-11.0", status: "normal" },
          { name: "Platelets", value: "250", unit: "10³/µL", normalRange: "150-450", status: "normal" }
        ],
        metadata: {
          extractionMethod: fileType.includes('pdf') ? 'OCR' : 
                          fileType.includes('image') ? 'Image Processing' : 
                          'Direct Parsing',
          confidence: 0.85,
          extractionDate: new Date().toISOString()
        }
      };
      resolve(mockData);
    }, 1000); // Simulate extraction delay
  });
}

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const date = formData.get('date') as string;
    const doctorLab = formData.get('doctorLab') as string;
    const notes = formData.get('notes') as string;
    const privacyLevel = formData.get('privacyLevel') as string || 'private';

    // Validate required fields
    if (!file) {
      return sendResponse(ApiResponse.validationError({ file: ['File is required'] }), 400);
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return sendResponse(
        ApiResponse.validationError({ 
          file: ['File type not allowed. Allowed: PDF, JPEG, PNG, Excel, CSV, Word'] 
        }), 
        400
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return sendResponse(
        ApiResponse.validationError({ 
          file: [`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`] 
        }), 
        400
      );
    }

    // Validate form data
    const validation = uploadReportSchema.safeParse({
      name,
      type,
      date,
      doctorLab: doctorLab || undefined,
      notes: notes || undefined,
      privacyLevel
    });

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return sendResponse(ApiResponse.validationError(errors), 400);
    }

    // Read file buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Upload to Cloudinary
    console.log('Uploading file to Cloudinary...');
    const uploadResult = await uploadToCloudinary(buffer, file.name);
    console.log('File uploaded to Cloudinary:', uploadResult.url);

    // Extract data from file (simulated)
    console.log('Extracting data from file...');
    const extractedData = await extractDataFromFile(buffer, file.name, file.type);
    console.log('Data extraction complete');

    // Save report to database with extracted data
    const reportId = await createReport(userId, {
      name: validation.data.name,
      type: validation.data.type,
      date: validation.data.date,
      doctorLab: validation.data.doctorLab || undefined,
      notes: validation.data.notes || undefined,
      fileUrl: uploadResult.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      extractedData: extractedData,
      privacyLevel: validation.data.privacyLevel
    });

    return sendResponse(
      ApiResponse.success('Report uploaded successfully', {
        reportId,
        fileUrl: uploadResult.url,
        fileName: file.name,
        extractedData: extractedData,
        status: 'ready_for_review'
      }),
      201
    );

  } catch (error: any) {
    console.error('Upload report error:', error);
    
    if (error.message.includes('timeout')) {
      return sendResponse(
        ApiResponse.error('Upload timeout. Please try again with a smaller file.'),
        408
      );
    }
    
    return sendResponse(
      ApiResponse.error('Failed to upload report'),
      500
    );
  }
}