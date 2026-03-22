---
phase: "02-form-steps-1-3"
plan: "02-04"
subsystem: "location-step"
tags:
  - form-step
  - cascading-dropdowns
  - psgc
  - zustand
dependency_graph:
  requires:
    - "02-01: PSGC data utility, Zustand store, Zod validation schemas"
    - "02-02: Select compound component, Input component"
  provides:
    - "LocationStep component (Step 2 of wizard)"
  affects:
    - "src/app/apply/page.tsx (wizard will render LocationStep)"
tech_stack:
  added: []
  patterns:
    - "Cascading dropdown with parent-clears-children"
    - "Lazy data loading with useEffect + useState"
    - "Zod safeParse for blur validation"
key_files:
  created:
    - "src/app/apply/steps/LocationStep.tsx"
  modified:
    - "src/components/ui/select.tsx (added onBlur to SelectTrigger)"
decisions: []
metrics:
  duration: "~10min"
  completed: "2026-03-22"
  tasks_completed: "1/1"
  files_changed: 2
---

# Phase 02 Plan 04: LocationStep Summary

## One-liner

Cascading PSGC dropdowns (Region → Province → City → Barangay) with parent-clears-children, blur validation, and Zustand store integration.

## What Was Built

**`src/app/apply/steps/LocationStep.tsx`** — Step 2 of the 7-step wizard.

### Features Implemented

1. **Cascading PSGC Dropdowns** — 4 Select components in order: Region → Province → City/Municipality → Barangay
2. **Lazy Data Loading** — PSGC data loaded from `/philippine_full.json` via `loadPSGCData()` on component mount with loading state
3. **Memoized Options** — Each dropdown level computed via `useMemo`, depending on parent selections
4. **Parent Clears Children Silently** — Selecting a region clears province+city+barangay (no toast, no error). Selecting a province clears city+barangay. Selecting a city clears barangay.
5. **Both Code and Name Stored** — Each change handler finds the label from options and sets both code and name in the Zustand store via `setLocation`
6. **Disabled When Parent Not Selected** — Province disabled without region, city without province, barangay without city
7. **Contextual Placeholders** — "Loading...", "Select Region", "Select Region first", "Select Province", "Select Province first", "Select City/Municipality", "Select City first", "Select Barangay"
8. **Blur Validation** — Each dropdown validates on blur using `locationSchema.safeParse()`. Errors shown as red text below the field. Touched state tracked per field.
9. **Continue Validation** — Continue button validates all fields and shows all errors if any field is invalid
10. **Mobile-First Layout** — `max-w-md mx-auto space-y-6` with section heading "Location"

### Supporting Change

**`src/components/ui/select.tsx`** — Added `onBlur` prop to `SelectTrigger` interface and wired it to the underlying `<button>` element. This enables blur-based validation for the custom Select component.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod error property access**
- **Found during:** TypeScript compilation (`npx tsc --noEmit`)
- **Issue:** Used `result.error.errors` but Zod's `ZodError` class exposes issues via `.issues`, not `.errors`
- **Fix:** Changed to `result.error.issues` in both `validateField` and `handleContinue`
- **Files modified:** `src/app/apply/steps/LocationStep.tsx`

**2. [Rule 2 - Enhancement] Added onBlur support to SelectTrigger**
- **Found during:** Implementation — SelectTrigger didn't support onBlur prop needed for blur validation
- **Issue:** Custom Select compound component's SelectTrigger only accepted `className` and `children`, no `onBlur`
- **Fix:** Added `onBlur?: () => void` to SelectTriggerProps interface, wired to the `<button>` element
- **Files modified:** `src/components/ui/select.tsx`

## Verification

- [x] `npx tsc --noEmit` passes cleanly
- [x] 4 cascading selects render in correct order (Region → Province → City → Barangay)
- [x] Selecting region populates province; changing region clears downstream
- [x] Disabled dropdowns show contextual placeholders
- [x] Both code and name stored in location state
- [x] Blur validation works with Zod locationSchema
- [x] Layout is mobile-first max-w-md

## Auth Gates

None — no authentication required.

## Self-Check: PASSED

- [x] `src/app/apply/steps/LocationStep.tsx` exists
- [x] `src/components/ui/select.tsx` modified with onBlur
- [x] Commit `c7bd223` exists
