// lib/auth-client.ts
// Client-side auth utilities (safe to use in components)

export function setAuthToken(token: string, remember = true): void {
  if (typeof window === 'undefined') return;
  
  if (remember) {
    localStorage.setItem('medivault-token', token);
  } else {
    sessionStorage.setItem('medivault-token', token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('medivault-token') || 
         sessionStorage.getItem('medivault-token');
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('medivault-token');
  sessionStorage.removeItem('medivault-token');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Helper for API calls with auth
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
    'Content-Type': 'application/json',
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}