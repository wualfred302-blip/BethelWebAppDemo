# 02-02 Summary

**Plan:** 02-02 — DocumentsStep + Step2Combined
**Executed:** 2026-03-22
**Status:** Done

## What was built

DocumentsStep with drag-drop file upload (3 slots) and Step2Combined wrapper combining Contact + Documents into Step 2 of the wizard.

## Files modified

- `src/store/useApplicationStore.ts` — DocumentsData fields changed from `string | null` to `File | null`
- `src/app/apply/steps/DocumentsStep.tsx` — rewrote shell into full upload form with drag-drop, click-to-browse, type/size validation, image preview, PDF filename display, remove/re-upload
- `src/app/apply/steps/Step2Combined.tsx` — new file, thin wrapper rendering ContactCoverageStep then DocumentsStep via `contactDone` state toggle
- `src/app/apply/page.tsx` — swapped ContactCoverageStep import for Step2Combined, label changed to "Contact & Docs"

## Commits

1. `feat(02-02): update DocumentsData to File and build DocumentsStep with drag-drop upload`
2. `feat(02-02): create Step2Combined wrapper and update wizard page`

## Self-check

- [x] `npx tsc --noEmit` passes
- [x] DocumentsData uses `File | null` (store interface)
- [x] DocumentsStep renders 3 upload zones (Business Permit *, DTI/SEC *, Valid Gov't ID *)
- [x] Drag-drop highlights zone on dragover, processes on drop
- [x] Click zone opens file picker with `.jpg,.jpeg,.png,.pdf` filter
- [x] JPG/PNG shows image preview via `URL.createObjectURL`, PDF shows filename + size
- [x] Wrong type shows "Only JPG, PNG, PDF allowed"; oversize shows "File must be under 5MB"
- [x] Remove button clears file and error
- [x] Step2Combined shows Contact first; after submit, shows Documents; back returns to Contact
- [x] page.tsx imports Step2Combined, label is "Contact & Docs"

## Deviations

None — implementation follows the plan exactly.
