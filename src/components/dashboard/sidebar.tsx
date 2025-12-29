"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  FileText,
  Activity,
  Share2,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
} from "lucide-react"
import clsx from "clsx"

interface DashboardSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogout?: () => void
}

export default function DashboardSidebar({
  open,
  onOpenChange,
  onLogout,
}: DashboardSidebarProps) {
  const pathname = usePathname()

  /* MAIN NAVIGATION (CORE FEATURES) */
  const mainNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/dashboard/profile", icon: User },
    { label: "Health Profile", href: "/dashboard/health-profile", icon: Activity },
    { label: "Reports", href: "/dashboard/reports", icon: FileText },
    { label: "Vitals", href: "/dashboard/vitals", icon: Activity },
    { label: "Shared Reports", href: "/dashboard/shared", icon: Share2 },
  ]

  /* UTILITY NAVIGATION */
  const utilityNav = [
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Help & Support", href: "/dashboard/help", icon: HelpCircle },
  ]

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href)

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed md:relative z-50 h-screen w-64 bg-white border-r border-slate-200",
          "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col font-poppins">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Image
                src="/medivault_logo.png"
                alt="MediVault"
                width={34}
                height={34}
              />
              <span className="text-[18px] font-semibold text-slate-900 tracking-tight">
                MediVault
              </span>
            </div>

            <button
              className="md:hidden rounded-xl p-2 hover:bg-slate-100 transition"
              onClick={() => onOpenChange(false)}
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {mainNav.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={clsx(
                      "relative flex items-center gap-4 px-5 py-3 rounded-2xl",
                      "text-[15px] font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(47,174,142,0.25)]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary" />
                    )}

                    <Icon
                      className={clsx(
                        "h-4.5 w-4.5",
                        active ? "text-primary" : "text-slate-500"
                      )}
                    />
                    {item.label}
                  </div>
                </Link>
              )
            })}

            {/* Utility Divider */}
            <div className="my-6 border-t border-slate-200" />

            {utilityNav.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={clsx(
                      "flex items-center gap-4 px-5 py-3 rounded-2xl",
                      "text-[15px] font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 text-slate-500" />
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Profile & Logout */}
          <div className="px-4 py-5 border-t border-slate-200 space-y-2">

            <button
              onClick={onLogout}
              className="flex w-full items-center gap-4 px-5 py-3 rounded-2xl
                         text-[15px] font-medium text-red-600
                         hover:bg-red-50 transition"
            >
              <LogOut className="h-4.5 w-4.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
