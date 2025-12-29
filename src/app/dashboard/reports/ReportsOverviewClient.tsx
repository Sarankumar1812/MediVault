"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import ReportCard from "./components/ReportCard"
import ReportsFilterBar from "./components/ReportsFilterBar"
import EmptyState from "./components/EmptyState"

const MOCK_REPORTS = [
  {
    id: "1",
    name: "Blood Test – July 2024",
    type: "Blood Test",
    date: "2024-07-10",
    vitals: ["Blood Sugar", "Cholesterol"],
  },
]

export default function ReportsOverviewClient() {
  return (
    <div className="space-y-8">

      {/* Header (same as vitals) */}
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

      {/* Filters */}
      <ReportsFilterBar />

      {/* Content */}
      {MOCK_REPORTS.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_REPORTS.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}
