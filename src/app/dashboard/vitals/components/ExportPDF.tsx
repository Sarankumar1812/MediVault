"use client"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Button } from "@/components/ui/button"
import { VitalEntry } from "../utils/vitals"

export default function ExportPDF({
  title,
  data,
}: {
  title: string
  data: VitalEntry[]
}) {
  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text(title, 20, 20)

    autoTable(doc, {
      startY: 30,
      head: [["Date", "Value"]],
      body: data.map((v) => [
        new Date(v.recordedAt).toLocaleString(),
        typeof v.value === "object"
          ? `${v.value.systolic}/${v.value.diastolic} ${v.unit}`
          : `${v.value} ${v.unit}`,
      ]),
    })

    doc.save(`${title}.pdf`)
  }

  return <Button onClick={exportPDF}>Export PDF</Button>
}
