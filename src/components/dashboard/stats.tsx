"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Heart, Droplets, Zap } from "lucide-react"

export default function DashboardStats() {
  const stats = [
    {
      title: "Heart Rate",
      value: "72 bpm",
      status: "Normal",
      icon: Heart,
      color: "text-red-500",
    },
    {
      title: "Blood Pressure",
      value: "120/80",
      status: "Normal",
      icon: Droplets,
      color: "text-blue-500",
    },
    {
      title: "Blood Sugar",
      value: "95 mg/dL",
      status: "Normal",
      icon: Zap,
      color: "text-yellow-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-2">{stat.status}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
