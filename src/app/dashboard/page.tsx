"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DashboardStats from "@/components/dashboard/stats"
import RecentReports from "@/components/dashboard/recent-reports"
import VitalsSummary from "@/components/dashboard/vitals-summary"
import { AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  const [healthProfileComplete, setHealthProfileComplete] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = typeof window !== "undefined" ? localStorage.getItem("medivault_user") : null
    const profileData = typeof window !== "undefined" ? localStorage.getItem("health_profile") : null

    if (userData) {
      setUser(JSON.parse(userData))
    }
    setHealthProfileComplete(!!profileData)
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name || "User"}!</h1>
          <p className="text-muted-foreground mt-2">Here's your health overview</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Add Vitals</Button>
          <Button className="bg-primary hover:bg-primary/90">Upload Report</Button>
        </div>
      </div>

      {/* Health Profile Alert */}
      {!healthProfileComplete && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Please complete your health profile to unlock full features. This information is mandatory to accurately
            monitor your health.{" "}
            <a href="/dashboard/health-profile" className="font-semibold underline">
              Complete Now
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentReports />
        </div>
        <div>
          <VitalsSummary />
        </div>
      </div>
    </div>
  )
}
