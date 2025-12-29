// app/dashboard/reports/components/EmptyState.tsx
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Upload, Shield, BarChart3 } from "lucide-react"

export default function EmptyState() {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="py-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">No medical reports yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Upload your first medical report to start building your digital health vault.
          Securely store, organize, and share your medical documents.
        </p>

        <Link href="/dashboard/reports/upload">
          <Button size="lg" className="mb-6">
            <Upload className="h-5 w-5 mr-2" />
            Upload First Report
          </Button>
        </Link>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mx-auto">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-medium">Secure Storage</h4>
            <p className="text-sm text-muted-foreground">
              HIPAA compliant encryption for all your medical data
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mx-auto">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-medium">Smart Extraction</h4>
            <p className="text-sm text-muted-foreground">
              Automatically extract medical parameters from reports
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mx-auto">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="font-medium">Easy Sharing</h4>
            <p className="text-sm text-muted-foreground">
              Share securely with doctors, family, or healthcare providers
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}