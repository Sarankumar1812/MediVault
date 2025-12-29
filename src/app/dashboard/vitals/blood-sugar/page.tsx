"use client"

import { useEffect, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import AddVitalModal from "../components/AddVitalModal"
import ExportPDF from "../components/ExportPDF"
import TimeFilter from "../components/TimeFilter"

import { getVitals, VitalEntry } from "../utils/vitals"

/* ----------------------------------
   Client Component
----------------------------------- */
export default function BloodSugarClient() {
  const [range, setRange] = useState<number>(7)
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<VitalEntry[]>([])

  /* Load & filter blood sugar data */
  useEffect(() => {
    const vitals = getVitals().filter(
      (v) => v.type === "blood-sugar"
    )
    setData(filterByRange(vitals, range))
  }, [range])

  /* Chart-safe data */
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return Array.from({ length: 7 }).map((_, i) => ({
        date: `Day ${i + 1}`,
        value: 0,
      }))
    }

    return data
      .slice()
      .reverse()
      .map((v) => ({
        date: new Date(v.recordedAt).toLocaleDateString(),
        value: typeof v.value === "number" ? v.value : 0,
      }))
  }, [data])

  /* Summary */
  const avg =
    chartData.reduce((a, b) => a + b.value, 0) /
    (chartData.length || 1)

  const min = Math.min(...chartData.map((d) => d.value))
  const max = Math.max(...chartData.map((d) => d.value))

  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Blood Sugar</h2>
          <p className="text-muted-foreground">
            Measured in mg/dL
          </p>
        </div>

        <div className="flex gap-3">
          <ExportPDF title="Blood Sugar Report" data={data} />
          <Button onClick={() => setOpen(true)}>
            Add Blood Sugar
          </Button>
        </div>
      </div>

      {/* ================= FILTER ================= */}
      <TimeFilter value={range} onChange={setRange} />

      {/* ================= GRAPH 1: MAIN TREND ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Sugar Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ================= GRAPH 2 + 3 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* -------- Bar chart -------- */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* -------- Area chart -------- */}
        <Card>
          <CardHeader>
            <CardTitle>Glucose Variability</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="bsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  fill="url(#bsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Average" value={`${avg.toFixed(1)} mg/dL`} />
        <SummaryCard label="Minimum" value={`${min} mg/dL`} />
        <SummaryCard label="Maximum" value={`${max} mg/dL`} />
      </div>

      {/* ================= RECENT TABLE ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Blood Sugar Records</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 7).map((v) => (
                <tr key={v.id} className="border-b">
                  <td className="p-3">
                    {new Date(v.recordedAt).toLocaleString()}
                  </td>
                  <td className="p-3 font-medium">
                    {typeof v.value === "number"
                      ? `${v.value} ${v.unit}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ================= ADD MODAL ================= */}
      <AddVitalModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

/* ----------------------------------
   Helpers
----------------------------------- */
function filterByRange(data: VitalEntry[], days: number) {
  const now = Date.now()
  return data.filter((v) => {
    const diff =
      (now - new Date(v.recordedAt).getTime()) /
      (1000 * 60 * 60 * 24)
    return diff <= days
  })
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
