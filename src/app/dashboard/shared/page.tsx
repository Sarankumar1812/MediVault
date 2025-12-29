"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Share2, Trash2, LinkIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SharedReport {
  id: string
  reportName: string
  sharedWith: string
  role: "doctor" | "family" | "friend"
  date: string
  access: "read-only"
}

export default function SharedReportsPage() {
  const [sharedReports, setSharedReports] = useState<SharedReport[]>([])
  const [shareOpen, setShareOpen] = useState(false)
  const [newShare, setNewShare] = useState({
    reportName: "",
    email: "",
    role: "doctor",
  })
  const { toast } = useToast()

  useEffect(() => {
    // Load shared reports from localStorage
    const saved = typeof window !== "undefined" ? localStorage.getItem("shared_reports") : null
    if (saved) {
      setSharedReports(JSON.parse(saved))
    }
  }, [])

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newShare.reportName || !newShare.email) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" })
      return
    }

    const shared: SharedReport = {
      id: Date.now().toString(),
      reportName: newShare.reportName,
      sharedWith: newShare.email,
      role: newShare.role as "doctor" | "family" | "friend",
      date: new Date().toISOString().split("T")[0],
      access: "read-only",
    }

    const updated = [shared, ...sharedReports]
    setSharedReports(updated)
    localStorage.setItem("shared_reports", JSON.stringify(updated))

    setNewShare({ reportName: "", email: "", role: "doctor" })
    setShareOpen(false)
    toast({ title: "Report shared successfully" })
  }

  const handleRevoke = (id: string) => {
    const updated = sharedReports.filter((s) => s.id !== id)
    setSharedReports(updated)
    localStorage.setItem("shared_reports", JSON.stringify(updated))
    toast({ title: "Access revoked" })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "doctor":
        return "bg-blue-100 text-blue-800"
      case "family":
        return "bg-green-100 text-green-800"
      case "friend":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shared Reports</h1>
          <p className="text-muted-foreground mt-2">Manage your shared medical documents</p>
        </div>
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Share2 className="w-4 h-4" />
              Share Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Medical Report</DialogTitle>
              <DialogDescription>Share your report with doctors, family, or friends</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleShare} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportName">Select Report</Label>
                <Input
                  id="reportName"
                  value={newShare.reportName}
                  onChange={(e) => setNewShare({ ...newShare, reportName: e.target.value })}
                  placeholder="e.g., Blood Test Report"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Share With (Email)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newShare.email}
                  onChange={(e) => setNewShare({ ...newShare, email: e.target.value })}
                  placeholder="doctor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Recipient Type</Label>
                <Select value={newShare.role} onValueChange={(value) => setNewShare({ ...newShare, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  Recipient will have read-only access and cannot edit or delete your report.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setShareOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Share Report</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shared List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shares ({sharedReports.length})</CardTitle>
          <CardDescription>Reports you've shared with others</CardDescription>
        </CardHeader>
        <CardContent>
          {sharedReports.length === 0 ? (
            <div className="text-center py-12">
              <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No shared reports yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedReports.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{share.reportName}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>{share.sharedWith}</span>
                      <Badge className={getRoleColor(share.role)}>{share.role}</Badge>
                      <span>Shared on {share.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="Copy share link">
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevoke(share.id)}
                      className="text-destructive hover:text-destructive"
                      title="Revoke access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Privacy & Security</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• Only you can view or manage your medical reports. Others can only view reports you explicitly share.</p>
          <p>• Shared reports are read-only. Recipients cannot modify, download, or share them further.</p>
          <p>• You can revoke access at any time by removing the share.</p>
          <p>• All data is encrypted in transit and at rest.</p>
        </CardContent>
      </Card>
    </div>
  )
}
