// app/dashboard/reports/upload/UploadReport.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Image, FileSpreadsheet, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getAuthToken } from "@/lib/auth-client"

const REPORT_TYPES = [
  { value: "blood_test", label: "Blood Test" },
  { value: "scan", label: "Scan" },
  { value: "prescription", label: "Prescription" },
  { value: "ecg", label: "ECG" },
  { value: "xray", label: "X-Ray" },
  { value: "mri", label: "MRI" },
  { value: "ct_scan", label: "CT Scan" },
  { value: "ultrasound", label: "Ultrasound" },
  { value: "discharge_summary", label: "Discharge Summary" },
  { value: "lab_report", label: "Lab Report" },
  { value: "doctor_notes", label: "Doctor Notes" },
  { value: "other", label: "Other" }
];

const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv,.docx";
const MAX_FILE_SIZE_MB = 10;

export default function UploadReport() {
  const { toast } = useToast()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: new Date().toISOString().split('T')[0],
    doctorLab: "",
    notes: "",
    privacyLevel: "private"
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />
    if (file.type.includes('image')) return <Image className="h-6 w-6 text-blue-500" />
    if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.type.includes('csv')) 
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />
    return <FileText className="h-6 w-6 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File must be less than ${MAX_FILE_SIZE_MB}MB`,
        variant: "destructive"
      })
      e.target.value = ""
      return
    }

    // Validate file type
    const allowedTypes = ACCEPTED_FILE_TYPES.split(',').map(ext => ext.trim())
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
    const mimeType = file.type
    
    if (!allowedTypes.includes(fileExt) && 
        !['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel', 'text/csv',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimeType)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, Image, Excel, CSV, or Word files only",
        variant: "destructive"
      })
      e.target.value = ""
      return
    }

    setUploadedFile(file)
    setShowSuccess(false)
    
    // Auto-fill name if empty
    if (!formData.name) {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      setFormData(prev => ({ ...prev, name: fileNameWithoutExt }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      })
      return
    }

    if (!formData.name || !formData.type || !formData.date) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      })
      return
    }

    const token = getAuthToken()
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please login to upload reports",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setShowSuccess(false)

    try {
      // Create FormData
      const formDataToSend = new FormData()
      formDataToSend.append('file', uploadedFile)
      formDataToSend.append('name', formData.name)
      formDataToSend.append('type', formData.type)
      formDataToSend.append('date', formData.date)
      if (formData.doctorLab) formDataToSend.append('doctorLab', formData.doctorLab)
      if (formData.notes) formDataToSend.append('notes', formData.notes)
      formDataToSend.append('privacyLevel', formData.privacyLevel)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // Upload to API
      const response = await fetch('/api/reports/mv2001uploadreport', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      setShowSuccess(true)
      
      // Store the data for review page
      localStorage.setItem('report_extraction_review_data', JSON.stringify({
        reportId: data.data.reportId,
        extractedData: data.data.extractedData,
        fileName: uploadedFile.name,
        fileType: uploadedFile.type,
        fileUrl: data.data.fileUrl,
        formData: formData
      }))

      toast({
        title: "Upload successful!",
        description: "Redirecting to review page...",
      })

      // Wait 2 seconds to show success, then redirect
      setTimeout(() => {
        router.push(`/dashboard/reports/upload/review`)
      }, 2000)

    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Upload Medical Report</h1>
        <p className="text-muted-foreground">
          Securely upload and store your medical documents
        </p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <Label htmlFor="file">Report File *</Label>
              
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Upload className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="font-medium">Drop your file here or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PDF, Images, Excel, CSV, Word (Max {MAX_FILE_SIZE_MB}MB)
                      </p>
                    </div>
                    <Input
                      id="file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept={ACCEPTED_FILE_TYPES}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file')?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(uploadedFile)}
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                      disabled={isUploading}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  {isUploading && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Report Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Report Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Annual Blood Test Report"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Report Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  disabled={isUploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Report Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorLab">Doctor / Lab (Optional)</Label>
                <Input
                  id="doctorLab"
                  placeholder="e.g., Apollo Hospitals, Dr. Smith"
                  value={formData.doctorLab}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctorLab: e.target.value }))}
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about this report..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                disabled={isUploading}
              />
            </div>

            {/* Privacy Level */}
            <div className="space-y-2">
              <Label htmlFor="privacyLevel">Privacy Level</Label>
              <Select
                value={formData.privacyLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, privacyLevel: value }))}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (Only you)</SelectItem>
                  <SelectItem value="shared">Shared (With selected people)</SelectItem>
                  <SelectItem value="public_link">Public Link (Anyone with link)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Upload complete! Redirecting to review page...
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/dashboard/reports')}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isUploading || !uploadedFile}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                  </>
                ) : (
                  'Upload Report'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}