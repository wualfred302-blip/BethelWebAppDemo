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

// ── Region ──────────────────────────────────────────────────

/**
 * Get all unique regions as SelectOptions, sorted by label.
 */
export function getRegions(data: PSGCData): SelectOption[] {
  return Object.entries(data)
    .map(([code, region]) => ({
      value: code,
      label: region.region_name,
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
    .map((name) => ({ value: name, label: name }))
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
    .map((name) => ({ value: name, label: name }))
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
    .map((name) => ({ value: name, label: name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
