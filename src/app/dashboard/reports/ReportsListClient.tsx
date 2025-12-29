// app/dashboard/reports/ReportsListClient.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ReportCard from "./components/ReportCard"
import ReportsFilterBar from "./components/ReportsFilterBar"
import EmptyState from "./components/EmptyState"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, FileText, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken } from "@/lib/auth-client"

interface Report {
  id: number;
  name: string;
  type: string;
  typeLabel: string;
  date: string;
  doctorLab: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedData: any;
  isExtracted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsListClient() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [stats, setStats] = useState({
    total: 0,
    extracted: 0,
    byType: {} as Record<string, number>
  })

  useEffect(() => {
    const fetchData = async () => {
      await fetchReports()
    }
    fetchData()
  }, [])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const token = getAuthToken()
      
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to view reports",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/reports/mv2002getreports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load reports')
      }

      if (data.success) {
        setReports(data.data.reports || [])
        setFilteredReports(data.data.reports || [])
        calculateStats(data.data.reports || [])
      }
    } catch (error: any) {
      console.error('Failed to fetch reports:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load reports",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (reports: Report[]) => {
    const byType: Record<string, number> = {}
    let extracted = 0
    
    reports.forEach(report => {
      // Count by type
      const typeLabel = report.typeLabel || report.type
      byType[typeLabel] = (byType[typeLabel] || 0) + 1
      
      // Count extracted
      if (report.isExtracted) extracted++
    })
    
    setStats({
      total: reports.length,
      extracted,
      byType
    })
  }

  const handleFilter = (filters: any) => {
    let filtered = [...reports]
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchLower) ||
        (report.doctorLab && report.doctorLab.toLowerCase().includes(searchLower))
      )
    }
    
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(report => report.type === filters.type)
    }
    
    setFilteredReports(filtered)
  }

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    
    try {
      const token = getAuthToken()
      if (!token) return
      
      // TODO: Implement delete API
      toast({
        title: "Delete feature coming soon",
        description: "Report deletion will be available in the next update",
      })
      
      // Refresh the list
      await fetchReports()
      
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Medical Reports</h1>
            <p className="text-muted-foreground">
              All your medical documents in one place
            </p>
          </div>
          <Link href="/dashboard/reports/upload">
            <Button>Upload Report</Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Medical Reports</h1>
          <p className="text-muted-foreground">
            All your medical documents in one place
          </p>
        </div>
        <Link href="/dashboard/reports/upload">
          <Button>Upload Report</Button>
        </Link>
      </div>

      {/* Statistics */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Extracted</p>
                  <p className="text-2xl font-semibold">{stats.extracted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Most Common</p>
                  <p className="text-2xl font-semibold">
                    {Object.keys(stats.byType).length > 0 
                      ? Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0][0]
                      : 'None'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <ReportsFilterBar onFilter={handleFilter} />

      {/* Content */}
      {filteredReports.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <ReportCard 
              key={report.id} 
              report={report}
              onDelete={() => handleDeleteReport(report.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}