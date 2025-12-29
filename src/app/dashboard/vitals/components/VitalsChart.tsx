"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { VitalEntry } from "../utils/vitals"

export default function VitalsChart({
  data,
  dual = false,
}: {
  data: VitalEntry[]
  dual?: boolean
}) {
  const chartData = data
    .slice()
    .reverse()
    .map((v) =>
      dual
        ? {
            date: new Date(v.recordedAt).toLocaleDateString(),
            systolic: (v.value as any).systolic,
            diastolic: (v.value as any).diastolic,
          }
        : {
            date: new Date(v.recordedAt).toLocaleDateString(),
            value: v.value as number,
          }
    )

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        {dual ? (
          <>
            <Line dataKey="systolic" stroke="#ef4444" strokeWidth={2} />
            <Line dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} />
          </>
        ) : (
          <Line dataKey="value" stroke="#2fae8e" strokeWidth={2} />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
