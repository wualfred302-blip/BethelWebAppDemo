# Phase 2: Steps 1-2 — Context

**Gathered:** 2026-03-22
**Status:** Ready for planning
**Depends on:** Phase 1 (Foundation)

<domain>
## Phase Boundary

Users can fill out business information with cascading PSGC address, enter contact details, and upload documents — all validated before proceeding. This phase delivers the data entry part of the 4-step wizard. The Review & Pay and Done steps are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Business Info form (Step 1)
- Fields grouped by type with section labels: Personal → Business → Location
- Full Name of Assured is a Personal field
- Business Name, TIN, Floor Area, Nature of Business are Business fields
- Street Address is a Location field
- Floor Area: numeric input with 'sqm' suffix displayed inline
- Nature of Business: flat list of 24 categories, standard select/dropdown
- Class I / Class II classification is internal only — NOT shown to user

### Cascading Address (Step 1, continued)
- Region → Province → City/Municipality → Barangay
- Searchable dropdowns (combobox pattern)
- Parent selection clears all child selections silently (no toast, no warning)
- Data loaded from `public/philippine_full.json` (PSGC data)
- Lazy load: each dropdown loads options on first open

### Contact fields (Step 2)
- Email: standard email format validation
- Phone: Philippine mobile regex `/^(\+63|0)9\d{9}$/`
- Just data collection — no coverage/premium calculation (moves to Phase 3)

### Document Upload (Step 2, continued)
- 3 uploads: Business Permit, DTI/SEC Registration, Valid Government ID
- Business Permit and Valid ID are required; DTI/SEC is required (pick one)
- Accepted types: JPG, PNG, PDF
- Max size: 5MB per file
- Drag-and-drop AND click-to-upload both supported
- Image preview for JPG/PNG uploads
- User can remove and re-upload files at any time
- File state stored in Zustand as base64 strings or file references

### Validation pattern
- Errors shown on blur (not on every keystroke, not on submit only)
- Asterisk (*) on required field labels
- Red text below the input on validation error (NOT red border)
- Uses react-hook-form + Zod (already in stack from Phase 1)
- Field-level validation via onBlur handler with zod schema resolution

### Step layout
- max-w-md mx-auto space-y-6
- Section headings separate field groups
- Back/Continue buttons at bottom of each step
- Step 2 has Continue even though it's not the last step (goes to Phase 3's Review & Pay)

### Claude's Discretion
- File upload UI component design (drag-drop zone styling, preview layout)
- How to store uploaded files in Zustand (base64 vs File object vs temp URL)
- Error handling for oversized or wrong-type files
- Whether DTI/SEC upload is a single field with a type selector or two separate fields
- Placeholder text and empty states for dropdowns

</decisions>

<specifics>
## Specific Ideas

- Reference project uses react-hook-form + zodResolver pattern for form validation
- Reference project LocationStep: cascading PSGC dropdowns with useMemo for filtered options, useEffect for lazy data loading
- Input component already has suffix support ('sqm' display)
- Select component already built (standalone compound, no shadcn, outside-click dismiss)
- File upload: consider a reusable UploadZone component that accepts drag-drop + click

</specifics>

<deferred>
## Deferred Ideas

- Coverage/premium calculation — Phase 3 (Review & Pay)
- Cover note display — Phase 3
- Payment flow — Phase 3
- Success page — Phase 4
- PDF generation — Phase 4

</deferred>

---

*Phase: 02-steps-1-2*
*Context gathered: 2026-03-22*
