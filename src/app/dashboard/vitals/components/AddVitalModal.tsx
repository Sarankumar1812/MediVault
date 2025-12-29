"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  getVitals,
  saveVitals,
  VitalType,
  VitalEntry,
} from "../utils/vitals"

/* ----------------------------------
   Vital Config (TYPE SAFE)
----------------------------------- */
const VITALS: {
  type: VitalType
  label: string
  unit: string
  hint: string
  dual?: boolean
}[] = [
  {
    type: "heart-rate",
    label: "Heart Rate",
    unit: "bpm",
    hint: "Normal resting heart rate: 60–100 bpm",
  },
  {
    type: "blood-pressure",
    label: "Blood Pressure",
    unit: "mmHg",
    hint: "Normal blood pressure: ~120/80 mmHg",
    dual: true,
  },
  {
    type: "blood-sugar",
    label: "Blood Sugar",
    unit: "mg/dL",
    hint: "Fasting normal range: 70–100 mg/dL",
  },
  {
    type: "weight",
    label: "Weight",
    unit: "kg",
    hint: "Track consistently at the same time of day",
  },
  {
    type: "temperature",
    label: "Temperature",
    unit: "°C",
    hint: "Normal body temperature: ~36.5–37.5 °C",
  },
]

/* ----------------------------------
   Component
----------------------------------- */
export default function AddVitalModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [type, setType] = useState<VitalType | null>(null)
  const [value, setValue] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [dateTime, setDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  )

  const config = VITALS.find((v) => v.type === type)

  /* ----------------------------------
     Save Handler
  ----------------------------------- */
  const handleSave = () => {
    if (!type || !config || !value) return

    const vitals = getVitals()

    const entry: VitalEntry = {
      id: Date.now().toString(),
      type,
      unit: config.unit,
      recordedAt: new Date(dateTime).toISOString(),
      value:
        type === "blood-pressure"
          ? {
              systolic: Number(value),
              diastolic: Number(diastolic),
            }
          : Number(value),
    }

    vitals.unshift(entry)
    saveVitals(vitals)

    // Reset state
    setType(null)
    setValue("")
    setDiastolic("")
    setDateTime(new Date().toISOString().slice(0, 16))

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vital</DialogTitle>
        </DialogHeader>

        {/* ================= VITAL TYPE SELECTION ================= */}
        <div className="grid grid-cols-2 gap-3">
          {VITALS.map((v) => (
            <Button
              key={v.type}
              variant={type === v.type ? "default" : "outline"}
              onClick={() => setType(v.type)}
              className="justify-start"
            >
              {v.label}
            </Button>
          ))}
        </div>

        {/* ================= DYNAMIC FORM ================= */}
        {config && (
          <div className="space-y-4 pt-5">

            {/* Main value */}
            <div className="space-y-2">
              <Label>
                {config.label} ({config.unit})
              </Label>
              <Input
                type="number"
                placeholder={`Enter ${config.label.toLowerCase()}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            {/* Blood pressure diastolic */}
            {config.dual && (
              <div className="space-y-2">
                <Label>Diastolic ({config.unit})</Label>
                <Input
                  type="number"
                  placeholder="Enter diastolic value"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                />
              </div>
            )}

            {/* Clinical hint */}
            <p className="text-xs text-muted-foreground">
              {config.hint} (For tracking only, not diagnosis)
            </p>

            {/* Date & time */}
            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Vital
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
