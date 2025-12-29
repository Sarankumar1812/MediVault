// app/dashboard/reports/[reportId]/page.tsx
import type { Metadata } from "next"
import ReportDetailsClient from "./ReportDetailsClient"

export const metadata: Metadata = {
  title: "Report Details | MediVault",
}

export default function ReportDetailsPage({
  params,
}: {
  params: { reportId: string }
}) {
  return <ReportDetailsClient reportId={params.reportId} />
}