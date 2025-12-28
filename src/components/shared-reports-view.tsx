// components/shared-reports-view.tsx
"use client"

import { useState, useEffect } from "react"
import { getAuthToken } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, FileText, Calendar, User, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SharedReport {
  id: number
  title: string
  type: string
  category: string
  date: string
  sharedByName: string
  sharedByEmail: string
  accessLevel: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
}

export function SharedReportsView() {
  const [reports, setReports] = useState<SharedReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalReports: 0,
    totalSharers: 0
  })

  useEffect(() => {
    fetchSharedReports()
  }, [])

  const fetchSharedReports = async () => {
    try {
      setIsLoading(true)
      const token = getAuthToken();
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to view shared reports",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/shared/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
        
        // Calculate stats
        const totalSharers = [...new Set(data.reports.map((r: SharedReport) => r.sharedByEmail))].length
        
        setStats({
          totalReports: data.reports.length,
          totalSharers
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to load shared reports",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching shared reports:", error)
      toast({
        title: "Error",
        description: "Failed to load shared reports",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (report: SharedReport) => {
    window.open(report.fileUrl, '_blank')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shared Reports</h1>
        <p className="text-gray-600 mt-1">Health reports shared with you by others</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Shared Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalReports}</div>
            <p className="text-xs text-gray-500 mt-1">Reports accessible to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              People Sharing With You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalSharers}</div>
            <p className="text-xs text-gray-500 mt-1">Individuals sharing reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Shared Health Reports</CardTitle>
          <CardDescription>
            Reports that have been shared with you. You can view and download them based on the access level granted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading shared reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">No shared reports yet</h3>
              <p className="text-sm text-gray-500">
                When someone shares their health reports with you, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${getCategoryColor(report.category)}`}>
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                          {report.type}
                        </Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          {report.category}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Shared by: {report.sharedByName}
                        </span>
                        <span className="text-xs">
                          {formatFileSize(report.fileSize)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {report.sharedByName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-500">{report.sharedByEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 sm:w-full"
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Blood Test': 'bg-red-500',
    'X-Ray': 'bg-blue-500',
    'MRI': 'bg-purple-500',
    'CT Scan': 'bg-green-500',
    'Ultrasound': 'bg-yellow-500',
    'General': 'bg-gray-500',
    'Prescription': 'bg-indigo-500',
    'Surgery': 'bg-pink-500'
  }
  return colors[category] || 'bg-gray-500'
}