# Phase 3: Review & Pay — Context

**Gathered:** 2026-03-22
**Status:** Ready for planning
**Depends on:** Phase 2 (Steps 1-2)

<domain>
## Phase Boundary

Users see a summary of their application with auto-calculated premium and billing, can download a cover note PDF, view payment instructions (GCash, Online Banking, OTC), and upload proof of payment. This is the review and payment capture step — the user's final action before reaching the Done page. PDF generation and the Done page are Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Premium Calculation
- **D-01:** Pricing table is a hardcoded TypeScript constant array — 27 floor area ranges with Limit of Liability, Class I Net/Gross Prem, Class II Net/Gross Prem
- **D-02:** Class I/II determined automatically from natureOfBusiness — internal mapping, NOT shown to user
- **D-03:** Billing invoice shows Gross Premium as the payable amount (includes VAT and taxes)
- **D-04:** Limit of Liability pulled directly from pricing table by floor area range
- **D-05:** Premium and limit update automatically when user enters Step 3 (reads from Zustand store: businessInfo.floorArea and businessInfo.natureOfBusiness)

### Nature of Business → Class Mapping

**Class I (lower risk):**
- Retail Trade, Wholesale Trade, Professional Services, Education / Training, Information Technology, Financial Services, Real Estate, Printing / Publishing, Personal Services, Security Services

**Class II (higher risk):**
- Food Service / Restaurant, Manufacturing, Construction, Transportation / Logistics, Healthcare / Medical, Agriculture / Farming, Fishing / Aquaculture, Mining / Quarrying, Tourism / Hospitality, Entertainment / Recreation, Repair / Maintenance, Cleaning / Sanitation, Import / Export, Other

### Cover Note Display
- **D-06:** Single scrollable card showing all details: control number, applicant name, business name, full address (street + barangay + city + province), nature of business, floor area, limit of liability, coverage period, premium amount, legal disclaimer
- **D-07:** Static expiry time displayed as "Valid until HH:MM PM" — computed as current time + 6 hours when user enters Step 3
- **D-08:** Control number format: `CGL-YYYYMMDD-XXXX` (date-based + random 4-digit suffix) — unique per application
- **D-09:** Legal disclaimer shown on screen below cover card AND included in the PDF

### Payment Method
- **D-10:** GCash displayed as prominent primary payment slot at top with placeholder number (0917-XXX-XXXX) and account name ("Bethel General Insurance")
- **D-11:** Online Banking shown with placeholder bank details (BDO, account number, account name)
- **D-12:** Over the Counter shown with "Visit nearest Bethel branch" instruction
- **D-13:** All three payment methods visible at once — no click-to-reveal
- **D-14:** Proof of payment upload uses same UploadZone pattern as Step 2 documents (drag-drop, JPG/PNG/PDF, max 5MB, image preview)
- **D-15:** Control number doubles as the payment reference — same number shown in cover note and payment section
- **D-16:** Continue button always enabled — user can proceed to Done without uploading proof of payment

### Page Layout
- **D-17:** Single scrollable page: cover note card → Download PDF button → payment section (all 3 methods) → proof of payment upload → Back/Continue buttons
- **D-18:** "Download Cover Note PDF" button placed directly below cover note card
- **D-19:** Back button returns to Step 2 (Contact & Docs) — no warning, data preserved
- **D-20:** Continue button advances to Step 4 (Done)
- **D-21:** Layout: max-w-md mx-auto space-y-6 (consistent with Steps 1-2)

### Agent's Discretion
- Exact control number random suffix generation method
- Placeholder payment numbers (GCash number, bank account)
- Cover note card styling (border, shadow, background color)
- How to format the expiry time (12-hour vs 24-hour, timezone handling)
- Upload zone label text for proof of payment

</decisions>

<canonical_refs>
## Canonical References

### Requirements (Phase 3 scope)
- `.planning/REQUIREMENTS.md` §Billing & Cover Note — BILL-01 through BILL-09
- `.planning/REQUIREMENTS.md` §Payment — PAY-01 through PAY-06

### Pricing Data
- Pricing table (27 ranges) — pasted by user, to be hardcoded in `src/lib/pricing.ts` or similar

### Reference Stack
- `C:\Users\ampoy\Barangay Linkod Project\BarangayLinkodWebRegistration-main\` — reference codebase for patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/store/useApplicationStore.ts` — Zustand store with businessInfo (fullName, businessName, tin, floorArea, natureOfBusiness, streetAddress), location, contactCoverage, documents, payment state. All data available for cover note summary.
- `src/components/ui/button.tsx` — CVA-based Button with primary (#2563EB) and outline variants
- `src/components/ui/input.tsx` — Input with label, error, icon, suffix support
- `src/app/apply/steps/DocumentsStep.tsx` — UploadZone pattern (drag-drop, file validation, image preview, remove button) — reusable for proof of payment upload
- `src/lib/validation.ts` — Zod schemas, validation patterns
- `src/app/apply/steps/ReviewPayStep.tsx` — Current placeholder shell (will be rewritten)

### Established Patterns
- react-hook-form + zodResolver for form validation (mode: onBlur)
- Blur validation with red text below inputs (NOT red border)
- Asterisk (*) on required field labels
- max-w-md mx-auto space-y-6 layout
- Section headings separate field groups
- Back/Continue buttons at bottom (flex-1, gap-3)
- PDF generation: pdf-lib (in stack, not yet used)

### Integration Points
- ReviewPayStep receives onNext/onBack/isFirstStep/isLastStep props from page.tsx
- Store has payment state: { method: string, proofOfPayment: string | null }
- PaymentData.proofOfPayment is currently `string | null` — may need to change to `File | null` (like DocumentsData) for consistency
- No PDF utility exists yet — needs to be created in Phase 3 (cover note PDF) or Phase 4 (e-policy PDF)

</code_context>

<specifics>
## Specific Ideas

- Pricing table as a const array in a dedicated `src/lib/pricing.ts` file — clean separation from UI
- `lookupPremium(floorAreaSqM: string, natureOfBusiness: string)` function that finds the matching range row and returns { limitOfLiability, grossPremium, netPremium, class }
- Cover note card should feel like a real insurance document — formal, structured, white background with subtle border
- Proof of payment upload can reuse the exact UploadZone pattern from DocumentsStep (inline, per-slot)
- PDF generation with pdf-lib: start with cover note PDF (Phase 3) since user needs to download it here. E-policy PDF can be Phase 4.

</specifics>

<deferred>
## Deferred Ideas

- Real payment gateway integration (GCash API, bank APIs) — v2 requirement
- E-Policy PDF generation — Phase 4
- Done page with success checkmark, e-policy download, Bethel contact info — Phase 4
- Dynamic pricing based on real-time data — v2 requirement

</deferred>

---

*Phase: 03-step-3-review-pay*
*Context gathered: 2026-03-22*
