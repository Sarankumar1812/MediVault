"use client"

import { Button } from "@/components/ui/button"
import ShareReportModal from "../components/ShareReportModal"
import ExtractedDataPanel from "../components/ExtractedDataPanel"
import { useState } from "react"

export default function ReportDetailsClient() {
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Blood Test – July 2024
          </h1>
          <p className="text-muted-foreground">
            Uploaded on July 10, 2024
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">Download</Button>
          <Button onClick={() => setShareOpen(true)}>Share</Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Metadata */}
        <div className="space-y-4">
          <p><strong>Type:</strong> Blood Test</p>
          <p><strong>Doctor / Lab:</strong> Apollo Labs</p>
          <p><strong>Related vitals:</strong> Blood Sugar</p>
        </div>

        {/* Viewer */}
        <div className="lg:col-span-2 border rounded-lg h-[500px] flex items-center justify-center text-muted-foreground">
          PDF / Image Viewer Placeholder
        </div>
      </div>

      {/* Extracted data */}
      <ExtractedDataPanel />

      <ShareReportModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  )
}
