import { z } from 'zod';

// ── Business Info Schema ────────────────────────────────────

export const businessInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name is required (2-100 characters)')
    .max(100, 'Full name is required (2-100 characters)'),
  natureOfBusiness: z
    .string()
    .min(1, 'Please select a nature of business'),
  businessName: z
    .string()
    .min(2, 'Business name is required (2-200 characters)')
    .max(200, 'Business name is required (2-200 characters)'),
  tin: z
    .string()
    .regex(
      /^\d{3}-\d{3}-\d{3}-\d{3}$/,
      'TIN must be in format 123-456-789-000'
    ),
  floorArea: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      'Floor area must be a valid number'
    ),
  effectiveDate: z
    .string()
    .min(1, 'Effective date is required'),
  streetAddress: z
    .string()
    .min(1, 'Street address is required'),
  phone: z
    .string()
    .regex(
      /^(\+63|09)\d{9}$/,
      'Enter a valid PH mobile number (e.g., 09123456789)'
    ),
  email: z
    .string()
    .email('Enter a valid email address'),
  buildingFloors: z
    .string()
    .regex(
      /^[1-9]\d*$/,
      'Building floors must be a positive whole number'
    )
    .refine(
      (val) => parseInt(val, 10) >= 1 && parseInt(val, 10) <= 50,
      'Building floors must be between 1 and 50'
    ),
  buildingType: z
    .string()
    .min(1, 'Please select a building type'),
  constructionType: z
    .string()
    .min(1, 'Please select a construction type'),
});

// ── Location Schema ─────────────────────────────────────────

export const locationSchema = z.object({
  regionCode: z.string().min(1, 'Please select a region'),
  regionName: z.string().min(1, 'Please select a region'),
  provinceCode: z.string().min(1, 'Please select a province'),
  provinceName: z.string().min(1, 'Please select a province'),
  cityCode: z.string().min(1, 'Please select a city/municipality'),
  cityName: z.string().min(1, 'Please select a city/municipality'),
  barangayCode: z.string().min(1, 'Please select a barangay'),
  barangayName: z.string().min(1, 'Please select a barangay'),
});

// ── Contact Schema ──────────────────────────────────────────

export const contactSchema = z.object({
  phone: z
    .string()
    .regex(
      /^(\+63|09)\d{9}$/,
      'Enter a valid PH mobile number (e.g., 09123456789)'
    ),
  email: z
    .string()
    .email('Enter a valid email address'),
});

// ── Type exports ────────────────────────────────────────────

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
