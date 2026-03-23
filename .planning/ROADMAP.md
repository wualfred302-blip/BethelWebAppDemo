# Roadmap: Bethel CGL Web Application

**Created:** 2026-03-21
**Updated:** 2026-03-23 — Added Phase 6 (UI fixes & 4-to-3 wizard merge)
**Depth:** Standard
**Total v1 Requirements:** 56
**Phases:** 6

---

## Flow Overview (3 Steps)

| Step | Name | Contents |
|------|------|----------|
| 1 | **Business** | Name, TIN, Nature of Business, Floor Area, Street Address, Location (Region→Province→City→Barangay), Phone, Email |
| 2 | **Documents** | Upload Business Permit, DTI/SEC, Valid ID |
| 3 | **Review & Pay** | Summary, premium calculated, billing invoice, cover note PDF, payment method, proof of payment upload, success confirmation

---

## Phases

- [ ] **Phase 1: Foundation** — Project setup, UI shell, wizard scaffold, state management
- [ ] **Phase 2: Steps 1-2** — Business info, cascading address, contact, document upload
- [ ] **Phase 3: Step 3** — Review & Pay (cover note, billing calculation, payment)
- [ ] **Phase 4: Step 4 + PDF** — Done page, cover note PDF, e-policy PDF
- [ ] **Phase 5: Polish** — Animations, mobile refinement, edge cases
- [x] **Phase 6: UI fixes & 4-to-3 wizard merge** — Darken street address, clean PSGC region names, merge contact into Step 1

---

## Phase Details

### Phase 1: Foundation
**Goal**: A working Next.js app with the 4-step wizard shell, progress bar (4 dots), navigation logic, and in-memory state management (no persistence) — no form content yet, just the skeleton that works on mobile.
**Depends on**: Nothing
**Requirements**: UI-01, UI-02, UI-03, UI-05, UI-06, FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05
**Success Criteria** (observable user behaviors):
1. User sees exactly 4 dots in the progress bar — completed dots show blue fill + white checkmark, current dot is larger (no ring)
2. User can click Continue to advance through all 4 steps with horizontal slide transitions (~200ms, ease-out, no bounce)
3. User can click Back to return to previous steps with reverse slide animation
4. User can press browser back button to navigate between wizard steps without leaving /apply
5. User can press Enter to advance placeholder steps (steps 3-4)
6. No Start Over button is visible on any step
7. URL stays at /apply during all navigation
**Plans**: 3 plans
- [ ] 01-01-PLAN.md — Wizard page restructure + placeholder steps
- [ ] 01-02-PLAN.md — ProgressBar visual fix (remove ring)
- [ ] 01-03-PLAN.md — End-to-end verification checkpoint

### Phase 2: Steps 1-2 — Business + Contact & Docs
**Goal**: Users can fill out business information with cascading PSGC address, enter contact details, and upload documents — all validated before proceeding.
**Depends on**: Phase 1
**Requirements**: BIZ-01, BIZ-02, BIZ-03, BIZ-04, BIZ-05, LOC-01, LOC-02, LOC-03, LOC-04, LOC-05, LOC-06, CONT-01, CONT-02, DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, DOC-07, DOC-08
**Success Criteria** (what must be TRUE):
1. User can enter Full Name of Assured, Business Name, Floor Area (numeric keyboard on mobile), select Nature of Business from 24-category dropdown, and enter Street Address
2. Region → Province → City/Municipality → Barangay cascading selects load from PSGC data and filter correctly
3. Changing a parent selection (e.g. Region) clears all child selections (Province, City, Barangay)
4. User can enter email address and Philippine mobile number with format validation
5. User can upload Business Permit, DTI/SEC, and Valid ID via drag-and-drop or click
6. Uploaded files validated for type (JPG, PNG, PDF) and size (max 5MB) with clear error messages
7. User can remove and re-upload files
8. All Step 1-2 fields validate before user can proceed — required fields show inline errors
**Plans**: 2 plans
- [ ] 02-steps-1-2/02-01-PLAN.md — Merge Location into BusinessInfoStep (searchable combobox cascading PSGC dropdowns)
- [ ] 02-steps-1-2/02-02-PLAN.md — Build DocumentsStep with drag-drop upload + combine into Step 2

### Phase 3: Step 3 — Review & Pay
**Goal**: Users see a summary of their application, the calculated premium and billing, can download a cover note PDF, select a payment method, and upload proof of payment.
**Depends on**: Phase 2
**Requirements**: BILL-01, BILL-02, BILL-03, BILL-04, BILL-05, BILL-06, BILL-07, BILL-08, BILL-09, PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06
**Success Criteria** (what must be TRUE):
1. Cover note page displays control number, applicant details, coverage period, 6-hour countdown timer
2. Billing invoice shows premium amount (auto-calculated from floor area and business class I/II)
3. Legal disclaimer displayed on cover note
4. Cover note PDF downloadable
5. User can select payment method (GCash primary, Online Banking, Over the Counter)
6. User can upload proof of payment
7. Control number displayed as payment reference
**Plans**: TBD

### Phase 4: Step 4 — Done + PDF Generation
**Goal**: Success page with confirmation, downloadable e-policy PDF, Bethel contact info, and links to other products. All PDFs generated client-side.
**Depends on**: Phase 3
**Requirements**: DONE-01, DONE-02, DONE-03, DONE-04, DONE-05, DONE-06, DONE-07, PDF-01, PDF-02, PDF-03, PDF-04
**Success Criteria** (what must be TRUE):
1. Animated success checkmark displayed
2. "Your application has been submitted" confirmation message
3. E-Policy PDF downloadable (full CGL policy with declarations, insuring agreements, exclusions, conditions)
4. Bethel contact info displayed (phone, email, address)
5. Links to other Bethel products (Fire, Motor Car, Bonds, Engineering, Marine)
6. Cover Note PDF includes Bethel header, control number, applicant details, coverage, validity
7. PDFs generated client-side using pdf-lib
**Plans**: TBD

### Phase 5: Polish
**Goal**: The application feels smooth and professional on mobile — page transitions animate, edge cases are handled, and the overall experience is production-presentable.
**Depends on**: Phase 4
**Requirements**: UI-04
**Success Criteria** (what must be TRUE):
1. Page transitions animate smoothly with Framer Motion — slides left when advancing, slides right when going back
2. App handles edge cases gracefully: long names in PDFs, PSGC data load failure, localStorage quota exceeded, empty dropdown states
**Plans**: TBD

### Phase 6: UI fixes & 4-to-3 step wizard merge
**Goal**: Three visual/architectural fixes: (1) darken the street address textarea to match surrounding input shades, (2) use original PSGC region names sorted alphabetically, (3) merge phone/email fields into Step 1 and reduce the wizard from 4 steps to 3.
**Depends on**: Phase 1
**Requirements**: FLOW-01, FLOW-05, BIZ-05, LOC-01, CONT-01, CONT-02
**Success Criteria** (what must be TRUE):
1. Street address textarea uses the same background shade as the other form inputs (no visual break)
2. Region dropdown shows original PSGC names (NCR, CAR, BARMM, REGION I, etc.) sorted alphabetically
3. Phone and Email fields appear in Step 1 (Business) below the Location section
4. Step 2 is Documents only (no contact sub-step)
5. Wizard has exactly 3 steps: Business → Documents → Review & Pay
6. Progress bar shows 3 segments, TOTAL_STEPS = 3
7. All existing validation continues to work (phone regex, email format, required fields)
**Plans**: 1 plan
- [x] 06-01-PLAN.md — Implement all 3 UI fixes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Planned | - |
| 2. Steps 1-2 | 0/2 | Planned | - |
| 3. Step 3 | 0/0 | Not started | - |
| 4. Step 4 + PDF | 0/0 | Not started | - |
| 5. Polish | 0/0 | Not started | - |
| 6. UI fixes & merge | 1/1 | Complete | ✓ |

---

## Coverage Map

```
Phase 1 (Foundation):     UI-01, UI-02, UI-03, UI-05, UI-06, FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05 (10)
Phase 2 (Steps 1-2):     BIZ-01..BIZ-05, LOC-01..LOC-06, CONT-01..CONT-02, DOC-01..DOC-08 (21)
Phase 3 (Step 3):         BILL-01..BILL-09, PAY-01..PAY-06 (15)
Phase 4 (Step 4 + PDF):   DONE-01..DONE-07, PDF-01..PDF-04 (11)
Phase 5 (Polish):         UI-04 (1)
Phase 6 (UI fixes):       FLOW-01, FLOW-05, BIZ-05, LOC-01, CONT-01, CONT-02 (6)

Total: 58/58 v1 requirements mapped ✓
```

---

*Last updated: 2026-03-22 — Reworked to 4-step flow (Option A)*
