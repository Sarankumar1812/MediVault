// app/api/vitals/mv2001addvital/route.ts
import { NextRequest } from 'next/server';
import { createVital } from '@/lib/database';
import { vitalSchema } from '@/lib/schemas/vitalSchemas';
import { ApiResponse, sendResponse } from '@/lib/utils/apiResponse';
import { extractUserIdFromToken } from '@/lib/auth';

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log('=== Add Vital API Called ===');
    
    // Check for token in header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Invalid auth header');
      return sendResponse(ApiResponse.unauthorized(), 401);
    }

    const token = authHeader.split(' ')[1];
    const userId = extractUserIdFromToken(token);
    console.log('User ID extracted:', userId);

    if (!userId) {
      console.log('Invalid user ID');
      return sendResponse(ApiResponse.unauthorized('Invalid token'), 401);
    }

    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    // Validate the vital data
    const validation = vitalSchema.safeParse(body);
    console.log('Validation result:', validation);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      console.log('Validation errors:', errors);
      return sendResponse(ApiResponse.validationError(errors), 400);
    }

    const vitalData = validation.data;
    console.log('Validated vital data:', vitalData);
    
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

    // Use type narrowing with switch statement
    switch (vitalData.type) {
      case 'heart-rate': {
        // Type is narrowed to HeartRateSchema here
        dbData = {
          type: vitalData.type,
          valueNumeric: vitalData.value,
          unit: 'bpm',
          recordedAt: vitalData.recordedAt,
          note: vitalData.note
        };
        break;
      }
        
      case 'blood-pressure': {
        // Type is narrowed to BloodPressureSchema here
        dbData = {
          type: vitalData.type,
          valueSystolic: vitalData.systolic,
          valueDiastolic: vitalData.diastolic,
          unit: 'mmHg',
          recordedAt: vitalData.recordedAt,
          note: vitalData.note
        };
        break;
      }
        
      case 'blood-sugar': {
        // Type is narrowed to BloodSugarSchema here
        dbData = {
          type: vitalData.type,
          valueNumeric: vitalData.value,
          unit: 'mg/dL',
          recordedAt: vitalData.recordedAt,
          note: vitalData.note
        };
        break;
      }
        
      case 'weight': {
        // Type is narrowed to WeightSchema here
        dbData = {
          type: vitalData.type,
          valueNumeric: vitalData.value,
          unit: 'kg',
          recordedAt: vitalData.recordedAt,
          note: vitalData.note
        };
        break;
      }
        
      case 'temperature': {
        // Type is narrowed to TemperatureSchema here
        dbData = {
          type: vitalData.type,
          valueNumeric: vitalData.value,
          unit: '°C',
          recordedAt: vitalData.recordedAt,
          note: vitalData.note
        };
        break;
      }
        
      default: {
        // This should never happen due to Zod validation
        console.log('Invalid vital type:', (vitalData as any).type);
        return sendResponse(
          ApiResponse.error('Invalid vital type'),
          400
        );
      }
    }

    console.log('Database data prepared:', dbData);

    // Save to database
    const vitalId = await createVital(userId, dbData);
    console.log('Vital saved with ID:', vitalId);

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