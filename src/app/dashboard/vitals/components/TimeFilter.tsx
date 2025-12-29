"use client"

import { Button } from "@/components/ui/button"

const ranges = [
  { label: "24H", value: 1 },
  { label: "7D", value: 7 },
  { label: "1M", value: 30 },
  { label: "1Y", value: 365 },
]

export default function TimeFilter({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex gap-2">
      {ranges.map((r) => (
        <Button
          key={r.value}
          size="sm"
          variant={value === r.value ? "default" : "outline"}
          onClick={() => onChange(r.value)}
        >
          {r.label}
        </Button>
      ))}
    </div>
  )
}
