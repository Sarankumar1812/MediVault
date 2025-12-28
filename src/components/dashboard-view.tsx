// components/dashboard-view.tsx (Updated)
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Activity, 
  Share2, 
  Users,
  TrendingUp,
  Calendar,
  Plus,
  ArrowRight,
  AlertCircle,
  Home,
  Loader2,
  Eye
} from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/hooks/use-auth"
import { ReportModal } from "@/components/report-modal"

// Use the same Report interface structure as report-modal.tsx
// Use the exact same Report interface structure as report-modal.tsx
interface Report {
  id: number
  title: string
  type: string
  category: string
  date: Date
  uploadDate: Date
  status: "Normal" | "Abnormal" | "Critical" | "Pending"
  fileUrl: string // Changed from optional to required
  fileName: string // Changed from optional to required
  fileType: string // Changed from optional to required
  fileSize: number // Changed from optional to required
  notes: string // Changed from optional to required
  extractedText: string // Changed from optional to required
  vitals: string[] // Changed from optional to required
  patientName: string // Changed from optional to required
  publicId: string // Changed from optional to required
}

interface DashboardStats {
  totalReports: number
  recentReports: number
  sharedWith: number
  vitalEntries: number
}

interface DashboardData {
  stats: DashboardStats
  recentReports: Report[]
  lastUpdated: string
}

export function DashboardView() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      totalReports: 0,
      recentReports: 0,
      sharedWith: 0,
      vitalEntries: 0
    },
    recentReports: [],
    lastUpdated: new Date().toISOString()
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showReportModal, setShowReportModal] = useState<boolean>(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated || user) {
      fetchDashboardData()
    }
  }, [isAuthenticated, user])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError("")
      const token = localStorage.getItem('healthwallet-token')
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }

      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        }
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      
      // In dashboard-view.tsx, update the data transformation in fetchDashboardData:

// Transform API data to match Report interface
const formattedRecentReports: Report[] = data.recentReports.map((report: any) => ({
  id: report.id,
  title: report.title || 'Untitled Report',
  type: report.type || 'General',
  category: report.category || 'Other',
  date: report.report_date ? new Date(report.report_date) : new Date(),
  uploadDate: report.upload_date ? new Date(report.upload_date) : new Date(),
  status: (report.status as "Normal" | "Abnormal" | "Critical" | "Pending") || 'Pending',
  fileUrl: report.fileUrl || '',
  fileName: report.fileName || '',
  fileType: report.fileType || '',
  fileSize: report.fileSize || 0,
  notes: report.notes || '',
  extractedText: report.extractedText || '',
  vitals: report.vitals || [], // Ensure this is always an array
  patientName: report.patientName || 'User',
  publicId: report.publicId || ''
}))

      setDashboardData({
        stats: data.stats,
        recentReports: formattedRecentReports,
        lastUpdated: data.lastUpdated
      })

    } catch (error: any) {
      console.error('Dashboard data error:', error)
      setError(error.message || 'Failed to load dashboard data')
      
      // If token is invalid, redirect to login
      if (error.message.includes('Session expired') || error.message.includes('No authentication')) {
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatReportDate = (date: Date) => {
    try {
      if (!date) return 'Date not available'
      
      return format(date, 'MMM d, yyyy')
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Date error'
    }
  }

  const handleViewReport = (report: Report) => {
    // Fetch full report details before showing modal
    fetchReportDetails(report.id)
  }

  const fetchReportDetails = async (reportId: number) => {
    try {
      const token = localStorage.getItem('healthwallet-token')
      if (!token) return

      const response = await fetch(`/api/reports/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const reportData = await response.json()
        
        // Transform API data to match Report interface
        const formattedReport: Report = {
          id: reportData.id,
          title: reportData.title || 'Untitled Report',
          type: reportData.type || 'General',
          category: reportData.category || 'Other',
          date: reportData.date ? new Date(reportData.date) : new Date(),
          uploadDate: reportData.uploadDate ? new Date(reportData.uploadDate) : new Date(),
          status: (reportData.status as "Normal" | "Abnormal" | "Critical" | "Pending") || 'Pending',
          fileUrl: reportData.fileUrl || '',
          fileName: reportData.fileName || '',
          fileType: reportData.fileType || '',
          fileSize: reportData.fileSize || 0,
          notes: reportData.notes || '',
          extractedText: reportData.extractedText || '',
          vitals: reportData.vitals || [],
          patientName: reportData.patientName || 'User',
          publicId: reportData.publicId || ''
        }
        
        setSelectedReport(formattedReport)
        setShowReportModal(true)
      }
    } catch (error) {
      console.error('Error fetching report details:', error)
    }
  }

  const handleUpdateReport = (updatedReport: Report) => {
    // Update the report in dashboard data
    setDashboardData(prev => ({
      ...prev,
      recentReports: prev.recentReports.map(report => 
        report.id === updatedReport.id ? updatedReport : report
      )
    }))
    setSelectedReport(updatedReport)
  }

  const handleDeleteReport = async (reportId: number) => {
    try {
      const token = localStorage.getItem('healthwallet-token')
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove from dashboard data
        setDashboardData(prev => ({
          ...prev,
          recentReports: prev.recentReports.filter(report => report.id !== reportId),
          stats: {
            ...prev.stats,
            totalReports: Math.max(0, prev.stats.totalReports - 1),
            recentReports: Math.max(0, prev.stats.recentReports - 1)
          }
        }))
        
        // Close modal if the deleted report was open
        if (selectedReport?.id === reportId) {
          setShowReportModal(false)
          setSelectedReport(null)
        }
      }
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }

  const handleUploadReport = () => {
    router.push('/reports/upload')
  }

  const handleViewAllReports = () => {
    router.push('/reports')
  }

  const handleGoToHome = () => {
    router.push('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
      case 'Completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'Critical':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'Abnormal':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    }
  }

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return '📄'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('csv') || fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('text')) return '📝'
    return '📁'
  }



  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Error loading data</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
          <Button 
            variant="outline" 
            className="mt-3"
            onClick={fetchDashboardData}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's an overview of your health data
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleGoToHome}
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            <Button 
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleUploadReport}
            >
              <Plus className="h-4 w-4" />
              Upload Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.totalReports}
              </div>
              <div className="flex items-center gap-1 mt-2">
                {dashboardData.stats.recentReports > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">
                      {dashboardData.stats.recentReports} new in last month
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">
                    No recent reports
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-green-500" />
                Shared Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.sharedWith}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Users className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-gray-500">
                  People with access
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                Vital Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.vitalEntries}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Activity className="h-3 w-3 text-purple-500" />
                <span className="text-xs text-gray-500">
                  Health metrics tracked
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                Today
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {format(new Date(), 'MMM d, yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Reports */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Recent Reports</CardTitle>
                  <CardDescription>
                    Your latest medical documents
                  </CardDescription>
                </div>
                {dashboardData.recentReports.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleViewAllReports}
                    className="gap-1"
                  >
                    View All
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData.recentReports.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentReports.map((report) => (
                    <div 
                      key={report.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group border border-transparent hover:border-blue-200"
                      onClick={() => handleViewReport(report)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <span className="text-lg">
                            {getFileIcon(report.fileType)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 group-hover:text-blue-600 truncate">
                            {report.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                              {report.type}
                            </span>
                            <span>•</span>
                            <span>{formatReportDate(report.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <div className="hidden group-hover:flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewReport(report)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">No reports yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload your first medical report to get started
                  </p>
                  <Button 
                    onClick={handleUploadReport}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Upload Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              <CardDescription>
                Manage your health records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => router.push('/reports/upload')}
              >
                <FileText className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Upload New Report</div>
                  <div className="text-xs text-gray-500">Add medical documents</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => router.push('/vitals')}
              >
                <Activity className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Track Vitals</div>
                  <div className="text-xs text-gray-500">Monitor health metrics</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => router.push('/shared')}
              >
                <Share2 className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Share Reports</div>
                  <div className="text-xs text-gray-500">With doctors & family</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => router.push('/profile')}
              >
                <Users className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Update Profile</div>
                  <div className="text-xs text-gray-500">Personal information</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={handleGoToHome}
              >
                <Home className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Back to Home</div>
                  <div className="text-xs text-gray-500">Return to homepage</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Health Tips */}
        <Card className="bg-linear-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Health Tips
            </CardTitle>
            <CardDescription className="text-blue-700">
              Stay on top of your health journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 p-3 bg-white/50 rounded-lg">
                <h4 className="font-medium text-blue-800">Regular Check-ups</h4>
                <p className="text-sm text-blue-700">
                  Schedule annual health check-ups to monitor your overall health status and catch potential issues early.
                </p>
              </div>
              <div className="space-y-2 p-3 bg-white/50 rounded-lg">
                <h4 className="font-medium text-blue-800">Stay Organized</h4>
                <p className="text-sm text-blue-700">
                  Keep all medical reports in one secure place for easy access during doctor visits and emergencies.
                </p>
              </div>
              <div className="space-y-2 p-3 bg-white/50 rounded-lg">
                <h4 className="font-medium text-blue-800">Share Wisely</h4>
                <p className="text-sm text-blue-700">
                  Share relevant health information with your healthcare providers for better coordinated care.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Refresh Button */}
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={fetchDashboardData}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Last updated: {format(new Date(dashboardData.lastUpdated), 'h:mm a')}
          </Button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <ReportModal
          report={selectedReport}
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false)
            setSelectedReport(null)
          }}
          onUpdate={handleUpdateReport}
          onDelete={handleDeleteReport}
        />
      )}
    </>
  )
}