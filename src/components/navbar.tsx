"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

interface NavbarProps {
  onAuthClick: (mode: "login" | "signup") => void
}

export default function Navbar({ onAuthClick }: NavbarProps) {
  const [activeSection, setActiveSection] = useState("home")
  const [visible, setVisible] = useState(true)

  const lastScrollY = useRef(0)

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
     Smooth scroll
  -------------------------------- */
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
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

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAuthClick("login")}
              className="
                text-sm font-500 text-white/80 hover:text-white
                px-3 py-2 rounded-lg
                transition-colors
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
              "
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
