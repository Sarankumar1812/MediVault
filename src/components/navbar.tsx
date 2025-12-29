"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { User, LogOut, Loader2 } from "lucide-react"
import { getAuthToken, clearAuthToken, getUserId, getUserEmail, getUserPhone } from "@/lib/auth-client"

interface NavbarProps {
  onAuthClick: (mode: "login" | "signup") => void
}

interface UserProfile {
  mv_ut_id: number
  mv_ut_email: string | null
  mv_ut_phone: string | null
  mv_id_first_name?: string
  mv_id_last_name?: string
  mv_id_profile_picture_url?: string
}

export default function Navbar({ onAuthClick }: NavbarProps) {
  const [activeSection, setActiveSection] = useState("home")
  const [visible, setVisible] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const lastScrollY = useRef(0)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  /* -------------------------------
     Check authentication status
  -------------------------------- */
  useEffect(() => {
    // Initial auth check
    checkAuthStatus()
    
    // Listen for custom auth events from login/signup
    const handleAuthChange = () => {
      console.log('Navbar: Auth change event received')
      checkAuthStatus()
    }
    
    // Listen for storage changes (for other tabs)
    const handleStorageChange = () => {
      console.log('Navbar: Storage change event received')
      checkAuthStatus()
    }
    
    // Add event listeners
    window.addEventListener('authStateChanged', handleAuthChange)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      console.log('Navbar: Checking authentication status...')
      
      const token = getAuthToken()
      const userId = getUserId()
      const email = getUserEmail()
      const phone = getUserPhone()
      
      console.log('Auth check results:', { 
        token: token ? `Yes (${token.substring(0, 20)}...)` : 'No',
        userId, 
        email, 
        phone 
      })
      
      if (token && userId) {
        console.log('Navbar: User is authenticated')
        setIsAuthenticated(true)
        
        // Create basic user profile from stored data
        const basicProfile: UserProfile = {
          mv_ut_id: userId,
          mv_ut_email: email,
          mv_ut_phone: phone,
          mv_id_first_name: '',
          mv_id_last_name: ''
        }
        setUserProfile(basicProfile)
        
        // Try to fetch detailed profile from API
        await fetchUserProfile()
      } else {
        console.log('Navbar: User is NOT authenticated')
        setIsAuthenticated(false)
        setUserProfile(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsAuthenticated(false)
      setUserProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      console.log('Navbar: Fetching user profile...')
      
      const response = await fetch('/api/profile/mv1005getprofile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Profile response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Profile response data:', data)
        
        if (data.success && data.data?.profile) {
          console.log('Navbar: User profile fetched successfully')
          setUserProfile(data.data.profile)
        }
      } else {
        console.log('Navbar: Failed to fetch user profile')
      }
    } catch (error) {
      console.error('Navbar: Failed to fetch user profile:', error)
    }
  }

  /* -------------------------------
     Scroll hide / show logic
  -------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY

      // Always show on hero section
      if (currentY < 120) {
        setVisible(true)
        lastScrollY.current = currentY
        return
      }

      // Scroll down → hide
      if (currentY > lastScrollY.current) {
        setVisible(false)
      } 
      // Scroll up → show
      else {
        setVisible(true)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  /* -------------------------------
     Click outside to close profile menu
  -------------------------------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* -------------------------------
     Smooth scroll
  -------------------------------- */
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  /* -------------------------------
     Profile functions
  -------------------------------- */
  const getProfileInitials = () => {
    if (!userProfile) return "U"
    
    const firstName = userProfile.mv_id_first_name || ''
    const lastName = userProfile.mv_id_last_name || ''
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase()
    } else if (userProfile.mv_ut_email) {
      return userProfile.mv_ut_email.charAt(0).toUpperCase()
    } else {
      return "U"
    }
  }

  const getProfileDisplayName = () => {
    if (!userProfile) return "User"
    
    if (userProfile.mv_id_first_name && userProfile.mv_id_last_name) {
      return `${userProfile.mv_id_first_name} ${userProfile.mv_id_last_name}`
    } else if (userProfile.mv_id_first_name) {
      return userProfile.mv_id_first_name
    } else if (userProfile.mv_ut_email) {
      return userProfile.mv_ut_email.split('@')[0]
    } else if (userProfile.mv_ut_phone) {
      return userProfile.mv_ut_phone
    } else {
      return "User"
    }
  }

  const handleLogout = () => {
    console.log('Navbar: Logging out...')
    clearAuthToken()
    setIsAuthenticated(false)
    setUserProfile(null)
    setShowProfileMenu(false)
    
    // Dispatch event so other components know about logout
    window.dispatchEvent(new CustomEvent('authStateChanged'))
    
    // Redirect to home page
    window.location.href = '/'
  }

  const handleProfileClick = () => {
    setShowProfileMenu(false)
    window.location.href = '/dashboard'
  }

  // If user is on dashboard page, don't show navbar
  if (typeof window !== 'undefined' && window.location.pathname === '/dashboard') {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <nav className="fixed top-4 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 rounded-full px-6 bg-primary/50 backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center gap-2">
              <Image
                src="/mv_logo_bg.jpg"
                alt="MediVault Logo"
                width={40}
                height={40}
                priority
              />
              <span className="hidden sm:block text-lg font-600 text-white">
                MediVault
              </span>
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-white/70" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav
      className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Rounded pill container */}
        <div
          className="
            flex items-center justify-between h-16
            rounded-full px-6
            bg-primary backdrop-blur-xl
            border border-white/10
            shadow-lg
          "
        >
          {/* Logo */}
          <button
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-2 focus:outline-none"
          >
            <Image
              src="/mv_logo_bg.jpg"
              alt="MediVault Logo"
              width={40}
              height={40}
              priority
            />
            <span className="hidden sm:block text-lg font-600 text-white">
              MediVault
            </span>
          </button>

          {/* Center links - Only show when not logged in */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              {["home", "about", "features", "security"].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-500 transition-colors ${
                    activeSection === section
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Right actions - Conditional rendering */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              /* Logged in: Show profile icon with initials */
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="
                    flex items-center justify-center
                    w-10 h-10 rounded-full
                    bg-white/20 hover:bg-white/30
                    border border-white/20
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-white/50
                  "
                  aria-label="User profile"
                >
                  <span className="text-white font-600 text-sm">
                    {getProfileInitials()}
                  </span>
                </button>

                {/* Profile dropdown menu */}
                {showProfileMenu && (
                  <div className="
                    absolute top-full right-0 mt-2
                    w-64 rounded-lg
                    bg-white/95 backdrop-blur-xl
                    border border-white/20
                    shadow-2xl
                    overflow-hidden
                    animate-in fade-in slide-in-from-top-2
                  ">
                    {/* Profile header */}
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="
                          flex items-center justify-center
                          w-12 h-12 rounded-full
                          bg-primary/20
                          border border-primary/30
                        ">
                          <span className="text-primary font-600 text-lg">
                            {getProfileInitials()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-600 text-gray-900 truncate">
                            {getProfileDisplayName()}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {userProfile?.mv_ut_email || userProfile?.mv_ut_phone || 'User'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfileClick}
                        className="
                          w-full px-4 py-3
                          flex items-center gap-3
                          text-left text-sm font-500 text-gray-700
                          hover:bg-gray-50/50
                          transition-colors
                        "
                      >
                        <User className="w-4 h-4" />
                        My Dashboard
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="
                          w-full px-4 py-3
                          flex items-center gap-3
                          text-left text-sm font-500 text-red-600
                          hover:bg-red-50/50
                          transition-colors
                        "
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in: Show auth buttons */
              <>

                <button
                  onClick={() => onAuthClick("signup")}
                  className="
                    text-sm font-600
                    bg-white text-primary
                    px-4 py-2 rounded-lg
                    hover:bg-white/90
                    transition-colors
                    shadow-sm
                  "
                >
                  Sign Up / Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}