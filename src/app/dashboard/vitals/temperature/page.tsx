// app/dashboard/vitals/temperature/page.tsx - Simplified fix
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

export default function TemperatureClient() {
  const { toast } = useToast()
  const [range, setRange] = useState<number>(7)
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<VitalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    avg: 0,
    min: 0,
    max: 0,
    count: 0,
    feverCount: 0,
    normalCount: 0
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
      const vitals = await getVitals('temperature')
      const filtered = filterByRange(vitals, range)
      setData(filtered)
      setRecentVitals(filtered.slice(0, 7))
      
      try {
        // Get stats from API
        const statsData = await getVitalStats('temperature', range)
        const localStats = calculateStats(filtered)
        
        // Calculate fever stats
        const feverCount = filtered.filter(v => {
          const value = v.value as number
          return value >= 37.5 // Fever threshold
        }).length
        
        const normalCount = filtered.filter(v => {
          const value = v.value as number
          return value >= 36.5 && value < 37.5 // Normal range
        }).length
        
        setStats({
          ...localStats,
          feverCount,
          normalCount
        })
      } catch (statsError) {
        // Fallback to local calculation if API fails
        const localStats = calculateStats(filtered)
        
        // Calculate fever stats
        const feverCount = filtered.filter(v => {
          const value = v.value as number
          return value >= 37.5 // Fever threshold
        }).length
        
        const normalCount = filtered.filter(v => {
          const value = v.value as number
          return value >= 36.5 && value < 37.5 // Normal range
        }).length
        
        setStats({
          ...localStats,
          feverCount,
          normalCount
        })
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load temperature data",
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

  // Color-coded chart data for bars
  const barChartData = useMemo(() => {
    if (data.length === 0) {
      return Array.from({ length: Math.min(7, range) }).map((_, i) => ({
        date: `Day ${i + 1}`,
        value: 0,
        fill: '#818cf8'
      }))
    }

    return data
      .slice()
      .reverse()
      .map((v) => {
        const value = v.value as number
        let fill = '#818cf8' // default normal
        if (value >= 37.5) fill = '#f87171' // fever
        else if (value < 36.5) fill = '#60a5fa' // low
        
        return {
          date: new Date(v.recordedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          value,
          fill
        }
      })
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
          <h2 className="text-2xl font-semibold">Body Temperature</h2>
          <p className="text-muted-foreground">
            Measured in degrees Celsius (°C)
          </p>
        </div>

        <div className="flex gap-3">
          <ExportPDF title="Temperature Report" data={data} />
          <Button onClick={() => setOpen(true)}>Add Temperature</Button>
        </div>
      </div>

      {/* FILTER */}
      <TimeFilter value={range} onChange={setRange} />

      {/* GRAPH 1 */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} °C`, 'Temperature']}
                  contentStyle={{ 
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    backgroundColor: 'white'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No temperature data available. Add your first reading!
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
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#818cf8" />
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
            <CardTitle>Temperature Variability</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="url(#tempFill)"
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

      {/* COLOR-CODED TEMPERATURE STATUS */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <p className="font-medium text-red-800">Fever Readings</p>
                <p className="text-2xl font-semibold text-red-700">{stats.feverCount}</p>
                <p className="text-sm text-red-600">≥37.5°C</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium text-green-800">Normal Readings</p>
                <p className="text-2xl font-semibold text-green-700">{stats.normalCount}</p>
                <p className="text-sm text-green-600">36.5-37.4°C</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="font-medium text-blue-800">Low Readings</p>
                <p className="text-2xl font-semibold text-blue-700">{stats.count - stats.feverCount - stats.normalCount}</p>
                <p className="text-sm text-blue-600">&lt;36.5°C</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard 
          label="Average" 
          value={`${stats.avg.toFixed(1)} °C`} 
          color="text-indigo-600"
        />
        <SummaryCard 
          label="Minimum" 
          value={`${stats.min} °C`} 
          color={stats.min < 36.5 ? "text-blue-600" : "text-slate-600"}
        />
        <SummaryCard 
          label="Maximum" 
          value={`${stats.max} °C`} 
          color={stats.max >= 37.5 ? "text-red-600" : "text-slate-600"}
        />
        <SummaryCard 
          label="Total Readings" 
          value={`${stats.count}`} 
        />
      </div>

      {/* TEMPERATURE REFERENCE CARD */}
      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardContent className="pt-6">
          <h3 className="font-medium text-indigo-900 mb-2">Temperature Reference Ranges</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="font-medium text-blue-800">Hypothermia</p>
              <p className="text-blue-700 font-semibold">&lt;35.0 °C</p>
              <p className="text-xs text-muted-foreground mt-1">Medical emergency</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium text-slate-800">Low Normal</p>
              <p className="text-slate-700 font-semibold">35.0 - 36.4 °C</p>
              <p className="text-xs text-muted-foreground mt-1">Below average</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="font-medium text-green-800">Normal</p>
              <p className="text-green-700 font-semibold">36.5 - 37.4 °C</p>
              <p className="text-xs text-muted-foreground mt-1">Healthy range</p>
            </div>
            <div className="bg-white p-3 rounded border border-red-200">
              <p className="font-medium text-red-800">Fever</p>
              <p className="text-red-700 font-semibold">≥37.5 °C</p>
              <p className="text-xs text-muted-foreground mt-1">Seek medical advice</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RECENT */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Temperature Records</CardTitle>
        </CardHeader>
        <CardContent>
          {recentVitals.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Temperature</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {recentVitals.map((v) => {
                  const value = v.value as number
                  let status = 'Normal'
                  let statusColor = 'bg-green-100 text-green-800'
                  
                  if (value >= 37.5) {
                    status = 'Fever'
                    statusColor = 'bg-red-100 text-red-800'
                  } else if (value < 36.5) {
                    status = 'Low'
                    statusColor = 'bg-blue-100 text-blue-800'
                  }
                  
                  return (
                    <tr key={v.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        {new Date(v.recordedAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-medium">
                        {`${value} ${v.unit}`}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
                          {status}
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
              No temperature records found. Add your first reading!
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