// app/dashboard/vitals/components/AddVitalModal.tsx - Fix data formatting
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { addVital, VitalType } from "../utils/api-vitals"

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

export default function AddVitalModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const { toast } = useToast()
  const [type, setType] = useState<VitalType | null>(null)
  const [value, setValue] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [note, setNote] = useState("")
  const [dateTime, setDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [isLoading, setIsLoading] = useState(false)

  const config = VITALS.find((v) => v.type === type)

  const handleSave = async () => {
    if (!type || !config || !value) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Ensure proper ISO date format
      let recordedAt = new Date(dateTime).toISOString()
      
      // If datetime-local doesn't include timezone, assume local time
      if (dateTime.length === 16) { // YYYY-MM-DDTHH:MM format
        const localDate = new Date(dateTime)
        recordedAt = localDate.toISOString()
      }

      console.log('Sending vital data with recordedAt:', recordedAt)

      let vitalData: any = {
        type,
        recordedAt,
      };

      if (note.trim()) {
        vitalData.note = note.trim();
      }

      if (type === 'blood-pressure') {
        if (!diastolic) {
          throw new Error('Diastolic value is required for blood pressure');
        }
        // Convert to numbers
        vitalData.systolic = parseFloat(value);
        vitalData.diastolic = parseFloat(diastolic);
      } else {
        // Convert to number
        vitalData.value = parseFloat(value);
      }

      console.log('Vital data to send:', vitalData)

      await addVital(vitalData);

      toast({
        title: "Success",
        description: "Vital added successfully",
      });

      // Reset form
      setType(null);
      setValue("");
      setDiastolic("");
      setNote("");
      setDateTime(new Date().toISOString().slice(0, 16));

      // Close modal and refresh data
      onClose();
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Add vital error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add vital",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    setType(null);
    setValue("");
    setDiastolic("");
    setNote("");
    setDateTime(new Date().toISOString().slice(0, 16));
  }

  const handleClose = () => {
    resetForm();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vital</DialogTitle>
        </DialogHeader>

        {/* Vital Type Selection */}
        <div className="grid grid-cols-2 gap-3">
          {VITALS.map((v) => (
            <Button
              key={v.type}
              variant={type === v.type ? "default" : "outline"}
              onClick={() => setType(v.type)}
              className="justify-start"
              disabled={isLoading}
            >
              {v.label}
            </Button>
          ))}
        </div>

        {/* Dynamic Form */}
        {config && (
          <div className="space-y-4 pt-5">
            {/* Main value */}
            <div className="space-y-2">
              <Label>
                {config.label} ({config.unit}) *
              </Label>
              <Input
                type="number"
                step="0.1"
                placeholder={`Enter ${config.label.toLowerCase()}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Blood pressure diastolic */}
            {config.dual && (
              <div className="space-y-2">
                <Label>Diastolic ({config.unit}) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter diastolic value"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Note */}
            <div className="space-y-2">
              <Label>Note (Optional)</Label>
              <Textarea
                placeholder="Add any notes or context"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isLoading}
                rows={2}
              />
            </div>

            {/* Clinical hint */}
            <p className="text-xs text-muted-foreground">
              {config.hint} (For tracking only, not diagnosis)
            </p>

            {/* Date & time */}
            <div className="space-y-2">
              <Label>Date & Time *</Label>
              <Input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Vital"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}