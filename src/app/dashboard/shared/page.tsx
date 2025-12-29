// app/dashboard/reports/shared/page.tsx
import type { Metadata } from "next"
import SharedReportsClient from "./SharedReportsClient"

export const metadata: Metadata = {
  title: "Shared Reports | MediVault",
  description: "View reports shared with you and by you",
}

export default function SharedReportsPage() {
  return <SharedReportsClient />
}