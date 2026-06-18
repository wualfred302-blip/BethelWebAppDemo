const MOTOR_MAKE_ALIAS_ENTRIES: Array<[string, string]> = [
  ['TOYOTA', 'Toyota'],
  ['TOYOTAMOTORCORPORATION', 'Toyota'],
  ['HONDA', 'Honda'],
  ['HONDAMOTOR', 'Honda'],
  ['HONDAMOTORCO', 'Honda'],
  ['MITSUBISHI', 'Mitsubishi'],
  ['MITS', 'Mitsubishi'],
  ['MITSUBISHIMOTORS', 'Mitsubishi'],
  ['NISSAN', 'Nissan'],
  ['ISUZU', 'Isuzu'],
  ['SUZUKI', 'Suzuki'],
  ['HYUNDAI', 'Hyundai'],
  ['KIA', 'Kia'],
  ['FORD', 'Ford'],
  ['MAZDA', 'Mazda'],
  ['CHEVROLET', 'Chevrolet'],
  ['SUBARU', 'Subaru'],
  ['VOLKSWAGEN', 'Volkswagen'],
  ['BMW', 'BMW'],
  ['AUDI', 'Audi'],
  ['LEXUS', 'Lexus'],
  ['JEEP', 'Jeep'],
  ['GMC', 'GMC'],
  ['MINI', 'MINI'],
  ['MERCEDESBENZ', 'Mercedes-Benz'],
  ['MERCEDES', 'Mercedes-Benz'],
  ['MITSUBISHIFUSO', 'Mitsubishi Fuso'],
  ['HINO', 'Hino'],
  ['VOLVO', 'Volvo'],
  ['LANDROVER', 'Land Rover'],
];

const MOTOR_MODEL_ALIAS_ENTRIES: Array<[string, string]> = [
  ['CRV', 'CR-V'],
  ['HCRV', 'CR-V'],
  ['HONDACRV', 'CR-V'],
  ['HRV', 'HR-V'],
  ['HRV2', 'HR-V'],
  ['RAV4', 'RAV4'],
  ['FJCRUISER', 'FJ Cruiser'],
  ['LANDCRUISER', 'Land Cruiser'],
  ['XTRAIL', 'X-Trail'],
  ['OUTLANDERSPORT', 'Outlander Sport'],
  ['MONTEROSPORT', 'Montero Sport'],
  ['STRADA', 'Strada'],
  ['SPACESTAR', 'Space Star'],
  ['GRANDVITARA', 'Grand Vitara'],
  ['SANTAFE', 'Santa Fe'],
  ['STAREX', 'Starex'],
  ['VERACRUZ', 'Veracruz'],
  ['SORENTO', 'Sorento'],
  ['SEDONA', 'Sedona'],
  ['SPORTAGE', 'Sportage'],
  ['ECOSPORT', 'EcoSport'],
  ['CX3', 'CX-3'],
  ['CX5', 'CX-5'],
  ['CX7', 'CX-7'],
  ['CX9', 'CX-9'],
  ['BT50', 'BT-50'],
  ['MX5', 'MX-5'],
  ['MX5MIATA', 'MX-5 Miata'],
  ['MUX', 'mu-X'],
  ['DMAX', 'D-Max'],
  ['PICANTO', 'Picanto'],
  ['TERRITORY', 'Territory'],
  ['CRETA', 'Creta'],
  ['VELOSTER', 'Veloster'],
  ['RANGER', 'Ranger'],
  ['EVEREST', 'Everest'],
  ['NAVARA', 'Navara'],
  ['ALMERA', 'Almera'],
  ['VIOS', 'Vios'],
  ['MIRAGE', 'Mirage'],
  ['MIRAGEG4', 'Mirage'],
  ['XPANDER', 'Xpander'],
  ['CIVIC', 'Civic'],
  ['CITY', 'City'],
  ['ACCORD', 'Accord'],
  ['ODYSSEY', 'Odyssey'],
  ['PILOT', 'Pilot'],
  ['INSIGHT', 'Insight'],
  ['ALTIMA', 'Altima'],
  ['SENTRA', 'Sentra'],
  ['MAXIMA', 'Maxima'],
  ['PATHFINDER', 'Pathfinder'],
  ['MURANO', 'Murano'],
  ['RAV', 'RAV4'],
  ['GOLF', 'Golf'],
  ['JETTA', 'Jetta'],
  ['PASSAT', 'Passat'],
  ['POLO', 'Polo'],
  ['TIGUAN', 'Tiguan'],
  ['TOUAREG', 'Touareg'],
  ['BEETLE', 'Beetle'],
  ['FORESTER', 'Forester'],
  ['LEGACY', 'Legacy'],
  ['OUTBACK', 'Outback'],
  ['IMPREZA', 'Impreza'],
  ['WRX', 'WRX'],
  ['BRZ', 'BRZ'],
];

export function normalizeMotorKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toUpperCase();
}

function toTitleCaseWord(word: string) {
  if (!word) return word;
  if (/^[A-Z0-9-]+$/.test(word) && word.length <= 4) return word.toUpperCase();
  if (/^\d+$/.test(word)) return word;
  return `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`;
}

export function toMotorDisplayText(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((segment) =>
      segment
        .split('-')
        .map((part) => toTitleCaseWord(part))
        .join('-'),
    )
    .join(' ');
}

function resolveAlias(value: string, aliases: Array<[string, string]>) {
  const normalized = normalizeMotorKey(value);

  for (const [aliasKey, canonical] of aliases) {
    if (normalized === aliasKey || normalized.startsWith(aliasKey)) {
      return canonical;
    }
  }

  return null;
}

export function normalizeMotorMake(value: string) {
  const alias = resolveAlias(value, MOTOR_MAKE_ALIAS_ENTRIES);
  if (alias) return alias;
  return toMotorDisplayText(value);
}

export function normalizeMotorModel(value: string) {
  const alias = resolveAlias(value, MOTOR_MODEL_ALIAS_ENTRIES);
  if (alias) return alias;

  const normalized = normalizeMotorKey(value);
  for (const [makeKey] of MOTOR_MAKE_ALIAS_ENTRIES) {
    if (normalized.startsWith(makeKey)) {
      const remainder = normalized.slice(makeKey.length);
      const remainderAlias = resolveAlias(remainder, MOTOR_MODEL_ALIAS_ENTRIES);
      if (remainderAlias) return remainderAlias;
    }
  }

  return toMotorDisplayText(value);
}

export function parseMotorYear(value: string) {
  const match = value.match(/(19|20)\d{2}/);
  if (!match) return null;
  return Number(match[0]);
}

export function normalizeMotorYearModel(value: string) {
  const year = parseMotorYear(value);
  return year ? String(year) : value.trim();
}

export function normalizeMotorVariant(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export const MOTOR_OCR_NORMALIZATION_NOTES = {
  make: 'Make values are normalized to canonical display casing and common aliases.',
  model: 'Model values are normalized to canonical display casing and common aliases.',
  yearModel: 'Year model values are reduced to a four-digit year when visible.',
  variant: 'Variant values are trimmed and whitespace-normalized only, preserving trim codes and drivetrain markers.',
} as const;

export const MOTOR_MAKE_ALIASES = Object.fromEntries(MOTOR_MAKE_ALIAS_ENTRIES);
export const MOTOR_MODEL_ALIASES = Object.fromEntries(MOTOR_MODEL_ALIAS_ENTRIES);
