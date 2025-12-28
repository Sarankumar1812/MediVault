"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { User, LogOut } from "lucide-react"
import { getAuthToken, clearAuthToken } from "@/lib/auth-client"

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const lastScrollY = useRef(0)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  /* -------------------------------
     Check authentication status
  -------------------------------- */
  useEffect(() => {
    checkAuthStatus()
    
    // Listen for auth changes
    const handleStorageChange = () => {
      checkAuthStatus()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const checkAuthStatus = async () => {
    const token = getAuthToken()
    if (token) {
      setIsAuthenticated(true)
      await fetchUserProfile()
    } else {
      setIsAuthenticated(false)
      setUserProfile(null)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch('/api/profile/mv1005getprofile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.profile) {
          setUserProfile(data.data.profile)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
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
    } else {
      return "User"
    }
  }

  const handleLogout = () => {
    clearAuthToken()
    setIsAuthenticated(false)
    setUserProfile(null)
    setShowProfileMenu(false)
    // Optional: Redirect to home page
    window.location.href = '/'
  }

  const handleProfileClick = () => {
    // Redirect to user dashboard or profile page
    window.location.href = '/dashboard'
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

          {/* Center links */}
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

          {/* Right actions - Conditional rendering */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              /* Logged in: Show profile icon */
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
                  {userProfile?.mv_id_profile_picture_url ? (
                    <Image
                      src={userProfile.mv_id_profile_picture_url}
                      alt="Profile"
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-600 text-sm">
                      {getProfileInitials()}
                    </span>
                  )}
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
                          {userProfile?.mv_id_profile_picture_url ? (
                            <Image
                              src={userProfile.mv_id_profile_picture_url}
                              alt="Profile"
                              width={44}
                              height={44}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-primary font-600 text-lg">
                              {getProfileInitials()}
                            </span>
                          )}
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
                  onClick={() => onAuthClick("login")}
                  className="
                    text-sm font-500 text-white/80 hover:text-white
                    px-3 py-2 rounded-lg
                    transition-colors
                    hover:bg-white/10
                  "
                >
                  Login
                </button>

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
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}