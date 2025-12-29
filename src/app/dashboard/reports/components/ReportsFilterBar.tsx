// app/dashboard/reports/components/ReportsFilterBar.tsx - Updated
"use client"

import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useState, useEffect } from "react"

const REPORT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "blood_test", label: "Blood Test" },
  { value: "scan", label: "Scan" },
  { value: "prescription", label: "Prescription" },
  { value: "ecg", label: "ECG" },
  { value: "xray", label: "X-Ray" },
  { value: "mri", label: "MRI" },
  { value: "ct_scan", label: "CT Scan" },
  { value: "ultrasound", label: "Ultrasound" },
  { value: "discharge_summary", label: "Discharge Summary" },
  { value: "lab_report", label: "Lab Report" },
  { value: "doctor_notes", label: "Doctor Notes" },
  { value: "other", label: "Other" }
];

const VITAL_PARAMETERS = [
  { value: "all", label: "All Vitals" },
  { value: "blood_sugar", label: "Blood Sugar" },
  { value: "cholesterol", label: "Cholesterol" },
  { value: "bp", label: "Blood Pressure" },
  { value: "hemoglobin", label: "Hemoglobin" },
  { value: "wbc", label: "White Blood Cells" },
  { value: "rbc", label: "Red Blood Cells" },
  { value: "platelets", label: "Platelets" },
  { value: "creatinine", label: "Creatinine" },
  { value: "bilirubin", label: "Bilirubin" }
];

interface ReportsFilterBarProps {
  onFilter: (filters: {
    search: string;
    type: string;
    vital: string;
  }) => void;
}

export default function ReportsFilterBar({ onFilter }: ReportsFilterBarProps) {
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    vital: "all"
  })

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      onFilter(filters)
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [filters])

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, type: value }))
  }

  const handleVitalChange = (value: string) => {
    setFilters(prev => ({ ...prev, vital: value }))
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Input 
        placeholder="Search reports..." 
        className="max-w-xs"
        value={filters.search}
        onChange={(e) => handleSearchChange(e.target.value)}
      />

      <Select value={filters.type} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Report Type" />
        </SelectTrigger>
        <SelectContent>
          {REPORT_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.vital} onValueChange={handleVitalChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Vital Parameter" />
        </SelectTrigger>
        <SelectContent>
          {VITAL_PARAMETERS.map((vital) => (
            <SelectItem key={vital.value} value={vital.value}>
              {vital.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}