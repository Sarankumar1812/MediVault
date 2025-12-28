// app/dashboard/page.tsx
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardView } from "@/components/dashboard-view"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardView />
    </DashboardLayout>
  )
}