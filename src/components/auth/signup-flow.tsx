"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react"
import type { Value } from "react-phone-number-input"
import DatePicker from "../custom/date-picker"
import Dropdown from "../custom/dropdown"
import CustomPhoneInput from "../custom/phone-input"

type SignupStep = "contact" | "otp" | "password" | "profile"

interface SignupFlowProps {
  onSwitchToLogin: () => void
  onOpenPrivacy: () => void
  onShowToast: (type: "success" | "error" | "warning" | "info", message: string) => void
  currentStep?: string
  onStepChange?: (step: string) => void
}

export default function SignupFlow({ 
  onSwitchToLogin, 
  onOpenPrivacy, 
  onShowToast,
  currentStep = "contact",
  onStepChange 
}: SignupFlowProps) {
  const [step, setStep] = useState<SignupStep>(currentStep as SignupStep)
  const [contact, setContact] = useState("")
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState<Value | undefined>()
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [phoneError, setPhoneError] = useState("")

  // Sync with parent component step
  useEffect(() => {
    if (currentStep && currentStep !== step) {
      setStep(currentStep as SignupStep)
    }
  }, [currentStep])

  // Notify parent about step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(step)
    }
  }, [step, onStepChange])

  // Gender options for dropdown
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer-not-to-say", label: "Prefer not to say" }
  ]

  // Handle Contact Step
  const handleContinueContact = () => {
    if (!contact.trim()) {
      onShowToast("error", "Please enter email or phone number")
      return
    }
    setStep("otp")
    setResendTimer(30)
    onShowToast("success", "OTP sent successfully")
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

  // Handle OTP Verification
  const handleVerifyOTP = () => {
    const otp = otpDigits.join("")
    if (!otp || otp.length !== 6) {
      onShowToast("error", "Please enter a valid 6-digit OTP")
      return
    }
    setStep("password")
    onShowToast("success", "OTP verified successfully")
  }

  // Handle Password Step
  const handleContinueToProfile = () => {
    if (!password.trim()) {
      onShowToast("error", "Please enter password")
      return
    }
    if (!confirmPassword.trim()) {
      onShowToast("error", "Please confirm your password")
      return
    }
    if (password !== confirmPassword) {
      onShowToast("error", "Passwords do not match")
      return
    }
    if (password.length < 8) {
      onShowToast("error", "Password must be at least 8 characters")
      return
    }
    setStep("profile")
  }

  // Validate phone number
  const validatePhone = (value: Value) => {
    setPhoneError("")
    
    if (!value) {
      setPhoneError("Phone number is required")
      return false
    }

    const phoneStr = value.toString()
    const digitsOnly = phoneStr.replace(/[^\d]/g, "")
    
    if (digitsOnly.length < 8) {
      setPhoneError("Please enter a valid phone number")
      return false
    }

    return true
  }

  // Handle phone change with validation
const handlePhoneChange = (value?: Value) => {
  setPhone(value)

  if (value) {
    validatePhone(value)
  } else {
    setPhoneError("Phone number is required")
  }
}


  // Handle Profile Submission
  const handleSubmitProfile = async () => {
    if (!firstName.trim()) {
      onShowToast("error", "First name is required")
      return
    }
    if (!lastName.trim()) {
      onShowToast("error", "Last name is required")
      return
    }
    
if (!phone || !validatePhone(phone)) {
  onShowToast("error", phoneError || "Please enter a valid phone number")
  return
}
    
    if (!dob) {
      onShowToast("error", "Date of birth is required")
      return
    }
    if (!gender) {
      onShowToast("error", "Gender is required")
      return
    }
    if (!privacyAccepted) {
      onShowToast("error", "Please accept the privacy policy")
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      onShowToast("success", "Account created successfully!")
    } catch (error) {
      onShowToast("error", "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = () => {
    setResendTimer(30)
    onShowToast("info", "OTP resent to your email/phone")
  }

  // Handle Back Navigation
  const handleBack = () => {
    if (step === "otp") {
      setStep("contact")
      setOtpDigits(["", "", "", "", "", ""])
    } else if (step === "password") {
      setStep("otp")
      setPassword("")
      setConfirmPassword("")
    } else if (step === "profile") {
      setStep("password")
      setFirstName("")
      setLastName("")
      setPhone(undefined)
      setPhoneError("")
      setDob("")
      setGender("")
      setPrivacyAccepted(false)
    }
  }

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  return (
    <div>
      <h2 id="auth-modal-title" className="text-2xl font-700 text-primary mb-2">
        {step === "contact" && "Create Account"}
        {step === "otp" && "Verify OTP"}
        {step === "password" && "Create Password"}
        {step === "profile" && "Profile Details"}
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        {step === "contact" && "Enter your email or phone number"}
        {step === "otp" && "Check your email/SMS for OTP"}
        {step === "password" && "Create a secure password"}
        {step === "profile" && "Complete your profile"}
      </p>

      {/* Step 1: Contact Information */}
      {step === "contact" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-600 text-foreground mb-2">
              Email or Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="you@example.com or +1234567890"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <button
            onClick={handleContinueContact}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {step === "otp" && (
        <div className="space-y-4">
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
                  className="w-12 h-12 text-center text-2xl font-700 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-transparent"
                  placeholder=" "
                  aria-label={`OTP digit ${index + 1}`}
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
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleBack}
              className="flex-1 border border-border text-foreground py-3 rounded-lg font-600 hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleVerifyOTP}
              disabled={otpDigits.join("").length !== 6}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Password Creation */}
      {step === "password" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-600 text-foreground mb-2">
              Create Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
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

          <div>
            <label className="block text-sm font-600 text-foreground mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleBack}
              className="flex-1 border border-border text-foreground py-3 rounded-lg font-600 hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleContinueToProfile}
              disabled={!password.trim() || !confirmPassword.trim() || password !== confirmPassword || password.length < 8}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Profile Details */}
      {step === "profile" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-600 text-foreground mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-600 text-foreground mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-600 text-foreground mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
<CustomPhoneInput
  value={phone}
  onChange={handlePhoneChange}
  placeholder="Enter phone number"
  required
/>
            {phoneError && (
              <p className="text-sm text-red-500 mt-1">{phoneError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-600 text-foreground mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={dob}
                onChange={setDob}
                placeholder="Select date"
              />
            </div>

            <div>
              <label className="block text-sm font-600 text-foreground mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={gender}
                onChange={setGender}
                options={genderOptions}
                placeholder="Select gender"
                searchable
              />
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="w-4 h-4 mt-1 focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-muted-foreground">
              I agree to the{" "}
              <button onClick={onOpenPrivacy} className="text-secondary hover:underline font-600">
                Privacy Policy
              </button>
              <span className="text-red-500"> *</span>
            </span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleBack}
              className="flex-1 border border-border text-foreground py-3 rounded-lg font-600 hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSubmitProfile}
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </div>
      )}

      {/* Switch to Login */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-secondary hover:underline font-600 focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
        >
          Login
        </button>
      </p>
    </div>
  )
}