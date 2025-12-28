// hooks/use-auth.tsx (Updated with refresh tokens)
"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  full_name: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  checkProfileComplete: () => Promise<boolean>
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    // Set up token refresh interval
    const interval = setInterval(() => {
      const token = localStorage.getItem('healthwallet-token')
      if (token) {
        refreshToken().catch(console.error)
      }
    }, 15 * 60 * 1000) // Refresh every 15 minutes
    
    return () => clearInterval(interval)
  }, [])

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('healthwallet-token')
      const refreshToken = localStorage.getItem('healthwallet-refresh-token')
      
      if (!token || !refreshToken) return false

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('healthwallet-token', data.token)
        localStorage.setItem('healthwallet-refresh-token', data.refreshToken)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('healthwallet-token')
      if (!token) {
        setIsLoading(false)
        return
      }

      // Verify token and get user data
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await refreshToken()
        if (refreshed) {
          // Retry with new token
          await checkAuth()
          return
        } else {
          localStorage.removeItem('healthwallet-token')
          localStorage.removeItem('healthwallet-refresh-token')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkProfileComplete = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('healthwallet-token')
      if (!token) return false

      const response = await fetch('/api/profile/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.profileComplete
      }
      return false
    } catch (error) {
      console.error('Profile check failed:', error)
      return false
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store both tokens
      localStorage.setItem('healthwallet-token', data.token)
      localStorage.setItem('healthwallet-refresh-token', data.refreshToken)
      setUser(data.user)
      
      // Check if profile is complete after login
      const profileComplete = await checkProfileComplete()
      
      // Redirect based on profile status
      if (profileComplete) {
        router.push('/dashboard')
      } else {
        router.push('/profile?setup=true')
      }
      
      return data
    } catch (error: any) {
      throw new Error(error.message || 'Login failed. Please check your credentials.')
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Auto login after registration
      await login(userData.email, userData.password)
      
      return data
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed. Please try again.')
    }
  }

  const logout = () => {
    localStorage.removeItem('healthwallet-token')
    localStorage.removeItem('healthwallet-refresh-token')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user,
      login, 
      register, 
      logout,
      checkProfileComplete,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}