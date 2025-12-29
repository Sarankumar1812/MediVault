"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import AddVitalModal from "./components/AddVitalModal"
import { getVitals, VitalEntry } from "./utils/vitals"

/* ----------------------------------
   Helpers
----------------------------------- */
const getLatestValue = (data: VitalEntry[], type: string) =>
  data.find((v) => v.type === type)

/* ----------------------------------
   Component
----------------------------------- */
export default function VitalsOverviewClient() {
  const [open, setOpen] = useState(false)
  const vitals = getVitals()

  const byType = useMemo(() => {
    return {
      heart: vitals.filter((v) => v.type === "heart-rate"),
      bp: vitals.filter((v) => v.type === "blood-pressure"),
      sugar: vitals.filter((v) => v.type === "blood-sugar"),
      weight: vitals.filter((v) => v.type === "weight"),
      temp: vitals.filter((v) => v.type === "temperature"),
    }
  }, [vitals])

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vitals Overview</h1>
          <p className="text-muted-foreground">
            Combined view of your health metrics
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Add Vital</Button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Kpi title="Heart Rate" value={renderValue(byType.heart[0])} />
        <Kpi title="Blood Pressure" value={renderBP(byType.bp[0])} />
        <Kpi title="Blood Sugar" value={renderValue(byType.sugar[0])} />
        <Kpi title="Weight" value={renderValue(byType.weight[0])} />
        <Kpi title="Temperature" value={renderValue(byType.temp[0])} />
      </div>

      {/* MINI GRAPHS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MiniCard title="Heart Rate" href="/dashboard/vitals/heart-rate" data={byType.heart} />
        <MiniCard title="Blood Sugar" href="/dashboard/vitals/blood-sugar" data={byType.sugar} />
        <MiniCard title="Weight" href="/dashboard/vitals/weight" data={byType.weight} />
        <MiniCard title="Temperature" href="/dashboard/vitals/temperature" data={byType.temp} />
        <MiniCard title="Blood Pressure" href="/dashboard/vitals/blood-pressure" data={byType.bp} dual />
      </div>

      {/* RECENT TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {vitals.slice(0, 6).map((v) => (
                <tr key={v.id} className="border-b">
                  <td className="p-3">
                    {new Date(v.recordedAt).toLocaleString()}
                  </td>
                  <td className="p-3 capitalize">{v.type.replace("-", " ")}</td>
                  <td className="p-3 font-medium">
                    {typeof v.value === "number"
                      ? `${v.value} ${v.unit}`
                      : `${v.value.systolic}/${v.value.diastolic} ${v.unit}`}
                  </td>
                </tr>
              ))}
              {vitals.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground">
                    No vitals recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AddVitalModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

/* ----------------------------------
   Small Components
----------------------------------- */
function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

function MiniCard({
  title,
  href,
  data,
  dual = false,
}: {
  title: string
  href: string
  data: VitalEntry[]
  dual?: boolean
}) {
  const chartData =
    data.length === 0
      ? Array.from({ length: 6 }).map((_, i) => ({ x: i, y: 0 }))
      : data
          .slice(0, 6)
          .reverse()
          .map((v, i) => ({
            x: i,
            y: typeof v.value === "number" ? v.value : v.value.systolic,
          }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="y"
              stroke="#2fae8e"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <Link href={href}>
          <Button variant="link" className="px-0">
            Explore →
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function renderValue(v?: VitalEntry) {
  if (!v) return "0"
  return typeof v.value === "number" ? `${v.value} ${v.unit}` : "—"
}

function renderBP(v?: VitalEntry) {
  if (!v || typeof v.value !== "object") return "0/0"
  return `${v.value.systolic}/${v.value.diastolic} ${v.unit}`
}
