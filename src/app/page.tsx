"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Hero from "@/components/sections/hero"
import About from "@/components/sections/about"
import Capabilities from "@/components/sections/capabilities"
import Features from "@/components/sections/features"
import Security from "@/components/sections/security"
import FinalCTA from "@/components/sections/final-cta"
import Footer from "@/components/sections/footer"
import AuthModal from "@/components/auth/auth-modal"
import PrivacyModal from "@/components/auth/privacy-modal"
import Toast from "@/components/toast"

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup")
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning" | "info"; message: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("auth")) {
      setAuthOpen(true)
      setAuthMode((params.get("mode") as "login" | "signup") || "signup")
    }
  }, [])

  const handleOpenAuth = (mode: "login" | "signup" = "signup") => {
    setAuthMode(mode)
    setAuthOpen(true)
    window.history.pushState(null, "", `?auth=true&mode=${mode}`)
  }

  const handleCloseAuth = () => {
    setAuthOpen(false)
    window.history.pushState(null, "", "/")
  }

  return (
    <main className="bg-light-bg min-h-screen">
      <Navbar onAuthClick={handleOpenAuth} />
      <Hero onCTAClick={() => handleOpenAuth("signup")} />
      <About />
      <Capabilities />
      <Features />
      <Security />
      <FinalCTA onCTAClick={() => handleOpenAuth("signup")} />
      <Footer />

      <AuthModal
        open={authOpen}
        onOpenChange={handleCloseAuth}
        initialMode={authMode}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onShowToast={(type, message) => setToast({ type, message })}
      />

      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </main>
  )
}
