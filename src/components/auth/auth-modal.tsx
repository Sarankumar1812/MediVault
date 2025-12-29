"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import SignupFlow from "./signup-flow"
import LoginFlow from "./login-flow"
import { useRouter, useSearchParams } from "next/navigation"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode: "login" | "signup"
  onOpenPrivacy: () => void
  onShowToast: (type: "success" | "error" | "warning" | "info", message: string) => void
}

export default function AuthModal({ open, onOpenChange, initialMode, onOpenPrivacy, onShowToast }: AuthModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<"login" | "signup">(initialMode)
  const [signupStep, setSignupStep] = useState<string>("contact")
  const [loginStep, setLoginStep] = useState<string>("email")

  // Initialize from URL parameters
  useEffect(() => {
    if (!open) return
    
    const modeParam = searchParams.get("mode")
    const stepParam = searchParams.get("step")
    
    if (modeParam === "login" || modeParam === "signup") {
      setMode(modeParam)
    }
    
    if (modeParam === "signup" && stepParam) {
      setSignupStep(stepParam)
    }
    
    if (modeParam === "login" && stepParam) {
      setLoginStep(stepParam)
    }
  }, [open, searchParams])

  // Update URL when mode/step changes
  const updateUrl = (newMode: "login" | "signup", step?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("mode", newMode)
    
    if (step) {
      params.set("step", step)
    } else {
      params.delete("step")
    }
    
    // Keep auth=true
    params.set("auth", "true")
    
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  const handleModeChange = (newMode: "login" | "signup") => {
    setMode(newMode)
    if (newMode === "signup") {
      setSignupStep("contact")
      updateUrl(newMode, "contact")
    } else {
      setLoginStep("email")
      updateUrl(newMode, "email")
    }
  }

  const handleSignupStepChange = (step: string) => {
    setSignupStep(step)
    updateUrl("signup", step)
  }

  const handleLoginSuccess = () => {
    console.log('AuthModal: Login successful, closing modal...')
    onShowToast("success", "Welcome back to MediVault!")
    onOpenChange(false)
    // User stays on landing page, navbar updates via events
  }

  const handleSignupComplete = () => {
    console.log('AuthModal: Signup complete, closing modal...')
    onShowToast("success", "Welcome to MediVault!")
    onOpenChange(false)
    // User stays on landing page, navbar updates via events
  }

  const handleEscapeKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onKeyDown={handleEscapeKey}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto relative">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="sticky top-4 right-4 float-right p-2 hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="p-8 pt-12">
            {mode === "signup" ? (
              <SignupFlow
                onSwitchToLogin={() => handleModeChange("login")}
                onOpenPrivacy={onOpenPrivacy}
                onShowToast={onShowToast}
                currentStep={signupStep}
                onStepChange={handleSignupStepChange}
                onSignupComplete={handleSignupComplete}
              />
            ) : (
              <LoginFlow 
                onSwitchToSignup={() => handleModeChange("signup")} 
                onShowToast={onShowToast}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}