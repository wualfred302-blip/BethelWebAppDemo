# Requirements: Bethel CGL Web Application

**Defined:** 2026-03-21
**Updated:** 2026-03-22 — Reworked to 4-step flow (Option A)
**Core Value:** Business owners can complete a CGL insurance application entirely online in one session and receive a valid policy document.

## v1 Requirements

### Application Flow

- [x] **FLOW-01**: User progresses through 4 steps: Business → Contact & Docs → Review & Pay → Done
- [x] **FLOW-02**: User can navigate back to previous steps without losing data
- [x] **FLOW-03**: User cannot skip ahead — each step must be completed before proceeding
- [x] **FLOW-04**: Form data persists across steps via Zustand in-memory store (no localStorage — page refresh starts fresh per user decision)
- [ ] **FLOW-05**: Progress bar shows 4 steps — current step highlighted, completed steps show checkmark, animated fill line

### Business (Step 1)

- [ ] **BIZ-01**: User enters Full Name of Assured (required, 2-100 characters)
- [ ] **BIZ-02**: User enters Business Name (required, 2-200 characters)
- [ ] **BIZ-03**: User enters Floor Area in sqm (required, positive number, numeric keyboard on mobile)
- [ ] **BIZ-04**: User selects Nature of Business from 24-category dropdown
- [ ] **BIZ-05**: User enters Street Address (unit/floor/building + street, required)

### Location (Step 1, continued)

- [ ] **LOC-01**: User selects Region from dropdown (loaded from PSGC data)
- [ ] **LOC-02**: User selects Province (filtered by selected Region)
- [ ] **LOC-03**: User selects City/Municipality (filtered by selected Province)
- [ ] **LOC-04**: User selects Barangay (filtered by selected City)
- [ ] **LOC-05**: Changing a parent selection clears all child selections
- [ ] **LOC-06**: PSGC data loads from `public/philippine_full.json`

### Contact (Step 2)

- [ ] **CONT-01**: User enters email address (validated format)
- [ ] **CONT-02**: User enters Philippine mobile number (regex: `/^(\+63|0)9\d{9}$/`)

### Documents (Step 2, continued)

- [ ] **DOC-01**: User uploads Business Permit (required)
- [ ] **DOC-02**: User uploads DTI Registration (sole proprietor) OR SEC Registration (corporation)
- [ ] **DOC-03**: User uploads Valid Government ID (required)
- [ ] **DOC-04**: Accepted file types: JPG, PNG, PDF
- [ ] **DOC-05**: Maximum file size: 5MB per file
- [ ] **DOC-06**: Drag-and-drop and click-to-upload both supported
- [ ] **DOC-07**: Image preview shown for JPG/PNG uploads
- [ ] **DOC-08**: User can remove and re-upload files

### Billing & Cover Note (Step 3)

- [ ] **BILL-01**: Cover note displays: control number (auto-generated), applicant name, business name, full address, nature of business, floor area, limit of liability, coverage period
- [ ] **BILL-02**: Billing invoice displays: premium amount (from pricing table), "Amount subject to final assessment" note
- [ ] **BILL-03**: 6-hour validity countdown timer displayed prominently
- [ ] **BILL-04**: Cover note PDF can be downloaded
- [ ] **BILL-05**: Legal disclaimer shown: "Any person who knowingly and with intent to defraud provides false information may face criminal prosecution."
- [ ] **BILL-06**: Limit of Liability is auto-calculated from floor area using pricing table
- [ ] **BILL-07**: Premium is calculated using Class I Gross Prem or Class II Gross Prem based on nature of business
- [ ] **BILL-08**: Class I businesses: Office, Retail, Financial Services, Education, Salon/Spa, Laundry, Printing, IT/BPO, Real Estate, Pharmacy
- [ ] **BILL-09**: Class II businesses: Restaurant, Hotel, Manufacturing, Construction, Warehouse, Healthcare, Entertainment, Transportation, Gym/Fitness, Gasoline Station, Auto Shop, Agriculture, Mining, Other

### Payment (Step 3, continued)

- [ ] **PAY-01**: GCash shown as primary payment option with placeholder GCash number
- [ ] **PAY-02**: Online Banking / Bank Transfer shown as secondary option with placeholder bank details
- [ ] **PAY-03**: Over the Counter shown as secondary option
- [ ] **PAY-04**: User uploads proof of payment (screenshot/photo)
- [ ] **PAY-05**: Control number displayed as payment reference
- [ ] **PAY-06**: Premium amount displayed for payment

### Done (Step 4)

- [ ] **DONE-01**: Animated success checkmark displayed
- [ ] **DONE-02**: "Your application has been submitted" confirmation message
- [ ] **DONE-03**: E-Policy PDF can be downloaded
- [ ] **DONE-04**: Bethel contact information displayed (phone, email, head office address)
- [ ] **DONE-05**: Links to other Bethel products (Fire, Motor Car, Bonds, Engineering, Marine)
- [ ] **DONE-06**: Link to bethelgen.com
- [ ] **DONE-07**: Disclaimer shown: "By submitting this form you agree to our terms and conditions"

### PDF Generation

- [ ] **PDF-01**: Cover Note PDF includes: Bethel header text, control number, applicant details, coverage details, validity period, terms
- [ ] **PDF-02**: E-Policy PDF is a full standard CGL policy with: policy number, declarations, insuring agreements (Coverage A: Bodily Injury, Coverage B: Property Damage, Coverage C: Personal & Advertising Injury), limits of insurance, exclusions, conditions
- [ ] **PDF-03**: Policy period: 1 year from date of payment
- [ ] **PDF-04**: Generated client-side using pdf-lib

### UI & Styling

- [ ] **UI-01**: Mobile-first single-column layout (max-w-md centered)
- [x] **UI-02**: Blue accent color (#2563EB) throughout — buttons, focus rings, progress bar, links
- [x] **UI-03**: Inter font
- [ ] **UI-04**: Smooth page transitions using Framer Motion (slide left/right)
- [ ] **UI-05**: App header shows "Bethel" text (no logo)
- [x] **UI-06**: Browser tab title: "Bethel CGL"

## v2 Requirements

Deferred to future release.

- **PAY-V2**: Real payment gateway integration (GCash API, bank APIs)
- **EMAIL-V2**: Email delivery of policy PDF to applicant
- **ADMIN-V2**: Admin dashboard for reviewing applications
- **AUTH-V2**: User accounts for application tracking
- **PRICING-V2**: Dynamic pricing based on real-time data

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication | Adds friction, not needed for one-time application |
| Real payment gateway | Stub only — real integration is future work |
| Email sending | PDFs downloadable on-screen |
| Admin dashboard | Separate project |
| Logo/assets | Text-only branding |

## Requirement Mapping (Old → New)

| Old ID | New ID | Change |
|--------|--------|--------|
| FLOW-01 | FLOW-01 | 7 steps → 4 steps |
| CONT-03 | BILL-06 | Coverage calc moved to Review & Pay |
| CONT-04 | BILL-07 | Premium calc moved to Review & Pay |
| CONT-05 | BILL-08 | Class I list moved to Review & Pay |
| CONT-06 | BILL-09 | Class II list moved to Review & Pay |
| COVER-01..05 | BILL-01..05 | Renamed (billing section) |
| SUCCESS-01..07 | DONE-01..07 | Renamed (done section) |

All other IDs unchanged.

## Traceability

### Phase 1: Foundation (10 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Complete |
| UI-03 | Phase 1 | Complete |
| UI-05 | Phase 1 | Pending |
| UI-06 | Phase 1 | Complete |
| FLOW-01 | Phase 1 | Needs update (4 steps) |
| FLOW-02 | Phase 1 | Complete |
| FLOW-03 | Phase 1 | Complete |
| FLOW-04 | Phase 1 | Complete |
| FLOW-05 | Phase 1 | Needs update (4 dots) |

### Phase 2: Steps 1-2 — Business + Contact & Docs (19 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| BIZ-01 | Phase 2 | Pending |
| BIZ-02 | Phase 2 | Pending |
| BIZ-03 | Phase 2 | Pending |
| BIZ-04 | Phase 2 | Pending |
| BIZ-05 | Phase 2 | Pending |
| LOC-01 | Phase 2 | Pending |
| LOC-02 | Phase 2 | Pending |
| LOC-03 | Phase 2 | Pending |
| LOC-04 | Phase 2 | Pending |
| LOC-05 | Phase 2 | Pending |
| LOC-06 | Phase 2 | Pending |
| CONT-01 | Phase 2 | Pending |
| CONT-02 | Phase 2 | Pending |
| DOC-01 | Phase 2 | Pending |
| DOC-02 | Phase 2 | Pending |
| DOC-03 | Phase 2 | Pending |
| DOC-04 | Phase 2 | Pending |
| DOC-05 | Phase 2 | Pending |
| DOC-06 | Phase 2 | Pending |
| DOC-07 | Phase 2 | Pending |
| DOC-08 | Phase 2 | Pending |

### Phase 3: Step 3 — Review & Pay (15 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| BILL-01 | Phase 3 | Pending |
| BILL-02 | Phase 3 | Pending |
| BILL-03 | Phase 3 | Pending |
| BILL-04 | Phase 3 | Pending |
| BILL-05 | Phase 3 | Pending |
| BILL-06 | Phase 3 | Pending |
| BILL-07 | Phase 3 | Pending |
| BILL-08 | Phase 3 | Pending |
| BILL-09 | Phase 3 | Pending |
| PAY-01 | Phase 3 | Pending |
| PAY-02 | Phase 3 | Pending |
| PAY-03 | Phase 3 | Pending |
| PAY-04 | Phase 3 | Pending |
| PAY-05 | Phase 3 | Pending |
| PAY-06 | Phase 3 | Pending |

### Phase 4: Step 4 — Done + PDF (11 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| DONE-01 | Phase 4 | Pending |
| DONE-02 | Phase 4 | Pending |
| DONE-03 | Phase 4 | Pending |
| DONE-04 | Phase 4 | Pending |
| DONE-05 | Phase 4 | Pending |
| DONE-06 | Phase 4 | Pending |
| DONE-07 | Phase 4 | Pending |
| PDF-01 | Phase 4 | Pending |
| PDF-02 | Phase 4 | Pending |
| PDF-03 | Phase 4 | Pending |
| PDF-04 | Phase 4 | Pending |

### Phase 5: Polish (1 requirement)

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 56 total (was 58 — CONT-03..06 become BILL-06..09, no net change in count)
- Mapped to phases: 56
- Unmapped: 0
- Orphaned: 0

---

*Requirements defined: 2026-03-21*
*Last updated: 2026-03-22 — Reworked to 4-step flow*
