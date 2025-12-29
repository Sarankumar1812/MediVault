// src/lib/schemas/reportSchemas.ts
import { z } from "zod";

/* ======================================================
   ENUM DEFINITIONS (Zod v4 safe)
====================================================== */

export const ReportTypeEnum = z.enum([
  "blood_test",
  "scan",
  "prescription",
  "ecg",
  "xray",
  "mri",
  "ct_scan",
  "ultrasound",
  "discharge_summary",
  "lab_report",
  "doctor_notes",
  "other",
]);

export const PrivacyLevelEnum = z.enum([
  "private",
  "shared",
  "public_link",
]);

export const SharePermissionEnum = z.enum([
  "view",
  "edit",
  "admin",
]);

export const ShareRoleEnum = z.enum([
  "doctor",
  "family",
  "friend",
  "other",
]);

/* ======================================================
   UPLOAD REPORT SCHEMA
====================================================== */

export const uploadReportSchema = z.object({
  name: z
    .string()
    .min(1, "Report name is required")
    .max(200, "Report name must be less than 200 characters"),

  // Zod v4 required enum handling
  type: z
    .string()
    .min(1, "Report type is required")
    .pipe(ReportTypeEnum),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),

  doctorLab: z
    .string()
    .max(200, "Doctor/Lab name must be less than 200 characters")
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),

  privacyLevel: PrivacyLevelEnum.default("private"),
});

export type UploadReportData = z.infer<typeof uploadReportSchema>;

/* ======================================================
   SHARE REPORT SCHEMA
====================================================== */

export const shareReportSchema = z
  .object({
    reportId: z.number().positive("Invalid report ID"),

    permission: SharePermissionEnum.default("view"),

    role: ShareRoleEnum.optional().nullable(),

    expiresAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Expiration date must be in YYYY-MM-DD format")
      .optional()
      .nullable(),

    // Share with existing user
    userId: z.number().positive("Invalid user ID").optional(),

    // Share via email / link
    email: z.string().email("Invalid email format").optional(),

    generateLink: z.boolean().default(false),
  })
  .refine(
    (data) => data.userId !== undefined || data.email !== undefined,
    {
      message: "Either user ID or email must be provided",
      path: ["userId"],
    }
  );

export type ShareReportData = z.infer<typeof shareReportSchema>;

/* ======================================================
   UPDATE REPORT SCHEMA
====================================================== */

export const updateReportSchema = z.object({
  name: z
    .string()
    .min(1, "Report name is required")
    .max(200, "Report name must be less than 200 characters")
    .optional(),

  type: ReportTypeEnum.optional(),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),

  doctorLab: z
    .string()
    .max(200, "Doctor/Lab name must be less than 200 characters")
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),

  // AI / OCR extracted data (future reports intelligence)
  extractedData: z.unknown().optional(),
});

export type UpdateReportData = z.infer<typeof updateReportSchema>;
