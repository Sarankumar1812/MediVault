// app/api/profile/check/route.ts
import { getDatabase } from '@/lib/database'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string }
  } catch (error) {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const user = await db.get(
      `SELECT 
        phone, date_of_birth, gender, address, blood_type, height, weight,
        allergies, conditions, medications, emergency_name, emergency_relation, emergency_phone
       FROM users WHERE id = ?`,
      decoded.userId
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if profile is complete (has at least basic information)
    // Required fields: phone, date_of_birth, gender, blood_type
    const hasPhone = !!user.phone && user.phone.trim().length > 0
    const hasDOB = !!user.date_of_birth
    const hasGender = !!user.gender && user.gender.trim().length > 0
    const hasBloodType = !!user.blood_type && user.blood_type.trim().length > 0
    
    const profileComplete = hasPhone && hasDOB && hasGender && hasBloodType

    return NextResponse.json({
      profileComplete,
      missingFields: profileComplete ? [] : [
        !hasPhone && 'Phone Number',
        !hasDOB && 'Date of Birth',
        !hasGender && 'Gender',
        !hasBloodType && 'Blood Type'
      ].filter(Boolean),
      user: {
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        blood_type: user.blood_type
      }
    })

  } catch (error) {
    console.error('Error checking profile:', error)
    return NextResponse.json(
      { error: 'Failed to check profile status' },
      { status: 500 }
    )
  }
}