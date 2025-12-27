"use client"

import { useState } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"

type SignupStep = "contact" | "otp" | "profile"

interface SignupFlowProps {
  onSwitchToLogin: () => void
  onOpenPrivacy: () => void
  onShowToast: (type: "success" | "error" | "warning" | "info", message: string) => void
}

export default function SignupFlow({ onSwitchToLogin, onOpenPrivacy, onShowToast }: SignupFlowProps) {
  const [step, setStep] = useState<SignupStep>("contact")
  const [contact, setContact] = useState("")
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleContinueContact = () => {
    if (!contact.trim()) {
      onShowToast("error", "Please enter email or phone number")
      return
    }
    setStep("otp")
    onShowToast("success", "OTP sent successfully")
  }

  const handleVerifyOTP = () => {
    const otp = otpDigits.join("")
    if (!otp || otp.length !== 6) {
      onShowToast("error", "Please enter a valid OTP")
      return
    }
    setStep("profile")
    onShowToast("success", "OTP verified successfully")
  }

  const handleSubmitProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !dob || !gender || !privacyAccepted) {
      onShowToast("error", "Please complete all mandatory fields")
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

  const otp = otpDigits.join("")

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otpDigits]
    newOtp[index] = value
    setOtpDigits(newOtp)
  }

  return (
    <div>
      <h2 id="auth-modal-title" className="text-2xl font-700 text-primary mb-2">
        {step === "contact" && "Create Account"}
        {step === "otp" && "Verify OTP"}
        {step === "profile" && "Profile Details"}
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        {step === "contact" && "Enter your email or phone number"}
        {step === "otp" && "Check your email/SMS for OTP"}
        {step === "profile" && "Complete your profile"}
      </p>

      {/* Contact Step */}
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

      {/* OTP Step */}
      {step === "otp" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-600 text-foreground mb-3">
              Enter 6-Digit OTP <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 justify-center mb-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  placeholder="•"
                  autoComplete="one-time-code"
                  className="w-12 h-12 text-center text-2xl font-700 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">You can copy and paste the code</p>
          </div>
          <button
            onClick={() => onShowToast("info", "OTP resent to your email/phone")}
            className="text-sm text-secondary hover:underline font-500 w-full text-center"
          >
            Resend OTP
          </button>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setStep("contact")
                setOtpDigits(["", "", "", "", "", ""])
              }}
              className="flex-1 border border-border text-foreground py-3 rounded-lg font-600 hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Profile Step */}
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
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-600 text-foreground mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-600 text-foreground mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
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
              onClick={() => {
                setStep("otp")
                setOtpDigits(["", "", "", "", "", ""])
              }}
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
