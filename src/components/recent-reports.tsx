"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Share2, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const reports = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    type: "Blood Test",
    date: new Date(2024, 11, 15),
    status: "Normal",
    vitals: ["Hemoglobin: 14.5 g/dL", "WBC: 7,500/μL", "Platelets: 250,000/μL"],
  },
  {
    id: 2,
    name: "Lipid Profile",
    type: "Blood Test",
    date: new Date(2024, 11, 10),
    status: "Normal",
    vitals: ["Total Cholesterol: 180 mg/dL", "HDL: 55 mg/dL", "LDL: 110 mg/dL"],
  },
  {
    id: 3,
    name: "Chest X-Ray",
    type: "Radiology",
    date: new Date(2024, 10, 28),
    status: "Clear",
    vitals: ["No abnormalities detected"],
  },
  {
    id: 4,
    name: "Blood Glucose Fasting",
    type: "Blood Test",
    date: new Date(2024, 10, 20),
    status: "Normal",
    vitals: ["Glucose: 95 mg/dL"],
  },
  {
    id: 5,
    name: "ECG Report",
    type: "Cardiac",
    date: new Date(2024, 10, 15),
    status: "Normal",
    vitals: ["Heart Rate: 74 bpm", "Rhythm: Regular"],
  },
]

export function RecentReports() {
  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex items-start gap-4 rounded-lg border border-border p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <FileText className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-foreground text-sm">{report.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {report.type} • {formatDistanceToNow(report.date, { addSuffix: true })}
                </p>
              </div>
              <Badge
                variant={report.status === "Normal" || report.status === "Clear" ? "default" : "secondary"}
                className="bg-success text-success-foreground shrink-0"
              >
                {report.status}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground space-y-0.5">
              {report.vitals.map((vital, idx) => (
                <p key={idx}>{vital}</p>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="ghost" className="h-8 text-xs">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs">
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
