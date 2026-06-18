import type { MotorVehicleInfo } from '@/store/useApplicationStore';
import type { ExtractedMotorField, MotorDocumentOcrResult, MotorOcrFieldKey } from './schema';

type MotorFormField = keyof MotorVehicleInfo;

type FieldMapping = {
  ocrKey: MotorOcrFieldKey;
  formKey: MotorFormField;
  label: string;
  normalize?: (value: string) => string;
};

export type AppliedMotorOcrField = {
  formKey: MotorFormField;
  label: string;
  value: string;
  confidence: number;
  sourceLabel?: string;
};

export type MotorOcrMappingResult = {
  values: Partial<MotorVehicleInfo>;
  appliedFields: AppliedMotorOcrField[];
  suggestions: AppliedMotorOcrField[];
  warnings: string[];
};

const moneyLikeFields = new Set<MotorOcrFieldKey>([
  'estimatedMarketValue',
  'thirdPartyPropertyDamageLimit',
  'deductibleParticipation',
]);

const clean = (value: string) => value.replace(/\s+/g, ' ').trim();

const money = (value: string) => {
  const digits = value.replace(/[^0-9.]/g, '');
  return digits ? digits : clean(value);
};

const normalizeDate = (value: string) => {
  const trimmed = clean(value);
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toISOString().split('T')[0];
};

const normalizeIncluded = (value: string) => {
  const trimmed = clean(value);
  if (/not included|excluded|no\b|none/i.test(trimmed)) return 'Not Included';
  if (/included|yes|with|aog|aon|acts of nature|acts of god/i.test(trimmed)) return 'Included';
  return trimmed;
};

const normalizeCoverageType = (value: string) => {
  const trimmed = clean(value);
  if (/comprehensive|own damage|theft/i.test(trimmed)) return 'Comprehensive';
  if (/ctpl|compulsory third party/i.test(trimmed)) return 'CTPL Only';
  return trimmed;
};

const normalizeVehicleUse = (value: string) => {
  const trimmed = clean(value);
  if (/commercial|for hire|taxi|tnvs|public/i.test(trimmed)) return 'Commercial';
  if (/private|personal/i.test(trimmed)) return 'Private';
  return trimmed;
};

const normalizeBodyType = (value: string) => {
  const trimmed = clean(value);
  if (/sport utility|suv/i.test(trimmed)) return 'SUV';
  if (/pick.?up|pickup/i.test(trimmed)) return 'Pickup';
  if (/hatch/i.test(trimmed)) return 'Hatchback';
  if (/van/i.test(trimmed)) return 'Van';
  if (/sedan|passenger car/i.test(trimmed)) return 'Sedan';
  return trimmed;
};

const normalizeCondition = (value: string) => {
  const trimmed = clean(value);
  if (/brand.?new|new/i.test(trimmed)) return 'Brand New';
  if (/used|second.?hand|pre.?owned/i.test(trimmed)) return 'Used';
  return trimmed;
};

export const MOTOR_OCR_FIELD_MAPPINGS: FieldMapping[] = [
  { ocrKey: 'fullName', formKey: 'fullName', label: 'Full Name' },
  { ocrKey: 'address', formKey: 'address', label: 'Address' },
  { ocrKey: 'phone', formKey: 'phone', label: 'Phone' },
  { ocrKey: 'email', formKey: 'email', label: 'Email' },
  { ocrKey: 'plateNumber', formKey: 'plateNumber', label: 'Plate Number' },
  { ocrKey: 'mvFileNumber', formKey: 'mvFileNumber', label: 'MV File Number' },
  { ocrKey: 'make', formKey: 'make', label: 'Make' },
  { ocrKey: 'model', formKey: 'model', label: 'Model' },
  { ocrKey: 'yearModel', formKey: 'yearModel', label: 'Year Model' },
  { ocrKey: 'bodyType', formKey: 'bodyType', label: 'Body Type', normalize: normalizeBodyType },
  { ocrKey: 'color', formKey: 'color', label: 'Color' },
  { ocrKey: 'seatingCapacity', formKey: 'seatingCapacity', label: 'Seating Capacity' },
  { ocrKey: 'vehicleUse', formKey: 'vehicleUse', label: 'Vehicle Use', normalize: normalizeVehicleUse },
  { ocrKey: 'chassisNumber', formKey: 'chassisNumber', label: 'Chassis Number' },
  { ocrKey: 'engineNumber', formKey: 'engineNumber', label: 'Engine Number' },
  { ocrKey: 'conductionSticker', formKey: 'conductionSticker', label: 'Conduction Sticker' },
  {
    ocrKey: 'vehicleCondition',
    formKey: 'vehicleCondition',
    label: 'Vehicle Condition',
    normalize: normalizeCondition,
  },
  {
    ocrKey: 'estimatedMarketValue',
    formKey: 'estimatedMarketValue',
    label: 'Estimated Market Value',
    normalize: money,
  },
  { ocrKey: 'effectiveDate', formKey: 'effectiveDate', label: 'Effective Date', normalize: normalizeDate },
  {
    ocrKey: 'coverageType',
    formKey: 'coverageType',
    label: 'Coverage Type',
    normalize: normalizeCoverageType,
  },
  {
    ocrKey: 'actsOfNature',
    formKey: 'actsOfNature',
    label: 'Acts of Nature',
    normalize: normalizeIncluded,
  },
  {
    ocrKey: 'thirdPartyPropertyDamageLimit',
    formKey: 'thirdPartyPropertyDamageLimit',
    label: 'TPPD Limit',
    normalize: money,
  },
  {
    ocrKey: 'autoPersonalAccident',
    formKey: 'autoPersonalAccident',
    label: 'Auto Personal Accident',
    normalize: normalizeIncluded,
  },
  {
    ocrKey: 'deductibleParticipation',
    formKey: 'deductibleParticipation',
    label: 'Deductible / Participation',
    normalize: money,
  },
];

function mappedValue(field: ExtractedMotorField, mapping: FieldMapping) {
  const value = mapping.normalize ? mapping.normalize(field.value) : clean(field.value);
  if (!value) return '';
  return moneyLikeFields.has(mapping.ocrKey) ? money(value) : value;
}

export function mapMotorOcrToVehicleInfo(
  result: MotorDocumentOcrResult,
  confidenceThreshold = 0.6,
): MotorOcrMappingResult {
  const values: Partial<MotorVehicleInfo> = {};
  const appliedFields: AppliedMotorOcrField[] = [];
  const suggestions: AppliedMotorOcrField[] = [];

  for (const mapping of MOTOR_OCR_FIELD_MAPPINGS) {
    const field = result.fields[mapping.ocrKey];
    if (!field) continue;

    const value = mappedValue(field, mapping);
    if (!value) continue;

    const mapped = {
      formKey: mapping.formKey,
      label: mapping.label,
      value,
      confidence: field.confidence,
      sourceLabel: field.sourceLabel,
    };

    if (field.confidence >= confidenceThreshold) {
      values[mapping.formKey] = value;
      appliedFields.push(mapped);
    } else {
      suggestions.push(mapped);
    }
  }

  return {
    values,
    appliedFields,
    suggestions,
    warnings: result.warnings,
  };
}
