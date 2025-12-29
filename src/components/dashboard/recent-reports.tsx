"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function RecentReports() {
  const reports = [
    {
      id: 1,
      name: "Blood Test Report",
      type: "Lab Report",
      date: "2024-01-15",
      status: "Reviewed",
    },
    {
      id: 2,
      name: "Chest X-Ray",
      type: "Imaging",
      date: "2024-01-10",
      status: "Pending",
    },
    {
      id: 3,
      name: "ECG Report",
      type: "Cardiology",
      date: "2024-01-05",
      status: "Reviewed",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
        <CardDescription>Your latest medical reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {report.type} • {report.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={report.status === "Reviewed" ? "default" : "secondary"}>{report.status}</Badge>
                <Button variant="ghost" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
