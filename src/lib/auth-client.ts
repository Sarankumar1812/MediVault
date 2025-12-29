// // lib/auth-client.ts
// // Client-side auth utilities (safe to use in components)

// export function setAuthToken(token: string, remember = true): void {
//   if (typeof window === 'undefined') return;
  
//   if (remember) {
//     localStorage.setItem('medivault-token', token);
//   } else {
//     sessionStorage.setItem('medivault-token', token);
//   }
// }

// export function getAuthToken(): string | null {
//   if (typeof window === 'undefined') return null;
  
//   return localStorage.getItem('medivault-token') || 
//          sessionStorage.getItem('medivault-token');
// }

// export function clearAuthToken(): void {
//   if (typeof window === 'undefined') return;
  
//   localStorage.removeItem('medivault-token');
//   sessionStorage.removeItem('medivault-token');
// }

// export function isAuthenticated(): boolean {
//   return !!getAuthToken();
// }

// // Helper for API calls with auth
// export async function fetchWithAuth(url: string, options: RequestInit = {}) {
//   const token = getAuthToken();
  
//   const headers = {
//     ...options.headers,
//     ...(token && { 'Authorization': `Bearer ${token}` }),
//     'Content-Type': 'application/json',
//   };
  
//   return fetch(url, {
//     ...options,
//     headers,
//   });
// }


// lib/auth-client.ts - Complete unified version
/**
 * Unified authentication client for frontend use
 * All functions are safe to use in React components
 */

// Storage keys (consistent naming)
const TOKEN_KEY = 'medivault-auth-token';
const USER_ID_KEY = 'medivault-user-id';
const USER_EMAIL_KEY = 'medivault-user-email';
const USER_PHONE_KEY = 'medivault-user-phone';
const REMEMBER_ME_KEY = 'medivault-remember-me';

/* ========== TOKEN MANAGEMENT ========== */

/**
 * Get authentication token from storage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Check localStorage first (for "remember me")
    if (localStorage.getItem(REMEMBER_ME_KEY) === 'true') {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) return token;
    }
    
    // Check sessionStorage (for session-only)
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Save authentication token and user data
 * @param token JWT token
 * @param remember Whether to remember user (store in localStorage)
 */
export function setAuthToken(token: string, remember: boolean = true): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REMEMBER_ME_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(REMEMBER_ME_KEY, 'false');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
}

/**
 * Save complete authentication data
 * @param token JWT token
 * @param userId User ID
 * @param email User email (optional)
 * @param phone User phone (optional)
 * @param remember Whether to remember user
 */
export function saveAuthData(
  token: string, 
  userId: number, 
  email: string | null = null, 
  phone: string | null = null,
  remember: boolean = true
): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (remember) {
      // Save to localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_ID_KEY, userId.toString());
      if (email) localStorage.setItem(USER_EMAIL_KEY, email);
      if (phone) localStorage.setItem(USER_PHONE_KEY, phone);
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      
      // Clear sessionStorage
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_ID_KEY);
      sessionStorage.removeItem(USER_EMAIL_KEY);
      sessionStorage.removeItem(USER_PHONE_KEY);
      sessionStorage.removeItem(REMEMBER_ME_KEY);
    } else {
      // Save to sessionStorage
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_ID_KEY, userId.toString());
      if (email) sessionStorage.setItem(USER_EMAIL_KEY, email);
      if (phone) sessionStorage.setItem(USER_PHONE_KEY, phone);
      sessionStorage.setItem(REMEMBER_ME_KEY, 'false');
      
      // Clear localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(USER_EMAIL_KEY);
      localStorage.removeItem(USER_PHONE_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
}

/**
 * Clear all authentication data from storage
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_PHONE_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    
    // Clear sessionStorage
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_ID_KEY);
    sessionStorage.removeItem(USER_EMAIL_KEY);
    sessionStorage.removeItem(USER_PHONE_KEY);
    sessionStorage.removeItem(REMEMBER_ME_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}

/* ========== USER DATA MANAGEMENT ========== */

/**
 * Get user ID from storage
 */
export function getUserId(): number | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Check localStorage first
    if (localStorage.getItem(REMEMBER_ME_KEY) === 'true') {
      const userIdStr = localStorage.getItem(USER_ID_KEY);
      if (userIdStr) return parseInt(userIdStr, 10);
    }
    
    // Check sessionStorage
    const sessionUserIdStr = sessionStorage.getItem(USER_ID_KEY);
    if (sessionUserIdStr) return parseInt(sessionUserIdStr, 10);
    
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

/**
 * Get user email from storage
 */
export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    if (localStorage.getItem(REMEMBER_ME_KEY) === 'true') {
      return localStorage.getItem(USER_EMAIL_KEY);
    }
    
    return sessionStorage.getItem(USER_EMAIL_KEY);
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

/**
 * Get user phone from storage
 */
export function getUserPhone(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    if (localStorage.getItem(REMEMBER_ME_KEY) === 'true') {
      return localStorage.getItem(USER_PHONE_KEY);
    }
    
    return sessionStorage.getItem(USER_PHONE_KEY);
  } catch (error) {
    console.error('Error getting user phone:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Check if "remember me" is enabled
 */
export function isRememberMeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  } catch (error) {
    return false;
  }
}

/* ========== API HELPERS ========== */

/**
 * Fetch with authentication headers
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && 
      options.method && 
      ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
    headers.set('Content-Type', 'application/json');
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Validate authentication token
 */
export async function validateToken(): Promise<boolean> {
  const token = getAuthToken();
  
  if (!token) {
    return false;
  }
  
  try {
    const response = await fetchWithAuth('/api/auth/validate');
    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/* ========== AUTH ACTIONS ========== */

/**
 * Logout user and redirect to login page
 */
export function logout(): void {
  clearAuthToken();
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Logout user and redirect to home page
 */
export function logoutToHome(): void {
  clearAuthToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

/**
 * Simple logout without redirect
 */
export function silentLogout(): void {
  clearAuthToken();
}

/* ========== TYPE GUARDS ========== */

/**
 * Check if response is unauthorized (401)
 */
export function isUnauthorizedResponse(response: Response): boolean {
  return response.status === 401;
}

/**
 * Handle unauthorized response (logout and redirect)
 */
export function handleUnauthorizedResponse(): void {
  console.warn('Unauthorized access detected. Logging out...');
  logout();
}

/* ========== EXPORT ALL FUNCTIONS ========== */

// Export everything for convenience
export default {
  // Token management
  getAuthToken,
  setAuthToken,
  saveAuthData,
  clearAuthToken,
  
  // User data
  getUserId,
  getUserEmail,
  getUserPhone,
  isAuthenticated,
  isRememberMeEnabled,
  
  // API helpers
  fetchWithAuth,
  validateToken,
  
  // Auth actions
  logout,
  logoutToHome,
  silentLogout,
  
  // Response handlers
  isUnauthorizedResponse,
  handleUnauthorizedResponse
};