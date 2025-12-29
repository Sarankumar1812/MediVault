import type { Metadata } from "next"
import UploadReportClient from "./UploadReportClient"

export const metadata: Metadata = {
  title: "Upload Medical Report | MediVault",
  description:
    "Upload and securely store your medical reports with structured health information.",
}

export default function UploadReportPage() {
  return <UploadReportClient />
}
