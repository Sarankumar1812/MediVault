import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Vitals Dashboard | MediVault",
  description: "Track and monitor your health vitals including heart rate, blood pressure, blood sugar, weight and temperature.",
}

const tabs = [
  { label: "Overview", href: "/dashboard/vitals" },
  { label: "Heart Rate", href: "/dashboard/vitals/heart-rate" },
  { label: "Blood Pressure", href: "/dashboard/vitals/blood-pressure" },
  { label: "Blood Sugar", href: "/dashboard/vitals/blood-sugar" },
  { label: "Weight", href: "/dashboard/vitals/weight" },
  { label: "Temperature", href: "/dashboard/vitals/temperature" },
]

export default function VitalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 min-h-screen px-8 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Vitals</h1>
        <p className="text-muted-foreground">
          Monitor, analyze, and export your health vitals over time
        </p>
      </header>

      <nav className="flex gap-6 border-b">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="pb-3 text-sm font-medium text-muted-foreground hover:text-black"
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  )
}
