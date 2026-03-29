export interface PricingRow {
  minSqm: number;
  maxSqm: number;
  limitOfLiability: number;
  classINet: number;
  classIGross: number;
  classIINet: number;
  classIIGross: number;
}

export const PRICING_TABLE: PricingRow[] = [
  { minSqm: 0, maxSqm: 20, limitOfLiability: 100000, classINet: 400.0, classIGross: 498.8, classIINet: 489.02, classIIGross: 609.81 },
  { minSqm: 21, maxSqm: 30, limitOfLiability: 150000, classINet: 536.05, classIGross: 668.45, classIINet: 625.07, classIIGross: 779.46 },
  { minSqm: 31, maxSqm: 40, limitOfLiability: 200000, classINet: 685.67, classIGross: 855.03, classIINet: 774.69, classIIGross: 966.04 },
  { minSqm: 41, maxSqm: 50, limitOfLiability: 250000, classINet: 767.0, classIGross: 956.45, classIINet: 856.01, classIIGross: 1067.44 },
  { minSqm: 51, maxSqm: 60, limitOfLiability: 300000, classINet: 889.56, classIGross: 1109.28, classIINet: 978.56, classIIGross: 1220.26 },
  { minSqm: 61, maxSqm: 70, limitOfLiability: 350000, classINet: 1011.71, classIGross: 1261.6, classIINet: 1100.71, classIIGross: 1372.59 },
  { minSqm: 71, maxSqm: 80, limitOfLiability: 400000, classINet: 1134.31, classIGross: 1414.48, classIINet: 1223.31, classIIGross: 1525.47 },
  { minSqm: 81, maxSqm: 90, limitOfLiability: 450000, classINet: 1215.6, classIGross: 1515.85, classIINet: 1304.6, classIIGross: 1626.84 },
  { minSqm: 91, maxSqm: 100, limitOfLiability: 500000, classINet: 1297.34, classIGross: 1617.78, classIINet: 1386.34, classIIGross: 1728.77 },
  { minSqm: 101, maxSqm: 110, limitOfLiability: 550000, classINet: 1378.99, classIGross: 1719.6, classIINet: 1467.99, classIIGross: 1830.58 },
  { minSqm: 111, maxSqm: 120, limitOfLiability: 600000, classINet: 1460.37, classIGross: 1821.08, classIINet: 1549.37, classIIGross: 1932.06 },
  { minSqm: 121, maxSqm: 130, limitOfLiability: 650000, classINet: 1542.1, classIGross: 1923.0, classIINet: 1631.1, classIIGross: 2033.98 },
  { minSqm: 131, maxSqm: 140, limitOfLiability: 700000, classINet: 1623.39, classIGross: 2024.37, classIINet: 1712.39, classIIGross: 2135.35 },
  { minSqm: 141, maxSqm: 150, limitOfLiability: 750000, classINet: 1705.12, classIGross: 2126.28, classIINet: 1794.12, classIIGross: 2237.27 },
  { minSqm: 151, maxSqm: 160, limitOfLiability: 800000, classINet: 1786.85, classIGross: 2228.2, classIINet: 1875.85, classIIGross: 2339.18 },
  { minSqm: 161, maxSqm: 170, limitOfLiability: 850000, classINet: 1868.13, classIGross: 2329.56, classIINet: 1957.13, classIIGross: 2440.54 },
  { minSqm: 171, maxSqm: 180, limitOfLiability: 900000, classINet: 1949.86, classIGross: 2431.48, classIINet: 2038.86, classIIGross: 2542.46 },
  { minSqm: 181, maxSqm: 190, limitOfLiability: 950000, classINet: 2031.15, classIGross: 2532.84, classIINet: 2120.15, classIIGross: 2643.83 },
  { minSqm: 191, maxSqm: 200, limitOfLiability: 1000000, classINet: 2112.89, classIGross: 2634.77, classIINet: 2201.89, classIIGross: 2745.76 },
  { minSqm: 201, maxSqm: 300, limitOfLiability: 1500000, classINet: 2765.42, classIGross: 3448.48, classIINet: 2854.42, classIIGross: 3559.46 },
  { minSqm: 301, maxSqm: 400, limitOfLiability: 2000000, classINet: 3580.98, classIGross: 4465.48, classIINet: 3669.98, classIIGross: 4576.47 },
  { minSqm: 401, maxSqm: 500, limitOfLiability: 2500000, classINet: 4150.71, classIGross: 5175.94, classIINet: 4239.71, classIIGross: 5286.92 },
  { minSqm: 501, maxSqm: 600, limitOfLiability: 3000000, classINet: 4478.25, classIGross: 5584.38, classIINet: 4567.25, classIIGross: 5695.36 },
  { minSqm: 601, maxSqm: 700, limitOfLiability: 3500000, classINet: 4723.0, classIGross: 5889.58, classIINet: 5180.0, classIIGross: 6459.46 },
  { minSqm: 701, maxSqm: 800, limitOfLiability: 4000000, classINet: 4967.3, classIGross: 6194.22, classIINet: 5440.0, classIIGross: 6783.68 },
  { minSqm: 801, maxSqm: 900, limitOfLiability: 4500000, classINet: 5535.0, classIGross: 6902.15, classIINet: 6075.0, classIIGross: 7575.53 },
  { minSqm: 901, maxSqm: 1000, limitOfLiability: 5000000, classINet: 6000.0, classIGross: 7482.0, classIINet: 6600.0, classIIGross: 8230.2 },
];

export const NATURE_TO_CLASS: Record<string, 1 | 2> = {
  'Retail Trade': 1,
  'Wholesale Trade': 1,
  'Professional Services': 1,
  'Education / Training': 1,
  'Information Technology': 1,
  'Financial Services': 1,
  'Real Estate': 1,
  'Printing / Publishing': 1,
  'Personal Services': 1,
  'Security Services': 1,
  'Food Service / Restaurant': 2,
  'Manufacturing': 2,
  'Construction': 2,
  'Transportation / Logistics': 2,
  'Healthcare / Medical': 2,
  'Agriculture / Farming': 2,
  'Fishing / Aquaculture': 2,
  'Mining / Quarrying': 2,
  'Tourism / Hospitality': 2,
  'Entertainment / Recreation': 2,
  'Repair / Maintenance': 2,
  'Cleaning / Sanitation': 2,
  'Import / Export': 2,
  'Other': 2,
};

export function lookupPremium(floorAreaSqM: string, natureOfBusiness: string) {
  // Return null if either field is missing
  if (!floorAreaSqM || !natureOfBusiness) return null;

  const sqm = parseInt(floorAreaSqM, 10) || 0;
  const row = PRICING_TABLE.find((r) => sqm >= r.minSqm && sqm <= r.maxSqm);
  if (!row) return null;
  const cls = NATURE_TO_CLASS[natureOfBusiness] ?? 2;
  const netPremium = cls === 1 ? row.classINet : row.classIINet;
  const grossPremium = cls === 1 ? row.classIGross : row.classIIGross;
  const dst = Math.round(netPremium * 0.25 * 100) / 100;     // Documentary Stamp Tax 25%
  const vat = Math.round(netPremium * 0.12 * 100) / 100;      // VAT 12%
  const lgTax = Math.round(netPremium * 0.02 * 100) / 100;    // Local Government Tax 2%
  return {
    limitOfLiability: row.limitOfLiability,
    netPremium,
    grossPremium,
    dst,
    vat,
    lgTax,
    class: cls,
  };
}

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}
