// app/dashboard/vitals/components/TimeFilter.tsx
"use client"

import { Button } from "@/components/ui/button"

const TIME_FILTERS = [
  { label: "24h", value: 1 },
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "3M", value: 90 },
  { label: "1Y", value: 365 },
]

export default function TimeFilter({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex gap-2">
      {TIME_FILTERS.map((filter) => (
        <Button
          key={filter.value}
          variant={value === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}