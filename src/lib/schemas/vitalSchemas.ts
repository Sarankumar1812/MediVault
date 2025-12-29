// lib/schemas/vitalSchemas.ts
import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Vital Types                                                        */
/* ------------------------------------------------------------------ */

export const vitalTypes = [
  "heart-rate",
  "blood-pressure",
  "blood-sugar",
  "weight",
  "temperature",
] as const;

export type VitalType = (typeof vitalTypes)[number];

/* ------------------------------------------------------------------ */
/*  Base Schema                                                        */
/* ------------------------------------------------------------------ */

export const baseVitalSchema = z.object({
  type: z.enum(vitalTypes, {
    message: "Invalid vital type",
  }),

  recordedAt: z
    .string()
    .datetime({ message: "Invalid date format. Use ISO 8601 format" }),

  note: z
    .string()
    .max(500, "Note must be less than 500 characters")
    .optional(),
});

/* ------------------------------------------------------------------ */
/*  Heart Rate                                                         */
/* ------------------------------------------------------------------ */

export const heartRateSchema = baseVitalSchema.extend({
  type: z.literal("heart-rate"),

  value: z
    .number({ message: "Heart rate must be a number" })
    .min(30, "Heart rate must be at least 30 bpm")
    .max(250, "Heart rate cannot exceed 250 bpm"),
});

/* ------------------------------------------------------------------ */
/*  Blood Pressure                                                     */
/* ------------------------------------------------------------------ */

export const bloodPressureSchema = baseVitalSchema.extend({
  type: z.literal("blood-pressure"),

  systolic: z
    .number({ message: "Systolic must be a number" })
    .min(60, "Systolic must be at least 60 mmHg")
    .max(250, "Systolic cannot exceed 250 mmHg"),

  diastolic: z
    .number({ message: "Diastolic must be a number" })
    .min(30, "Diastolic must be at least 30 mmHg")
    .max(150, "Diastolic cannot exceed 150 mmHg"),
});

/* ------------------------------------------------------------------ */
/*  Blood Sugar                                                        */
/* ------------------------------------------------------------------ */

export const bloodSugarSchema = baseVitalSchema.extend({
  type: z.literal("blood-sugar"),

  value: z
    .number({ message: "Blood sugar must be a number" })
    .min(30, "Blood sugar must be at least 30 mg/dL")
    .max(500, "Blood sugar cannot exceed 500 mg/dL"),
});

/* ------------------------------------------------------------------ */
/*  Weight                                                             */
/* ------------------------------------------------------------------ */

export const weightSchema = baseVitalSchema.extend({
  type: z.literal("weight"),

  value: z
    .number({ message: "Weight must be a number" })
    .min(10, "Weight must be at least 10 kg")
    .max(300, "Weight cannot exceed 300 kg"),
});

/* ------------------------------------------------------------------ */
/*  Temperature                                                        */
/* ------------------------------------------------------------------ */

export const temperatureSchema = baseVitalSchema.extend({
  type: z.literal("temperature"),

  value: z
    .number({ message: "Temperature must be a number" })
    .min(30, "Temperature must be at least 30°C")
    .max(45, "Temperature cannot exceed 45°C"),
});

/* ------------------------------------------------------------------ */
/*  Discriminated Union                                                */
/* ------------------------------------------------------------------ */

export const vitalSchema = z.discriminatedUnion("type", [
  heartRateSchema,
  bloodPressureSchema,
  bloodSugarSchema,
  weightSchema,
  temperatureSchema,
]);

export type VitalData = z.infer<typeof vitalSchema>;
