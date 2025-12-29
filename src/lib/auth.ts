// // lib/auth.ts
// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';

// const JWT_SECRET = process.env.JWT_SECRET || 'medivault-super-secret-key-change-in-production';
// const JWT_EXPIRY = '7d';

// export interface DecodedToken {
//   mv_ut_id: number;
//   mv_ut_email: string | null;
//   mv_ut_phone: string | null;
//   iat: number;
//   exp: number;
// }

// export interface TokenPayload {
//   mv_ut_id: number;
//   mv_ut_email: string | null;
//   mv_ut_phone: string | null;
// }

// // Generate JWT Token (Updated with correct parameters)
// export function generateToken(userId: number, email: string | null, phone: string | null): string {
//   const payload: TokenPayload = {
//     mv_ut_id: userId,
//     mv_ut_email: email,
//     mv_ut_phone: phone
//   };
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
// }

// // Generate Refresh Token
// export function generateRefreshToken(): string {
//   return crypto.randomBytes(40).toString('hex');
// }

// // Hash token for storage
// export function hashToken(token: string): string {
//   return crypto.createHash('sha256').update(token).digest('hex');
// }

// // Verify JWT Token
// export function verifyToken(token: string): DecodedToken | null {
//   try {
//     return jwt.verify(token, JWT_SECRET) as DecodedToken;
//   } catch (error) {
//     console.error('Token verification failed:', error);
//     return null;
//   }
// }

// // Extract user ID from token (Added this function)
// export function extractUserIdFromToken(token: string): number | null {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
//     return decoded.mv_ut_id;
//   } catch (error) {
//     return null;
//   }
// }

// // Extract email from token (Keep existing)
// export function extractEmailFromToken(token: string): string | null {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
//     return decoded.mv_ut_email;
//   } catch (error) {
//     return null;
//   }
// }

// // Frontend token management
// export function getAuthToken(): string | null {
//   if (typeof window === 'undefined') return null;
  
//   const token = localStorage.getItem('medivault-token') || 
//                 sessionStorage.getItem('medivault-token');
//   return token;
// }

// export function setAuthToken(token: string, remember = true): void {
//   if (typeof window === 'undefined') return;
  
//   if (remember) {
//     localStorage.setItem('medivault-token', token);
//   } else {
//     sessionStorage.setItem('medivault-token', token);
//   }
// }

// export function clearAuthToken(): void {
//   if (typeof window === 'undefined') return;
  
//   localStorage.removeItem('medivault-token');
//   sessionStorage.removeItem('medivault-token');
// }

// export function isAuthenticated(): boolean {
//   return !!getAuthToken();
// }


// lib/auth.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'medivault-super-secret-key-change-in-production-2024';
const JWT_EXPIRY = '7d';

export interface DecodedToken {
  mv_ut_id: number;
  mv_ut_email: string | null;
  mv_ut_phone: string | null;
  iat: number;
  exp: number;
}

export interface TokenPayload {
  mv_ut_id: number;
  mv_ut_email: string | null;
  mv_ut_phone: string | null;
}

// Generate JWT Token
export function generateToken(userId: number, email: string | null = null, phone: string | null = null): string {
  const payload: TokenPayload = {
    mv_ut_id: userId,
    mv_ut_email: email,
    mv_ut_phone: phone
  };
  
  try {
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256'
    });
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

// Generate Refresh Token
export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

// Hash token for storage
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Verify JWT Token
export function verifyToken(token: string): DecodedToken | null {
  try {
    // Clean the token first
    const cleanToken = token.trim().replace(/^["']|["']$/g, '');
    
    if (!cleanToken) {
      console.error('Token is empty after cleaning');
      return null;
    }
    
    const decoded = jwt.verify(cleanToken, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      console.error('Token expired at:', error.expiredAt);
    } else if (error.name === 'JsonWebTokenError') {
      console.error('JWT Error:', error.message);
    }
    
    return null;
  }
}

// Extract user ID from token
export function extractUserIdFromToken(token: string): number | null {
  try {
    if (!token || typeof token !== 'string') {
      console.error('Invalid token format');
      return null;
    }

    const cleanToken = token.trim().replace(/^["']|["']$/g, '');
    
    if (!cleanToken) {
      console.error('Token is empty after cleaning');
      return null;
    }

    const decoded = jwt.verify(cleanToken, JWT_SECRET) as any;
    
    if (!decoded || typeof decoded !== 'object') {
      console.error('Invalid decoded token');
      return null;
    }

    // Extract from mv_ut_id field
    const userId = decoded.mv_ut_id;
    
    if (!userId && userId !== 0) {
      console.error('No user ID found in token. Available fields:', Object.keys(decoded));
      return null;
    }

    const userIdNum = parseInt(userId.toString(), 10);
    
    if (isNaN(userIdNum)) {
      console.error('User ID is not a valid number:', userId);
      return null;
    }

    return userIdNum;
    
  } catch (error: any) {
    console.error('Token extraction error:', error.message);
    return null;
  }
}

// Extract email from token
export function extractEmailFromToken(token: string): string | null {
  try {
    const decoded = verifyToken(token);
    return decoded?.mv_ut_email || null;
  } catch (error) {
    return null;
  }
}

// Extract phone from token
export function extractPhoneFromToken(token: string): string | null {
  try {
    const decoded = verifyToken(token);
    return decoded?.mv_ut_phone || null;
  } catch (error) {
    return null;
  }
}