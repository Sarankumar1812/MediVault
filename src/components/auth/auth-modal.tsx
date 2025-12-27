"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import SignupFlow from "./signup-flow"
import LoginFlow from "./login-flow"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode: "login" | "signup"
  onOpenPrivacy: () => void
  onShowToast: (type: "success" | "error" | "warning" | "info", message: string) => void
}

export default function AuthModal({ open, onOpenChange, initialMode, onOpenPrivacy, onShowToast }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)

  if (!open) return null

  const handleEscapeKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false)
    }
  }

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
                onSwitchToLogin={() => setMode("login")}
                onOpenPrivacy={onOpenPrivacy}
                onShowToast={onShowToast}
              />
            ) : (
              <LoginFlow onSwitchToSignup={() => setMode("signup")} onShowToast={onShowToast} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
