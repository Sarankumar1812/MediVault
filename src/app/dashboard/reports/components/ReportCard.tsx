// app/dashboard/reports/components/ReportCard.tsx - UPDATE
"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Image, FileSpreadsheet, MoreVertical, Download, Trash2, Share2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

interface ReportCardProps {
  report: {
    id: number;
    name: string;
    typeLabel: string;
    date: string;
    doctorLab: string | null;
    fileType: string;
    isExtracted: boolean;
  };
  onDelete: () => void;
  onShare?: () => void; // Make this optional with ?
}

export default function ReportCard({ report, onDelete, onShare }: ReportCardProps) {
  const getFileIcon = () => {
    if (report.fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
    if (report.fileType.includes('image')) return <Image className="h-4 w-4 text-blue-500" />
    if (report.fileType.includes('spreadsheet') || report.fileType.includes('excel') || report.fileType.includes('csv')) 
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  const handleDownload = async () => {
    try {
      // TODO: Implement download functionality
      console.log('Download report:', report.id)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      // Default behavior - navigate to share page
      window.location.href = `/dashboard/reports/${report.id}#share`
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="space-y-4 pt-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              {getFileIcon()}
            </div>
            <div>
              <h3 className="font-medium line-clamp-1">{report.name}</h3>
              <p className="text-sm text-muted-foreground">{report.typeLabel}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{format(new Date(report.date), 'MMM dd, yyyy')}</span>
          </div>
          
          {report.doctorLab && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Doctor/Lab:</span>
              <span className="text-right line-clamp-1">{report.doctorLab}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data Extracted:</span>
            <span className={report.isExtracted ? "text-green-600" : "text-amber-600"}>
              {report.isExtracted ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Link href={`/dashboard/reports/${report.id}`}>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </Link>
          <Button size="sm" variant="secondary" onClick={handleShare}>
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}