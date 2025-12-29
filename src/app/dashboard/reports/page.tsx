import type { Metadata } from "next"
import ReportsOverviewClient from "./ReportsListClient"

export const metadata: Metadata = {
  title: "Medical Reports | MediVault",
  description:
    "Upload, manage, and securely share your medical reports with doctors and family.",
}

export default function ReportsPage() {
  return <ReportsOverviewClient />
}
