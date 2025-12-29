"use client"

import { Menu } from "lucide-react"

interface DashboardHeaderProps {
  onMenuClick: () => void
  title?: string
}

export default function DashboardHeader({
  onMenuClick,
  title = "Dashboard",
}: DashboardHeaderProps) {
  return (
    <header
      className="
        sticky top-0 z-30
        h-[64px]
        bg-white
        border-b border-slate-200
        px-6
      "
    >
      <div className="flex h-full items-center gap-4 font-poppins">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="
            md:hidden
            rounded-xl p-2
            text-slate-600
            hover:bg-slate-100
            transition
          "
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page title */}
        <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  )
}
