export type VitalType =
  | "heart-rate"
  | "blood-pressure"
  | "blood-sugar"
  | "weight"
  | "temperature"

export interface VitalEntry {
  id: string
  type: VitalType
  value: number | { systolic: number; diastolic: number }
  unit: string
  recordedAt: string
}

export const getVitals = (): VitalEntry[] =>
  JSON.parse(localStorage.getItem("vitals") || "[]")

export const saveVitals = (data: VitalEntry[]) =>
  localStorage.setItem("vitals", JSON.stringify(data))
