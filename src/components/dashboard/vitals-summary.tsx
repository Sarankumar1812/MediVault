"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

export default function VitalsSummary() {
  const vitals = [
    { label: "Weight", value: "75 kg", unit: "Last: Jan 15" },
    { label: "Height", value: "180 cm", unit: "Constant" },
    { label: "Temperature", value: "37°C", unit: "Normal" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Quick Vitals
        </CardTitle>
        <CardDescription>Current health metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vitals.map((vital) => (
            <div key={vital.label} className="pb-4 border-b last:border-b-0">
              <p className="text-sm text-muted-foreground">{vital.label}</p>
              <p className="text-lg font-semibold">{vital.value}</p>
              <p className="text-xs text-muted-foreground">{vital.unit}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
