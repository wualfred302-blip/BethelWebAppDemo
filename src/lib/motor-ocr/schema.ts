import { z } from 'zod';

export const motorDocumentTypeSchema = z.enum([
  'previous_policy',
  'or_cr',
  'sales_invoice',
  'unknown',
]);

export const extractedMotorFieldSchema = z.object({
  value: z.string().default(''),
  confidence: z.coerce.number().min(0).max(1).default(0.5),
  sourceLabel: z.string().optional(),
  sourceText: z.string().optional(),
});

export const motorOcrFieldsSchema = z.object({
  fullName: extractedMotorFieldSchema.optional(),
  address: extractedMotorFieldSchema.optional(),
  phone: extractedMotorFieldSchema.optional(),
  email: extractedMotorFieldSchema.optional(),
  plateNumber: extractedMotorFieldSchema.optional(),
  mvFileNumber: extractedMotorFieldSchema.optional(),
  make: extractedMotorFieldSchema.optional(),
  model: extractedMotorFieldSchema.optional(),
  yearModel: extractedMotorFieldSchema.optional(),
  bodyType: extractedMotorFieldSchema.optional(),
  color: extractedMotorFieldSchema.optional(),
  seatingCapacity: extractedMotorFieldSchema.optional(),
  vehicleUse: extractedMotorFieldSchema.optional(),
  chassisNumber: extractedMotorFieldSchema.optional(),
  engineNumber: extractedMotorFieldSchema.optional(),
  conductionSticker: extractedMotorFieldSchema.optional(),
  vehicleCondition: extractedMotorFieldSchema.optional(),
  estimatedMarketValue: extractedMotorFieldSchema.optional(),
  effectiveDate: extractedMotorFieldSchema.optional(),
  expiryDate: extractedMotorFieldSchema.optional(),
  coverageType: extractedMotorFieldSchema.optional(),
  actsOfNature: extractedMotorFieldSchema.optional(),
  thirdPartyPropertyDamageLimit: extractedMotorFieldSchema.optional(),
  autoPersonalAccident: extractedMotorFieldSchema.optional(),
  deductibleParticipation: extractedMotorFieldSchema.optional(),
  previousPolicyNumber: extractedMotorFieldSchema.optional(),
  previousInsurer: extractedMotorFieldSchema.optional(),
  previousPremium: extractedMotorFieldSchema.optional(),
});

export const motorDocumentOcrSchema = z.object({
  documentType: motorDocumentTypeSchema.default('unknown'),
  confidence: z.coerce.number().min(0).max(1).default(0.5),
  fields: motorOcrFieldsSchema.default({}),
  unmappedText: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export type ExtractedMotorField = z.infer<typeof extractedMotorFieldSchema>;
export type MotorDocumentOcrResult = z.infer<typeof motorDocumentOcrSchema>;
export type MotorOcrFieldKey = keyof z.infer<typeof motorOcrFieldsSchema>;
