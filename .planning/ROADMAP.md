# Roadmap: Bethel CGL Web Application

**Created:** 2026-03-21
**Depth:** Standard
**Total v1 Requirements:** 58
**Phases:** 5

---

## Phases

- [ ] **Phase 1: Foundation** — Project setup, UI shell, wizard scaffold, state management
- [ ] **Phase 2: Form Steps 1-3** — Business info, cascading address, contact & coverage
- [ ] **Phase 3: Form Steps 4-7** — Documents, cover note, payment, success page
- [ ] **Phase 4: PDF Generation** — Cover note PDF and e-policy PDF
- [ ] **Phase 5: Polish** — Animations, mobile refinement, edge cases

---

## Phase Details

### Phase 1: Foundation
**Goal**: A working Next.js app with the wizard shell, progress bar, navigation logic, and in-memory state management (no persistence) — no form content yet, just the skeleton that works on mobile.
**Depends on**: Nothing
**Requirements**: UI-01, UI-02, UI-03, UI-05, UI-06, FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05
**Success Criteria** (what must be TRUE):
1. App loads on mobile viewport (max-w-md centered, single-column layout)
2. Browser tab says "Bethel CGL" — branding present via document title
3. Progress bar displays 7 dots at top — current step highlighted in blue (#2563EB), completed steps show checkmark, animated fill line
4. User can navigate back to a previous step without losing entered data
5. User cannot skip ahead — Continue button is disabled until current step is valid
6. State lifecycle managed correctly — no persistence middleware, page refresh starts fresh from Step 1, Start Over clears all state
7. Steps slide horizontally (right on forward, left on back, ~250ms spring animation)
**Plans**: 4 plans
- [x] 01-foundation-01-PLAN.md — Project scaffold & setup
- [x] 01-foundation-02-PLAN.md — Zustand store (no persistence)
- [x] 01-foundation-03-PLAN.md — ProgressBar + wizard page + step shells
- [ ] 01-foundation-04-PLAN.md — Human verification checkpoint
- [ ] 01-foundation-04-PLAN.md — Human verification checkpoint

### Phase 2: Form Steps 1-3
**Goal**: Users can fill out business information, select their Philippine address via cascading PSGC dropdowns, enter contact details, and see auto-calculated coverage and premium.
**Depends on**: Phase 1
**Requirements**: BIZ-01, BIZ-02, BIZ-03, BIZ-04, BIZ-05, LOC-01, LOC-02, LOC-03, LOC-04, LOC-05, LOC-06, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06
**Success Criteria** (what must be TRUE):
1. User can enter Full Name of Assured, Business Name, Floor Area (numeric keyboard on mobile), select Nature of Business from 24-category dropdown, and enter Street Address
2. Region → Province → City/Municipality → Barangay cascading selects load from PSGC data and filter correctly
3. Changing a parent selection (e.g. Region) clears all child selections (Province, City, Barangay)
4. User can enter email address and Philippine mobile number with format validation
5. Limit of Liability and Premium auto-calculate based on floor area and nature of business classification (Class I / Class II)
6. All Step 1-3 fields validate before user can proceed — required fields show inline errors
**Plans**: 6 plans
- [x] 02-form-steps-1-3/02-01-PLAN.md — Zustand store update, Zod schemas, PSGC data utility, pricing table
- [x] 02-form-steps-1-3/02-02-PLAN.md — Select + Input UI components (with suffix support)
- [x] 02-form-steps-1-3/02-03-PLAN.md — BusinessInfoStep form (4 fields, blur validation)
- [x] 02-form-steps-1-3/02-04-PLAN.md — LocationStep cascading PSGC dropdowns
- [x] 02-form-steps-1-3/02-05-PLAN.md — ContactCoverageStep + auto-calculated coverage/premium
- [ ] 02-form-steps-1-3/02-06-PLAN.md — Wizard page integration + human verification

### Phase 3: Form Steps 4-7
**Goal**: Users can upload documents, review a cover note with billing, select a payment method and upload proof, then reach a success confirmation page.
**Depends on**: Phase 2
**Requirements**: DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, DOC-07, DOC-08, COVER-01, COVER-02, COVER-03, COVER-04, COVER-05, PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, SUCCESS-01, SUCCESS-02, SUCCESS-03, SUCCESS-04, SUCCESS-05, SUCCESS-06, SUCCESS-07
**Success Criteria** (what must be TRUE):
1. User can upload Business Permit, DTI/SEC Registration, and Valid Government ID via drag-and-drop or click, with image preview for JPG/PNG
2. Cover note page displays control number, applicant details, coverage period, 6-hour countdown timer, billing invoice with premium amount, legal disclaimer, and a download button for the cover note PDF
3. User can select a payment method (GCash, Online Banking, Over the Counter), view placeholder payment details, and upload proof of payment
4. Success page shows animated checkmark, "Your application has been submitted" message, downloadable e-policy PDF, Bethel contact info, links to other products, and terms disclaimer
5. Uploaded files are validated for type (JPG, PNG, PDF) and size (max 5MB) with clear error messages on rejection
6. User can remove and re-upload files at any time before submission
**Plans**: TBD

### Phase 4: PDF Generation
**Goal**: The app generates two downloadable PDFs — a Cover Note with control number and validity period, and a full Electronic CGL Policy document — using client-side pdf-lib.
**Depends on**: Phase 3
**Requirements**: PDF-01, PDF-02, PDF-03, PDF-04
**Success Criteria** (what must be TRUE):
1. Cover Note PDF downloads with Bethel header text, control number, applicant name, business name, full address, nature of business, floor area, limit of liability, coverage period, and validity terms
2. E-Policy PDF downloads as a complete CGL policy with policy number, declarations section, insuring agreements (Coverage A: Bodily Injury, Coverage B: Property Damage, Coverage C: Personal & Advertising Injury), limits of insurance, exclusions, and conditions
3. Policy period shows 1 year from date of payment
4. PDFs generate client-side in the browser with no server calls — using pdf-lib with Helvetica built-in fonts
**Plans**: TBD

### Phase 5: Polish
**Goal**: The application feels smooth and professional on mobile — page transitions animate, edge cases are handled, and the overall experience is production-presentable.
**Depends on**: Phase 4
**Requirements**: UI-04, SUCCESS-01
**Success Criteria** (what must be TRUE):
1. Page transitions animate smoothly with Framer Motion — slides left when advancing, slides right when going back
2. App handles edge cases gracefully: long names in PDFs, PSGC data load failure, localStorage quota exceeded, empty dropdown states
3. Success page shows a polished animated checkmark on submission
4. All form inputs use appropriate mobile keyboards (numeric for floor area, tel for phone, email for email)
5. File upload rejects oversized files (>5MB) with a clear, non-intrusive error message before any data is stored
**Plans**: TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/4 | In progress | - |
| 2. Form Steps 1-3 | 5/6 | In progress | - |
| 3. Form Steps 4-7 | 0/0 | Not started | - |
| 4. PDF Generation | 0/0 | Not started | - |
| 5. Polish | 0/0 | Not started | - |

---

## Coverage Map

```
Phase 1 (Foundation):     UI-01, UI-02, UI-03, UI-05, UI-06, FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05 (10)
Phase 2 (Steps 1-3):     BIZ-01..BIZ-05, LOC-01..LOC-06, CONT-01..CONT-06 (17)
Phase 3 (Steps 4-7):     DOC-01..DOC-08, COVER-01..COVER-05, PAY-01..PAY-06, SUCCESS-01..SUCCESS-07 (26)
Phase 4 (PDF):            PDF-01..PDF-04 (4)
Phase 5 (Polish):         UI-04, SUCCESS-01 — note: SUCCESS-01 appears in both Phase 3 and 5 (1 unique)

Total: 58/58 v1 requirements mapped ✓
```

**Note on SUCCESS-01:** The animated success checkmark is a success page element (Phase 3) but its polish/animation quality is a Phase 5 concern. It is assigned to Phase 3 as the primary delivery phase with Phase 5 refining the animation.

---

*Last updated: 2026-03-21*
