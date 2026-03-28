import { z } from 'zod';

// ── OCR Extraction Schema ────────────────────────────────────
// Schema for extracting business permit fields from photos
// using Vercel AI SDK generateObject

export const businessPermitOcrSchema = z.object({
  tin: z
    .string()
    .regex(
      /^\d{3}-\d{3}-\d{3}-\d{3}$/,
      'TIN must be in format XXX-XXX-XXX-XXX'
    )
    .describe(
      'Tax Identification Number in format XXX-XXX-XXX-XXX (e.g., 123-456-789-000)'
    ),
  businessName: z
    .string()
    .min(1, 'Business name is required')
    .describe('The registered name of the business as shown on the permit'),
  fullName: z
    .string()
    .min(1, 'Owner full name is required')
    .describe('Full name of the business owner (e.g., JUAN DELA CRUZ)'),
  streetAddress: z
    .string()
    .min(1, 'Street address is required')
    .describe('Street address, building name, or unit number'),
  regionName: z
    .string()
    .min(1, 'Region is required')
    .describe('Philippine region name (e.g., NATIONAL CAPITAL REGION)'),
  provinceName: z
    .string()
    .min(1, 'Province is required')
    .describe('Province name (e.g., METRO MANILA)'),
  cityName: z
    .string()
    .min(1, 'City/Municipality is required')
    .describe('City or municipality name (e.g., MANILA)'),
  barangayName: z
    .string()
    .min(1, 'Barangay is required')
    .describe('Barangay name (e.g., SAN ANDRES)'),
  effectiveDate: z
    .string()
    .describe('Permit issue date or effective date in YYYY-MM-DD format (e.g., 2024-01-15). If no date is found, return empty string.'),
});

// ── Type exports ─────────────────────────────────────────────

export type BusinessPermitOcrData = z.infer<typeof businessPermitOcrSchema>;
