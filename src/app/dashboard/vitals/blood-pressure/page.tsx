// app/dashboard/vitals/blood-pressure/page.tsx
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

export default function BloodPressureClient() {
  const { toast } = useToast()
  const [range, setRange] = useState<number>(7)
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<VitalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    avgSystolic: 0,
    avgDiastolic: 0,
    minSystolic: 0,
    maxSystolic: 0,
    minDiastolic: 0,
    maxDiastolic: 0,
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
      const vitals = await getVitals('blood-pressure')
      const filtered = filterByRange(vitals, range)
      setData(filtered)
      setRecentVitals(filtered.slice(0, 7))
      
      // Calculate stats locally for BP
      if (filtered.length > 0) {
        const systolicValues = filtered.map(v => 
          typeof v.value === 'object' ? v.value.systolic : 0
        )
        const diastolicValues = filtered.map(v => 
          typeof v.value === 'object' ? v.value.diastolic : 0
        )
        
        const avgSystolic = systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length
        const avgDiastolic = diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length
        const minSystolic = Math.min(...systolicValues)
        const maxSystolic = Math.max(...systolicValues)
        const minDiastolic = Math.min(...diastolicValues)
        const maxDiastolic = Math.max(...diastolicValues)
        
        setStats({
          avgSystolic: parseFloat(avgSystolic.toFixed(1)),
          avgDiastolic: parseFloat(avgDiastolic.toFixed(1)),
          minSystolic,
          maxSystolic,
          minDiastolic,
          maxDiastolic,
          count: filtered.length
        })
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load blood pressure data",
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
        systolic: 0,
        diastolic: 0,
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
        systolic: typeof v.value === 'object' ? v.value.systolic : 0,
        diastolic: typeof v.value === 'object' ? v.value.diastolic : 0,
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
          <h2 className="text-2xl font-semibold">Blood Pressure</h2>
          <p className="text-muted-foreground">
            Systolic / Diastolic pressure (mmHg)
          </p>
        </div>

        <div className="flex gap-3">
          <ExportPDF title="Blood Pressure Report" data={data} />
          <Button onClick={() => setOpen(true)}>Add Blood Pressure</Button>
        </div>
      </div>

      {/* FILTER */}
      <TimeFilter value={range} onChange={setRange} />

      {/* GRAPH 1 */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Pressure Trend</CardTitle>
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
                  dataKey="systolic"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Systolic"
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Diastolic"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No blood pressure data available. Add your first reading!
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
                  <Bar dataKey="systolic" fill="#f87171" name="Systolic" />
                  <Bar dataKey="diastolic" fill="#60a5fa" name="Diastolic" />
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
            <CardTitle>Pressure Variability</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sysFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="diaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="systolic"
                    stroke="#ef4444"
                    fill="url(#sysFill)"
                    name="Systolic"
                  />
                  <Area
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#3b82f6"
                    fill="url(#diaFill)"
                    name="Diastolic"
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
          label="Average Systolic" 
          value={`${stats.avgSystolic.toFixed(1)} mmHg`} 
          color="text-red-600"
        />
        <SummaryCard 
          label="Average Diastolic" 
          value={`${stats.avgDiastolic.toFixed(1)} mmHg`} 
          color="text-blue-600"
        />
        <SummaryCard 
          label="Total Readings" 
          value={`${stats.count}`} 
        />
      </div>

      {/* RECENT */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Blood Pressure Records</CardTitle>
        </CardHeader>
        <CardContent>
          {recentVitals.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Reading</th>
                  <th className="p-3 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {recentVitals.map((v) => (
                  <tr key={v.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      {new Date(v.recordedAt).toLocaleString()}
                    </td>
                    <td className="p-3 font-medium">
                      {typeof v.value === "object"
                        ? `${v.value.systolic}/${v.value.diastolic} ${v.unit}`
                        : "—"}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {v.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No blood pressure records found. Add your first reading!
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