// app/dashboard/reports/[reportId]/ReportDetailsClient.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Share2, Edit, FileText, Image, FileSpreadsheet, Calendar, User, Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getAuthToken } from "@/lib/auth-client"
import { format } from "date-fns"
import ShareReportModal from "../components/ShareReportModal"

interface ReportDetail {
  id: number;
  name: string;
  type: string;
  typeLabel: string;
  date: string;
  doctorLab: string | null;
  notes: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedData: any;
  isExtracted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ReportDetailsClient({ reportId }: { reportId: string }) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  useEffect(() => {
    fetchReportDetails()
  }, [reportId])

  const fetchReportDetails = async () => {
    try {
      setIsLoading(true)
      const token = getAuthToken()
      
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to view report details",
          variant: "destructive"
        })
        router.push('/login')
        return
      }

      const response = await fetch(`/api/reports/mv2003getreport/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load report details')
      }

      if (data.success && data.data.report) {
        setReport(data.data.report)
      } else {
        throw new Error('Report not found')
      }
    } catch (error: any) {
      console.error('Failed to fetch report details:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load report details",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!report?.fileUrl) {
      toast({
        title: "No file available",
        description: "Report file is not available for download",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = report.fileUrl
      link.download = report.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Download started",
        description: "Your report is being downloaded",
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: "Download failed",
        description: "Failed to download report. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getFileIcon = () => {
    if (report?.fileType.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />
    if (report?.fileType.includes('image')) return <Image className="h-6 w-6 text-blue-500" />
    if (report?.fileType.includes('spreadsheet') || report?.fileType.includes('excel') || report?.fileType.includes('csv')) 
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading report details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <FileText className="h-12 w-12 text-gray-400 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold">Report Not Found</h2>
          <p className="mt-2 text-muted-foreground">The requested report does not exist or you don't have access</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/reports')}>
            Back to Reports
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/reports')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{report.name}</h1>
            <p className="text-muted-foreground">
              {report.typeLabel} • {format(new Date(report.date), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={() => setShareModalOpen(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Metadata */}
        <div className="space-y-6">
          {/* Report Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getFileIcon()}
                </div>
                <div>
                  <p className="font-medium">{report.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(report.fileSize)} • {report.fileType.split('/')[1]?.toUpperCase() || 'File'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Uploaded: {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                
                {report.doctorLab && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{report.doctorLab}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          {report.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{report.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Viewer */}
          <Card>
            <CardHeader>
              <CardTitle>Report Viewer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg h-[500px] flex flex-col">
                {report.fileType.includes('pdf') ? (
                  <iframe
                    src={`${report.fileUrl}#view=FitH`}
                    className="w-full h-full border-0"
                    title="PDF Viewer"
                  />
                ) : report.fileType.includes('image') ? (
                  <div className="h-full flex items-center justify-center p-4">
                    <img
                      src={report.fileUrl}
                      alt={report.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Preview not available for this file type</p>
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download to View
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Extracted Data */}
          {report.isExtracted && report.extractedData?.parameters && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Medical Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Normal Range</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.extractedData.parameters.map((param: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{param.name}</TableCell>
                        <TableCell>{param.value}</TableCell>
                        <TableCell>{param.unit}</TableCell>
                        <TableCell>{param.normalRange}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            param.status === 'normal' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {param.status.charAt(0).toUpperCase() + param.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {report.extractedData.metadata && (
                  <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <p>Extracted via: {report.extractedData.metadata.extractionMethod}</p>
                    <p>Confidence: {Math.round(report.extractedData.metadata.confidence * 100)}%</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!report.isExtracted && (
            <Alert>
              <AlertDescription>
                Data extraction is pending for this report. The system will automatically extract
                medical parameters soon.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareReportModal 
        open={shareModalOpen} 
        onClose={() => setShareModalOpen(false)}
        reportId={reportId}
      />
    </div>
  )
}