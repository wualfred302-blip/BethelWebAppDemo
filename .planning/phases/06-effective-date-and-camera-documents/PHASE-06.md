# Phase 06: Effective Date + Camera-First Documents

## Phase Goal
Two UX improvements:
1. **Effective Date** — Add coverage start date field with auto-extraction from OCR
2. **Camera-First Documents** — Enable rear camera capture on mobile for document scanning

## Decision Log

### Effective Date
- **Placement**: ASSURED DETAILS section, in 2-col grid with TIN/FloorArea
- **Default**: Today (current date)
- **Constraints**: Min=today, Max=30 days out
- **OCR**: Extract from permit issue date field when available
- **Validation**: Optional (can be empty), but if filled must be within valid range
- **Design**: Native `<input type="date">` with underline styling (consistent with other fields)

### Camera-First Documents  
- **Implementation**: Single attribute `capture="environment"` on file input
- **Behavior**: Opens rear camera on mobile, file picker on desktop
- **Scope**: ScanStep.tsx only (not the documents upload step)

## Plan List

| Plan | Title | Status |
|------|-------|--------|
| 06-01 | Store + Validation + OCR | Pending |
| 06-02 | Effective Date UI | Pending |
| 06-03 | Camera-First Documents | Pending |

## Dependencies
- Plan 06-01 must be executed before Plan 06-02 (validation schema needed for form)
- Plan 06-03 is independent

## Related Files
- Store: `src/store/useApplicationStore.ts`
- Validation: `src/lib/validation.ts`
- OCR Schema: `src/lib/ocr-schema.ts`
- OCR Route: `src/app/api/extract-permit/route.ts`
- UI: `src/app/apply/steps/BusinessInfoStep.tsx`, `src/app/apply/steps/ScanStep.tsx`