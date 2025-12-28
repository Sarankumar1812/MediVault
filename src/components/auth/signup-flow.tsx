"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react"
import type { Value } from "react-phone-number-input"
import DatePicker from "../custom/date-picker"
import Dropdown from "../custom/dropdown"
import CustomPhoneInput from "../custom/phone-input"
import { setAuthToken } from "@/lib/auth-client"

type SignupStep = "contact" | "otp" | "password" | "profile"

interface SignupFlowProps {
  onSwitchToLogin: () => void
  onOpenPrivacy: () => void
  onShowToast: (type: "success" | "error" | "warning" | "info", message: string) => void
  currentStep?: string
  onStepChange?: (step: string) => void
  onSignupComplete?: () => void
}

// Extended props interfaces for disabled support
interface CustomPhoneInputProps {
  value?: Value;
  onChange: (value?: Value) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
}

export default function SignupFlow({ 
  onSwitchToLogin, 
  onOpenPrivacy, 
  onShowToast,
  currentStep = "contact",
  onStepChange,
  onSignupComplete
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
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [authToken, setAuthTokenState] = useState<string | null>(null)

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
    { value: "prefer_not_to_say", label: "Prefer not to say" }
  ]

  // Send OTP API Call
  const sendOTP = async (contactInfo: string, method: 'email' | 'phone' | 'whatsapp') => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/mv1001sendotp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: contactInfo,
          method: method
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP')
      }

      setRegistrationId(data.data.registrationId)
      onShowToast("success", data.message || "OTP sent successfully")
      
      // In development, show OTP in console
      if (process.env.NODE_ENV === 'development' && data.data.otp) {
        console.log(`Development OTP: ${data.data.otp}`)
      }
      
      return { success: true, data }
    } catch (error: any) {
      onShowToast("error", error.message || "Failed to send OTP")
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP API Call
const verifyOTP = async (contactInfo: string, otpCode: string) => {
  try {
    setLoading(true);
    const response = await fetch('/api/auth/mv1002verifyotp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: contactInfo,
        otp: otpCode,
        registrationId: registrationId ? String(registrationId) : undefined
      })
    });

    const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP')
      }

      // Store user data from response
      setUserId(data.data.userId)
      setAuthTokenState(data.data.token)
      
      // Store token in localStorage
      if (data.data.token) {
        setAuthToken(data.data.token, true)
      }

      onShowToast("success", data.message || "OTP verified successfully")
      return { 
        success: true, 
        data, 
        requiresPassword: !data.data.requiresProfileCompletion 
      }
    } catch (error: any) {
      onShowToast("error", error.message || "Failed to verify OTP")
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Set User Password API Call (renamed to avoid conflict)
  const setUserPassword = async (newPassword: string) => {
    try {
      if (!authToken) {
        throw new Error('Authentication required')
      }

      setLoading(true)
      const response = await fetch('/api/auth/mv1003setpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          password: newPassword,
          confirmPassword: newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to set password')
      }

      onShowToast("success", data.message || "Password set successfully")
      return { success: true, data }
    } catch (error: any) {
      onShowToast("error", error.message || "Failed to set password")
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Complete Profile API Call
  const completeUserProfile = async (profileData: {
    firstName: string
    lastName: string
    phone?: string
    dateOfBirth?: string
    gender?: string
    privacyAccepted: boolean
  }) => {
    try {
      if (!authToken) {
        throw new Error('Authentication required')
      }

      setLoading(true)
      const response = await fetch('/api/profile/mv1004completeprofile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete profile')
      }

      onShowToast("success", data.message || "Profile completed successfully")
      return { success: true, data }
    } catch (error: any) {
      onShowToast("error", error.message || "Failed to complete profile")
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Handle Contact Step
  const handleContinueContact = async () => {
    if (!contact.trim()) {
      onShowToast("error", "Please enter email or phone number")
      return
    }

    // Determine if it's email or phone
    const isEmail = contact.includes('@')
    const method = isEmail ? 'email' : 'phone'

    const result = await sendOTP(contact, method)
    
    if (result.success) {
      setStep("otp")
      setResendTimer(30)
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

  // Handle OTP Verification
  const handleVerifyOTP = async () => {
    const otp = otpDigits.join("")
    if (!otp || otp.length !== 6) {
      onShowToast("error", "Please enter a valid 6-digit OTP")
      return
    }

    const result = await verifyOTP(contact, otp)
    
    if (result.success) {
      if (result.requiresPassword) {
        setStep("password")
      } else {
        // Skip password step if not required
        setStep("profile")
      }
    }
  }

  // Handle Password Step
  const handleContinueToProfile = async () => {
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

    const result = await setUserPassword(password)
    
    if (result.success) {
      setStep("profile")
    }
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

    // Convert date format if needed
    let formattedDob = dob
    if (dob.includes('/')) {
      const [day, month, year] = dob.split('/')
      formattedDob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    const profileData = {
      firstName,
      lastName,
      phone: phone.toString(),
      dateOfBirth: formattedDob,
      gender: gender === 'prefer-not-to-say' ? 'prefer_not_to_say' : gender,
      privacyAccepted
    }

    const result = await completeUserProfile(profileData)
    
    if (result && result.success) {
      onShowToast("success", "Account created successfully!")
      
      // Call parent callback if provided
      if (onSignupComplete) {
        onSignupComplete()
      }
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    const isEmail = contact.includes('@')
    const method = isEmail ? 'email' : 'phone'
    
    const result = await sendOTP(contact, method)
    
    if (result && result.success) {
      setResendTimer(30)
      setOtpDigits(["", "", "", "", "", ""])
    }
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

  // After successful signup in signup-flow.tsx
const handleSignupComplete = () => {
  // Store token
  if (authToken) {
    setAuthToken(authToken, true);
  }
  
  // Show success message
  onShowToast("success", "Welcome to MediVault!");
  
  // Force navbar to update by triggering storage event
  window.dispatchEvent(new Event('storage'));
  
  // Optionally close modal or redirect
  if (onSignupComplete) {
    onSignupComplete();
  }
};

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
      const verify = async () => {
        await handleVerifyOTP()
      }
      verify()
    }
  }, [otpDigits])

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
        {step === "otp" && "Check your email for OTP"}
        {step === "password" && "Create a secure password"}
        {step === "profile" && "Complete your profile"}
      </p>

      {/* Step 1: Contact Information */}
      {step === "contact" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-600 text-foreground mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Currently supporting email registration only. Phone support coming soon.
            </p>
          </div>
          <button
            onClick={handleContinueContact}
            disabled={loading || !contact.trim() || !contact.includes('@')}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending OTP...
              </>
            ) : (
              <>
                Continue <ChevronRight className="w-4 h-4" />
              </>
            )}
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
            <p className="text-sm text-muted-foreground mb-3">
              Sent to: <span className="font-600">{contact}</span>
            </p>
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
                  className="w-12 h-12 text-center text-2xl font-700 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex-1 border border-border text-foreground py-3 rounded-lg font-600 hover:bg-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleVerifyOTP}
              disabled={otpDigits.join("").length !== 6 || loading}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify"}
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
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
                type="button"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Must include uppercase, lowercase, number, and special character
            </p>
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
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              />
              <button
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                type="button"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex-1 border border-border text-foreground py-3 rounded-lg font-600 hover:bg-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleContinueToProfile}
              disabled={!password.trim() || !confirmPassword.trim() || password !== confirmPassword || password.length < 8 || loading}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Setting Password..." : "Continue"}
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
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
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
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
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
              required={true}
              disabled={loading}
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
                disabled={loading}
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
                searchable={true}
                disabled={loading}
              />
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="w-4 h-4 mt-1 focus:ring-2 focus:ring-ring disabled:opacity-50"
              disabled={loading}
            />
            <span className="text-sm text-muted-foreground">
              I agree to the{" "}
              <button 
                onClick={onOpenPrivacy} 
                className="text-secondary hover:underline font-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                Privacy Policy
              </button>
              <span className="text-red-500"> *</span>
            </span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex-1 border border-border text-foreground py-3 rounded-lg font-600 hover:bg-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSubmitProfile}
              disabled={loading || !firstName || !lastName || !phone || !dob || !gender || !privacyAccepted}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Switch to Login */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-secondary hover:underline font-600 focus:outline-none focus:ring-2 focus:ring-ring rounded px-1 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Login
        </button>
      </p>
    </div>
  )
}