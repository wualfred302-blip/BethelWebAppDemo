# Requirements: Bethel CGL Web Application

**Defined:** 2026-03-21
**Core Value:** Business owners can complete a CGL insurance application entirely online in one session and receive a valid policy document.

## v1 Requirements

### Application Flow

- [ ] **FLOW-01**: User progresses through 7 steps: Business Info → Location → Contact & Coverage → Documents → Cover Note & Billing → Payment → Success
- [ ] **FLOW-02**: User can navigate back to previous steps without losing data
- [ ] **FLOW-03**: User cannot skip ahead — each step must be completed before proceeding
- [ ] **FLOW-04**: Form data persists across page refreshes (Zustand + localStorage)
- [ ] **FLOW-05**: Progress bar shows current step, completed steps (with checkmark), and remaining steps

### Business Information (Step 1)

- [ ] **BIZ-01**: User enters Full Name of Assured (required, 2-100 characters)
- [ ] **BIZ-02**: User enters Business Name (required, 2-200 characters)
- [ ] **BIZ-03**: User enters Floor Area in sqm (required, positive number, numeric keyboard on mobile)
- [ ] **BIZ-04**: User selects Nature of Business from 24-category dropdown
- [ ] **BIZ-05**: User enters Street Address (unit/floor/building + street, required)

### Location (Step 2)

- [ ] **LOC-01**: User selects Region from dropdown (loaded from PSGC data)
- [ ] **LOC-02**: User selects Province (filtered by selected Region)
- [ ] **LOC-03**: User selects City/Municipality (filtered by selected Province)
- [ ] **LOC-04**: User selects Barangay (filtered by selected City)
- [ ] **LOC-05**: Changing a parent selection clears all child selections
- [ ] **LOC-06**: PSGC data loads from `public/philippine_full.json`

### Contact & Coverage (Step 3)

- [ ] **CONT-01**: User enters email address (validated format)
- [ ] **CONT-02**: User enters Philippine mobile number (regex: `/^(\+63|0)9\d{9}$/`)
- [ ] **CONT-03**: Limit of Liability is auto-calculated from floor area using pricing table
- [ ] **CONT-04**: Premium is calculated using Class I Gross Prem or Class II Gross Prem based on nature of business
- [ ] **CONT-05**: Class I businesses: Office, Retail, Financial Services, Education, Salon/Spa, Laundry, Printing, IT/BPO, Real Estate, Pharmacy
- [ ] **CONT-06**: Class II businesses: Restaurant, Hotel, Manufacturing, Construction, Warehouse, Healthcare, Entertainment, Transportation, Gym/Fitness, Gasoline Station, Auto Shop, Agriculture, Mining, Other

### Document Upload (Step 4)

- [ ] **DOC-01**: User uploads Business Permit (required)
- [ ] **DOC-02**: User uploads DTI Registration (sole proprietor) OR SEC Registration (corporation)
- [ ] **DOC-03**: User uploads Valid Government ID (required)
- [ ] **DOC-04**: Accepted file types: JPG, PNG, PDF
- [ ] **DOC-05**: Maximum file size: 5MB per file
- [ ] **DOC-06**: Drag-and-drop and click-to-upload both supported
- [ ] **DOC-07**: Image preview shown for JPG/PNG uploads
- [ ] **DOC-08**: User can remove and re-upload files

### Cover Note & Billing (Step 5)

- [ ] **COVER-01**: Cover note displays: control number (auto-generated), applicant name, business name, full address, nature of business, floor area, limit of liability, coverage period
- [ ] **COVER-02**: Billing invoice displays: premium amount (from pricing table), "Amount subject to final assessment" note
- [ ] **COVER-03**: 6-hour validity countdown timer displayed prominently
- [ ] **COVER-04**: Cover note PDF can be downloaded
- [ ] **COVER-05**: Legal disclaimer shown: "Any person who knowingly and with intent to defraud provides false information may face criminal prosecution."

### Payment (Step 6)

- [ ] **PAY-01**: GCash shown as primary payment option with placeholder GCash number
- [ ] **PAY-02**: Online Banking / Bank Transfer shown as secondary option with placeholder bank details
- [ ] **PAY-03**: Over the Counter shown as secondary option
- [ ] **PAY-04**: User uploads proof of payment (screenshot/photo)
- [ ] **PAY-05**: Control number displayed as payment reference
- [ ] **PAY-06**: Premium amount displayed for payment

### Success (Step 7)

- [ ] **SUCCESS-01**: Animated success checkmark displayed
- [ ] **SUCCESS-02**: "Your application has been submitted" confirmation message
- [ ] **SUCCESS-03**: E-Policy PDF can be downloaded
- [ ] **SUCCESS-04**: Bethel contact information displayed (phone, email, head office address)
- [ ] **SUCCESS-05**: Links to other Bethel products (Fire, Motor Car, Bonds, Engineering, Marine)
- [ ] **SUCCESS-06**: Link to bethelgen.com
- [ ] **SUCCESS-07**: Disclaimer shown: "By submitting this form you agree to our terms and conditions"

### PDF Generation

- [ ] **PDF-01**: Cover Note PDF includes: Bethel header text, control number, applicant details, coverage details, validity period, terms
- [ ] **PDF-02**: E-Policy PDF is a full standard CGL policy with: policy number, declarations, insuring agreements (Coverage A: Bodily Injury, Coverage B: Property Damage, Coverage C: Personal & Advertising Injury), limits of insurance, exclusions, conditions
- [ ] **PDF-03**: Policy period: 1 year from date of payment
- [ ] **PDF-04**: Generated client-side using pdf-lib

### UI & Styling

- [ ] **UI-01**: Mobile-first single-column layout (max-w-md centered)
- [ ] **UI-02**: Blue accent color (#2563EB) throughout — buttons, focus rings, progress bar, links
- [ ] **UI-03**: Inter font
- [ ] **UI-04**: Smooth page transitions using Framer Motion (slide left/right)
- [ ] **UI-05**: App header shows "Bethel" text (no logo)
- [ ] **UI-06**: Browser tab title: "Bethel CGL"

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

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FLOW-01 to FLOW-05 | Phase 1-2 | Pending |
| BIZ-01 to BIZ-05 | Phase 2 | Pending |
| LOC-01 to LOC-06 | Phase 2 | Pending |
| CONT-01 to CONT-06 | Phase 2 | Pending |
| DOC-01 to DOC-08 | Phase 3 | Pending |
| COVER-01 to COVER-05 | Phase 3 | Pending |
| PAY-01 to PAY-06 | Phase 3 | Pending |
| SUCCESS-01 to SUCCESS-07 | Phase 3 | Pending |
| PDF-01 to PDF-04 | Phase 3 | Pending |
| UI-01 to UI-06 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 after initial definition*
