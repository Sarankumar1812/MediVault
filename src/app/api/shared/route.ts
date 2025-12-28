// import { getDatabase, generateInvitationToken } from '@/lib/database'
// import { NextResponse } from 'next/server'
// import jwt from 'jsonwebtoken'
// import { sendShareInvitationEmail } from '@/lib/email'

// const JWT_SECRET = process.env.JWT_SECRET || 'health-wallet-secret-key'

// function verifyToken(token: string) {
//   try {
//     return jwt.verify(token, JWT_SECRET) as { userId: number; email: string }
//   } catch {
//     return null
//   }
// }

// /* =========================
//    GET – Fetch shared access
// ========================= */
// export async function GET(request: Request) {
//   try {
//     const authHeader = request.headers.get('authorization')

//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const decoded = verifyToken(authHeader.split(' ')[1])
//     if (!decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
//     }

//     const db = await getDatabase()

//     const sharedAccess = await db.all(
//       `
//       SELECT 
//         sa.id,
//         sa.shared_with_email,
//         sa.shared_with_name,
//         sa.access_level,
//         sa.status,
//         sa.reports_shared,
//         sa.expires_at,
//         sa.created_at,
//         COUNT(sr.id) as actual_reports_shared
//       FROM shared_access sa
//       LEFT JOIN shared_reports sr ON sa.id = sr.shared_access_id
//       WHERE sa.user_id = ?
//       GROUP BY sa.id
//       ORDER BY sa.created_at DESC
//       `,
//       [decoded.userId]
//     )

//     const formatted = sharedAccess.map((access: any) => ({
//       id: access.id,
//       name: access.shared_with_name || access.shared_with_email.split('@')[0],
//       email: access.shared_with_email,
//       role: getRoleFromEmail(access.shared_with_email),
//       accessLevel: formatAccessLevel(access.access_level),
//       reportsShared: access.actual_reports_shared || access.reports_shared,
//       sharedDate: new Date(access.created_at).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric'
//       }),
//       status: access.status.charAt(0).toUpperCase() + access.status.slice(1)
//     }))

//     return NextResponse.json(formatted)
//   } catch (error) {
//     console.error('GET shared access error:', error)
//     return NextResponse.json(
//       { error: 'Failed to fetch shared access data' },
//       { status: 500 }
//     )
//   }
// }

// /* =========================
//    POST – Create shared access
// ========================= */
// export async function POST(request: Request) {
//   try {
//     const authHeader = request.headers.get('authorization')

//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const decoded = verifyToken(authHeader.split(' ')[1])
//     if (!decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
//     }

//     const data = await request.json()
//     const db = await getDatabase()

//     if (!data.email || !data.access_level) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       )
//     }

//     const existingShare = await db.get(
//       `
//       SELECT id FROM shared_access
//       WHERE user_id = ? AND shared_with_email = ?
//       AND status IN ('pending', 'active')
//       `,
//       [decoded.userId, data.email]
//     )

//     if (existingShare) {
//       return NextResponse.json(
//         { error: 'Already shared with this email' },
//         { status: 400 }
//       )
//     }

//     const user = await db.get(
//       'SELECT full_name, email FROM users WHERE id = ?',
//       [decoded.userId]
//     )

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 })
//     }

//     const expiresAt = new Date()
//     expiresAt.setDate(expiresAt.getDate() + 7)

//     const result = await db.run(
//       `
//       INSERT INTO shared_access
//       (user_id, shared_with_email, shared_with_name, access_level, status, expires_at)
//       VALUES (?, ?, ?, ?, 'pending', ?)
//       `,
//       [
//         decoded.userId,
//         data.email,
//         data.name || data.email.split('@')[0],
//         data.access_level,
//         expiresAt.toISOString()
//       ]
//     )

//     const sharedAccessId = result.lastID

//     // ✅ CRITICAL SAFETY CHECK
//     if (!sharedAccessId) {
//       return NextResponse.json(
//         { error: 'Failed to create shared access record' },
//         { status: 500 }
//       )
//     }

//     const invitationToken = await generateInvitationToken(sharedAccessId)

//     await db.run(
//       'UPDATE shared_access SET invitation_token = ? WHERE id = ?',
//       [invitationToken, sharedAccessId]
//     )

//     const baseUrl =
//       process.env.NEXTAUTH_URL ||
//       process.env.NEXT_PUBLIC_APP_URL ||
//       'http://localhost:3000'

//     const invitationLink = `${baseUrl}/shared-access/accept?token=${invitationToken}`

//     try {
//       await sendShareInvitationEmail({
//         to: data.email,
//         fromName: user.full_name,
//         fromEmail: user.email,
//         accessLevel: formatAccessLevel(data.access_level),
//         invitationLink
//       })

//       await db.run(
//         'UPDATE shared_access SET email_sent = 1 WHERE id = ?',
//         [sharedAccessId]
//       )
//     } catch (emailError) {
//       console.error('Email send failed:', emailError)
//       await db.run(
//         'UPDATE shared_access SET email_sent = 0 WHERE id = ?',
//         [sharedAccessId]
//       )
//     }

//     return NextResponse.json({
//       message: 'Invitation sent successfully',
//       id: sharedAccessId,
//       token: invitationToken
//     })
//   } catch (error: any) {
//     console.error('POST shared access error:', error)

//     return NextResponse.json(
//       {
//         error: 'Failed to create shared access',
//         details: error.message
//       },
//       { status: 500 }
//     )
//   }
// }

// /* =========================
//    DELETE – Revoke access
// ========================= */
// export async function DELETE(request: Request) {
//   try {
//     const authHeader = request.headers.get('authorization')

//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const decoded = verifyToken(authHeader.split(' ')[1])
//     if (!decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
//     }

//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')

//     if (!id) {
//       return NextResponse.json(
//         { error: 'Missing shared access ID' },
//         { status: 400 }
//       )
//     }

//     const db = await getDatabase()

//     const sharedAccess = await db.get(
//       'SELECT id FROM shared_access WHERE id = ? AND user_id = ?',
//       [id, decoded.userId]
//     )

//     if (!sharedAccess) {
//       return NextResponse.json(
//         { error: 'Shared access not found or unauthorized' },
//         { status: 404 }
//       )
//     }

//     await db.run('DELETE FROM shared_access WHERE id = ?', [id])

//     return NextResponse.json({ message: 'Shared access revoked successfully' })
//   } catch (error) {
//     console.error('DELETE shared access error:', error)
//     return NextResponse.json(
//       { error: 'Failed to revoke shared access' },
//       { status: 500 }
//     )
//   }
// }

// /* =========================
//    Helpers
// ========================= */
// function getRoleFromEmail(email: string): string {
//   if (email.includes('dr.') || email.includes('doctor') || email.includes('clinic'))
//     return 'Doctor'
//   if (email.includes('cardio')) return 'Cardiologist'
//   if (email.includes('hospital') || email.includes('health'))
//     return 'Healthcare Provider'
//   return 'Family Member'
// }

// function formatAccessLevel(level: string): string {
//   switch (level) {
//     case 'full':
//       return 'Full Access'
//     case 'limited':
//       return 'Limited Access'
//     case 'view_only':
//       return 'View Only'
//     default:
//       return level
//   }
// }
import { getDatabase, generateInvitationToken } from '@/lib/database'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { sendShareInvitationEmail } from '@/lib/email'

const JWT_SECRET = process.env.JWT_SECRET || 'health-wallet-secret-key'

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string }
  } catch {
    return null
  }
}

/* =========================
   GET – Fetch shared access
========================= */
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

    const sharedAccess = await db.all(
      `
      SELECT 
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
      ORDER BY sa.created_at DESC
      `,
      [decoded.userId]
    )

    const formatted = sharedAccess.map((access: any) => ({
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
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('GET shared access error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shared access data' },
      { status: 500 }
    )
  }
}

/* =========================
   POST – Create shared access
========================= */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(authHeader.split(' ')[1])
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const data = await request.json()
    const db = await getDatabase()

// ✅ FIX: Handle both field names with better debugging
    const email = data.email;
    const accessLevel = data.access_level || data.accessLevel || 'limited';
    const name = data.name || data.recipientName || email?.split('@')[0];

   if (!email || !email.includes('@')) {
      console.log('❌ Invalid email:', email);
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!accessLevel) {
      console.log('❌ No access level provided');
      return NextResponse.json(
        { error: 'Access level is required' },
        { status: 400 }
      )
    }

    const existingShare = await db.get(
      `
      SELECT id FROM shared_access
      WHERE user_id = ? AND shared_with_email = ?
      AND status IN ('pending', 'active')
      `,
      [decoded.userId, email]
    )

    if (existingShare) {
      return NextResponse.json(
        { error: 'Already shared with this email' },
        { status: 400 }
      )
    }

    const user = await db.get(
      'SELECT full_name, email FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const result = await db.run(
      `
      INSERT INTO shared_access
      (user_id, shared_with_email, shared_with_name, access_level, status, expires_at)
      VALUES (?, ?, ?, ?, 'pending', ?)
      `,
      [
        decoded.userId,
        email,
        name,
        accessLevel,
        expiresAt.toISOString()
      ]
    )

    const sharedAccessId = result.lastID

    // ✅ CRITICAL SAFETY CHECK
    if (!sharedAccessId) {
      return NextResponse.json(
        { error: 'Failed to create shared access record' },
        { status: 500 }
      )
    }

    const invitationToken = await generateInvitationToken(sharedAccessId)

    await db.run(
      'UPDATE shared_access SET invitation_token = ? WHERE id = ?',
      [invitationToken, sharedAccessId]
    )

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'

    const invitationLink = `${baseUrl}/shared-access/accept?token=${invitationToken}`

    try {
      // ✅ ACTUALLY SEND EMAIL AND WAIT FOR RESULT
      const emailResult = await sendShareInvitationEmail({
        to: email,
        fromName: user.full_name,
        fromEmail: user.email,
        accessLevel: formatAccessLevel(accessLevel),
        invitationLink
      })

      if (emailResult.success) {
        await db.run(
          'UPDATE shared_access SET email_sent = 1 WHERE id = ?',
          [sharedAccessId]
        )
        console.log(`✅ Email sent successfully to ${email}`)
      } else {
        await db.run(
          'UPDATE shared_access SET email_sent = 0 WHERE id = ?',
          [sharedAccessId]
        )
        console.log(`❌ Email failed to send to ${email}`)
      }
    } catch (emailError) {
      console.error('❌ Email send failed:', emailError)
      await db.run(
        'UPDATE shared_access SET email_sent = 0 WHERE id = ?',
        [sharedAccessId]
      )
      
      // Still return success to user, but log the error
      return NextResponse.json({
        message: 'Invitation created but email may not have been sent',
        id: sharedAccessId,
        token: invitationToken,
        warning: 'Email delivery may have failed'
      })
    }

    return NextResponse.json({
      message: 'Invitation sent successfully',
      id: sharedAccessId,
      token: invitationToken
    })
  } catch (error: any) {
    console.error('POST shared access error:', error)

    return NextResponse.json(
      {
        error: 'Failed to create shared access',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE – Revoke access
========================= */
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(authHeader.split(' ')[1])
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing shared access ID' },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    const sharedAccess = await db.get(
      'SELECT id FROM shared_access WHERE id = ? AND user_id = ?',
      [id, decoded.userId]
    )

    if (!sharedAccess) {
      return NextResponse.json(
        { error: 'Shared access not found or unauthorized' },
        { status: 404 }
      )
    }

    await db.run('DELETE FROM shared_access WHERE id = ?', [id])

    return NextResponse.json({ message: 'Shared access revoked successfully' })
  } catch (error) {
    console.error('DELETE shared access error:', error)
    return NextResponse.json(
      { error: 'Failed to revoke shared access' },
      { status: 500 }
    )
  }
}

/* =========================
   Helpers
========================= */
function getRoleFromEmail(email: string): string {
  if (email.includes('dr.') || email.includes('doctor') || email.includes('clinic'))
    return 'Doctor'
  if (email.includes('cardio')) return 'Cardiologist'
  if (email.includes('hospital') || email.includes('health'))
    return 'Healthcare Provider'
  return 'Family Member'
}

function formatAccessLevel(level: string): string {
  switch (level) {
    case 'full':
      return 'Full Access'
    case 'limited':
      return 'Limited Access'
    case 'view_only':
      return 'View Only'
    default:
      return level
  }
}