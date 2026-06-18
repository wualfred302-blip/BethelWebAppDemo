# Motor Policy OCR Autofill Notes

Date: 2026-06-17

## Purpose

Capture the intended OCR/autofill direction for the Bethel Motor Car policy flow so a later planning/implementation agent can use this as context when building the quote generator and motor policy creator.

The goal is **not** to issue a final policy directly from OCR. The goal is:

```txt
Previous policy / OR-CR / vehicle document
→ AI document extraction
→ normalized motor vehicle fields
→ pre-filled form
→ user review/correction
→ quote generator calculation
```

## User Direction Captured

- The user wants AI OCR to instantly fill the Motor Car form based on a previous policy or vehicle document.
- The extracted fields will later feed the Motor Car quote generator.
- The user does **not** want the plan centered around OpenAI-style endpoints or OpenAI SDK conventions.
- Keep OCR provider details behind an internal app abstraction so the UI and quote generator do not care which provider is used.
- Do not store API keys or secrets in this document.

## Security Note

An OpenRouter key was exposed during discussion. Do **not** commit or reuse exposed secrets. Rotate/revoke exposed keys before implementation.

## Current App Context

Existing motor fields live in `src/store/useApplicationStore.ts` under `MotorVehicleInfoData`:

```ts
fullName
address
phone
email
plateNumber
mvFileNumber
make
model
bodyType
color
seatingCapacity
vehicleUse
chassisNumber
engineNumber
conductionSticker
vehicleCondition
estimatedMarketValue
coverageType
actsOfNature
thirdPartyPropertyDamageLimit
```

Existing extraction APIs:

- `src/app/api/extract-permit/route.ts`
- `src/app/api/extract-policy/route.ts`

These currently use OpenAI client style. For the future motor OCR implementation, prefer a provider-neutral module with direct provider adapters rather than hard-coding OpenAI client semantics into route handlers.

## Research Summary: What PH Motor Policies Usually Contain

Public PH motor policy/product materials and sample policy schedules usually contain these sections:

### 1. Insured / Assured Details

- Policy number
- Name of insured / assured
- Address
- Contact details, sometimes omitted
- Policy period / effective date / expiry date

### 2. Vehicle Details

- Plate number
- Motor vehicle file number / MV file number
- Make
- Series/model
- Year model
- Body type
- Color
- Engine number
- Chassis number
- Seating capacity
- Vehicle classification / use
- Sometimes conduction sticker

### 3. Coverage Details

Common PH motor policy coverages:

- CTPL / Compulsory Third Party Liability
- Own Damage
- Theft
- Fire
- Acts of Nature / Acts of God / AON / AOG
- Third Party Property Damage / TPPD
- Excess Bodily Injury / Third Party Bodily Injury
- Auto Personal Accident / Unnamed Passenger Personal Accident
- Roadside assistance, sometimes optional
- Loss of use, sometimes optional

### 4. Financial / Rating Details

- Sum insured / fair market value
- Premium per coverage
- Taxes and fees
- Deductible / participation
- Total premium
- Mortgagee / financing institution, if applicable

## Research Summary: OR/CR Documents Usually Contain

Philippine vehicle OR/CR documents commonly provide:

- Registered owner
- Owner address
- Plate number
- MV file number
- Engine number
- Chassis number
- Make
- Series/model
- Body type
- Year model
- Color
- Classification
- Gross vehicle weight / net capacity in some cases
- Registration date / latest OR date

OR/CR is useful for vehicle identity, but previous policy is better for coverage and premium history.

## Autofill Mapping Strategy

Prefer field extraction into a normalized OCR result, then map to app form fields.

### Normalized OCR Result

Suggested type:

```ts
interface MotorDocumentOcrResult {
  documentType: 'previous_policy' | 'or_cr' | 'sales_invoice' | 'unknown';
  confidence: number;
  fields: {
    fullName?: ExtractedField;
    address?: ExtractedField;
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
  unmappedText?: string[];
  warnings: string[];
}

interface ExtractedField {
  value: string;
  confidence: number;
  sourceLabel?: string;
  sourceText?: string;
}
```

### App Store Mapping

Map only high-confidence normalized fields into `motorVehicleInfo`. Low-confidence fields should be presented as suggestions.

Example:

```txt
OCR fullName → motorVehicleInfo.fullName
OCR insuredAddress / registeredOwnerAddress → motorVehicleInfo.address
OCR plateNo / plateNumber → motorVehicleInfo.plateNumber
OCR mvFileNo / motorVehicleFileNo → motorVehicleInfo.mvFileNumber
OCR make → motorVehicleInfo.make
OCR series/model → motorVehicleInfo.model
OCR yearModel → motorVehicleInfo.yearModel
OCR bodyType → motorVehicleInfo.bodyType
OCR color → motorVehicleInfo.color
OCR authorizedCapacity / seatingCapacity → motorVehicleInfo.seatingCapacity
OCR use/classification → motorVehicleInfo.vehicleUse
OCR chassisNo → motorVehicleInfo.chassisNumber
OCR engineNo → motorVehicleInfo.engineNumber
OCR fairMarketValue / sumInsured → motorVehicleInfo.estimatedMarketValue
OCR AON/AOG/Acts of Nature → motorVehicleInfo.actsOfNature
OCR TPPD limit → motorVehicleInfo.thirdPartyPropertyDamageLimit
OCR deductible / participation → motorVehicleInfo.deductibleParticipation
```

## UX Requirement

OCR should feel instant, but must include confirmation.

Recommended flow:

```txt
Upload previous policy / OR-CR
→ show scanning state
→ pre-fill form
→ highlight filled fields
→ user reviews and edits
→ continue to quote generator
```

Use visual cues:

- Green/check mark for high-confidence fields
- Yellow/warning for low-confidence fields
- Empty state for missing fields
- “Review required” banner before quote calculation

## Provider-Agnostic OCR Architecture

Avoid tying UI or business logic to any specific model endpoint style.

Recommended internal boundary:

```txt
src/lib/motor-ocr/
  schema.ts
  normalize.ts
  validate.ts
  providers/
    gemini.ts
    mistral.ts
    openrouter.ts (optional, isolated)
  extract.ts
```

Public app-facing function:

```ts
extractMotorDocument(file): Promise<MotorDocumentOcrResult>
```

The app should call only this function/API route, not provider-specific code.

## Provider Notes

If avoiding OpenAI-style endpoint conventions, prioritize:

1. Direct Google Gemini API / SDK for mobile-photo document extraction.
2. Direct Mistral OCR API for PDF/document-heavy extraction.
3. Google Document AI or AWS Textract for future production reliability.

OpenRouter can still be kept as an optional experimental adapter, but it should not shape the app architecture.

## Validation Rules Before Quote Generator

The quote generator should not run blindly from OCR output. Required before pricing:

- `estimatedMarketValue` is numeric and greater than zero
- `yearModel` is valid and plausible
- `make` and `model` are present
- `bodyType` is present or mapped to a supported body type
- `vehicleUse` is present or selected manually
- `coverageType` is selected manually or confidently extracted
- `chassisNumber` and `engineNumber` should be present for policy issuance
- `plateNumber` or `conductionSticker` should be present depending on vehicle status

If key values are missing, show the user what must be completed manually.

## Quote Generator Dependency

The future Motor quote generator should consume validated `motorVehicleInfo`, not raw OCR output.

Preferred dependency chain:

```txt
OCR Result → Normalizer → Form Fields → User Confirmation → Quote Input → Quote Result
```

Do not calculate premiums directly from unreviewed OCR text.

## Future Implementation Reminder

When the Motor quote screen is ready, build the plan around:

- Motor-specific OCR extraction route
- Normalized OCR schema
- Form autofill + review UX
- Motor quote calculation module
- Motor cover note display
- Referral/manual underwriting rules

## Visual Direction: Stitch Cover Note Reference

Stitch reference fetched on 2026-06-17:

- Project: `Bethel CGL Motor Car`
- Project ID: `18303284917765248356`
- Screen: `Personalized Cover Note - Apple Inspired`
- Screen ID: `27eba40790a6494888cf45617614ee1b`
- Local assets:
  - `.planning/stitch-assets/personalized-cover-note-apple-inspired.html`
  - `.planning/stitch-assets/personalized-cover-note-apple-inspired.png`

### What to Replicate

The user wants to fairly replicate the **center page content**, not necessarily the exact top/bottom navigation shell.

Key visual pattern:

- Mobile-first centered receipt/card layout.
- Apple-inspired, clean, soft white surface.
- Rounded card with subtle border and light shadow.
- Logo/header block at top.
- Large hero premium amount.
- Personalized insured name below the premium.
- Clear sectioned rows for vehicle details.
- Coverage limit section with soft tinted background.
- Dashed/ticket-style separator before billing summary.
- Billing summary with itemized line items and final total.
- Prominent PDF/download action button.
- Calm Bethel blue color palette.

### How This Fits the Motor Quote Flow

After OCR fills the Motor Vehicle form and the user confirms the fields, the quote generator should produce a motor cover note/receipt screen visually similar to the Stitch reference:

```txt
Confirmed vehicle fields
→ quote calculation
→ Apple-inspired Motor Cover Note card
→ downloadable PDF receipt / cover note
```

The motor version should replace placeholder sample values with Philippine motor policy fields:

- Total Premium in PHP
- Assured name
- Make/model/year
- Plate number / conduction sticker
- Color
- Sum insured / fair market value
- CTPL
- Own Damage
- Theft
- Acts of Nature
- Third Party Property Damage
- Auto Personal Accident
- Deductible / participation
- Taxes/fees
- Final total

Keep disclaimer visible:

```txt
Estimated premium only. Subject to Bethel final underwriting assessment.
```
