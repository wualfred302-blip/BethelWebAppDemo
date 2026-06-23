import type { MotorDocumentOcrResult } from './motor-ocr/schema';
import type { MotorVehicleInfo } from '@/store/useApplicationStore';
import { calculateIndicativeMotorQuote } from './motor-rating';

export interface RenewalOffer {
  currentInsurer: string;
  currentPolicyNumber: string;
  currentTotal: number;
  bethelTotal: number;
  savings: number;
  savingsPercent: number;
  coverageLines: string[];
  vehicleSummary: string;
  vehicleInfo: Partial<MotorVehicleInfo>;
}

function parseMoney(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function calculateRenewalOffer(
  ocrResult: MotorDocumentOcrResult,
  vehicleInfo: Partial<MotorVehicleInfo>,
): RenewalOffer {
  const f = ocrResult.fields;

  const currentTotal = parseMoney(f.premiumTotal?.value)
    ?? parseMoney(f.previousPremium?.value)
    ?? 0;

  const currentSubtotal = parseMoney(f.premiumSubtotal?.value)
    ?? currentTotal;

  const coverageLines: string[] = [];
  const ct = f.coverageType?.value?.toLowerCase() || '';
  if (ct.includes('comprehensive') || ct.includes('compre')) {
    coverageLines.push('Compulsory Third Party Liability (CTPL)');
    coverageLines.push('Own Damage & Theft');
    if (f.hasActsOfNature?.value === 'true' || f.actsOfNature?.value?.toLowerCase().includes('include')) {
      coverageLines.push('Acts of Nature');
    }
    if (f.hasAutoPersonalAccident?.value === 'true' || f.autoPersonalAccident?.value?.toLowerCase().includes('include')) {
      coverageLines.push('Auto Personal Accident');
    }
    if (f.thirdPartyPropertyDamageLimit?.value) {
      coverageLines.push('Third Party Bodily Injury');
      coverageLines.push('Third Party Property Damage');
    }
    if (f.hasRoadsideAssistance?.value === 'true') {
      coverageLines.push('Roadside Assistance');
    }
  } else {
    coverageLines.push('Compulsory Third Party Liability (CTPL)');
  }

  const make = f.make?.value || '';
  const model = f.model?.value || '';
  const year = f.yearModel?.value || '';
  const vehicleSummary = [year, make, model].filter(Boolean).join(' ') || 'Unknown vehicle';

  const savingsPercent = 10;
  const bethelTotal = Math.round(currentSubtotal * (1 - savingsPercent / 100) * 100) / 100;

  return {
    currentInsurer: f.previousInsurer?.value || 'Current Insurer',
    currentPolicyNumber: f.previousPolicyNumber?.value || '',
    currentTotal,
    bethelTotal,
    savings: Math.round((currentTotal - bethelTotal) * 100) / 100,
    savingsPercent,
    coverageLines,
    vehicleSummary,
    vehicleInfo,
  };
}
