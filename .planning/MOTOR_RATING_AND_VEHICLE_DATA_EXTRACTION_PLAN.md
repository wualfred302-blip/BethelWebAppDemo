# Motor Rating and Vehicle Data Extraction Plan

Date: 2026-06-18

## Purpose

Create the data foundation for the Bethel Motor Car Insurance flow.

The next agent should extract and install the data needed to support:

1. OCR-assisted motor document intake.
2. A reviewed motor vehicle form.
3. Cascading vehicle dropdowns where data quality allows.
4. An indicative motor quote summary.
5. A final cover-note screen that clearly distinguishes estimated/range pricing from underwriting-approved pricing.

This plan is for data extraction and integration only. It should not invent final Bethel underwriting rates.

## Current App State

The motor form currently captures these fields in `src/store/useApplicationStore.ts` under `MotorVehicleInfoData`:

```ts
fullName
address
phone
email
plateNumber
mvFileNumber
make
model
yearModel
bodyType
color
seatingCapacity
vehicleUse
chassisNumber
engineNumber
conductionSticker
vehicleCondition
estimatedMarketValue
effectiveDate
coverageType
actsOfNature
thirdPartyPropertyDamageLimit
autoPersonalAccident
deductibleParticipation
```

The form currently has dropdowns only for:

```txt
bodyType: Sedan, SUV, Van, Pickup, Hatchback
vehicleUse: Private, Commercial
vehicleCondition: Brand New, Used
coverageType: CTPL Only, Comprehensive
actsOfNature: Included, Not Included
autoPersonalAccident: Included, Not Included
```

The form does not currently have a vehicle make/model/year catalogue. `make`, `model`, and `yearModel` are free-text inputs.

The existing pricing module, `src/lib/pricing.ts`, is for CGL/business property, not motor car.

## Key Product Rule

OCR should extract facts. The app should price only from explicit rating data.

Do not let the Gemini/OpenRouter extraction agent invent premiums. If a document contains previous premium, extract it as historical context, not as Bethel's new quote.

## Required Data Tracks

There are two separate datasets to install.

### Track A: Motor Rating Table

Purpose: calculate an indicative motor premium or premium range.

Primary source:

```txt
Insurance Commission - Schedule-Rates-for-Motorcar.pdf
https://www.insurance.gov.ph/wp-content/uploads/2022/05/Schedule-Rates-for-Motorcar.pdf
```

Why this source:

- Official Philippine Insurance Commission domain.
- Directly contains motor rating schedule data.
- Includes private car, commercial vehicle, land transportation operator, motorcycle, CTPL, voluntary liability, property damage, AON, deductible, loading, and surcharge rules.
- Small enough to extract into a reliable structured table.

Companion source for CTPL details:

```txt
Insurance Commission - IMC No. 4-2006
https://www.insurance.gov.ph/wp-content/uploads/2022/04/IMC2006-4.pdf
```

Companion source for current CTPL benefit context:

```txt
Insurance Commission - IMC 2024-01
https://www.insurance.gov.ph/wp-content/uploads/2024/04/IMC-2024-01_Increase-in-the-Benefits-for-Compulsory-Motor-Vehicle-Insurance-Coverage.pdf
```

Also note the Insurance Commission press release states that IMC 2024-01 increased CMVLI benefits without increasing CMVLI premiums, and that IMC 4-2006 premium rates remain in force.

### Track B: Vehicle Catalogue

Purpose: power cascading dropdowns and normalize OCR text into controlled options.

The Insurance Commission rating schedule does not contain make/model/year data.

Preferred source:

```txt
Bethel-provided accepted vehicle make/model/variant table, if available.
```

This is the best source because it can match actual underwriting appetite, local availability, and accepted body-type mappings.

Fallback open-source source:

```txt
arthurkao/vehicle-make-model-data
https://github.com/arthurkao/vehicle-make-model-data
```

Use only as a prototype fallback because:

- It is MIT-licensed.
- It has year/make/model data in CSV/JSON/SQL.
- It is broad/global, not Philippine-specific.
- Its README describes years 2001-2015, so it is stale for modern vehicles.
- It does not provide Philippine market availability or insurer appetite.

Commercial/API fallback:

```txt
CarAPI vehicle data feed
https://carapi.app/features/vehicle-csv-download
```

Use only if the user approves cost/licensing. It provides year, make, model, submodel, trim, body type, doors, seats, engine data, etc., but it is US-focused and paid for the full CSV feed.

## Expected Data Artifacts

Prefer data files under:

```txt
src/data/motor/
```

Recommended files:

```txt
src/data/motor/rating-table.ts
src/data/motor/vehicle-catalog.ts
src/data/motor/normalization-aliases.ts
src/lib/motor-rating.ts
```

If the repo prefers JSON for data, use:

```txt
src/data/motor/rating-table.json
src/data/motor/vehicle-catalog.json
src/data/motor/normalization-aliases.json
```

Either format is acceptable if TypeScript types and validation are added.

## Rating Table Target Shape

The extracted rating table should preserve source values and not prematurely flatten business logic.

Recommended TypeScript shape:

```ts
export type VehicleRatingClass =
  | 'private_car'
  | 'commercial_own_goods'
  | 'commercial_hire_car'
  | 'bus'
  | 'taxi_puj_mini_bus'
  | 'motorcycle'
  | 'tricycle'
  | 'trailer'
  | 'unknown';

export interface RateValue {
  ratePercent?: number;
  premiumPHP?: number;
  minPremiumPHP?: number;
  notes?: string[];
  sourceText?: string;
}

export interface DeductibleRule {
  basis: 'sum_insured_percent' | 'fixed_php' | 'greater_of';
  percentOfSumInsured?: number;
  fixedMinimumPHP?: number;
  notes?: string[];
}

export interface DeductibleDiscount {
  deductiblePercentOfSI: number;
  minimumDeductiblePHP: number;
  discountPercent: number;
}

export interface CtplPremiumRow {
  vehicleClass: VehicleRatingClass;
  oneYearTotalPremiumPHP: number;
  threeYearTotalPremiumPHP?: number;
  basicPremiumPHP?: number;
  dstPHP?: number;
  vatPHP?: number;
  lgtPHP?: number;
  liabilityLimitPHP: number;
  benefitsLimitPHP?: number;
}

export interface LimitPremiumRow {
  limitPHP: number;
  privateCarPHP?: number;
  cvOwnGoodsLightMediumPHP?: number;
  cvOwnGoodsHeavyPHP?: number;
  motorcyclePHP?: number;
}

export interface MotorRatingTable {
  source: {
    title: string;
    url: string;
    effectiveDate?: string;
    extractedAt: string;
  };
  privateCar: {
    ownDamageAndTheft: RateValue;
    theftOnly: RateValue;
    fireOnly: RateValue;
    deductible: DeductibleRule;
    deductibleDiscounts: DeductibleDiscount[];
    surcharges: string[];
    notes: string[];
  };
  commercialVehicles: Record<string, unknown>;
  landTransportationOperators: Record<string, unknown>;
  motorcycles: Record<string, unknown>;
  ctpl: CtplPremiumRow[];
  voluntaryBodilyInjury: LimitPremiumRow[];
  voluntaryPropertyDamage: LimitPremiumRow[];
  actsOfNature: RateValue;
}
```

## Vehicle Catalogue Target Shape

Recommended target shape:

```ts
export interface VehicleCatalogEntry {
  make: string;
  model: string;
  yearStart?: number;
  yearEnd?: number;
  year?: number;
  variant?: string;
  bodyType?: 'Sedan' | 'SUV' | 'Van' | 'Pickup' | 'Hatchback' | 'Truck' | 'Motorcycle' | 'Other';
  seatingCapacity?: number;
  aliases?: string[];
  source: string;
  sourceConfidence: 'official' | 'licensed' | 'open_source' | 'manual_seed' | 'ocr_observed';
  philippinesMarket?: boolean;
}

export interface VehicleCatalog {
  source: {
    title: string;
    url?: string;
    license?: string;
    extractedAt: string;
    notes: string[];
  };
  entries: VehicleCatalogEntry[];
}
```

For the first implementation, keep catalogue fields modest:

```txt
make
model
year or yearStart/yearEnd
bodyType
aliases
source
```

Do not block the form if the vehicle is not in the catalogue. The user must always be able to type manually or accept OCR values.

## Cascading Dropdown Plan

Target interaction:

```txt
Make -> Model -> Year -> Body Type / Variant
```

Rules:

1. Make dropdown filters models.
2. Model dropdown filters years.
3. Year dropdown filters body type/variant if known.
4. OCR values should attempt exact match first, alias match second, fuzzy match third.
5. If confidence is low, show the OCR value as a suggestion and let the user select or type.
6. If no catalogue match exists, keep the typed/OCR value and mark it as manual/unverified.

Current form should evolve from:

```txt
make: free text
model: free text
yearModel: free text
bodyType: dropdown
```

To:

```txt
make: combobox
model: dependent combobox
yearModel: dependent combobox or numeric input with suggestions
variant: optional dependent combobox if catalogue supports it
bodyType: dependent dropdown, manual override allowed
```

The store currently has no `variant` field. Add it only if the extracted catalogue supports it and the UI needs it. Otherwise keep variant folded into `model` or `modelDescription`.

## OCR Provider Plan

Provider should be Gemini through OpenRouter.

Implementation boundary should look like:

```txt
src/lib/motor-ocr/
  schema.ts
  mapping.ts
  providers/
    openrouter-gemini.ts
  extract.ts
```

OpenRouter may use an OpenAI-compatible API shape, but code naming must not imply the business logic depends on OpenAI.

Preferred env var:

```txt
OPENROUTER_API_KEY
```

Recommended model config should be centralized:

```ts
export const MOTOR_OCR_MODEL = 'google/gemini-2.5-flash';
```

Use the actual model ID selected by the user/team.

## OCR Extraction Target Shape

Use this normalized result. OCR should return facts plus confidence and source evidence.

```ts
interface ExtractedField {
  value: string;
  confidence: number;
  sourceLabel?: string;
  sourceText?: string;
}

interface MotorDocumentOcrResult {
  documentType: 'previous_policy' | 'or_cr' | 'sales_invoice' | 'unknown';
  confidence: number;
  fields: {
    fullName?: ExtractedField;
    address?: ExtractedField;
    phone?: ExtractedField;
    email?: ExtractedField;
    plateNumber?: ExtractedField;
    mvFileNumber?: ExtractedField;
    make?: ExtractedField;
    model?: ExtractedField;
    yearModel?: ExtractedField;
    bodyType?: ExtractedField;
    color?: ExtractedField;
    seatingCapacity?: ExtractedField;
    vehicleUse?: ExtractedField;
    chassisNumber?: ExtractedField;
    engineNumber?: ExtractedField;
    conductionSticker?: ExtractedField;
    vehicleCondition?: ExtractedField;
    estimatedMarketValue?: ExtractedField;
    effectiveDate?: ExtractedField;
    expiryDate?: ExtractedField;
    coverageType?: ExtractedField;
    actsOfNature?: ExtractedField;
    thirdPartyPropertyDamageLimit?: ExtractedField;
    autoPersonalAccident?: ExtractedField;
    deductibleParticipation?: ExtractedField;
    previousPolicyNumber?: ExtractedField;
    previousInsurer?: ExtractedField;
    previousPremium?: ExtractedField;
  };
  unmappedText: string[];
  warnings: string[];
}
```

## OCR-to-Form Mapping

High-confidence values should be applied to `motorVehicleInfo`.

Low-confidence values should become suggestions.

Mapping:

```txt
fullName -> motorVehicleInfo.fullName
address -> motorVehicleInfo.address
phone -> motorVehicleInfo.phone
email -> motorVehicleInfo.email
plateNumber -> motorVehicleInfo.plateNumber
mvFileNumber -> motorVehicleInfo.mvFileNumber
make -> motorVehicleInfo.make
model -> motorVehicleInfo.model
yearModel -> motorVehicleInfo.yearModel
bodyType -> motorVehicleInfo.bodyType
color -> motorVehicleInfo.color
seatingCapacity -> motorVehicleInfo.seatingCapacity
vehicleUse -> motorVehicleInfo.vehicleUse
chassisNumber -> motorVehicleInfo.chassisNumber
engineNumber -> motorVehicleInfo.engineNumber
conductionSticker -> motorVehicleInfo.conductionSticker
vehicleCondition -> motorVehicleInfo.vehicleCondition
estimatedMarketValue -> motorVehicleInfo.estimatedMarketValue
effectiveDate -> motorVehicleInfo.effectiveDate
coverageType -> motorVehicleInfo.coverageType
actsOfNature -> motorVehicleInfo.actsOfNature
thirdPartyPropertyDamageLimit -> motorVehicleInfo.thirdPartyPropertyDamageLimit
autoPersonalAccident -> motorVehicleInfo.autoPersonalAccident
deductibleParticipation -> motorVehicleInfo.deductibleParticipation
```

Fields that do not currently have form targets:

```txt
expiryDate
previousPolicyNumber
previousInsurer
previousPremium
```

Store these either in `motorOcrData` only or add a separate `motorPreviousPolicyInfo` object. Do not force them into vehicle details if they are not part of the quote input.

## Quote Calculation Plan

The first quote calculator should be explicitly labelled indicative.

Recommended function:

```ts
calculateIndicativeMotorQuote(input: MotorVehicleInfo): MotorQuoteResult
```

Recommended output:

```ts
interface MotorQuoteLineItem {
  key: string;
  label: string;
  amountPHP?: number;
  ratePercent?: number;
  status: 'calculated' | 'selected' | 'missing' | 'referral';
  notes?: string[];
}

interface MotorQuoteResult {
  status: 'quote_ready' | 'needs_review' | 'pending_assessment' | 'not_enough_data';
  displayLabel: 'Indicative Quote' | 'Estimated Premium Range' | 'Pending Assessment';
  sumInsuredPHP?: number;
  lineItems: MotorQuoteLineItem[];
  estimatedGrossPremiumPHP?: number;
  estimatedPremiumRangePHP?: {
    min: number;
    max: number;
  };
  referralReasons: string[];
  missingFields: string[];
}
```

Minimum required fields before any indicative calculation:

```txt
estimatedMarketValue
vehicleUse
coverageType
vehicleCondition
yearModel
make
model
bodyType
```

Fields required before policy issuance, but not necessarily before an indicative quote:

```txt
fullName
address
engineNumber
chassisNumber
plateNumber or conductionSticker
effectiveDate
```

Suggested first calculation behavior:

1. If `coverageType` is `CTPL Only`, calculate CTPL only from vehicle class.
2. If `coverageType` is `Comprehensive`, calculate OD/Theft from FMV and rate range.
3. Add AON only when selected/included.
4. Add TPPD only when a selected limit matches the voluntary property damage table.
5. Add voluntary bodily injury only if the product includes it later.
6. Do not add APA unless a Bethel rate is provided. Mark it as `pending_assessment`.
7. Show deductible rule as a note, not a user-facing discount, unless the user selects a higher deductible.
8. If a required table row is missing, return `pending_assessment`.

## Validation Rules

The form should prevent obviously invalid quote inputs:

```txt
estimatedMarketValue must be numeric and > 0
yearModel must be plausible, e.g. 1980-current year + 1
make must be present
model must be present
bodyType must be present or manually selected
vehicleUse must be Private or Commercial
coverageType must be CTPL Only or Comprehensive
actsOfNature must be Included or Not Included
thirdPartyPropertyDamageLimit must match an available table limit or be blank
deductibleParticipation must be numeric or blank
```

Referral conditions:

```txt
racing / pace-making / speed testing usage
commercial hauling of logs, lumber, sand, gravel, bottled beverages, gasoline, inflammables
vehicle older than source table rules can confidently rate
vehicle use not mapped to supported rating class
FMV missing or implausible
make/model not recognized and user has not confirmed manual override
coverage selected but no applicable rate is available
```

## Installation Tasks for the Agent

### Phase 1: Extract Rating Data

1. Pull values from `Schedule-Rates-for-Motorcar.pdf`.
2. Pull CTPL/tax breakdown from `IMC2006-4.pdf`.
3. Pull current benefits/premium-stability note from `IMC-2024-01`.
4. Create rating data file.
5. Add source metadata and extraction date.
6. Add tests or a validation script that checks the known rows:
   - private car CTPL one-year total premium is PHP 560.
   - private car CTPL three-year total premium is PHP 1,610.
   - AON minimum rate is 0.50%.
   - private car deductible is the greater of PHP 2,000 or 0.5% of sum insured.
   - private car higher deductible discounts include 0.75% SI / PHP 3,000 / 6% and 1.00% SI / PHP 4,000 / 12%.

### Phase 2: Install Vehicle Catalogue

1. First check whether the user/Bethel has an accepted make/model list.
2. If not, install a prototype catalogue from the approved source.
3. Preserve source/license metadata.
4. Normalize casing:
   - `TOYOTA` -> `Toyota`
   - `MITSUBISHI` -> `Mitsubishi`
   - `ISUZU` -> `Isuzu`
5. Add alias mappings:
   - `HONDA CRV` -> `Honda CR-V`
   - `TOYOTA VIOS 1.3E A/T` -> `Toyota` / `Vios` / variant `1.3E A/T`
   - `MITS STRADA` -> `Mitsubishi` / `Strada`
6. Keep manual fallback for unmatched OCR values.

### Phase 3: Build Form Data Helpers

Create helpers:

```ts
getVehicleMakes()
getVehicleModels(make)
getVehicleYears(make, model)
getVehicleVariants(make, model, year)
matchVehicleFromOcr({ make, model, yearModel, bodyType })
```

Return both exact and suggested matches:

```ts
{
  exact?: VehicleCatalogEntry;
  suggestions: VehicleCatalogEntry[];
  confidence: number;
}
```

### Phase 4: Connect to Motor Form

Update `MotorVehicleDetailsStep`:

1. Convert make/model/year to combobox-style fields.
2. Preserve typed/manual entry.
3. Cascade options from make to model to year.
4. Auto-select body type only when confidence is high.
5. Show OCR-filled fields as reviewable, not final.
6. Keep the user able to override everything.

### Phase 5: Add Indicative Quote Summary

Create `src/lib/motor-rating.ts`.

Implement:

```ts
validateMotorQuoteInput()
calculateIndicativeMotorQuote()
formatMotorQuoteSummary()
```

The cover note should display:

```txt
Indicative Quote
Estimated Premium Range
Pending Assessment
```

depending on confidence and completeness.

Never display an unqualified `Final Total` for motor unless Bethel-specific final rates are installed and underwriting rules are satisfied.

### Phase 6: Verification

Run:

```txt
npm run lint
npx tsc --noEmit
npm run build
```

Browser-test:

1. Vehicle flow with no OCR.
2. Vehicle flow with OCR data mock.
3. Private car comprehensive quote with FMV and AON.
4. CTPL-only quote.
5. Unknown make/model manual override.
6. Missing FMV should show pending assessment.
7. Unmatched TPPD limit should show pending assessment or missing table row.

## Deliverables

The agent should deliver:

```txt
1. rating-table data file
2. vehicle-catalog data file or documented reason it could not be sourced
3. normalization aliases
4. motor rating helper module
5. form dropdown/cascade integration
6. quote summary integration
7. validation tests or scripts
8. notes on any fields that still require Bethel underwriting input
```

## Open Questions for User/Bethel

These cannot be solved reliably from public data:

```txt
What exact OD/Theft rate should Bethel use inside the public tariff range?
Does Bethel price AON as exactly 0.50%, or use internal adjustments?
Does Bethel include Auto Personal Accident by default?
What TPPD limits should be offered in the UI?
Does Bethel support commercial vehicles in this flow, or private cars only?
What minimum premium applies?
What vehicles are referral-only or excluded?
How should older vehicles be loaded or declined?
Does Bethel want indicative ranges or a single estimated premium?
```

Until these are answered, the app should say `Pending Assessment` or `Indicative Quote`, not `Final Premium`.
