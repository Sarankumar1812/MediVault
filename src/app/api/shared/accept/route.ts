// app/api/shared/accept/route.ts
import { getDatabase, validateInvitationToken, markTokenAsUsed } from '@/lib/database';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'health-wallet-secret-key';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string }
  } catch {
    return null
  }
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    // Validate the token
    const validation = await validateInvitationToken(token);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get shared access details
    const sharedAccess = await db.get(
      `SELECT 
        sa.*,
        u.full_name as from_name,
        u.email as from_email
       FROM shared_access sa
       JOIN users u ON sa.user_id = u.id
       WHERE sa.id = ?`,
      [validation.sharedAccessId]
    );

    if (!sharedAccess) {
      return NextResponse.json(
        { error: 'Shared access not found' },
        { status: 404 }
      );
    }

    // Format access level
    const formatAccessLevel = (level: string) => {
      switch (level) {
        case 'full': return 'Full Access';
        case 'limited': return 'Limited Access';
        case 'view_only': return 'View Only';
        default: return level;
      }
    };

    return NextResponse.json({
      message: 'Invitation is valid',
      sharedDetails: {
        fromName: sharedAccess.from_name,
        fromEmail: sharedAccess.from_email,
        accessLevel: formatAccessLevel(sharedAccess.access_level),
        expiresAt: sharedAccess.expires_at
      }
    });
  } catch (error) {
    console.error('Error validating invitation token:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const token = data.token;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    // Validate the token
    const validation = await validateInvitationToken(token);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get the shared access record
    const sharedAccess = await db.get(
      `SELECT * FROM shared_access WHERE id = ?`,
      [validation.sharedAccessId]
    );

    if (!sharedAccess) {
      return NextResponse.json(
        { error: 'Shared access not found' },
        { status: 404 }
      );
    }

    // Check if user is authenticated
    const authHeader = request.headers.get('authorization');
    let currentUserEmail = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number; email: string };
        if (decoded) {
          const user = await db.get('SELECT email FROM users WHERE id = ?', [decoded.userId]);
          currentUserEmail = user?.email;
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    // If user is logged in and email matches, activate immediately
    if (currentUserEmail && currentUserEmail === sharedAccess.shared_with_email) {
      // Update shared access status to active
      await db.run(
        `UPDATE shared_access 
         SET status = 'active', 
             expires_at = datetime('now', '+7 days')
         WHERE id = ?`,
        [validation.sharedAccessId]
      );

      // Mark token as used
      await markTokenAsUsed(token);

      return NextResponse.json({
        success: true,
        message: 'Invitation accepted successfully',
        activated: true
      });
    }

    // If user is not logged in or email doesn't match
    return NextResponse.json({
      success: true,
      message: 'Invitation is valid. Please login to accept.',
      activated: false,
      requiresLogin: true
    });
    
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    );
  }
}