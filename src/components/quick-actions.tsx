"use client"

import { Button } from "@/components/ui/button"
import { Upload, FileText, Share2, Calendar } from "lucide-react"

export function QuickActions() {
  return (
    <div className="space-y-3">
      <Button className="w-full justify-start gap-3 h-auto py-4 bg-transparent" variant="outline">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Upload className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className="font-medium text-foreground">Upload Report</p>
          <p className="text-xs text-muted-foreground">Add new medical documents</p>
        </div>
      </Button>

      <Button className="w-full justify-start gap-3 h-auto py-4 bg-transparent" variant="outline">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FileText className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className="font-medium text-foreground">View Reports</p>
          <p className="text-xs text-muted-foreground">Browse all documents</p>
        </div>
      </Button>

      <Button className="w-full justify-start gap-3 h-auto py-4 bg-transparent" variant="outline">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success text-success-foreground">
          <Share2 className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className="font-medium text-foreground">Share Access</p>
          <p className="text-xs text-muted-foreground">Grant report permissions</p>
        </div>
      </Button>

      <Button className="w-full justify-start gap-3 h-auto py-4 bg-transparent" variant="outline">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className="font-medium text-foreground">Schedule Test</p>
          <p className="text-xs text-muted-foreground">Book appointments</p>
        </div>
      </Button>
    </div>
  )
}
