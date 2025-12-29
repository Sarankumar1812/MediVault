// app/api/vitals/mv2001addvital/route.ts
import { NextRequest } from 'next/server';
import { createVital } from '@/lib/database';
import { vitalSchema } from '@/lib/schemas/vitalSchemas';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { extractUserIdFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    // Validate the vital data
    const validation = vitalSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return sendResponse(ApiResponse.validationError(errors), 400);
    }

    const vitalData = validation.data;
    
    // Prepare data for database
    let dbData: {
      type: string;
      valueSystolic?: number;
      valueDiastolic?: number;
      valueNumeric?: number;
      unit: string;
      note?: string;
      recordedAt: string;
    };

    switch (vitalData.type) {
      case 'heart-rate':
        dbData = {
          type: vitalData.type,
          valueNumeric: vitalData.value,
          unit: 'bpm',
          recordedAt: vitalData.recordedAt,
          note: vitalData.note
        };
        break;
        
      case 'blood-pressure':
        dbData = {
          type: vitalData.type,
          valueSystolic: vitalData.systolic,
          valueDiastolic: vitalData.diastolic,
          unit: 'mmHg',
          recordedAt: vitalData.recordedAt,
          note: vitalData.note
        };
        break;
        
      case 'blood-sugar':
        dbData = {
          type: vitalData.type,
          valueNumeric: vitalData.value,
          unit: 'mg/dL',
          recordedAt: vitalData.recordedAt,
          note: vitalData.note
        };
        break;
        
      case 'weight':
        dbData = {
          type: vitalData.type,
          valueNumeric: vitalData.value,
          unit: 'kg',
          recordedAt: vitalData.recordedAt,
          note: vitalData.note
        };
        break;
        
      case 'temperature':
        dbData = {
          type: vitalData.type,
          valueNumeric: vitalData.value,
          unit: '°C',
          recordedAt: vitalData.recordedAt,
          note: vitalData.note
        };
        break;
        
      default:
        return sendResponse(
          ApiResponse.error('Invalid vital type'),
          400
        );
    }

    // Save to database
    const vitalId = await createVital(userId, dbData);

    return sendResponse(
      ApiResponse.success('Vital added successfully', {
        vitalId,
        vital: vitalData
      }),
      200
    );

  } catch (error) {
    console.error('Add vital error:', error);
    return sendResponse(
      ApiResponse.error('Failed to add vital'),
      500
    );
  }
}