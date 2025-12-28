// lib/schemas/authSchemas.ts - UPDATED
import { z } from 'zod';

// OTP verification schema - FIXED
export const otpVerificationSchema = z.object({
  contact: z.string().min(1, 'Contact information is required'),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
  registrationId: z.union([
    z.string(),  // Accept string
    z.number(),  // Also accept number
    z.undefined() // Or undefined
  ]).optional()
  .transform(val => val ? String(val) : undefined) // Convert number to string
});

// Registration validation schema
export const registrationSchema = z.object({
  contact: z.string().min(1, 'Contact information is required'),
  method: z.enum(['email', 'phone', 'whatsapp']).default('email')
});

// Password validation schema
export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Basic profile validation schema
export const basicProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
});

// Full profile validation schema
export const fullProfileSchema = basicProfileSchema.extend({
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9+\-\s()]*$/, 'Phone number can only contain numbers, spaces, and + - ( )')
    .optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
    .optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the privacy policy'
  })
});

// Login validation schema
export const loginSchema = z.object({
  contact: z.string().min(1, 'Contact information is required'),
  password: z.string().min(1, 'Password is required').optional(),
  method: z.enum(['password', 'otp']).default('password')
});

// Contact method validation schema
export const contactMethodSchema = z.object({
  contact: z.string().min(1, 'Contact information is required')
});