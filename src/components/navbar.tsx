"use client"

import { useState } from "react"
import Image from "next/image"

interface NavbarProps {
  onAuthClick: (mode: "login" | "signup") => void
}

export default function Navbar({ onAuthClick }: NavbarProps) {
  const [activeSection, setActiveSection] = useState("home")

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ✅ Logo */}
          <button
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-1"
            aria-label="MediVault Home"
          >
            <Image
              src="/medivault_logo.png"
              alt="MediVault Logo"
              width={36}
              height={36}
              priority
              className="object-contain"
            />
            <span className="hidden sm:block text-lg font-600 text-foreground">
              MediVault
            </span>
          </button>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            {["home", "about", "features", "security"].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`text-sm font-500 transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1 ${
                  activeSection === section
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAuthClick("login")}
              className="text-sm font-500 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-3 py-2"
            >
              Login
            </button>
            <button
              onClick={() => onAuthClick("signup")}
              className="text-sm font-600 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
