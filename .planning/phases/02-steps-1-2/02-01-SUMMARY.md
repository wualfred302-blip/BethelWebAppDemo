---
phase: 02-steps-1-2
plan: "01"
subsystem: ui
tags: [react-hook-form, zod, psgc, combobox, cascading-select, zustand]
requires:
  - phase: 01-foundation
    provides: "Step wizard shell, Select/Input/Button components, PSGC data utility, Zustand store"
provides:
  - "Combined Step 1 form with Personal, Business, and Location sections"
  - "Searchable combobox PSGC dropdowns (Region→Province→City→Barangay)"
  - "fullName and streetAddress added to businessInfoSchema and store"
affects:
  - 02-steps-1-2 (next plans in this phase)

tech-stack:
  added: []
  patterns:
    - "SearchableSelectContent wrapper for combobox pattern on custom Select"
    - "Dual-schema validation: zodResolver(businessInfoSchema) + manual locationSchema.safeParse on submit"
    - "Blur-based validation with touched state for location fields"

key-files:
  created: []
  modified:
    - src/lib/validation.ts - Added fullName and streetAddress to businessInfoSchema
    - src/app/apply/steps/BusinessInfoStep.tsx - Rewritten as combined Step 1 with 3 sections + combobox PSGC

key-decisions:
  - "SearchableSelectContent created as local wrapper (not modifying base Select component) to add combobox filtering"
  - "Location fields validated separately via locationSchema (not merged into businessInfoSchema) since store keeps location as a separate slice"
  - "Search input stops event propagation to prevent Select dropdown from closing when typing"

patterns-established:
  - "SearchableSelectContent: reusable pattern for adding search/filter to existing Select compound component without modifying its API"
  - "Combined form with split schema validation: zodResolver for react-hook-form fields, manual safeParse for store-managed fields"

requirements-completed:
  - BIZ-01
  - BIZ-02
  - BIZ-03
  - BIZ-04
  - BIZ-05
  - LOC-01
  - LOC-02
  - LOC-03
  - LOC-04
  - LOC-05
  - LOC-06

duration: ~12min
completed: 2026-03-22
---

# Phase 02-steps-1-2: Plan 01 Summary

**Combined Step 1 form merging Personal (Full Name), Business (4 fields), and Location (Street Address + searchable cascading PSGC dropdowns) with dual-schema validation.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-22
- **Completed:** 2026-03-22
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `fullName` (2-100 chars) and `streetAddress` (required) to `businessInfoSchema` in validation.ts
- Rewrote `BusinessInfoStep.tsx` as combined Step 1 with three section headings (Personal, Business, Location)
- Ported PSGC cascading dropdowns from LocationStep.tsx with all existing behavior (parent-clears-children, blur validation, disabled states)
- Added combobox search/filter to all four PSGC dropdowns via `SearchableSelectContent` wrapper
- Dual-schema submit validation: `zodResolver(businessInfoSchema)` + manual `locationSchema.safeParse`
- Required fields marked with asterisk (*) on labels
- Red text error display below inputs (not red border)

## Task Commits

1. **Task 1: Update businessInfoSchema with fullName and streetAddress** - `c991b73` (feat)
2. **Task 2: Merge location fields into BusinessInfoStep** - `39cc430` (feat)

## Files Created/Modified
- `src/lib/validation.ts` - Added fullName (min 2, max 100) and streetAddress (min 1) to businessInfoSchema
- `src/app/apply/steps/BusinessInfoStep.tsx` - Rewritten: 3 sections, PSGC cascading, combobox dropdowns, dual-schema validation

## Decisions Made
- Kept `locationSchema` separate from `businessInfoSchema` because the store manages location as its own slice with code/name pairs
- Created `SearchableSelectContent` as a local component wrapping existing `SelectContent` rather than modifying the base Select compound component
- Search input uses `stopPropagation` on mouseDown/click to prevent the Select dropdown from closing when the user interacts with the filter
- Location validation uses manual `locationSchema.safeParse` on submit (same pattern as LocationStep.tsx) rather than trying to fit location into react-hook-form

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compiled cleanly on first attempt after both changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Step 1 (Business Info + Location) is complete and functional
- Plan 02-02 can proceed to implement Step 2 (Contact & Documents)
- `LocationStep.tsx` preserved as-is for reference
- `SearchableSelectContent` pattern available for reuse if future steps need searchable dropdowns

---

*Phase: 02-steps-1-2*
*Completed: 2026-03-22*
