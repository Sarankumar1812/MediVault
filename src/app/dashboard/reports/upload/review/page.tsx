// app/dashboard/reports/upload/review/page.tsx - CREATE THIS FILE
import type { Metadata } from "next"
import ReviewExtractedDataClient from "./ReviewExtractedData"

export const metadata: Metadata = {
  title: "Review Extracted Data | MediVault",
  description: "Review and verify extracted medical data from your report",
}

export default function ReviewExtractedDataPage() {
  return <ReviewExtractedDataClient />
}