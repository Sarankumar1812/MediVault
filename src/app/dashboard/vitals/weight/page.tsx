// app/dashboard/vitals/weight/page.tsx
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

export default function WeightClient() {
  const { toast } = useToast()
  const [range, setRange] = useState<number>(30) // Default to 30 days for weight
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<VitalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    avg: 0,
    min: 0,
    max: 0,
    count: 0,
    change: 0,
    trend: 'stable' // 'up', 'down', 'stable'
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
      const vitals = await getVitals('weight')
      const filtered = filterByRange(vitals, range)
      setData(filtered)
      setRecentVitals(filtered.slice(0, 7))
      
      try {
        // Get stats from API
        const statsData = await getVitalStats('weight', range)
        const localStats = calculateStats(filtered)
        
        // Calculate weight change if we have at least 2 readings
        let change = 0
        let trend: 'up' | 'down' | 'stable' = 'stable'
        
        if (filtered.length >= 2) {
          const sortedByDate = [...filtered].sort((a, b) => 
            new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
          )
          const firstValue = sortedByDate[0].value as number
          const lastValue = sortedByDate[sortedByDate.length - 1].value as number
          change = parseFloat((lastValue - firstValue).toFixed(1))
          
          if (change > 0.5) trend = 'up'
          else if (change < -0.5) trend = 'down'
          else trend = 'stable'
        }
        
        setStats({
          ...localStats,
          change,
          trend
        })
      } catch (statsError) {
        // Fallback to local calculation if API fails
        const localStats = calculateStats(filtered)
        
        // Calculate weight change
        let change = 0
        let trend: 'up' | 'down' | 'stable' = 'stable'
        
        if (filtered.length >= 2) {
          const sortedByDate = [...filtered].sort((a, b) => 
            new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
          )
          const firstValue = sortedByDate[0].value as number
          const lastValue = sortedByDate[sortedByDate.length - 1].value as number
          change = parseFloat((lastValue - firstValue).toFixed(1))
          
          if (change > 0.5) trend = 'up'
          else if (change < -0.5) trend = 'down'
          else trend = 'stable'
        }
        
        setStats({
          ...localStats,
          change,
          trend
        })
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load weight data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Chart data
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return Array.from({ length: Math.min(7, Math.min(range, 30)) }).map((_, i) => ({
        date: `Day ${i + 1}`,
        value: 0,
      }))
    }

    return data
      .slice()
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
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
          {[1, 7, 30, 90, 365].map(i => (
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
          <h2 className="text-2xl font-semibold">Weight</h2>
          <p className="text-muted-foreground">
            Measured in kilograms (kg)
          </p>
        </div>

        <div className="flex gap-3">
          <ExportPDF title="Weight Report" data={data} />
          <Button onClick={() => setOpen(true)}>Add Weight</Button>
        </div>
      </div>

      {/* FILTER */}
      <TimeFilter value={range} onChange={setRange} />

      {/* GRAPH 1 */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
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
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No weight data available. Add your first reading!
            </div>
          )}
        </CardContent>
      </Card>

      {/* GRAPH 2 + 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Change</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#34d399" />
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
            <CardTitle>Weight Variation</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wtFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    fill="url(#wtFill)"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard 
          label="Average" 
          value={`${stats.avg.toFixed(1)} kg`} 
          color="text-emerald-600"
        />
        <SummaryCard 
          label="Minimum" 
          value={`${stats.min} kg`} 
        />
        <SummaryCard 
          label="Maximum" 
          value={`${stats.max} kg`} 
        />
        <SummaryCard 
          label="Change" 
          value={
            <div className={`font-semibold ${stats.change > 0 ? 'text-red-600' : stats.change < 0 ? 'text-blue-600' : 'text-slate-600'}`}>
              {stats.change > 0 ? '+' : ''}{stats.change} kg
              <span className="block text-xs font-normal mt-1">
                {stats.trend === 'up' ? '↗ Increasing' : 
                 stats.trend === 'down' ? '↘ Decreasing' : 
                 '→ Stable'}
              </span>
            </div>
          } 
        />
      </div>

      {/* BMI CALCULATOR INFO */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardContent className="pt-6">
          <h3 className="font-medium text-emerald-900 mb-2">Weight & Health Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <p className="font-medium">Healthy Weight Range*</p>
              <p className="text-emerald-700">BMI: 18.5 - 24.9</p>
              <p className="text-xs text-muted-foreground mt-1">*Based on standard BMI calculation</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium">Weekly Goal</p>
              <p className="text-emerald-700">±0.5 - 1 kg</p>
              <p className="text-xs text-muted-foreground mt-1">Safe weight change per week</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium">Measurement Tips</p>
              <p className="text-emerald-700">Same time, scale, clothing</p>
              <p className="text-xs text-muted-foreground mt-1">For consistent tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RECENT */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Weight Records</CardTitle>
        </CardHeader>
        <CardContent>
          {recentVitals.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Weight</th>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {recentVitals.map((v, index) => {
                  const date = new Date(v.recordedAt)
                  const isRecent = index === 0
                  
                  return (
                    <tr key={v.id} className={`border-b ${isRecent ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                      <td className="p-3">
                        {date.toLocaleString()}
                      </td>
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span>{`${v.value} ${v.unit}`}</span>
                          {isRecent && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                              Latest
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              No weight records found. Add your first reading!
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
  value: string | React.ReactNode; 
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`text-2xl font-semibold ${color}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}