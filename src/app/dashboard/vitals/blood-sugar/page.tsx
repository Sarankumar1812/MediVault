// app/dashboard/vitals/blood-sugar/page.tsx
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

import { getVitals, getVitalStats, VitalEntry, filterByRange, calculateStats } from "../utils/api-vitals"

export default function BloodSugarClient() {
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
  const [recentVitals, setRecentVitals] = useState<VitalEntry[]>([])

  // Load data
  useEffect(() => {
    fetchData()
  }, [range])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Get vitals
      const vitals = await getVitals('blood-sugar')
      const filtered = filterByRange(vitals, range)
      setData(filtered)
      setRecentVitals(filtered.slice(0, 7))
      
      try {
        // Get stats from API
        const statsData = await getVitalStats('blood-sugar', range)
        setStats(statsData.stats)
      } catch (statsError) {
        // Fallback to local calculation if API fails
        const localStats = calculateStats(filtered)
        setStats(localStats)
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load blood sugar data",
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
        date: new Date(v.recordedAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        value: v.value as number,
      }))
  }, [data, range])

  const handleSuccess = () => {
    fetchData()
  }

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-slate-200 rounded animate-pulse w-48 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-64"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-slate-200 rounded animate-pulse w-24"></div>
            <div className="h-10 bg-slate-200 rounded animate-pulse w-32"></div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-slate-200 rounded animate-pulse w-16"></div>
          ))}
        </div>
        
        <div className="h-80 bg-slate-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Blood Sugar</h2>
          <p className="text-muted-foreground">
            Measured in mg/dL
          </p>
        </div>

        <div className="flex gap-3">
          <ExportPDF title="Blood Sugar Report" data={data} />
          <Button onClick={() => setOpen(true)}>Add Blood Sugar</Button>
        </div>
      </div>

      {/* FILTER */}
      <TimeFilter value={range} onChange={setRange} />

      {/* GRAPH 1 */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Sugar Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
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
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No blood sugar data available. Add your first reading!
            </div>
          )}
        </CardContent>
      </Card>

      {/* GRAPH 2 + 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Glucose Variability</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
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
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard 
          label="Average" 
          value={`${stats.avg.toFixed(1)} mg/dL`} 
          color="text-amber-600"
        />
        <SummaryCard 
          label="Minimum" 
          value={`${stats.min} mg/dL`} 
        />
        <SummaryCard 
          label="Maximum" 
          value={`${stats.max} mg/dL`} 
        />
      </div>

      {/* HEALTH RANGES INFO */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="pt-6">
          <h3 className="font-medium text-amber-900 mb-2">Blood Sugar Reference Ranges</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <p className="font-medium">Normal (Fasting)</p>
              <p className="text-amber-700">70-100 mg/dL</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium">Pre-Diabetes</p>
              <p className="text-amber-700">100-125 mg/dL</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium">Diabetes</p>
              <p className="text-red-600">≥126 mg/dL</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium">Post-Meal (2h)</p>
              <p className="text-amber-700">&lt;140 mg/dL</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RECENT */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Blood Sugar Records</CardTitle>
        </CardHeader>
        <CardContent>
          {recentVitals.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Time of Day</th>
                  <th className="p-3 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {recentVitals.map((v) => {
                  const date = new Date(v.recordedAt)
                  const hours = date.getHours()
                  let timeOfDay = 'Other'
                  
                  if (hours >= 5 && hours < 10) timeOfDay = 'Fasting'
                  else if (hours >= 10 && hours < 12) timeOfDay = 'Post-Breakfast'
                  else if (hours >= 12 && hours < 16) timeOfDay = 'Post-Lunch'
                  else if (hours >= 16 && hours < 20) timeOfDay = 'Post-Dinner'
                  else timeOfDay = 'Bedtime'
                  
                  return (
                    <tr key={v.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        {date.toLocaleString()}
                      </td>
                      <td className="p-3 font-medium">
                        {`${v.value} ${v.unit}`}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                          {timeOfDay}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {v.note || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No blood sugar records found. Add your first reading!
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

function SummaryCard({ 
  label, 
  value, 
  color = "text-slate-900" 
}: { 
  label: string; 
  value: string; 
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  )
}