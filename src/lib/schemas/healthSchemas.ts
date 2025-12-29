// lib/schemas/healthSchemas.ts - Simple version
import { z } from 'zod';

export const healthProfileSchema = z.object({
  height: z
    .number()
    .min(50, 'Height must be at least 50cm')
    .max(300, 'Height cannot exceed 300cm')
    .positive('Height must be a positive number'),

  weight: z
    .number()
    .min(10, 'Weight must be at least 10kg')
    .max(300, 'Weight cannot exceed 300kg')
    .positive('Weight must be a positive number'),

  bloodGroup: z.string().min(1, 'Blood group is required'),

  conditions: z.string().max(500, 'Conditions must be less than 500 characters').default(''),

  allergies: z.string().max(500, 'Allergies must be less than 500 characters').default(''),

  chronicIllnesses: z.string().max(500, 'Chronic illnesses must be less than 500 characters').default(''),

  emergencyContactName: z
    .string()
    .min(2, 'Emergency contact name must be at least 2 characters')
    .max(100, 'Emergency contact name must be less than 100 characters')
    .trim(),

  emergencyContactPhone: z
    .string()
    .min(10, 'Emergency contact phone must be at least 10 digits')
    .max(15, 'Emergency contact phone must be less than 15 digits')
    .regex(/^[\d\s+\-()]*$/, 'Phone number can only contain numbers, spaces, and + - ( )')
    .transform(val => val.replace(/\s+/g, ' ').trim())
});

export type HealthProfileData = z.infer<typeof healthProfileSchema>;