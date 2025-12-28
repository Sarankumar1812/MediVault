"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Eye, EyeOff, ChevronLeft } from "lucide-react"

interface LoginFlowProps {
  onSwitchToSignup: () => void
  onShowToast: (type: "success" | "error" | "warning" | "info", message: string) => void
  forgotPasswordStep?: string | null
  onForgotPasswordStepChange?: (step: string) => void
  onBackToLogin?: () => void
}

export default function LoginFlow({ 
  onSwitchToSignup, 
  onShowToast,
  forgotPasswordStep = null,
  onForgotPasswordStepChange,
  onBackToLogin 
}: LoginFlowProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Sync with parent component step
  useEffect(() => {
    // If we're in forgot password flow, notify parent
    if (forgotPasswordStep && onForgotPasswordStepChange) {
      onForgotPasswordStepChange(forgotPasswordStep)
    }
  }, [forgotPasswordStep])

  const handleLogin = async () => {
    if (!email.trim()) {
      onShowToast("error", "Please enter your email")
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
      setPassword("")
    } catch {
      onShowToast("error", "Login failed")
    } finally {
      setLoading(false)
    }
  }

  // Show forgot password flow
  const handleForgotPassword = () => {
    if (onForgotPasswordStepChange) {
      onForgotPasswordStepChange("email")
    }
  }

  if (forgotPasswordStep) {
    return <ForgotPasswordFlow 
      onBackToLogin={onBackToLogin || (() => {
        if (onForgotPasswordStepChange) {
          onForgotPasswordStepChange("")
        }
      })} 
      onShowToast={onShowToast}
      currentStep={forgotPasswordStep}
      onStepChange={onForgotPasswordStepChange}
    />
  }

  return (
    <div>
      <h2 id="auth-modal-title" className="text-2xl font-700 text-primary mb-2">
        Welcome Back
      </h2>
      <p className="text-sm text-muted-foreground mb-8">Sign in to your health wallet</p>

      <div className="space-y-4">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-600 text-foreground mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
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
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring pr-10"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              type="button"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <button
            onClick={handleForgotPassword}
            className="text-sm text-secondary hover:underline font-500"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
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

// Forgot Password Flow Component (with URL sync)
interface ForgotPasswordFlowProps {
  onBackToLogin: () => void
  onShowToast: (type: "success" | "error" | "warning" | "info", message: string) => void
  currentStep?: string
  onStepChange?: (step: string) => void
}

type ForgotPasswordStep = "email" | "otp" | "new-password"

function ForgotPasswordFlow({ onBackToLogin, onShowToast, currentStep = "email", onStepChange }: ForgotPasswordFlowProps) {
  const [step, setStep] = useState<ForgotPasswordStep>(currentStep as ForgotPasswordStep)
  const [email, setEmail] = useState("")
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Sync with parent component step
  useEffect(() => {
    if (currentStep && currentStep !== step) {
      setStep(currentStep as ForgotPasswordStep)
    }
  }, [currentStep])

  // Notify parent about step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(step)
    }
  }, [step, onStepChange])

  // OTP Handlers
  const handleOtpDigitChange = (index: number, value: string) => {
    const newDigits = [...otpDigits]
    newDigits[index] = value.replace(/\D/g, "").slice(0, 1)
    setOtpDigits(newDigits)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newDigits = [...otpDigits]
    text.split("").forEach((digit, index) => {
      if (index < 6) newDigits[index] = digit
    })
    setOtpDigits(newDigits)
  }

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!email.trim()) {
      onShowToast("error", "Please enter your email")
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep("otp")
      setResendTimer(30)
      onShowToast("success", "OTP sent to your email")
    } catch {
      onShowToast("error", "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    const otp = otpDigits.join("")
    if (!otp || otp.length !== 6) {
      onShowToast("error", "Please enter complete OTP")
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep("new-password")
      onShowToast("success", "OTP verified successfully")
    } catch {
      onShowToast("error", "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      onShowToast("error", "Please enter new password")
      return
    }
    if (!confirmPassword.trim()) {
      onShowToast("error", "Please confirm your password")
      return
    }
    if (newPassword !== confirmPassword) {
      onShowToast("error", "Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      onShowToast("error", "Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      onShowToast("success", "Password reset successfully!")
      
      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        onBackToLogin()
      }, 2000)
    } catch {
      onShowToast("error", "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = () => {
    setResendTimer(30)
    onShowToast("info", "OTP resent to your email")
  }

  // Handle Back Navigation
  const handleBack = () => {
    if (step === "email") {
      onBackToLogin()
    } else if (step === "otp") {
      setStep("email")
      setOtpDigits(["", "", "", "", "", ""])
    } else {
      setStep("otp")
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <h2 id="auth-modal-title" className="text-2xl font-700 text-primary mb-2">
        {step === "email" && "Reset Password"}
        {step === "otp" && "Verify OTP"}
        {step === "new-password" && "Create New Password"}
      </h2>
      
      <p className="text-sm text-muted-foreground mb-8">
        {step === "email" && "Enter your registered email to receive OTP"}
        {step === "otp" && "Enter the 6-digit OTP sent to your email"}
        {step === "new-password" && "Enter your new password"}
      </p>

      <div className="space-y-4">
        {/* Step 1: Enter Email */}
        {step === "email" && (
          <>
            <div>
              <label className="block text-sm font-600 text-foreground mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* Step 2: Enter OTP */}
        {step === "otp" && (
          <>
            <div>
              <label className="block text-sm font-600 text-foreground mb-3">
                Enter 6-Digit OTP <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 justify-center mb-4" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 border-2 border-border rounded-lg text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-transparent"
                    placeholder=" "
                    maxLength={1}
                  />
                ))}
              </div>
              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0}
                  className="text-xs text-secondary hover:underline font-500 disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </div>
            <button
              onClick={handleVerifyOTP}
              disabled={loading || otpDigits.join("").length !== 6}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* Step 3: New Password */}
        {step === "new-password" && (
          <>
            <div>
              <label className="block text-sm font-600 text-foreground mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  type="button"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-600 text-foreground mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  type="button"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}