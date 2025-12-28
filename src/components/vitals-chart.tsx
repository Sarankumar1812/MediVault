"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { month: "Jan", bp: 118, sugar: 92, heart: 72 },
  { month: "Feb", bp: 122, sugar: 95, heart: 75 },
  { month: "Mar", bp: 120, sugar: 88, heart: 70 },
  { month: "Apr", bp: 125, sugar: 98, heart: 78 },
  { month: "May", bp: 119, sugar: 90, heart: 73 },
  { month: "Jun", bp: 120, sugar: 95, heart: 74 },
]

export function VitalsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Line
          type="monotone"
          dataKey="bp"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          name="Blood Pressure"
          dot={{ fill: "hsl(var(--chart-1))" }}
        />
        <Line
          type="monotone"
          dataKey="sugar"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          name="Blood Sugar"
          dot={{ fill: "hsl(var(--chart-2))" }}
        />
        <Line
          type="monotone"
          dataKey="heart"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          name="Heart Rate"
          dot={{ fill: "hsl(var(--chart-3))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
