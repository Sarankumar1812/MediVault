"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function UploadReportClient() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Upload Medical Report</h1>
        <p className="text-muted-foreground">
          Add a new medical document to your health vault
        </p>
      </div>

      {/* File upload */}
      <div className="space-y-2">
        <Label>Report File</Label>
        <Input type="file" />
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Report Name</Label>
          <Input placeholder="Blood Test – July 2024" />
        </div>

        <div className="space-y-2">
          <Label>Report Type</Label>
          <Input placeholder="Blood Test / Scan / Prescription" />
        </div>

        <div className="space-y-2">
          <Label>Report Date</Label>
          <Input type="date" />
        </div>

        <div className="space-y-2">
          <Label>Doctor / Lab (optional)</Label>
          <Input placeholder="Hospital or Lab name" />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea placeholder="Additional information…" />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>Upload Report</Button>
      </div>
    </div>
  )
}
