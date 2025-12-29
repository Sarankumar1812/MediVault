"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsFilterBar() {
  return (
    <div className="flex flex-wrap gap-3">
      <Input placeholder="Search reports..." className="max-w-xs" />

      <Select>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Report Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="blood">Blood Test</SelectItem>
          <SelectItem value="scan">Scan</SelectItem>
          <SelectItem value="prescription">Prescription</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Vital" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sugar">Blood Sugar</SelectItem>
          <SelectItem value="bp">Blood Pressure</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
