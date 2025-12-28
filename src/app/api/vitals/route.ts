// app/api/vitals/route.ts
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const timeRange = searchParams.get('range') || '3M';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    let query = `
      SELECT * FROM vital_entries 
      WHERE user_id = ? AND recorded_at >= ?
    `;
    
    const params: any[] = [decoded.userId, startDate.toISOString()];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY recorded_at ASC';
    
    const vitals = await db.all(query, params);
    
    // Group by type for the dashboard view
    if (!type) {
      const groupedVitals = {
        blood_pressure: vitals.filter(v => v.type === 'blood_pressure'),
        blood_sugar: vitals.filter(v => v.type === 'blood_sugar'),
        heart_rate: vitals.filter(v => v.type === 'heart_rate'),
        weight: vitals.filter(v => v.type === 'weight')
      };
      
      return NextResponse.json(groupedVitals);
    }

    return NextResponse.json(vitals);
  } catch (error) {
    console.error('Error fetching vitals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vitals data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const data = await request.json();
    const db = await getDatabase();
    
    // Validate required fields
    if (!data.type || !data.recorded_at) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert vital entry
    const result = await db.run(
      `INSERT INTO vital_entries 
       (user_id, type, value_systolic, value_diastolic, value_fasting, value_post_meal, 
        value_resting, value_active, value_numeric, unit, notes, recorded_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        decoded.userId,
        data.type,
        data.value_systolic || null,
        data.value_diastolic || null,
        data.value_fasting || null,
        data.value_post_meal || null,
        data.value_resting || null,
        data.value_active || null,
        data.value_numeric || null,
        data.unit || getDefaultUnit(data.type),
        data.notes || null,
        data.recorded_at
      ]
    );

    return NextResponse.json({
      message: 'Vital entry added successfully',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error adding vital entry:', error);
    return NextResponse.json(
      { error: 'Failed to add vital entry' },
      { status: 500 }
    );
  }
}

// app/api/vitals/route.ts (Add PUT and DELETE methods)
export async function PUT(request: Request) {
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

    const data = await request.json();
    const db = await getDatabase();
    
    // Validate required fields
    if (!data.id || !data.type || !data.recorded_at) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingEntry = await db.get(
      'SELECT id FROM vital_entries WHERE id = ? AND user_id = ?',
      [data.id, decoded.userId]
    );

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Vital entry not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update vital entry
    await db.run(
      `UPDATE vital_entries 
       SET type = ?, 
           value_systolic = ?, 
           value_diastolic = ?, 
           value_fasting = ?, 
           value_post_meal = ?, 
           value_resting = ?, 
           value_active = ?, 
           value_numeric = ?, 
           unit = ?, 
           notes = ?, 
           recorded_at = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        data.type,
        data.value_systolic || null,
        data.value_diastolic || null,
        data.value_fasting || null,
        data.value_post_meal || null,
        data.value_resting || null,
        data.value_active || null,
        data.value_numeric || null,
        data.unit || getDefaultUnit(data.type),
        data.notes || null,
        data.recorded_at,
        data.id
      ]
    );

    return NextResponse.json({
      message: 'Vital entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating vital entry:', error);
    return NextResponse.json(
      { error: 'Failed to update vital entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing vital entry ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Verify ownership
    const existingEntry = await db.get(
      'SELECT id FROM vital_entries WHERE id = ? AND user_id = ?',
      [id, decoded.userId]
    );

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Vital entry not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete vital entry
    await db.run('DELETE FROM vital_entries WHERE id = ?', [id]);

    return NextResponse.json({
      message: 'Vital entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vital entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete vital entry' },
      { status: 500 }
    );
  }
}

function getDefaultUnit(type: string): string {
  switch (type) {
    case 'blood_pressure': return 'mmHg';
    case 'blood_sugar': return 'mg/dL';
    case 'heart_rate': return 'bpm';
    case 'weight': return 'kg';
    case 'temperature': return '°C';
    case 'oxygen_level': return '%';
    default: return '';
  }
}