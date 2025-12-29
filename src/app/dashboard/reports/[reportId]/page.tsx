import type { Metadata } from "next"
import ReportDetailsClient from "./ReportDetailsClient"

export const metadata: Metadata = {
  title: "Report Details | MediVault",
}

export default function ReportDetailsPage() {
  return <ReportDetailsClient />
}
