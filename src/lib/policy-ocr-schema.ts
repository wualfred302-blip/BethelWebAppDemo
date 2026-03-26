import { z } from 'zod';

// ── Policy OCR Extraction Schema ─────────────────────────────
// Schema for extracting CGL/liability policy fields from photos
// using Vercel AI SDK generateObject

export const policyOcrSchema = z.object({
  policyNumber: z
    .string()
    .describe('Policy number or certificate number'),
  expiryDate: z
    .string()
    .describe('Policy expiry date in YYYY-MM-DD format'),
  coverageLimit: z
    .string()
    .describe('Coverage limit amount (e.g., 1000000)'),
  priorInsurer: z
    .string()
    .describe('Name of previous/current insurer'),
  namedInsured: z
    .string()
    .describe('Name on the policy'),
  businessAddress: z
    .string()
    .describe('Business address from policy'),
});

// ── Type exports ─────────────────────────────────────────────

export type PolicyOcrData = z.infer<typeof policyOcrSchema>;
