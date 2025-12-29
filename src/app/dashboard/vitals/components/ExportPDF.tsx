// app/dashboard/vitals/components/ExportPDF.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ExportPDF({
  title,
  data,
}: {
  title: string
  data: any[]
}) {
  const { toast } = useToast()

  const handleExport = () => {
    // Basic CSV export for now
    if (data.length === 0) {
      toast({
        title: "No data",
        description: "There's no data to export",
        variant: "destructive",
      })
      return
    }

    const headers = ["Date", "Type", "Value", "Unit"]
    const csvRows = data.map((v) => [
      new Date(v.recordedAt).toLocaleString(),
      v.type,
      typeof v.value === "number" ? v.value : `${v.value.systolic}/${v.value.diastolic}`,
      v.unit,
    ])

    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()

    toast({
      title: "Exported",
      description: "Data exported successfully as CSV",
    })
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  )
}