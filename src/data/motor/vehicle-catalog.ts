import catalogData from './vehicle-catalog.json';
import {
  normalizeMotorKey,
  normalizeMotorMake,
  normalizeMotorModel,
  normalizeMotorVariant,
  normalizeMotorYearModel,
  parseMotorYear,
} from './normalization-aliases';

export type VehicleCatalogSourceConfidence =
  | 'official'
  | 'open_source'
  | 'manual_seed'
  | 'ocr_observed';

export type VehicleCatalogBodyType = 'Sedan' | 'SUV' | 'Van' | 'Pickup' | 'Hatchback' | 'Truck' | 'Motorcycle' | 'Other';

export type VehicleCatalogRatingClass =
  | 'private_car'
  | 'light_medium_truck'
  | 'heavy_truck_private_bus'
  | 'ac_tourist_car'
  | 'taxi_puj_mini_bus'
  | 'pub_tourist_bus'
  | 'motorcycle_tricycle_trailer';

export interface VehicleCatalogSeedEntry {
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  variant?: string;
  bodyType?: VehicleCatalogBodyType;
  seatingCapacity?: number;
  ratingClass?: VehicleCatalogRatingClass;
  source: string;
  sourceConfidence: VehicleCatalogSourceConfidence;
}

export interface VehicleCatalogSource {
  title: string;
  url?: string;
  license?: string;
  extractedAt: string;
  notes: string[];
}

export interface VehicleCatalogFile {
  source: VehicleCatalogSource;
  entries: VehicleCatalogSeedEntry[];
}

export interface VehicleCatalogEntry extends VehicleCatalogSeedEntry {
  variant: string;
  bodyType: VehicleCatalogBodyType;
  seatingCapacity: number;
  ratingClass: VehicleCatalogRatingClass;
}

export type VehicleCatalogMatch = {
  exact?: VehicleCatalogEntry;
  suggestions: VehicleCatalogEntry[];
  confidence: number;
};

type VehicleProfileOverride = {
  variants: string[];
  bodyType: VehicleCatalogBodyType;
  seatingCapacity: number;
  ratingClass: VehicleCatalogRatingClass;
  variantOverrides?: Record<string, Partial<Pick<VehicleProfileOverride, 'bodyType' | 'seatingCapacity' | 'ratingClass'>>>;
};

const vehicleCatalog = catalogData as VehicleCatalogFile;
const currentYear = new Date().getFullYear();
const DEFAULT_VARIANT = 'Standard';

const MODEL_PROFILE_OVERRIDES: Record<string, VehicleProfileOverride> = {
  [profileKey('Toyota', 'Vios')]: {
    variants: ['1.3 J MT', '1.3 E CVT', '1.5 G CVT'],
    bodyType: 'Sedan',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Toyota', 'Fortuner')]: {
    variants: ['2.4 G DSL AT', '2.8 V DSL AT'],
    bodyType: 'SUV',
    seatingCapacity: 7,
    ratingClass: 'private_car',
  },
  [profileKey('Toyota', 'Hilux')]: {
    variants: ['2.4 E DSL MT', '2.8 G DSL AT'],
    bodyType: 'Pickup',
    seatingCapacity: 5,
    ratingClass: 'light_medium_truck',
  },
  [profileKey('Toyota', 'Innova')]: {
    variants: ['2.8 E DSL AT', '2.8 V DSL AT'],
    bodyType: 'Van',
    seatingCapacity: 7,
    ratingClass: 'private_car',
  },
  [profileKey('Toyota', 'Corolla')]: {
    variants: ['1.6 E CVT', '1.8 V CVT'],
    bodyType: 'Sedan',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Honda', 'City')]: {
    variants: ['1.5 S CVT', '1.5 RS CVT'],
    bodyType: 'Sedan',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Honda', 'Civic')]: {
    variants: ['1.5 V Turbo CVT', '1.5 RS Turbo CVT'],
    bodyType: 'Sedan',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Honda', 'CR-V')]: {
    variants: ['1.5 V Turbo CVT', '2.0 S CVT'],
    bodyType: 'SUV',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Honda', 'Accord')]: {
    variants: ['1.5 V Turbo CVT', '2.0 VTEC Turbo'],
    bodyType: 'Sedan',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Mitsubishi', 'Mirage')]: {
    variants: ['GLX MT', 'GLX CVT', 'G4 GLX CVT'],
    bodyType: 'Hatchback',
    seatingCapacity: 5,
    ratingClass: 'private_car',
    variantOverrides: {
      [normalizeMotorVariant('G4 GLX CVT')]: {
        bodyType: 'Sedan',
      },
    },
  },
  [profileKey('Mitsubishi', 'Montero Sport')]: {
    variants: ['GLX 2WD', 'GT 4WD'],
    bodyType: 'SUV',
    seatingCapacity: 7,
    ratingClass: 'private_car',
  },
  [profileKey('Mitsubishi', 'Strada')]: {
    variants: ['2.4 GLX MT', '2.4 GLS AT'],
    bodyType: 'Pickup',
    seatingCapacity: 5,
    ratingClass: 'light_medium_truck',
  },
  [profileKey('Mitsubishi', 'Xpander')]: {
    variants: ['GLS CVT', 'Cross CVT'],
    bodyType: 'Van',
    seatingCapacity: 7,
    ratingClass: 'private_car',
  },
  [profileKey('Nissan', 'Navara')]: {
    variants: ['EL 4x2 MT', 'VL 4x4 AT'],
    bodyType: 'Pickup',
    seatingCapacity: 5,
    ratingClass: 'light_medium_truck',
  },
  [profileKey('Nissan', 'X-Trail')]: {
    variants: ['2.0 S CVT', '2.5 VL 4x4 CVT'],
    bodyType: 'SUV',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Isuzu', 'D-Max')]: {
    variants: ['RZ4E LS-A MT', 'RZ4E LS-E AT'],
    bodyType: 'Pickup',
    seatingCapacity: 5,
    ratingClass: 'light_medium_truck',
  },
  [profileKey('Isuzu', 'mu-X')]: {
    variants: ['LS-A 4x2 AT', 'LS-E 4x4 AT'],
    bodyType: 'SUV',
    seatingCapacity: 7,
    ratingClass: 'private_car',
  },
  [profileKey('Ford', 'Ranger')]: {
    variants: ['2.2 XLS 4x2 MT', '2.0 Wildtrak 4x4 AT'],
    bodyType: 'Pickup',
    seatingCapacity: 5,
    ratingClass: 'light_medium_truck',
  },
  [profileKey('Ford', 'Everest')]: {
    variants: ['2.0 Ambiente 4x2 AT', '2.0 Titanium 4x4 AT'],
    bodyType: 'SUV',
    seatingCapacity: 7,
    ratingClass: 'private_car',
  },
  [profileKey('Ford', 'Territory')]: {
    variants: ['Titanium', 'Titanium X'],
    bodyType: 'SUV',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Suzuki', 'Ertiga')]: {
    variants: ['GL MT', 'GLX AT'],
    bodyType: 'Van',
    seatingCapacity: 7,
    ratingClass: 'private_car',
  },
  [profileKey('Suzuki', 'APV')]: {
    variants: ['GA', 'GLX'],
    bodyType: 'Van',
    seatingCapacity: 8,
    ratingClass: 'private_car',
  },
  [profileKey('Suzuki', 'Jimny')]: {
    variants: ['GL MT', 'GLX AT'],
    bodyType: 'SUV',
    seatingCapacity: 4,
    ratingClass: 'private_car',
  },
  [profileKey('Kia', 'Picanto')]: {
    variants: ['1.0 LX MT', '1.2 EX AT'],
    bodyType: 'Hatchback',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Kia', 'Sportage')]: {
    variants: ['2.0 LX AT', '2.0 EX AT'],
    bodyType: 'SUV',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Hyundai', 'Creta')]: {
    variants: ['1.5 GL AT', '1.5 GLS AT'],
    bodyType: 'SUV',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Hyundai', 'Tucson')]: {
    variants: ['2.0 GL AT', '2.0 GLS AT'],
    bodyType: 'SUV',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Hyundai', 'Starex')]: {
    variants: ['GL', 'GRX'],
    bodyType: 'Van',
    seatingCapacity: 10,
    ratingClass: 'private_car',
  },
  [profileKey('Mazda', 'CX-5')]: {
    variants: ['2.0 Sport', '2.5 AWD'],
    bodyType: 'SUV',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Mazda', 'Mazda3')]: {
    variants: ['1.5 Sedan', '2.0 Sportback'],
    bodyType: 'Sedan',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Mazda', 'BT-50')]: {
    variants: ['4x2 MT', '4x4 AT'],
    bodyType: 'Pickup',
    seatingCapacity: 5,
    ratingClass: 'light_medium_truck',
  },
  [profileKey('Subaru', 'Forester')]: {
    variants: ['2.0i-L', '2.0i-S EyeSight'],
    bodyType: 'SUV',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Subaru', 'Outback')]: {
    variants: ['2.5i-Touring', '2.4 XT Touring'],
    bodyType: 'SUV',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Volkswagen', 'Polo')]: {
    variants: ['1.6 Trendline', '1.6 Comfortline'],
    bodyType: 'Hatchback',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Volkswagen', 'Golf')]: {
    variants: ['1.4 TSI', 'GTI'],
    bodyType: 'Hatchback',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
  [profileKey('Volkswagen', 'Tiguan')]: {
    variants: ['1.4 TSI', '2.0 TSI R-Line'],
    bodyType: 'SUV',
    seatingCapacity: 5,
    ratingClass: 'private_car',
  },
};

const groupedByMake = new Map<string, VehicleCatalogEntry[]>();
const groupedByMakeAndModel = new Map<string, VehicleCatalogEntry[]>();
const groupedByMakeModelYear = new Map<string, VehicleCatalogEntry[]>();
const groupedByMakeModelYearVariant = new Map<string, VehicleCatalogEntry>();
const displayMakes = new Map<string, string>();
const allEntries: VehicleCatalogEntry[] = [];

function profileKey(make: string, model: string) {
  return `${makeKey(make)}::${modelKey(model)}`;
}

function makeKey(make: string) {
  return normalizeMotorKey(normalizeMotorMake(make));
}

function modelKey(model: string) {
  return normalizeMotorKey(normalizeMotorModel(model));
}

function groupKey(make: string, model: string) {
  return `${makeKey(make)}::${modelKey(model)}`;
}

function makeModelYearKey(make: string, model: string, year: number) {
  return `${groupKey(make, model)}::${year}`;
}

function makeModelYearVariantKey(make: string, model: string, year: number, variant: string) {
  return `${makeModelYearKey(make, model, year)}::${normalizeMotorKey(variant)}`;
}

function clampYear(value: number) {
  return Math.max(1980, Math.min(value, currentYear + 1));
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function uniqueSortedNumbers(values: number[]) {
  return Array.from(new Set(values)).sort((a, b) => b - a);
}

function rangeYears(start: number, end: number) {
  const years: number[] = [];
  for (let year = end; year >= start; year -= 1) {
    years.push(year);
  }
  return years;
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previousRow: number[] = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const currentRow = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(
        previousRow[j] + 1,
        currentRow[j - 1] + 1,
        previousRow[j - 1] + cost,
      );
    }
    previousRow = currentRow;
  }
  return previousRow[b.length];
}

function similarityScore(a: string, b: string) {
  const left = normalizeMotorKey(a);
  const right = normalizeMotorKey(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.startsWith(right) || right.startsWith(left)) return 0.92;
  if (left.includes(right) || right.includes(left)) return 0.84;
  const distance = levenshtein(left, right);
  return Math.max(0, 1 - distance / Math.max(left.length, right.length));
}

function matchesAny(key: string, needles: string[]) {
  return needles.some((needle) => key.includes(needle));
}

function inferBodyType(make: string, model: string): VehicleCatalogBodyType {
  const key = normalizeMotorKey(`${make} ${model}`);

  if (matchesAny(key, ['MOTORCYCLE', 'TRICYCLE', 'TRIKE', 'SCOOTER'])) return 'Motorcycle';
  if (matchesAny(key, ['HILUX', 'NAVARA', 'RANGER', 'DMAX', 'BT50', 'STRADA', 'FRONTIER', 'TACOMA', 'COLORADO'])) {
    return 'Pickup';
  }
  if (matchesAny(key, ['HIACE', 'URVAN', 'STAREX', 'APV', 'ERTIGA', 'INNOVA', 'AVANZA', 'XPANDER', 'ODYSSEY', 'CARNIVAL', 'VELOZ', 'RUSH', 'CROSSWIND'])) {
    return 'Van';
  }
  if (matchesAny(key, ['FORTUNER', 'EVEREST', 'CRV', 'HRV', 'RAV4', 'XTRAIL', 'TERRITORY', 'TUCSON', 'SORENTO', 'SPORTAGE', 'SANTAFE', 'FORESTER', 'OUTBACK', 'TRAILBLAZER', 'CAPTIVA', 'MUX', 'PATHFINDER', 'MURANO', 'CX3', 'CX5', 'CX7', 'CX9', 'PILOT', 'CRETA', 'KICKS'])) {
    return 'SUV';
  }
  if (matchesAny(key, ['MIRAGEG4'])) return 'Sedan';
  if (matchesAny(key, ['MIRAGE', 'WIGO', 'CELERIO', 'SWIFT', 'PICANTO', 'POLO', 'BEETLE', 'YARIS', 'SPARK', 'FIESTA', 'RIO', 'ALMERA', 'VERSA', 'MAZDA2'])) {
    return 'Hatchback';
  }
  return 'Sedan';
}

function inferSeatingCapacity(bodyType: VehicleCatalogBodyType, make: string, model: string) {
  const key = normalizeMotorKey(`${make} ${model}`);
  if (matchesAny(key, ['HIACE', 'URVAN'])) return 12;
  if (matchesAny(key, ['STAREX'])) return 10;
  if (matchesAny(key, ['APV'])) return 8;
  if (matchesAny(key, ['CARNIVAL'])) return 7;
  if (matchesAny(key, ['INNOVA', 'AVANZA', 'ERTIGA', 'XPANDER', 'VELOZ', 'RUSH', 'CROSSWIND', 'ODYSSEY', 'PILOT'])) return 7;
  if (bodyType === 'SUV') return 5;
  if (bodyType === 'Van') return 7;
  if (bodyType === 'Pickup') return 5;
  if (bodyType === 'Truck') return 2;
  if (bodyType === 'Motorcycle') return 2;
  return 5;
}

function inferRatingClass(bodyType: VehicleCatalogBodyType): VehicleCatalogRatingClass {
  if (bodyType === 'Pickup' || bodyType === 'Truck') return 'light_medium_truck';
  if (bodyType === 'Motorcycle') return 'motorcycle_tricycle_trailer';
  return 'private_car';
}

function expandSeedEntry(entry: VehicleCatalogSeedEntry): VehicleCatalogEntry[] {
  const normalizedMake = normalizeMotorMake(entry.make);
  const normalizedModel = normalizeMotorModel(entry.model);
  const profile = MODEL_PROFILE_OVERRIDES[profileKey(normalizedMake, normalizedModel)];
  const variants = uniqueSorted(
    profile?.variants?.length ? profile.variants.map((variant) => normalizeMotorVariant(variant)) : [entry.variant ?? DEFAULT_VARIANT],
  );

  return variants.map((variant) => {
    const variantOverride = profile?.variantOverrides?.[variant];
    const bodyType = variantOverride?.bodyType ?? profile?.bodyType ?? entry.bodyType ?? inferBodyType(normalizedMake, normalizedModel);
    const seatingCapacity =
      variantOverride?.seatingCapacity ??
      profile?.seatingCapacity ??
      entry.seatingCapacity ??
      inferSeatingCapacity(bodyType, normalizedMake, normalizedModel);
    const ratingClass = variantOverride?.ratingClass ?? profile?.ratingClass ?? entry.ratingClass ?? inferRatingClass(bodyType);

    return {
      ...entry,
      make: normalizedMake,
      model: normalizedModel,
      yearStart: clampYear(entry.yearStart),
      yearEnd: clampYear(entry.yearEnd),
      variant: variant || DEFAULT_VARIANT,
      bodyType,
      seatingCapacity,
      ratingClass,
    };
  });
}

function allCandidatesForMake(make: string) {
  return groupedByMake.get(makeKey(make)) ?? [];
}

function candidatesForMakeModel(make: string, model: string) {
  return groupedByMakeAndModel.get(groupKey(make, model)) ?? [];
}

function candidatesForYear(make: string, model: string, year: number) {
  return groupedByMakeModelYear.get(makeModelYearKey(make, model, year)) ?? [];
}

function exactCandidate(make: string, model: string, year?: number | null, variant?: string | null) {
  const candidates = candidatesForMakeModel(make, model);
  if (!candidates.length) return undefined;

  const yearFiltered = year ? candidates.filter((entry) => year >= entry.yearStart && year <= entry.yearEnd) : candidates;
  if (!yearFiltered.length) return undefined;

  if (variant) {
    const normalizedVariant = normalizeMotorVariant(variant);
    const matchedVariant = yearFiltered.find((entry) => normalizeMotorKey(entry.variant) === normalizeMotorKey(normalizedVariant));
    if (matchedVariant) return matchedVariant;
  }

  if (yearFiltered.length === 1) return yearFiltered[0];
  return undefined;
}

function scoreEntry(
  entry: VehicleCatalogEntry,
  make: string,
  model: string,
  year?: number | null,
  variant?: string | null,
  bodyType?: string | null,
) {
  const makeScore = make ? similarityScore(entry.make, make) : 0;
  const modelScore = model ? similarityScore(entry.model, model) : 0;
  const variantScore = variant ? similarityScore(entry.variant, variant) : entry.variant === DEFAULT_VARIANT ? 0.08 : 0.04;
  const bodyTypeScore = bodyType ? similarityScore(entry.bodyType, bodyType) : 0.05;
  const yearScore = !year
    ? 0.08
    : year >= entry.yearStart && year <= entry.yearEnd
      ? 0.2
      : 0;

  return makeScore * 0.35 + modelScore * 0.3 + variantScore * 0.1 + bodyTypeScore * 0.1 + yearScore * 0.15;
}

function titleizeRatingClass(value: VehicleCatalogRatingClass) {
  switch (value) {
    case 'private_car':
      return 'Private Car';
    case 'light_medium_truck':
      return 'Light/Medium Truck';
    case 'heavy_truck_private_bus':
      return 'Heavy Truck / Private Bus';
    case 'ac_tourist_car':
      return 'AC / Tourist Car';
    case 'taxi_puj_mini_bus':
      return 'Taxi / PUJ / Mini Bus';
    case 'pub_tourist_bus':
      return 'PUB / Tourist Bus';
    case 'motorcycle_tricycle_trailer':
      return 'Motorcycle / Tricycle / Trailer';
    default:
      return value;
  }
}

for (const entry of vehicleCatalog.entries) {
  for (const resolved of expandSeedEntry(entry)) {
    allEntries.push(resolved);

    const makeBucket = groupedByMake.get(makeKey(resolved.make)) ?? [];
    makeBucket.push(resolved);
    groupedByMake.set(makeKey(resolved.make), makeBucket);

    const modelBucket = groupedByMakeAndModel.get(groupKey(resolved.make, resolved.model)) ?? [];
    modelBucket.push(resolved);
    groupedByMakeAndModel.set(groupKey(resolved.make, resolved.model), modelBucket);

    for (const year of rangeYears(resolved.yearStart, resolved.yearEnd)) {
      const yearBucket = groupedByMakeModelYear.get(makeModelYearKey(resolved.make, resolved.model, year)) ?? [];
      yearBucket.push(resolved);
      groupedByMakeModelYear.set(makeModelYearKey(resolved.make, resolved.model, year), yearBucket);
      groupedByMakeModelYearVariant.set(makeModelYearVariantKey(resolved.make, resolved.model, year, resolved.variant), resolved);
    }

    displayMakes.set(makeKey(resolved.make), resolved.make);
  }
}

export const VEHICLE_CATALOG_SOURCE = vehicleCatalog.source;
export const VEHICLE_CATALOG_ENTRIES = allEntries;

export function formatVehicleCatalogLabel(entry: VehicleCatalogEntry) {
  return [entry.make, entry.model, entry.variant && entry.variant !== DEFAULT_VARIANT ? entry.variant : '']
    .filter(Boolean)
    .join(' ');
}

export function formatVehicleRatingClassLabel(value: VehicleCatalogRatingClass) {
  return titleizeRatingClass(value);
}

export function getVehicleMakes() {
  return uniqueSorted(Array.from(displayMakes.values()));
}

export function getVehicleModels(make: string) {
  const bucket = allCandidatesForMake(make);
  return uniqueSorted(bucket.map((entry) => entry.model));
}

export function getVehicleYears(make: string, model: string) {
  const bucket = candidatesForMakeModel(make, model);
  if (bucket.length) {
    return uniqueSortedNumbers(bucket.flatMap((entry) => rangeYears(entry.yearStart, entry.yearEnd)));
  }

  const models = getVehicleModels(make);
  if (models.length && model) {
    const similarModel = models.find((candidate) => similarityScore(candidate, model) >= 0.7);
    if (similarModel) {
      const similarBucket = candidatesForMakeModel(make, similarModel);
      if (similarBucket.length) {
        return uniqueSortedNumbers(similarBucket.flatMap((entry) => rangeYears(entry.yearStart, entry.yearEnd)));
      }
    }
  }

  return uniqueSortedNumbers(rangeYears(2001, currentYear));
}

export function getVehicleVariants(make: string, model: string, year?: number | null) {
  const bucket = year ? candidatesForYear(make, model, year) : candidatesForMakeModel(make, model);
  if (!bucket.length) return [];
  return uniqueSorted(bucket.map((entry) => entry.variant));
}

export function getVehicleEntry(make: string, model: string, yearOrYearModel?: string | number | null, variant?: string | null) {
  const year =
    typeof yearOrYearModel === 'number'
      ? yearOrYearModel
      : yearOrYearModel
        ? parseMotorYear(normalizeMotorYearModel(String(yearOrYearModel)))
        : null;

  const exact = exactCandidate(make, model, year, variant);
  if (exact) return exact;

  if (year) {
    const yearBucket = candidatesForYear(make, model, year);
    if (yearBucket.length === 1) return yearBucket[0];
    if (variant) {
      const normalizedVariant = normalizeMotorVariant(variant);
      const variantMatch = yearBucket.find((entry) => normalizeMotorKey(entry.variant) === normalizeMotorKey(normalizedVariant));
      if (variantMatch) return variantMatch;
    }
    return undefined;
  }

  const bucket = candidatesForMakeModel(make, model);
  if (bucket.length === 1) return bucket[0];
  if (variant && bucket.length) {
    const normalizedVariant = normalizeMotorVariant(variant);
    const variantMatch = bucket.find((entry) => normalizeMotorKey(entry.variant) === normalizeMotorKey(normalizedVariant));
    if (variantMatch) return variantMatch;
  }
  return undefined;
}

export function matchVehicleFromOcr(input: {
  make?: string;
  model?: string;
  yearModel?: string;
  variant?: string;
  bodyType?: string;
}): VehicleCatalogMatch {
  const make = input.make ? normalizeMotorMake(input.make) : '';
  const model = input.model ? normalizeMotorModel(input.model) : '';
  const variant = input.variant ? normalizeMotorVariant(input.variant) : '';
  const bodyType = input.bodyType ? input.bodyType.trim() : '';
  const year = input.yearModel ? parseMotorYear(normalizeMotorYearModel(input.yearModel)) : null;

  const makeBucket = make ? allCandidatesForMake(make) : allEntries;
  const scored = makeBucket
    .map((entry) => ({
      entry,
      score: scoreEntry(entry, make, model, year, variant, bodyType),
    }))
    .sort((left, right) => right.score - left.score);

  const suggestions = scored
    .filter(({ score }) => score >= 0.45)
    .slice(0, 6)
    .map(({ entry }) => entry);

  const top = scored[0];
  const exact = exactCandidate(make, model, year, variant);

  return {
    exact: exact ?? (top && top.score >= 0.82 ? top.entry : undefined),
    suggestions,
    confidence: exact ? Math.min(1, top?.score ?? 1) : top?.score ?? (suggestions[0] ? 0.6 : 0),
  };
}
