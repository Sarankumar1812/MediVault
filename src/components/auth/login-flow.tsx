"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Eye, EyeOff, ChevronLeft } from "lucide-react"
import { setAuthToken } from "@/lib/auth-client"

type LoginStep = "email" | "otp"

interface LoginFlowProps {
  onSwitchToSignup: () => void
  onShowToast: (type: "success" | "error" | "warning" | "info", message: string) => void
  onLoginSuccess?: () => void
}

export default function LoginFlow({ 
  onSwitchToSignup, 
  onShowToast,
  onLoginSuccess
}: LoginFlowProps) {
  const [step, setStep] = useState<LoginStep>("email")
  const [email, setEmail] = useState("")
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [userId, setUserId] = useState<number | null>(null)

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Auto-submit OTP when all digits are entered
  useEffect(() => {
    const otp = otpDigits.join("")
    if (otp.length === 6 && step === "otp") {
      handleVerifyOTP()
    }
  }, [otpDigits])

  // Send login OTP API call
  const sendLoginOTP = async (email: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/mv1007sendloginotp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact: email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP')
      }

      setUserId(data.data.userId)
      onShowToast("success", data.message || "OTP sent successfully")
      
      // In development, show OTP in console
      if (process.env.NODE_ENV === 'development' && data.data.debugOtp) {
        console.log(`Development OTP: ${data.data.debugOtp}`)
      }
      
      return { success: true, data }
    } catch (error: any) {
      onShowToast("error", error.message || "Failed to send OTP")
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Verify login OTP API call
  const verifyLoginOTP = async (email: string, otp: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/mv1008verifyloginotp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: email,
          otp: otp
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP')
      }

      // Store token
      if (data.data.token) {
        setAuthToken(data.data.token, true)
      }

      onShowToast("success", data.message || "Login successful!")
      return { success: true, data }
    } catch (error: any) {
      onShowToast("error", error.message || "Failed to verify OTP")
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Handle email submission
  const handleSendOTP = async () => {
    if (!email.trim() || !email.includes('@')) {
      onShowToast("error", "Please enter a valid email address")
      return
    }

    const result = await sendLoginOTP(email)
    
    if (result.success) {
      setStep("otp")
      setResendTimer(30)
    }
  }

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    const otp = otpDigits.join("")
    if (otp.length !== 6) {
      onShowToast("error", "Please enter complete 6-digit OTP")
      return
    }

    const result = await verifyLoginOTP(email, otp)
    
    if (result.success) {
      // Clear form
      setEmail("")
      setOtpDigits(["", "", "", "", "", ""])
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    }
  }

  // OTP Handlers
  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1)
    const newOtp = [...otpDigits]
    newOtp[index] = digit
    setOtpDigits(newOtp)

    if (digit && index < 5) {
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

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newDigits = [...otpDigits]
    
    pastedText.split("").forEach((digit, index) => {
      if (index < 6) newDigits[index] = digit
    })
    
    setOtpDigits(newDigits)
    
    if (pastedText.length < 6) {
      const nextInput = document.getElementById(`otp-${pastedText.length}`)
      nextInput?.focus()
    } else {
      const lastInput = document.getElementById(`otp-5`)
      lastInput?.focus()
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    const result = await sendLoginOTP(email)
    
    if (result.success) {
      setResendTimer(30)
      setOtpDigits(["", "", "", "", "", ""])
    }
  }

  // Handle Back Navigation
  const handleBack = () => {
    if (step === "otp") {
      setStep("email")
      setOtpDigits(["", "", "", "", "", ""])
    }
  }

  return (
    <div>
      <h2 id="auth-modal-title" className="text-2xl font-700 text-primary mb-2">
        {step === "email" ? "Welcome Back" : "Verify OTP"}
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        {step === "email" 
          ? "Sign in to your health wallet" 
          : `Enter OTP sent to ${email}`
        }
      </p>

      <div className="space-y-4">
        {/* Step 1: Enter Email */}
        {step === "email" && (
          <>
            <div>
              <label className="block text-sm font-600 text-foreground mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll send a 6-digit OTP to your email
              </p>
            </div>
            
            <button
              onClick={handleSendOTP}
              disabled={loading || !email.trim() || !email.includes('@')}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </>
        )}

        {/* Step 2: Enter OTP */}
        {step === "otp" && (
          <>
            {/* Back Button */}
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div>
              <label className="block text-sm font-600 text-foreground mb-3">
                Enter 6-Digit OTP <span className="text-red-500">*</span>
              </label>
              <div 
                className="flex gap-2 justify-center mb-3" 
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    autoComplete="one-time-code"
                    className="w-12 h-12 text-center text-2xl font-700 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-transparent disabled:opacity-50"
                    placeholder=" "
                    aria-label={`OTP digit ${index + 1}`}
                    disabled={loading}
                  />
                ))}
              </div>
              <div className="text-center space-y-2">
                <button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || loading}
                  className="text-xs text-secondary hover:underline font-500 disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                </button>
                {loading && (
                  <div className="text-xs text-muted-foreground">
                    Verifying OTP...
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleVerifyOTP}
              disabled={otpDigits.join("").length !== 6 || loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                "Login"
              )}
            </button>
          </>
        )}
      </div>

      {/* Switch to Signup */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        {step === "email" ? "Don't have an account? " : "Need an account? "}
        <button
          onClick={onSwitchToSignup}
          className="text-secondary hover:underline font-600 focus:outline-none focus:ring-2 focus:ring-ring rounded px-1 disabled:opacity-50"
          disabled={loading}
        >
          Sign up
        </button>
      </p>
    </div>
  )
}