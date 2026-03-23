/**
 * PSGC Data Utilities
 * Functions for loading and filtering Philippine Standard Geographic Code data.
 * Works directly with the nested JSON structure from philippine_full.json.
 */

export interface SelectOption {
  value: string;
  label: string;
}

// ── Types for nested JSON structure ─────────────────────────

interface RegionData {
  region_name: string;
  province_list: {
    [provinceName: string]: {
      municipality_list: {
        [municipalityName: string]: {
          barangay_list: string[];
        };
      };
    };
  };
}

interface PSGCData {
  [regionCode: string]: RegionData;
}

// ── Load ────────────────────────────────────────────────────

let cachedData: PSGCData | null = null;

/**
 * Load PSGC data from /philippine_full.json.
 * Caches the result for subsequent calls.
 */
export async function loadPSGCData(): Promise<PSGCData> {
  if (cachedData) return cachedData;

  const response = await fetch('/philippine_full.json');
  if (!response.ok) {
    throw new Error('Failed to load PSGC data');
  }
  cachedData = await response.json();
  return cachedData!;
}

// ── Title case helper ──────────────────────────────────────

/** Articles/prepositions that stay lowercase (except at start of string) */
const LOWER_WORDS = new Set(['of', 'de', 'del', 'ng', 'and', 'the', 'sa']);

/**
 * Convert ALL CAPS to Title Case.
 * Keeps acronyms (3+ uppercase letters with no vowels) uppercase.
 */
function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .replace(/\b(\w+)\b/g, (word, _, offset) => {
      if (offset === 0) return word.charAt(0).toUpperCase() + word.slice(1);
      if (LOWER_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
}

// ── Region name mapping ────────────────────────────────────

const REGION_NAMES: Record<string, string> = {
  '01': 'Ilocos Region',
  '02': 'Cagayan Valley',
  '03': 'Central Luzon',
  '05': 'Bicol Region',
  '06': 'Western Visayas',
  '07': 'Central Visayas',
  '08': 'Eastern Visayas',
  '09': 'Zamboanga Peninsula',
  '10': 'Northern Mindanao',
  '11': 'Davao Region',
  '12': 'SOCCSKSARGEN',
  '13': 'Caraga',
  '4A': 'CALABARZON',
  '4B': 'MIMAROPA',
  'NCR': 'National Capital Region',
  'CAR': 'Cordillera Administrative Region',
  'BARMM': 'Bangsamoro',
};

// ── Region ──────────────────────────────────────────────────

/**
 * Get all unique regions as SelectOptions with proper names, sorted alphabetically.
 */
export function getRegions(data: PSGCData): SelectOption[] {
  return Object.entries(data)
    .map(([code]) => ({
      value: code,
      label: REGION_NAMES[code] || data[code].region_name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// ── Province ────────────────────────────────────────────────

/**
 * Get provinces for a given region, sorted alphabetically.
 * Returns [] if regionCode is empty.
 */
export function getProvinces(data: PSGCData, regionCode: string): SelectOption[] {
  if (!regionCode) return [];

  const region = data[regionCode];
  if (!region) return [];

  return Object.keys(region.province_list)
    .map((name) => ({ value: name, label: toTitleCase(name) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// ── City / Municipality ─────────────────────────────────────

/**
 * Get cities/municipalities for a given region and province, sorted alphabetically.
 * Returns [] if any parent is empty.
 */
export function getCities(
  data: PSGCData,
  regionCode: string,
  provinceName: string
): SelectOption[] {
  if (!regionCode || !provinceName) return [];

  const region = data[regionCode];
  if (!region) return [];

  const province = region.province_list[provinceName];
  if (!province) return [];

  return Object.keys(province.municipality_list)
    .map((name) => ({ value: name, label: toTitleCase(name) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// ── Barangay ────────────────────────────────────────────────

/**
 * Get barangays for a given region, province, and city, sorted alphabetically.
 * Returns [] if any parent is empty.
 */
export function getBarangays(
  data: PSGCData,
  regionCode: string,
  provinceName: string,
  cityName: string
): SelectOption[] {
  if (!regionCode || !provinceName || !cityName) return [];

  const region = data[regionCode];
  if (!region) return [];

  const province = region.province_list[provinceName];
  if (!province) return [];

  const city = province.municipality_list[cityName];
  if (!city) return [];

  return city.barangay_list
    .map((name) => ({ value: name, label: toTitleCase(name) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
