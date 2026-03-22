# 03-02 Summary — Payment Section + Cover Note PDF

**Phase:** 03-step-3-review-pay
**Plan:** 03-02-PLAN.md
**Completed:** 2026-03-23

## One-liner

Added payment section (GCash, Online Banking, OTC), proof of payment upload zone, and client-side cover note PDF download to ReviewPayStep.

## Files Modified

| File | Change |
|------|--------|
| `src/app/apply/steps/ReviewPayStep.tsx` | Added payment section, proof upload, PDF generation |
| `package.json` | Added `pdf-lib` dependency |

## Commits

1. `feat(03-02): add payment section with GCash, Banking, OTC and proof of payment upload`
2. `feat(03-02): wire cover note PDF download with pdf-lib`

## Self-Check

- [x] GCash card shows 0917-123-4567 and Bethel General Insurance
- [x] Online Banking card shows BDO, 1234-5678-9012, Bethel General Insurance Corporation
- [x] OTC card shows "Visit nearest Bethel branch"
- [x] All three payment methods visible at once (no click-to-reveal)
- [x] Control number displayed as payment reference
- [x] Premium amount displayed with formatPHP
- [x] Upload zone accepts drag-drop and click (JPG, PNG, PDF, max 5MB)
- [x] Image preview for JPG/PNG, filename for PDF
- [x] Remove button clears uploaded file
- [x] Continue works with or without proof upload
- [x] Cover note PDF generated client-side with pdf-lib
- [x] PDF contains header, control number, applicant, coverage, billing, disclaimer
- [x] Download button shows "Generating..." while PDF is being created
- [x] PDF filename: CoverNote-{controlNumber}.pdf
- [x] `npx tsc --noEmit` — compiles cleanly

## Deviations

None. Implementation follows plan exactly.
