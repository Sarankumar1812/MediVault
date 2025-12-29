"use client"

import { LineChart, Line, ResponsiveContainer } from "recharts"

export default function MiniLineGraph({ data }: { data: number[] }) {
  const chartData = data.map((v, i) => ({ index: i, value: v }))

  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2fae8e"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
