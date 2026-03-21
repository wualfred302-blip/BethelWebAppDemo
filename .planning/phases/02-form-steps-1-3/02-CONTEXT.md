# Phase 2: Form Steps 1-3 — Context

**Phase:** 2 — Form Steps 1-3
**Status:** Ready for planning
**Depends on:** Phase 1 (Foundation)

---

## Locked Decisions

### Business Info Form Layout
- Fields grouped by type with section labels: Personal → Business → Location
- Section labels help users understand context without cluttering individual field labels
- Full Name of Assured is a Personal field; Business Name, Floor Area, Nature of Business are Business fields; Street Address starts the Location group

### Floor Area Input
- Numeric input with 'sqm' suffix displayed inline (input type="number" or inputMode="numeric")
- Display pattern: `[number] sqm` — suffix shows next to the value
- Required field, positive number validation

### Cascading Address (Location Step)
- Searchable dropdowns (combobox pattern) for Region → Province → City/Municipality → Barangay
- Parent selection clears all child selections **silently** (no toast, no warning)
- Data loads from `public/philippine_full.json` (PSGC data, user-provided, ~2.3MB)
- Lazy load: each dropdown loads its options on first open (not eagerly on page mount)
- Must handle the PSGC JSON structure: region → province_list → municipality_list → barangay_list

### Nature of Business
- **Flat list** of 24 categories (no grouping by Class I/II)
- Standard select/dropdown (not combobox — list is static and manageable)
- Class I / Class II classification is **internal only** — used for premium calculation, NOT displayed to user
- Class I categories: Office, Retail, Financial Services, Education, Salon/Spa, Laundry, Printing, IT/BPO, Real Estate, Pharmacy
- Class II categories: Restaurant, Hotel, Manufacturing, Construction, Warehouse, Healthcare, Entertainment, Transportation, Gym/Fitness, Gasoline Station, Auto Shop, Agriculture, Mining, Other

### Validation Pattern
- Errors shown **on blur** (not on every keystroke, not on submit only)
- Asterisk (*) on required field labels
- Red text below the input on validation error (NOT red border)
- Uses react-hook-form + Zod (already in stack from Phase 1)
- Field-level validation via `onBlur` handler with zod schema resolution

### Contact & Coverage (Step 3)
- Email: standard email format validation
- Mobile: Philippine mobile regex `/^(\+63|0)9\d{9}$/`
- Limit of Liability: auto-calculated from floor area using pricing table (class-based, lookup by floor area range)
- Premium: auto-calculated from Limit of Liability and business class (I or II)
- Both fields are display-only (user cannot edit)
- Calculation updates live as user fills in floor area and nature of business (even though those are on different steps — state is global via Zustand)

### Pricing Table
- Floor area ranges from 0-20 sqm to 901-1000 sqm (27 ranges)
- Each range has: Limit of Liability, Class I Net/Gross Prem, Class II Net/Gross Prem
- Gross Prem ≈ Net × 1.247 (24.7% markup)
- Table will be provided as a data file or inline data array

---

## Source Files from Phase 1 (Expected to Exist)

These files should exist from Phase 1 execution. If missing, Phase 2 plans must recreate them:

- `src/store/useApplicationStore.ts` — Zustand store with 7 data sections (businessInfo, location, contactCoverage, documents, coverNote, payment, success), navigation (currentStep, nextStep, prevStep, goToStep), no persistence
- `src/app/apply/page.tsx` — Wizard page with AnimatePresence slide transitions
- `src/app/apply/steps/BusinessInfoStep.tsx` — Step 1 shell
- `src/app/apply/steps/LocationStep.tsx` — Step 2 shell
- `src/app/apply/steps/ContactCoverageStep.tsx` — Step 3 shell
- `src/components/ProgressBar.tsx` — 7-dot animated progress bar
- `src/components/ui/button.tsx` — CVA button with blue-600
- `src/components/ui/input.tsx` — Labeled input with error
- `src/components/ui/label.tsx` — shadcn Label
- `src/lib/utils.ts` — cn() utility

---

## Key Reference Files

- `C:\Users\ampoy\Downloads\App Assets\philippine_full.json` — PSGC cascading address data
- `C:\Users\ampoy\Barangay Linkod Project\BarangayLinkodWebRegistration-main\` — reference codebase for patterns

---

## Deferred Ideas (DO NOT PLAN)

- Search functionality — deferred
- Dark mode — deferred
- Real payment integration — deferred
- Email delivery — deferred
- Admin dashboard — deferred
