"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"

interface LoginFlowProps {
  onSwitchToSignup: () => void
  onShowToast: (type: "success" | "error" | "warning" | "info", message: string) => void
}

type LoginMode = "email" | "otp" | "password"

export default function LoginFlow({ onSwitchToSignup, onShowToast }: LoginFlowProps) {
  const [mode, setMode] = useState<LoginMode>("email")
  const [email, setEmail] = useState("")
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return

    const newOtp = [...otpDigits]
    newOtp[index] = value

    setOtpDigits(newOtp)

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newOtp = [...otpDigits]

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }

    setOtpDigits(newOtp)

    if (pastedData.length === 6) {
      otpInputRefs.current[5]?.blur()
    } else if (pastedData.length > 0) {
      otpInputRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }
  }

  const otp = otpDigits.join("")

  const handleRequestOTP = async () => {
    if (!email.trim()) {
      onShowToast("error", "Please enter your email")
      return
    }
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onShowToast("success", "OTP sent to your email")
      setMode("otp")
      setResendTimer(30)
    } catch {
      onShowToast("error", "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndLogin = async () => {
    if (!otp || otp.length !== 6) {
      onShowToast("error", "Please enter complete OTP")
      return
    }
    if (!password.trim()) {
      onShowToast("error", "Please enter your password")
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      onShowToast("success", "Login successful!")
      setEmail("")
      setOtpDigits(["", "", "", "", "", ""])
      setPassword("")
      setMode("email")
    } catch {
      onShowToast("error", "Login failed")
    } finally {
      setLoading(false)
    }
  }

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleResendOTP = () => {
    setResendTimer(30)
    onShowToast("info", "OTP resent to your email")
  }

  return (
    <div>
      <h2 id="auth-modal-title" className="text-2xl font-700 text-primary mb-2">
        Welcome Back
      </h2>
      <p className="text-sm text-muted-foreground mb-8">Sign in to your health wallet</p>

      {/* Email Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-600 text-foreground mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={mode !== "email"}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground"
          />
        </div>

        {mode !== "email" && (
          <>
            {/* 6-Digit OTP Boxes */}
            <div>
              <label className="block text-sm font-600 text-foreground mb-3">
                Enter 6-Digit OTP <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 justify-center mb-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    placeholder="•"
                    autoComplete="one-time-code"
                    className="w-12 h-12 text-center text-2xl font-700 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                ))}
              </div>
              <button
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                className="text-xs text-secondary hover:underline font-500 disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-600 text-foreground mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Primary Action Button */}
        <button
          onClick={mode === "email" ? handleRequestOTP : handleVerifyAndLogin}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (mode === "email" ? "Sending..." : "Logging in...") : mode === "email" ? "Request OTP" : "Login"}
        </button>

        {/* Back Button - Only show when in OTP/Password mode */}
        {mode !== "email" && (
          <button
            onClick={() => {
              setMode("email")
              setOtpDigits(["", "", "", "", "", ""])
              setPassword("")
              setShowPassword(false)
            }}
            className="w-full border border-border text-foreground py-3 rounded-lg font-600 hover:bg-muted transition-colors"
          >
            Back
          </button>
        )}
      </div>

      {/* Switch to Signup */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Don't have an account?{" "}
        <button
          onClick={onSwitchToSignup}
          className="text-secondary hover:underline font-600 focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
        >
          Sign up
        </button>
      </p>
    </div>
  )
}
