# Phase Plan: OCR Form Auto-Fill (Completed Fields)

## Phase Overview

**Phase ID:** ocr-form-integration  
**Objective:** Connect OCR extraction to form auto-fill, building upon completed building fields

---

## Status: Tasks Summary

| Task | Description | Status |
|------|-------------|--------|
| ✅ Task 2 | Add Building Details Fields (floors, type, construction) | **COMPLETE** |
| ⚡ Task 1 | Fix OCR-to-Form Data Flow | **IN PROGRESS** |
| ❌ Task 3 | Reuse Scanned Permit in Documents | **REMOVED** |
| ❌ Task 4 | Update OCR Schema | **REMOVED** |

---

## Background

### Completed Work (Task 2)
- Building fields added to store: `buildingFloors`, `buildingType`, `constructionType`
- Validation schemas added to `validation.ts`
- UI components added to `BusinessInfoStep.tsx`
- TypeScript compilation: **PASS**

### Problem Statement (Task 1)
OCR data is **orphaned** — extracted data sits in `scanData` in Zustand but is never used to auto-fill the form.

**Current Flow:**
```
ScanStep → OCR extracts → scanData (stored but unused)
BusinessInfoStep → reads businessInfo (always empty on load)
```

**Expected Flow:**
```
ScanStep → OCR extracts → scanData
BusinessInfoStep → on mount, if scanData exists → pre-fill businessInfo
```

---

## Task 1: Fix OCR-to-Form Data Flow (IN PROGRESS)

### 1A: Map OCR Fields to Form Fields

**OCR Schema** (`scanData`):
```typescript
{
  tin: string;              // "000-000-000-000"
  businessName: string;     // "Business Name"
  fullName: string;         // "Owner Full Name"
  streetAddress: string;    // "123 Main St, Unit 4B"
  regionName: string;       // "NATIONAL CAPITAL REGION"
  provinceName: string;     // "METRO MANILA"
  cityName: string;         // "MANILA"
  barangayName: string;     // "SAN ANDRES"
}
```

**Form Fields** (`businessInfo`):
```typescript
{
  fullName: string;
  businessName: string;
  tin: string;
  streetAddress: string;
  // ... plus phone, email, floorArea, building fields
}
```

**Mapping Required:**

| OCR Field | Form Field | Notes |
|-----------|------------|-------|
| `tin` | `tin` | Direct map |
| `businessName` | `businessName` | Direct map |
| `fullName` | `fullName` | Direct map |
| `streetAddress` | `streetAddress` | Direct map |
| `regionName` | (location) | Need code lookup |
| `provinceName` | (location) | Need code lookup |
| `cityName` | (location) | Need code lookup |
| `barangayName` | (location) | Need code lookup |

**Missing (not in OCR, manual entry):**
- `floorArea`
- `natureOfBusiness`
- `phone`, `email`
- `buildingFloors`, `buildingType`, `constructionType`

---

### 1B: Implementation Details

**File:** `src/app/apply/steps/BusinessInfoStep.tsx`

**Required Changes:**
1. Import `scanData` from Zustand store
2. On component mount (`useEffect`), check if `scanData` exists
3. If yes, populate form default values with OCR data
4. Use `defaultValue` in react-hook-form, NOT `value` (preserves user override)

**Implementation Pattern:**
```typescript
// Inside BusinessInfoStep component
const { scanData, setBusinessInfo } = useApplicationStore();

// On mount - pre-fill from OCR if available
useEffect(() => {
  if (scanData) {
    // Set form default values
    setValue('fullName', scanData.fullName || '');
    setValue('businessName', scanData.businessName || '');
    setValue('tin', scanData.tin || '');
    setValue('streetAddress', scanData.streetAddress || '');
    // ... etc
  }
}, [scanData]);
```

---

### 1C: Location Code Lookup (Additional Complexity)

**Challenge:** OCR returns location *names* (strings), but form uses PSGC *codes* for cascading selects.

**Solution Options:**

| Option | Pros | Cons |
|--------|------|------|
| A. Name-to-code lookup | Full auto-fill | Complex matching logic |
| B. Names only, no cascading | Simple | Less precise |
| C. Manual fallback + suggest | User confirms | Extra step |

**Recommendation:** Option B for MVP
- Pre-fill street address (text field)
- Show region/province/city/barangay as text read-only with "Edit" button
- User clicks to use dropdown if they want to change

---

## Implementation Order

```
Step 1: Read scanData from store in BusinessInfoStep
Step 2: useEffect to pre-fill form with OCR data  
Step 3: Test with actual OCR response
Step 4: Handle location names gracefully
```

---

## Verification Criteria

- [ ] With scanData present, form pre-fills on mount
- [ ] Without scanData, form loads empty (current behavior)
- [ ] User can still edit any pre-filled field
- [ ] Location fields show OCR values when available
- [ ] TypeScript compilation passes

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/apply/steps/BusinessInfoStep.tsx` | Import scanData, add useEffect for auto-fill |

---

## Dependencies

- **Requires:** `scanData` exists in Zustand store (already there ✅)
- **Requires:** OCR extraction completes successfully (at runtime)

---

## Post-Implementation Notes

After Task 1 is complete, the flow will be:
```
Splash → Scan Permit (OCR) → scanData stored
       → Business Info Form → auto-filled from scanData
       → User fills floorArea, natureOfBusiness, building fields
       → Continue to Documents → Review → Payment
```

This eliminates duplicate data entry and creates the proper "scan-first" experience.

---

## Next Phase Suggestions

After completing OCR-to-form integration:
1. **QR Code Entry** — Real entry point from barangay QR
2. **Camera-First Documents** — Replace drag-drop with camera UI  
3. **Payment Integration** — Real GCash/PayMongo API
4. **Persistence** — Supabase or database for application storage
5. **Email Confirmation** — Send cover note PDF to user email