// lib/schemas/vitalSchemas.ts
import { z } from 'zod';

// Define the enum values
const vitalTypes = ['heart-rate', 'blood-pressure', 'blood-sugar', 'weight', 'temperature'] as const;

// Create the enum type
export type VitalType = typeof vitalTypes[number];

// Helper function to validate date
const isValidDate = (dateString: string) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Create a reusable enum schema
const vitalTypeEnum = z.enum(vitalTypes);

export const baseVitalSchema = z.object({
  type: vitalTypeEnum,
  recordedAt: z.string()
    .refine((val) => isValidDate(val), {
      message: "Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss)"
    }),
  note: z.string().max(500, 'Note must be less than 500 characters').optional().default('')
});

export const heartRateSchema = baseVitalSchema.extend({
  type: z.literal('heart-rate'),
  value: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val))
  ])
    .refine((val) => !isNaN(val), { message: "Heart rate must be a valid number" })
    .refine((val) => val >= 30, { message: "Heart rate must be at least 30 bpm" })
    .refine((val) => val <= 250, { message: "Heart rate cannot exceed 250 bpm" })
});

export const bloodPressureSchema = baseVitalSchema.extend({
  type: z.literal('blood-pressure'),
  systolic: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val))
  ])
    .refine((val) => !isNaN(val), { message: "Systolic must be a valid number" })
    .refine((val) => val >= 60, { message: "Systolic must be at least 60 mmHg" })
    .refine((val) => val <= 250, { message: "Systolic cannot exceed 250 mmHg" }),
  diastolic: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val))
  ])
    .refine((val) => !isNaN(val), { message: "Diastolic must be a valid number" })
    .refine((val) => val >= 30, { message: "Diastolic must be at least 30 mmHg" })
    .refine((val) => val <= 150, { message: "Diastolic cannot exceed 150 mmHg" })
});

export const bloodSugarSchema = baseVitalSchema.extend({
  type: z.literal('blood-sugar'),
  value: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val))
  ])
    .refine((val) => !isNaN(val), { message: "Blood sugar must be a valid number" })
    .refine((val) => val >= 30, { message: "Blood sugar must be at least 30 mg/dL" })
    .refine((val) => val <= 500, { message: "Blood sugar cannot exceed 500 mg/dL" })
});

export const weightSchema = baseVitalSchema.extend({
  type: z.literal('weight'),
  value: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val))
  ])
    .refine((val) => !isNaN(val), { message: "Weight must be a valid number" })
    .refine((val) => val >= 10, { message: "Weight must be at least 10 kg" })
    .refine((val) => val <= 300, { message: "Weight cannot exceed 300 kg" })
});

export const temperatureSchema = baseVitalSchema.extend({
  type: z.literal('temperature'),
  value: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val))
  ])
    .refine((val) => !isNaN(val), { message: "Temperature must be a valid number" })
    .refine((val) => val >= 0, { message: "Temperature must be at least 0°C" })
    .refine((val) => val <= 110, { message: "Temperature cannot exceed 110°C" })
});

export const vitalSchema = z.discriminatedUnion('type', [
  heartRateSchema,
  bloodPressureSchema,
  bloodSugarSchema,
  weightSchema,
  temperatureSchema
]);

export type VitalData = z.infer<typeof vitalSchema>;