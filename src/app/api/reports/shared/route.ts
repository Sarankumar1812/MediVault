// app/api/shared/route.ts
import { getDatabase } from '@/lib/database';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sendShareInvitationEmail } from '@/lib/email';

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
    
    // Get shared access records
    const sharedAccess = await db.all(
      `SELECT 
        sa.id,
        sa.shared_with_email,
        sa.shared_with_name,
        sa.access_level,
        sa.status,
        sa.reports_shared,
        sa.expires_at,
        sa.created_at,
        COUNT(sr.id) as actual_reports_shared
       FROM shared_access sa
       LEFT JOIN shared_reports sr ON sa.id = sr.shared_access_id
       WHERE sa.user_id = ?
       GROUP BY sa.id
       ORDER BY sa.created_at DESC`,
      [decoded.userId]
    );

    // Format the response
    const formattedSharedAccess = sharedAccess.map(access => ({
      id: access.id,
      name: access.shared_with_name || access.shared_with_email.split('@')[0],
      email: access.shared_with_email,
      role: getRoleFromEmail(access.shared_with_email),
      accessLevel: formatAccessLevel(access.access_level),
      reportsShared: access.actual_reports_shared || access.reports_shared,
      sharedDate: new Date(access.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      status: access.status.charAt(0).toUpperCase() + access.status.slice(1)
    }));

    return NextResponse.json(formattedSharedAccess);
  } catch (error) {
    console.error('Error fetching shared access:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared access data' },
      { status: 500 }
    );
  }
}

// app/api/shared/route.ts (Updated POST method)
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
    if (!data.email || !data.access_level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if already shared with this email
    const existingShare = await db.get(
      'SELECT id FROM shared_access WHERE user_id = ? AND shared_with_email = ? AND status != "revoked"',
      [decoded.userId, data.email]
    );

    if (existingShare) {
      return NextResponse.json(
        { error: 'Already shared with this email' },
        { status: 400 }
      );
    }

    // Get user's name and email for the shared access
    const user = await db.get(
      'SELECT full_name, email FROM users WHERE id = ?',
      [decoded.userId]
    );

    // Generate unique invitation token
    const invitationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Insert shared access record
    const result = await db.run(
      `INSERT INTO shared_access 
       (user_id, shared_with_email, shared_with_name, access_level, status, invitation_token, expires_at) 
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [
        decoded.userId,
        data.email,
        data.name || data.email.split('@')[0],
        data.access_level,
        invitationToken,
        expiresAt.toISOString()
      ]
    );

    // Generate invitation link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const invitationLink = `${baseUrl}/shared-access/accept?token=${invitationToken}`;

    // Send email notification
    try {
      await sendShareInvitationEmail({
        to: data.email,
        fromName: user.full_name,
        fromEmail: user.email,
        accessLevel: formatAccessLevel(data.access_level),
        invitationLink
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue even if email fails, but update status
      await db.run(
        'UPDATE shared_access SET email_sent = 0 WHERE id = ?',
        [result.lastID]
      );
    }

    return NextResponse.json({
      message: 'Invitation sent successfully',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error creating shared access:', error);
    return NextResponse.json(
      { error: 'Failed to create shared access' },
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
        { error: 'Missing shared access ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Verify ownership
    const sharedAccess = await db.get(
      'SELECT id FROM shared_access WHERE id = ? AND user_id = ?',
      [id, decoded.userId]
    );

    if (!sharedAccess) {
      return NextResponse.json(
        { error: 'Shared access not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete shared access (cascade will delete shared_reports)
    await db.run('DELETE FROM shared_access WHERE id = ?', [id]);

    return NextResponse.json({
      message: 'Shared access revoked successfully'
    });
  } catch (error) {
    console.error('Error deleting shared access:', error);
    return NextResponse.json(
      { error: 'Failed to revoke shared access' },
      { status: 500 }
    );
  }
}

function getRoleFromEmail(email: string): string {
  if (email.includes('dr.') || email.includes('doctor') || email.includes('hospital') || email.includes('clinic')) {
    return 'Doctor';
  } else if (email.includes('cardio')) {
    return 'Cardiologist';
  } else if (email.includes('hospital') || email.includes('health')) {
    return 'Healthcare Provider';
  }
  return 'Family Member';
}

function formatAccessLevel(level: string): string {
  switch (level) {
    case 'full': return 'Full Access';
    case 'limited': return 'Limited Access';
    case 'view_only': return 'View Only';
    default: return level;
  }
}