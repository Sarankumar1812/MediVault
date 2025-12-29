// app/dashboard/vitals/heart-rate/page.tsx - Updated
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
import { useToast } from "@/hooks/use-toast"

import AddVitalModal from "../components/AddVitalModal"
import ExportPDF from "../components/ExportPDF"
import TimeFilter from "../components/TimeFilter"

import { getVitals, getVitalStats, VitalEntry, filterByRange } from "../utils/api-vitals"

export default function HeartRateClient() {
  const { toast } = useToast()
  const [range, setRange] = useState<number>(7)
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<VitalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    avg: 0,
    min: 0,
    max: 0,
    count: 0
  })

  // Load data
  useEffect(() => {
    fetchData()
  }, [range])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Get vitals
      const vitals = await getVitals('heart-rate')
      const filtered = filterByRange(vitals, range)
      setData(filtered)
      
      // Get stats
      const statsData = await getVitalStats('heart-rate', range)
      setStats(statsData.stats)
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load heart rate data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Chart data
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return Array.from({ length: Math.min(7, range) }).map((_, i) => ({
        date: `Day ${i + 1}`,
        value: 0,
      }))
    }

    return data
      .slice()
      .reverse()
      .map((v) => ({
        date: new Date(v.recordedAt).toLocaleDateString(),
        value: v.value as number,
      }))
  }, [data, range])

  const handleSuccess = () => {
    fetchData()
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-64"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Heart Rate</h2>
          <p className="text-muted-foreground">
            Measured in beats per minute (bpm)
          </p>
        </div>

        <div className="flex gap-3">
          <ExportPDF title="Heart Rate Report" data={data} />
          <Button onClick={() => setOpen(true)}>Add Heart Rate</Button>
        </div>
      </div>

      {/* FILTER */}
      <TimeFilter value={range} onChange={setRange} />

      {/* GRAPH 1 */}
      <Card>
        <CardHeader>
          <CardTitle>Heart Rate Trend</CardTitle>
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
                stroke="#2fae8e"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAPH 2 + 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Bar dataKey="value" fill="#3fc4e2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variability Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="hrFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2fae8e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2fae8e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2fae8e"
                  fill="url(#hrFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Average" value={`${stats.avg.toFixed(1)} bpm`} />
        <SummaryCard label="Minimum" value={`${stats.min} bpm`} />
        <SummaryCard label="Maximum" value={`${stats.max} bpm`} />
      </div>

      {/* RECENT */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Heart Rate Records</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
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
                      {`${v.value} ${v.unit}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No heart rate records found
            </div>
          )}
        </CardContent>
      </Card>

      <AddVitalModal 
        open={open} 
        onClose={() => setOpen(false)} 
        onSuccess={handleSuccess}
      />
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}