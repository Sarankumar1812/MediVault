"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserSettings {
  name: string
  email: string
  phone: string
  notificationsEmail: boolean
  notificationsSMS: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    email: "",
    phone: "",
    notificationsEmail: true,
    notificationsSMS: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Load user data
    const user = typeof window !== "undefined" ? localStorage.getItem("medivault_user") : null
    if (user) {
      const userData = JSON.parse(user)
      setSettings((prev) => ({
        ...prev,
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      }))
    }
  }, [])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    // Simulate save
    setTimeout(() => {
      const user = JSON.parse(localStorage.getItem("medivault_user") || "{}")
      user.name = settings.name
      user.email = settings.email
      user.phone = settings.phone
      localStorage.setItem("medivault_user", JSON.stringify(user))
      setIsSaving(false)
      toast({ title: "Profile updated successfully" })
    }, 500)
  }

  const handleChangePassword = () => {
    toast({ title: "Password change", description: "Password change functionality would be implemented here" })
  }

  const handleLogout = () => {
    localStorage.removeItem("medivault_user")
    localStorage.removeItem("health_profile")
    router.push("/")
    toast({ title: "Logged out successfully" })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-4">Password</h3>
                  <Button variant="outline" onClick={handleChangePassword}>
                    Change Password
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Active Sessions</h3>
                  <p className="text-sm text-muted-foreground mb-4">Current device is logged in</p>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout All Devices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Get updates via email</p>
                </div>
                <Switch
                  checked={settings.notificationsEmail}
                  onCheckedChange={(checked) => setSettings({ ...settings, notificationsEmail: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Get alerts via text message</p>
                </div>
                <Switch
                  checked={settings.notificationsSMS}
                  onCheckedChange={(checked) => setSettings({ ...settings, notificationsSMS: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Abnormal Vitals Alerts</p>
                  <p className="text-sm text-muted-foreground">Alert me when vitals are out of range</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button onClick={() => toast({ title: "Preferences saved" })}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
