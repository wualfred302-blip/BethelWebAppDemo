import ratingTable from '@/data/motor/rating-table.json';
import { getVehicleEntry } from '@/data/motor/vehicle-catalog';
import { formatPHP } from '@/lib/pricing';
import type { MotorVehicleInfo } from '@/store/useApplicationStore';

export type MotorQuoteStatus =
  | 'quote_ready'
  | 'needs_review'
  | 'pending_assessment'
  | 'not_enough_data';

export type MotorRatingBucket =
  | 'private_car'
  | 'light_medium_truck'
  | 'heavy_truck_private_bus'
  | 'ac_tourist_car'
  | 'taxi_puj_mini_bus'
  | 'pub_tourist_bus'
  | 'motorcycle_tricycle_trailer';

export type MotorQuoteLineItemStatus = 'calculated' | 'selected' | 'missing' | 'referral';

export interface MotorQuoteLineItem {
  key: string;
  label: string;
  amountPHP?: number;
  ratePercent?: number;
  status: MotorQuoteLineItemStatus;
  notes?: string[];
  contributesToTotal?: boolean;
}

export interface MotorQuoteResult {
  status: MotorQuoteStatus;
  displayLabel: 'Indicative Quote' | 'Estimated Premium Range' | 'Pending Assessment';
  sumInsuredPHP?: number;
  lineItems: MotorQuoteLineItem[];
  estimatedGrossPremiumPHP?: number;
  estimatedSubtotalPremiumPHP?: number;
  estimatedPremiumRangePHP?: {
    min: number;
    max: number;
  };
  referralReasons: string[];
  missingFields: string[];
}

type VoluntaryThirdPartyLiabilityTableEntry = {
  limitPHP: number;
  premiumPHP: number;
};

type VoluntaryThirdPartyLiabilityTable = {
  vehicleClass: MotorRatingBucket;
  label: string;
  entries: VoluntaryThirdPartyLiabilityTableEntry[];
};

type VoluntaryThirdPartyLiabilityPremiums = {
  bodilyInjuryPremiumPHP: number | null;
  propertyDamagePremiumPHP: number | null;
};

type RatingTable = Omit<typeof ratingTable, 'voluntaryThirdPartyLiability'> & {
  voluntaryThirdPartyLiability?: {
    bodilyInjury?: {
      status?: string;
      note?: string;
      tables?: VoluntaryThirdPartyLiabilityTable[];
    };
    propertyDamage?: {
      status?: string;
      note?: string;
      tables?: VoluntaryThirdPartyLiabilityTable[];
    };
  };
};

const RATE = ratingTable as RatingTable;
const PASSENGER_BODY_TYPES = new Set(['Sedan', 'SUV', 'Van', 'Pickup', 'Hatchback']);
const MOTOR_TAX_RATES = {
  dst: 0.125,
  vat: 0.12,
  lgt: 0.005,
};

function cleanValue(value: string) {
  return String(value ?? '').trim();
}

function parseMoney(value: string) {
  const cleaned = cleanValue(value).replace(/[^0-9.]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function isPrivateVehicle(input: MotorVehicleInfo) {
  return cleanValue(input.vehicleUse).toLowerCase() === 'private';
}

function isCommercialVehicle(input: MotorVehicleInfo) {
  return cleanValue(input.vehicleUse).toLowerCase() === 'commercial';
}

function resolveCatalogRatingBucket(input: MotorVehicleInfo): MotorRatingBucket | null {
  const catalogEntry = getVehicleEntry(input.make, input.model, input.yearModel, input.variant);
  return catalogEntry?.ratingClass ?? null;
}

function resolveRatingBucket(input: MotorVehicleInfo): MotorRatingBucket | null {
  const bodyType = cleanValue(input.bodyType);
  const catalogBucket = resolveCatalogRatingBucket(input);

  if (bodyType && /motorcycle/i.test(bodyType)) return 'motorcycle_tricycle_trailer';
  if (bodyType && /bus/i.test(bodyType)) return 'heavy_truck_private_bus';

  if (catalogBucket) return catalogBucket;
  if (isPrivateVehicle(input)) return 'private_car';
  if (isCommercialVehicle(input)) return 'light_medium_truck';

  if (PASSENGER_BODY_TYPES.has(bodyType)) return 'private_car';
  return null;
}

function ctplPremiumForBucket(bucket: MotorRatingBucket | null) {
  if (!bucket) return null;
  const row = RATE.ctpl.find((entry) => entry.vehicleClass === bucket);
  return row?.oneYearTotalPremiumPHP ?? null;
}

function ownDamageRateForBucket(bucket: MotorRatingBucket | null) {
  if (!bucket) return RATE.privateCar.ownDamageAndTheft.ratePercent;
  if (bucket === 'private_car') return RATE.privateCar.ownDamageAndTheft.ratePercent;
  if (bucket === 'light_medium_truck') return RATE.commercialVehicles.ownDamageAndTheft[0].ratePercent;
  if (bucket === 'heavy_truck_private_bus') return RATE.commercialVehicles.ownDamageAndTheft[1].ratePercent;
  if (bucket === 'motorcycle_tricycle_trailer') return RATE.motorcycles.ownDamageAndTheft.ratePercent;
  if (bucket === 'ac_tourist_car') return RATE.landTransportationOperators.ownDamageAndTheft[0].ratePercent;
  if (bucket === 'taxi_puj_mini_bus') return RATE.landTransportationOperators.ownDamageAndTheft[1].ratePercent;
  if (bucket === 'pub_tourist_bus') return RATE.landTransportationOperators.ownDamageAndTheft[2].ratePercent;
  return RATE.privateCar.ownDamageAndTheft.ratePercent;
}

function buildMissingFields(input: MotorVehicleInfo, comprehensive: boolean) {
  const missing: string[] = [];

  if (!cleanValue(input.make)) missing.push('make');
  if (!cleanValue(input.model)) missing.push('model');
  if (!cleanValue(input.yearModel)) missing.push('yearModel');
  if (cleanValue(input.make) && cleanValue(input.model) && cleanValue(input.yearModel) && !getVehicleEntry(input.make, input.model, input.yearModel, input.variant)) {
    missing.push('variant');
  }
  if (!cleanValue(input.bodyType)) missing.push('bodyType');
  if (!cleanValue(input.vehicleUse)) missing.push('vehicleUse');
  if (!cleanValue(input.coverageType)) missing.push('coverageType');

  if (comprehensive) {
    if (!cleanValue(input.estimatedMarketValue)) missing.push('estimatedMarketValue');
    if (!cleanValue(input.vehicleCondition)) missing.push('vehicleCondition');
  }

  return Array.from(new Set(missing));
}

function buildQuoteLineItem(
  key: string,
  label: string,
  amountPHP: number | undefined,
  status: MotorQuoteLineItemStatus,
  ratePercent?: number,
  notes?: string[],
  contributesToTotal = true,
): MotorQuoteLineItem {
  return {
    key,
    label,
    amountPHP,
    ratePercent,
    status,
    notes,
    contributesToTotal,
  };
}

function ratingNoteForBucket(bucket: MotorRatingBucket | null) {
  if (!bucket) return 'Unable to map vehicle to a known CTPL tariff class.';
  const row = RATE.ctpl.find((entry) => entry.vehicleClass === bucket);
  return row ? row.label : 'Unable to map vehicle to a known CTPL tariff class.';
}

function lookupThirdPartyLiabilityPremiums(
  bucket: MotorRatingBucket | null,
  limitPHP: number | null,
): VoluntaryThirdPartyLiabilityPremiums | null {
  if (!bucket || !limitPHP) return null;

  const bodilyInjuryTables = RATE.voluntaryThirdPartyLiability?.bodilyInjury?.tables ?? [];
  const propertyDamageTables = RATE.voluntaryThirdPartyLiability?.propertyDamage?.tables ?? [];

  const bodilyInjuryTable = bodilyInjuryTables.find((entry) => entry.vehicleClass === bucket);
  const propertyDamageTable = propertyDamageTables.find((entry) => entry.vehicleClass === bucket);

  const bodilyInjuryPremiumPHP = bodilyInjuryTable?.entries.find((entry) => entry.limitPHP === limitPHP)?.premiumPHP ?? null;
  const propertyDamagePremiumPHP = propertyDamageTable?.entries.find((entry) => entry.limitPHP === limitPHP)?.premiumPHP ?? null;

  if (bodilyInjuryPremiumPHP === null && propertyDamagePremiumPHP === null) return null;
  return { bodilyInjuryPremiumPHP, propertyDamagePremiumPHP };
}

export function validateMotorQuoteInput(input: MotorVehicleInfo) {
  const comprehensive = cleanValue(input.coverageType) === 'Comprehensive';
  const ctplBucket = resolveRatingBucket(input);
  const missingFields = buildMissingFields(input, comprehensive);
  const referralReasons: string[] = [];

  if (cleanValue(input.vehicleUse) === 'Commercial') {
    referralReasons.push('Commercial vehicles are using a provisional tariff bucket and need underwriting review.');
  }

  if (comprehensive && cleanValue(input.autoPersonalAccident) === 'Included') {
    referralReasons.push('Auto Personal Accident is selected, but the Bethel rate is not yet installed.');
  }

  if (comprehensive && cleanValue(input.thirdPartyPropertyDamageLimit)) {
    const tppdLimit = parseMoney(input.thirdPartyPropertyDamageLimit);
    if (tppdLimit === null) {
      referralReasons.push('TPPD limit could not be parsed.');
    } else if (!lookupThirdPartyLiabilityPremiums(ctplBucket, tppdLimit)) {
      referralReasons.push('TPPD premium rate is not available for the selected vehicle class and limit.');
    }
  }
  return { missingFields, referralReasons };
}

function deductibleForSumInsured(sumInsured: number | null) {
  if (sumInsured === null || sumInsured <= 0) return 3000;
  return roundCurrency(Math.max(3000, sumInsured * 0.005));
}

function taxLineItems(subtotalPHP: number) {
  return [
    buildQuoteLineItem('dst', 'Documentary Stamp Tax (DST) 12.5%', roundCurrency(subtotalPHP * MOTOR_TAX_RATES.dst), 'calculated'),
    buildQuoteLineItem('vat', 'Value Added Tax (VAT) 12%', roundCurrency(subtotalPHP * MOTOR_TAX_RATES.vat), 'calculated'),
    buildQuoteLineItem('lgt', 'Local Government Tax (LGT) 0.5%', roundCurrency(subtotalPHP * MOTOR_TAX_RATES.lgt), 'calculated'),
  ];
}

export function calculateIndicativeMotorQuote(input: MotorVehicleInfo): MotorQuoteResult {
  const coverageType = cleanValue(input.coverageType);
  const comprehensive = coverageType === 'Comprehensive';
  const ctplBucket = resolveRatingBucket(input);
  const ctplPremium = ctplPremiumForBucket(ctplBucket);
  const { missingFields, referralReasons } = validateMotorQuoteInput(input);
  const lineItems: MotorQuoteLineItem[] = [];

  if (!coverageType) {
    return {
      status: 'not_enough_data',
      displayLabel: 'Pending Assessment',
      lineItems: [],
      referralReasons,
      missingFields,
    };
  }

  if (ctplPremium !== null) {
    lineItems.push(
      buildQuoteLineItem(
        'ctpl',
        `CTPL (${ratingNoteForBucket(ctplBucket)})`,
        ctplPremium,
        'calculated',
      ),
    );
  } else {
    lineItems.push(
      buildQuoteLineItem(
        'ctpl',
        'CTPL',
        undefined,
        'missing',
        undefined,
        ['Unable to map the vehicle to a CTPL premium row.'],
      ),
    );
    referralReasons.push('CTPL premium could not be mapped from the current vehicle details.');
  }

  const sumInsured = parseMoney(input.estimatedMarketValue);
  const deductibleParticipation = deductibleForSumInsured(sumInsured);

  if (comprehensive && (sumInsured === null || sumInsured <= 0) && !missingFields.includes('estimatedMarketValue')) {
    missingFields.push('estimatedMarketValue');
  }

  if (comprehensive && sumInsured !== null && sumInsured > 0) {
    const ownDamageRate = ownDamageRateForBucket(ctplBucket);
    const ownDamagePremium = roundCurrency((sumInsured * ownDamageRate) / 100);
    const actsOfNatureRate = RATE.actsOfNature.ratePercent;
    const actsOfNaturePremium = roundCurrency((sumInsured * actsOfNatureRate) / 100);

    lineItems.push(
      buildQuoteLineItem(
        'own_damage_theft',
        'Own Damage & Theft',
        ownDamagePremium,
        'calculated',
        ownDamageRate,
      ),
    );

    lineItems.push(
      buildQuoteLineItem(
        'acts_of_nature',
        'Acts of Nature',
        actsOfNaturePremium,
        'calculated',
        actsOfNatureRate,
      ),
    );
  }

  const tppdLimit = parseMoney(input.thirdPartyPropertyDamageLimit);
  if (comprehensive && tppdLimit !== null) {
    const tppdPremiums = lookupThirdPartyLiabilityPremiums(ctplBucket, tppdLimit);
    if (tppdPremiums) {
      const tppdNotes = [`${formatPHP(tppdLimit)} limit`];

      if (tppdPremiums.bodilyInjuryPremiumPHP !== null) {
        lineItems.push(
          buildQuoteLineItem(
            'third_party_bodily_injury',
            'Third Party Bodily Injury',
            tppdPremiums.bodilyInjuryPremiumPHP,
            'calculated',
            undefined,
            tppdNotes,
          ),
        );
      }

      if (tppdPremiums.propertyDamagePremiumPHP !== null) {
        lineItems.push(
          buildQuoteLineItem(
            'third_party_property_damage',
            'Third Party Property Damage',
            tppdPremiums.propertyDamagePremiumPHP,
            'calculated',
            undefined,
            tppdNotes,
          ),
        );
      }
    } else {
      lineItems.push(
        buildQuoteLineItem(
          'third_party_liability',
          'Third Party Liability',
          undefined,
          'referral',
          undefined,
          [`${formatPHP(tppdLimit)} limit`, 'Pending assessment.'],
          false,
        ),
      );
      referralReasons.push('TPPD premium rate is not available for the selected vehicle class and limit.');
    }
  }

  lineItems.push(
    buildQuoteLineItem(
      'deductible',
      'Deductible / Participation',
      deductibleParticipation,
      'calculated',
      undefined,
      ['Not charged upfront.'],
      false,
    ),
  );


  if (comprehensive && cleanValue(input.autoPersonalAccident) === 'Included') {
    lineItems.push(
      buildQuoteLineItem(
        'auto_personal_accident',
        'Auto Personal Accident',
        undefined,
        'referral',
        undefined,
        ['Rate not yet installed.'],
      ),
    );
  }

  if (cleanValue(input.roadsideAssistance) === 'Included') {
    lineItems.push(
      buildQuoteLineItem(
        'roadside_assistance',
        'Roadside Assistance',
        undefined,
        'selected',
        undefined,
        ['Selected'],
        false,
      ),
    );
  }

  const estimatedSubtotalPremiumPHP = roundCurrency(
    lineItems
      .filter((item) => item.contributesToTotal !== false && typeof item.amountPHP === 'number')
      .reduce((total, item) => total + (item.amountPHP ?? 0), 0),
  );
  lineItems.push(...taxLineItems(estimatedSubtotalPremiumPHP));

  const estimatedGrossPremiumPHP = roundCurrency(
    lineItems
      .filter((item) => item.contributesToTotal !== false && typeof item.amountPHP === 'number')
      .reduce((total, item) => total + (item.amountPHP ?? 0), 0),
  );

  const exactEnough =
    missingFields.length === 0 &&
    ctplPremium !== null &&
    (coverageType === 'CTPL Only' || (sumInsured !== null && sumInsured > 0)) &&
    isPrivateVehicle(input) &&
    PASSENGER_BODY_TYPES.has(cleanValue(input.bodyType));

  const status: MotorQuoteStatus = missingFields.length
    ? 'not_enough_data'
    : referralReasons.length
      ? 'needs_review'
      : exactEnough
        ? 'quote_ready'
        : 'pending_assessment';

  return {
    status,
    displayLabel: status === 'pending_assessment' || status === 'not_enough_data'
      ? 'Pending Assessment'
      : 'Indicative Quote',
    sumInsuredPHP: sumInsured ?? undefined,
    lineItems,
    estimatedGrossPremiumPHP,
    estimatedSubtotalPremiumPHP,
    referralReasons,
    missingFields,
  };
}

export function formatMotorQuoteSummary(result: MotorQuoteResult) {
  if (result.displayLabel === 'Pending Assessment' || !result.estimatedGrossPremiumPHP) {
    return {
      label: 'Pending Assessment',
      value: 'Pending Assessment',
      note: result.referralReasons[0] ?? 'Motor tariff review required.',
    };
  }

  return {
    label: result.displayLabel,
    value: formatPHP(result.estimatedGrossPremiumPHP),
    note:
      result.referralReasons[0] ??
      'Indicative only. Final premium remains subject to underwriting review.',
  };
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}
