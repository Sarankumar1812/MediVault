// app/dashboard/health-profile/page.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2, AlertCircle, Shield, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken, clearAuthToken } from "@/lib/auth-client"

interface HealthProfile {
  height: string
  weight: string
  bloodGroup: string
  conditions: string
  allergies: string
  chronicIllnesses: string
  emergencyContactName: string
  emergencyContactPhone: string
}

interface ApiError {
  [key: string]: string[]
}

const fieldClass = "w-full h-11 bg-white border border-slate-300 rounded-lg px-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
const textareaClass = "w-full min-h-[96px] bg-white border border-slate-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"

export default function HealthProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError>({})
  const [hasProfile, setHasProfile] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const [profile, setProfile] = useState<HealthProfile>({
    height: "",
    weight: "",
    bloodGroup: "",
    conditions: "",
    allergies: "",
    chronicIllnesses: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  })

  useEffect(() => {
    fetchHealthProfile()
  }, [])

  const fetchHealthProfile = async () => {
    try {
      setIsLoading(true)
      const authToken = getAuthToken()
      
      if (!authToken) {
        toast({
          title: "Authentication required",
          description: "Please login to access your health profile",
          variant: "destructive",
        })
        window.location.href = '/login'
        return
      }

      console.log('📡 Fetching health profile...')
      const response = await fetch('/api/profile/mv1009gethealthprofile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Cache-Control': 'no-cache'
        }
      })

      console.log('📊 Response status:', response.status)
      
      if (response.status === 401) {
        console.log('🔐 Token expired')
        clearAuthToken()
        toast({
          title: "Session expired",
          description: "Please login again to continue",
          variant: "destructive",
        })
        window.location.href = '/login'
        return
      }

      const data = await response.json()
      console.log('📦 Response data:', data)

      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch health profile (${response.status})`)
      }

      if (data.success) {
        if (data.data.profile) {
          setProfile({
            height: data.data.profile.height || "",
            weight: data.data.profile.weight || "",
            bloodGroup: data.data.profile.bloodGroup || "",
            conditions: data.data.profile.conditions || "",
            allergies: data.data.profile.allergies || "",
            chronicIllnesses: data.data.profile.chronicIllnesses || "",
            emergencyContactName: data.data.profile.emergencyContactName || "",
            emergencyContactPhone: data.data.profile.emergencyContactPhone || "",
          })
          setHasProfile(true)
          setLastUpdated(data.data.profile.lastUpdated || "")
          console.log('✅ Profile loaded successfully')
          
          // Show welcome toast for new users
          if (!data.data.profile.lastUpdated) {
            toast({
              title: "Welcome to Health Profile",
              description: "Complete your health profile to enable all features",
              variant: "default",
            })
          }
        } else {
          console.log('ℹ️ No existing profile found')
          setHasProfile(false)
          setLastUpdated("")
          
          toast({
            title: "Health Profile Setup",
            description: "Complete your health profile to get started",
            variant: "default",
          })
        }
      }
    } catch (error: any) {
      console.error('💥 Failed to fetch health profile:', error)
      toast({
        title: "Connection Error",
        description: "Unable to load health profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const requiredFields: (keyof HealthProfile)[] = [
    "height",
    "weight",
    "bloodGroup",
    "emergencyContactName",
    "emergencyContactPhone",
  ]

  const completedCount = requiredFields.filter((f) => {
    const value = profile[f]
    return value !== null && value !== undefined && value.toString().trim() !== ''
  }).length

  const isComplete = completedCount === requiredFields.length
  const completionPercentage = Math.round((completedCount / requiredFields.length) * 100)

  const handleChange = (key: keyof HealthProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
    // Clear validation error when user types
    if (apiErrors[key]) {
      setApiErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
    // Reset success state when user edits
    if (saveSuccess) {
      setSaveSuccess(false)
    }
  }

  const handleSave = async () => {
    if (!isComplete) {
      toast({
        title: "Incomplete Profile",
        description: `Please complete all required fields (${completedCount}/${requiredFields.length})`,
        variant: "destructive",
      })
      return
    }

    const authToken = getAuthToken()
    if (!authToken) {
      toast({
        title: "Authentication Required",
        description: "Please login to save your health profile",
        variant: "destructive",
      })
      window.location.href = '/login'
      return
    }

    setIsSaving(true)
    setApiErrors({})
    setSaveSuccess(false)
    
    console.log('💾 Saving health profile...')
    console.log('Profile data to save:', profile)
    
    try {
      const response = await fetch('/api/profile/mv1010savehealthprofile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(profile)
      })

      const data = await response.json()
      console.log('💾 Save response:', data)

      if (!response.ok) {
        if (response.status === 400 && data.errors) {
          setApiErrors(data.errors)
          toast({
            title: "Validation Error",
            description: "Please check the highlighted fields",
            variant: "destructive",
          })
          return
        } else if (response.status === 401) {
          clearAuthToken()
          toast({
            title: "Session Expired",
            description: "Please login again to continue",
            variant: "destructive",
          })
          window.location.href = '/login'
          return
        }
        throw new Error(data.message || 'Failed to save health profile')
      }

      // Success!
      setSaveSuccess(true)
      setHasProfile(true)
      
      // Show success toast
      toast({
        title: "✅ Health Profile Saved!",
        description: "Your health information has been updated successfully",
        variant: "default",
      })

      // Refresh the profile data to get updated timestamp
      await fetchHealthProfile()
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 5000)

    } catch (error: any) {
      console.error('💥 Save error:', error)
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save health profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = () => {
    toast({
      title: "Setup Skipped",
      description: "You can complete your health profile later from dashboard settings",
      variant: "default",
    })
    window.location.href = '/dashboard'
  }

  if (isLoading) {
    return (
      <main className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-slate-900">Loading Health Profile</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Securely fetching your health information...
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Health Profile
                </h1>
              </div>
              <p className="text-muted-foreground max-w-3xl">
                Complete your health profile to enable accurate health tracking and secure sharing with doctors.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700 min-w-[60px]">
                  {completionPercentage}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {completedCount} of {requiredFields.length} required fields
              </p>
            </div>
          </div>
          
          {/* Success Alert */}
          {saveSuccess && (
            <Alert className="animate-in slide-in-from-top-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                <span className="font-semibold">Success!</span> Your health profile has been saved. All information is now up to date.
                {lastUpdated && (
                  <span className="block text-sm text-green-700 mt-1">
                    Last updated: {new Date(lastUpdated).toLocaleString()}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Profile Status */}
          <div className="flex flex-wrap items-center gap-3">
            {hasProfile ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                Profile Complete
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                Profile Incomplete
              </div>
            )}
            
            {lastUpdated && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-full text-sm">
                <Shield className="h-4 w-4" />
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>
        </header>

        {/* Baseline Health Metrics */}
        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded">
                <UserCheck className="h-4 w-4 text-primary" />
              </div>
              Baseline Health Metrics
            </CardTitle>
            <CardDescription>
              Core physical attributes used as baseline for health monitoring
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-1 text-sm font-medium">
                Height (cm) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="height"
                type="number"
                className={fieldClass}
                placeholder="e.g. 170"
                value={profile.height}
                onChange={(e) => handleChange("height", e.target.value)}
              />
              {apiErrors.height && (
                <p className="text-sm text-red-600 animate-pulse">{apiErrors.height[0]}</p>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-1 text-sm font-medium">
                Weight (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="weight"
                type="number"
                className={fieldClass}
                placeholder="e.g. 75"
                value={profile.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
              />
              {apiErrors.weight && (
                <p className="text-sm text-red-600 animate-pulse">{apiErrors.weight[0]}</p>
              )}
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <Label htmlFor="bloodGroup" className="flex items-center gap-1 text-sm font-medium">
                Blood Group <span className="text-red-500">*</span>
              </Label>
              <Select
                value={profile.bloodGroup}
                onValueChange={(v) => handleChange("bloodGroup", v)}
              >
                <SelectTrigger className={fieldClass} id="bloodGroup">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(
                    (g) => (
                      <SelectItem key={g} value={g} className="cursor-pointer">
                        {g}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {apiErrors.bloodGroup && (
                <p className="text-sm text-red-600 animate-pulse">{apiErrors.bloodGroup[0]}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medical Background */}
        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl">Medical Background</CardTitle>
            <CardDescription>
              Helps doctors understand your health history
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="conditions" className="text-sm font-medium">Existing Health Conditions</Label>
              <Textarea
                id="conditions"
                className={textareaClass}
                placeholder="e.g. Diabetes, Hypertension, Asthma"
                value={profile.conditions}
                onChange={(e) => handleChange("conditions", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                List any existing medical conditions (separated by commas)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies" className="text-sm font-medium">Allergies</Label>
              <Textarea
                id="allergies"
                className={textareaClass}
                placeholder="e.g. Penicillin, Peanuts, Dust allergy"
                value={profile.allergies}
                onChange={(e) => handleChange("allergies", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                List any allergies you have
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chronicIllnesses" className="text-sm font-medium">Chronic Illnesses</Label>
              <Textarea
                id="chronicIllnesses"
                className={textareaClass}
                placeholder="e.g. Thyroid disorder, Arthritis, Migraine"
                value={profile.chronicIllnesses}
                onChange={(e) => handleChange("chronicIllnesses", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                List any chronic illnesses or long-term health conditions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-2 border-red-100 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4 border-b border-red-200">
            <CardTitle className="text-xl text-red-800">Emergency Contact</CardTitle>
            <CardDescription className="text-red-700">
              Used during critical medical situations
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName" className="flex items-center gap-1 text-sm font-medium text-red-800">
                Contact Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="emergencyContactName"
                className={`${fieldClass} border-red-200 focus:border-red-500 focus:ring-red-500/20`}
                placeholder="e.g. John Doe"
                value={profile.emergencyContactName}
                onChange={(e) =>
                  handleChange("emergencyContactName", e.target.value)
                }
              />
              {apiErrors.emergencyContactName && (
                <p className="text-sm text-red-600 animate-pulse">{apiErrors.emergencyContactName[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone" className="flex items-center gap-1 text-sm font-medium text-red-800">
                Contact Phone <span className="text-red-600">*</span>
              </Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                className={`${fieldClass} border-red-200 focus:border-red-500 focus:ring-red-500/20`}
                placeholder="e.g. +91 98765 43210"
                value={profile.emergencyContactPhone}
                onChange={(e) =>
                  handleChange("emergencyContactPhone", e.target.value)
                }
              />
              {apiErrors.emergencyContactPhone && (
                <p className="text-sm text-red-600 animate-pulse">{apiErrors.emergencyContactPhone[0]}</p>
              )}
              <p className="text-xs text-red-700">
                Include country code if outside India
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="sticky bottom-6 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isComplete ? (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Ready to Save</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>
                    {completedCount} of {requiredFields.length} required fields
                  </span>
                </div>
              )}
              
              <div className="hidden sm:block text-sm text-muted-foreground">
                {isComplete ? "All information is complete" : "Fill all required fields to save"}
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                onClick={handleSkip}
                className="flex-1 sm:flex-none min-w-[120px]"
                disabled={isSaving}
              >
                Skip
              </Button>
              
              <Button
                size="lg"
                disabled={!isComplete || isSaving}
                onClick={handleSave}
                className="flex-1 sm:flex-none min-w-[180px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : hasProfile ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Update Profile
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Save Health Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <Alert className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
          <Shield className="h-5 w-5 text-slate-600" />
          <AlertDescription className="text-slate-700">
            <span className="font-medium">Your data is secure:</span> All health profile information is encrypted and stored securely. 
            This information enables accurate health monitoring and can be securely shared with your healthcare providers.
          </AlertDescription>
        </Alert>
      </div>
    </main>
  )
}