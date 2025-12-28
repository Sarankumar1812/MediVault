// app/reports/upload/page.tsx
"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Upload,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  FileSpreadsheet,
  FileType,
  Download,
  Loader2,
  Info,
  FileImage
} from "lucide-react"
import { format } from "date-fns"
import { generateHealthReportTemplate } from "@/lib/templates"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

const reportTypes = [
  "Blood Test",
  "Radiology",
  "Cardiac",
  "Imaging",
  "Biochemistry",
  "Endocrinology",
  "Hematology",
  "Other"
]

const categories = [
  "Hematology",
  "Biochemistry",
  "Imaging",
  "Cardiology",
  "Endocrinology",
  "General"
]

const templateTypes = [
  { 
    id: "csv", 
    name: "CSV Template", 
    icon: FileSpreadsheet, 
    description: "Spreadsheet format for lab results",
    color: "bg-green-50 border-green-200 text-green-700",
    iconColor: "text-green-600 bg-green-100"
  },
  { 
    id: "excel", 
    name: "Excel Template", 
    icon: FileText, 
    description: "Detailed report with tables",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    iconColor: "text-blue-600 bg-blue-100"
  },
  { 
    id: "simple", 
    name: "Simple Template", 
    icon: FileType, 
    description: "Basic health report format",
    color: "bg-purple-50 border-purple-200 text-purple-700",
    iconColor: "text-purple-600 bg-purple-100"
  }
]

// Allowed file types - ONLY CSV, Excel, and TXT
const allowedFileTypes = [
  { 
    type: 'text/csv', 
    extensions: ['.csv'], 
    name: 'CSV', 
    icon: FileSpreadsheet, 
    color: 'text-green-600',
    description: 'Comma Separated Values'
  },
  { 
    type: 'text/plain', 
    extensions: ['.txt'], 
    name: 'TXT', 
    icon: FileText, 
    color: 'text-gray-500',
    description: 'Plain Text File'
  },
  { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    extensions: ['.xlsx'], 
    name: 'Excel', 
    icon: FileSpreadsheet, 
    color: 'text-green-700',
    description: 'Excel Spreadsheet'
  },
  { 
    type: 'application/vnd.ms-excel', 
    extensions: ['.xls'], 
    name: 'Excel', 
    icon: FileSpreadsheet, 
    color: 'text-green-700',
    description: 'Excel 97-2003'
  }
]

export default function UploadReportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    reportType: "",
    category: "",
    reportDate: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    status: "Pending"
  })

  // Update form data handler
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle template download
  const handleDownloadTemplate = useCallback((templateType: string) => {
    try {
      const userName = "Your Name"
      const templates = generateHealthReportTemplate(userName)
      
      let content: string
      let fileName: string
      let mimeType: string
      
      switch(templateType) {
        case "csv":
          content = templates.csv
          fileName = `health-report-template-${Date.now()}.csv`
          mimeType = "text/csv"
          break
        case "excel":
          content = templates.excel
          fileName = `health-report-template-${Date.now()}.xlsx`
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          break
        case "simple":
          content = templates.simple
          fileName = `health-report-template-${Date.now()}.txt`
          mimeType = "text/plain"
          break
        default:
          content = templates.simple
          fileName = `health-report-template-${Date.now()}.txt`
          mimeType = "text/plain"
      }
      
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setSelectedTemplate(templateType)
      
      toast({
        title: "Template Downloaded",
        description: `${templateType.toUpperCase()} template has been downloaded. Fill it with your data and upload.`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }, [isDragging])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0])
    }
  }, [])

  // File selection handler
  const handleFileSelect = useCallback((selectedFile: File) => {
    // Clear previous errors
    toast({ title: "", description: "" })
    
    // Validate file type
    const allowedMimeTypes = allowedFileTypes.map(ft => ft.type)
    const allowedExtensions = allowedFileTypes.flatMap(ft => ft.extensions)
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase()
    
    const isValidMimeType = allowedMimeTypes.includes(selectedFile.type)
    const isValidExtension = allowedExtensions.includes(fileExtension)
    
    if (!isValidMimeType && !isValidExtension) {
      toast({
        title: "Invalid File Type",
        description: `Please upload only: CSV, Excel (XLS/XLSX), or TXT files`,
        variant: "destructive",
      })
      return
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    
    // Set default title from filename if not already set
    if (!formData.title) {
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "")
      setFormData(prev => ({ ...prev, title: fileNameWithoutExt }))
    }

    toast({
      title: "File Selected",
      description: `${selectedFile.name} (${formatFileSize(selectedFile.size)})`,
      variant: "default",
    })
  }, [formData.title, toast])

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon
  const getFileIcon = (fileType: string) => {
    const fileTypeObj = allowedFileTypes.find(ft => 
      ft.type === fileType || 
      fileType.includes(ft.name.toLowerCase()) ||
      (fileType === 'text/plain' && fileType.includes('text'))
    )
    
    if (fileTypeObj) {
      const Icon = fileTypeObj.icon
      return <Icon className={`h-8 w-8 ${fileTypeObj.color}`} />
    }
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const validationErrors: string[] = []
    
    if (!formData.title.trim()) {
      validationErrors.push("Please enter a report title")
    }

    if (!formData.reportType) {
      validationErrors.push("Please select a report type")
    }

    if (!formData.category) {
      validationErrors.push("Please select a category")
    }

    if (!file) {
      validationErrors.push("Please select a file to upload")
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(". "),
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const token = localStorage.getItem('healthwallet-token')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload reports",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      // Show uploading toast
      toast({
        title: "Uploading Report",
        description: "Your file is being uploaded...",
        variant: "default",
      })

      // Step 1: Upload file to Cloudinary (only if file exists)
      if (!file) {
        throw new Error("No file selected")
      }

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const uploadResponse = await fetch('/api/upload-files', {
        method: 'POST',
        body: uploadFormData,
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'File upload failed')
      }

      // Step 2: Save report with extracted text
      const reportData = {
        title: formData.title,
        type: formData.reportType,
        category: formData.category,
        reportDate: formData.reportDate,
        notes: formData.notes,
        status: formData.status,
        fileUrl: uploadResult.url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        publicId: uploadResult.publicId || ''
      }

      const saveResponse = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      })

      const reportResult = await saveResponse.json()

      if (!saveResponse.ok || !reportResult.success) {
        // Try to delete the uploaded file if report save fails
        if (uploadResult.publicId) {
          await fetch('/api/upload-files', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId: uploadResult.publicId })
          })
        }
        
        throw new Error(reportResult.error || 'Report creation failed')
      }

      // Success toast
      toast({
        title: "Success!",
        description: "Report uploaded successfully. Redirecting...",
        variant: "default",
      })

      // Reset form
      setFormData({
        title: "",
        reportType: "",
        category: "",
        reportDate: format(new Date(), "yyyy-MM-dd"),
        notes: "",
        status: "Pending"
      })
      setFile(null)
      setSelectedTemplate("")

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/reports')
      }, 2000)

    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: error.message || 'Upload failed. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Clear all form data
  const handleClearForm = () => {
    setFormData({
      title: "",
      reportType: "",
      category: "",
      reportDate: format(new Date(), "yyyy-MM-dd"),
      notes: "",
      status: "Pending"
    })
    setFile(null)
    setSelectedTemplate("")
    toast({
      title: "Form Cleared",
      description: "All form data has been cleared",
      variant: "default",
    })
  }

  // Get accepted file types for input
  const getAcceptedFileTypes = () => {
    return allowedFileTypes.flatMap(ft => ft.extensions).join(',')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Toast Container */}
        <Toaster />

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Upload Medical Report</h1>
                <p className="text-gray-600 mt-1">Add a new medical report to your health wallet</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/reports')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            View Reports
          </Button>
        </div>

        {/* Instructions Banner */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">How to Upload Reports</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li><strong>Download a template</strong> below and fill with your real health data</li>
                <li><strong>Save the file</strong> as CSV, Excel, or TXT format</li>
                <li><strong>Fill in the report details</strong> and upload your file using drag & drop or browse</li>
                <li><strong>Submit</strong> - your report will be securely stored and viewable immediately</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Templates
            </CardTitle>
            <CardDescription>
              Choose a template format, fill with your data, save, and upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {templateTypes.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => handleDownloadTemplate(template.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleDownloadTemplate(template.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${template.iconColor}`}>
                      <template.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-xs text-gray-500">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Format: {template.id.toUpperCase()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Free
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedTemplate && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800 mb-1">
                      Template Downloaded Successfully!
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Next Steps:</strong> Open the {selectedTemplate.toUpperCase()} file, 
                      fill in your real medical data, save it, then upload it below.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Upload Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Report Details</CardTitle>
              <CardDescription>
                Fill in the report information and upload your document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700">
                    Report Title *
                    <span className="text-xs text-gray-500 ml-1">(e.g., Annual Blood Test Results)</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter report title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    disabled={isUploading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportDate" className="text-gray-700">Report Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="reportDate"
                      type="date"
                      className="pl-9"
                      value={formData.reportDate}
                      onChange={(e) => handleInputChange('reportDate', e.target.value)}
                      disabled={isUploading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportType" className="text-gray-700">Report Type *</Label>
                  <Select
                    value={formData.reportType}
                    onValueChange={(value) => handleInputChange('reportType', value)}
                    disabled={isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-700">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                    disabled={isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-700">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  disabled={isUploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Abnormal">Abnormal</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-700">
                  Notes (Optional)
                  <span className="text-xs text-gray-500 ml-1">(Additional observations or comments)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes or observations about this report..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  disabled={isUploading}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-gray-700">
                    Report File *
                    <span className="ml-2 text-sm text-gray-500">
                      (Max 10MB • CSV, Excel, TXT only)
                    </span>
                  </Label>
                  
                  {/* Drag & Drop Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                        : file
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput')?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('fileInput')?.click()}
                  >
                    {file ? (
                      <div className="space-y-4">
                        <div className="flex flex-col items-center gap-3">
                          {getFileIcon(file.type)}
                          <div className="text-center">
                            <p className="font-medium text-gray-900 truncate max-w-xs mx-auto">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFile(null)
                              toast({
                                title: "File Removed",
                                description: "You can select a new file",
                                variant: "default",
                              })
                            }}
                            disabled={isUploading}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            Remove File
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              document.getElementById('fileInput')?.click()
                            }}
                            disabled={isUploading}
                            className="gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Change File
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className={`rounded-full p-4 transition-all ${
                            isDragging ? 'bg-blue-100 scale-110' : 'bg-gray-100'
                          }`}>
                            <Upload className={`h-8 w-8 ${
                              isDragging ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            {isDragging ? 'Drop your file here' : 'Click to browse or drag & drop'}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Supported: CSV, Excel (XLS/XLSX), TXT files only
                          </p>
                        </div>
                        <input
                          id="fileInput"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept={getAcceptedFileTypes()}
                          disabled={isUploading}
                        />
                      </div>
                    )}
                  </div>

                  {/* File Requirements */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div className="text-xs text-gray-600">
                        <p className="font-medium mb-1">File Requirements:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Maximum file size: 10MB</li>
                          <li>Supported formats: CSV, Excel (XLS/XLSX), TXT only</li>
                          <li>CSV files: Data will be automatically extracted and displayed</li>
                          <li>Excel files: Must be in XLS or XLSX format</li>
                          <li>TXT files: Plain text format for simple reports</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <div className="flex-1 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/reports')}
                    disabled={isUploading}
                    className="flex-1 gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={isUploading || !file}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading Report...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Quick Tips */}
        <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-800">For Best Results:</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Use CSV format for structured lab results</li>
                  <li>Excel files work best with clear column headers</li>
                  <li>TXT files are good for simple text reports</li>
                  <li>Add relevant notes for better organization</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-800">Data Extraction:</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>CSV: Automatic data extraction with column headers</li>
                  <li>Excel: Basic data extraction from sheets</li>
                  <li>TXT: Full text extraction for analysis</li>
                  <li>All files: Secure cloud storage with backup</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}