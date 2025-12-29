"use client"

import type { ReactNode } from "react"
import { Poppins } from "next/font/google"
import { useState } from "react"
import DashboardSidebar from "@/components/dashboard/sidebar"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
