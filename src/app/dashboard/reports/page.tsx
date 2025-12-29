"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Download, Share2, Trash2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Report {
  id: string
  name: string
  type: string
  date: string
  size: string
  url?: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [uploadOpen, setUploadOpen] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [newReport, setNewReport] = useState({
    name: "",
    type: "lab-report",
  })
  const { toast } = useToast()

  useEffect(() => {
    // Load reports from localStorage
    const saved = typeof window !== "undefined" ? localStorage.getItem("reports") : null
    if (saved) {
      setReports(JSON.parse(saved))
    }
  }, [])

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newReport.name) {
      toast({ title: "Error", description: "Please enter a report name", variant: "destructive" })
      return
    }

    const report: Report = {
      id: Date.now().toString(),
      name: newReport.name,
      type: newReport.type,
      date: new Date().toISOString().split("T")[0],
      size: "2.4 MB",
    }

    const updated = [report, ...reports]
    setReports(updated)
    localStorage.setItem("reports", JSON.stringify(updated))

    setNewReport({ name: "", type: "lab-report" })
    setUploadOpen(false)

    toast({ title: "Report uploaded successfully" })
  }

  const handleDelete = (id: string) => {
    const updated = reports.filter((r) => r.id !== id)
    setReports(updated)
    localStorage.setItem("reports", JSON.stringify(updated))
    toast({ title: "Report deleted" })
  }

  const filteredReports = filterType === "all" ? reports : reports.filter((r) => r.type === filterType)

  const reportTypes = [
    { value: "lab-report", label: "Lab Report" },
    { value: "imaging", label: "Imaging (X-Ray, CT, MRI)" },
    { value: "cardiology", label: "Cardiology" },
    { value: "prescription", label: "Prescription" },
    { value: "vaccination", label: "Vaccination" },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Reports</h1>
          <p className="text-muted-foreground mt-2">Manage and organize your medical documents</p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Medical Report</DialogTitle>
              <DialogDescription>Add a new medical report to your vault</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  placeholder="e.g., Blood Test Results"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={newReport.type} onValueChange={(value) => setNewReport({ ...newReport, type: value })}>
                  <SelectTrigger id="reportType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File Upload</Label>
                <Input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png" />
                <p className="text-xs text-muted-foreground">PDF, JPG, or PNG (Max 10MB)</p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Upload Report</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="space-y-2">
              <Label htmlFor="filter">Filter by Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No reports yet. Upload your first report to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{report.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Badge variant="secondary">{reportTypes.find((t) => t.value === report.type)?.label}</Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {report.date}
                        </span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(report.id)}
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
    </div>
  )
}
