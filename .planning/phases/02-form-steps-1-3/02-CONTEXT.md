# Phase 2: Form Steps 1-3 - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Three form steps that collect business information, Philippine address via cascading PSGC selects, and contact/coverage details with auto-calculated premium. Users fill out data that feeds into cover note and policy PDF generation in later phases. No document upload or payment — those are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Business Info layout
- Fields grouped by type: Personal → Business → Location
- Section labels for groups: "Personal Information", "Business Details", "Location"
- Personal group: Full Name of Assured
- Business group: Business Name, Floor Area, Nature of Business
- Location group: Street Address
- Floor Area: numeric input with 'sqm' suffix displayed inline to the right
- All inputs use same visual style — no special emphasis on Business Name
- Step title area: heading + subtitle (e.g., "Business Information" + "Tell us about your business")

### Cascading address UX
- All 4 selects are searchable dropdowns (combobox) — user can type to filter long lists like barangays
- Parent change clears all children silently — no confirmation dialog
- Data loads lazily on first open of Region dropdown — spinner shown inside dropdown while loading
- Child dropdowns disabled until parent is selected

### Nature of Business dropdown
- Flat list of all 24 categories — no Class I/Class II grouping labels
- Standard select (not searchable) — 24 items is manageable
- Class I/II classification is internal — used for premium calculation, not displayed to user

### Validation & error handling
- Errors appear on blur (when user leaves a field) — not on change, not only on submit
- Asterisk (*) on label to indicate required fields
- Error message: red text below input — no red border (keeps form clean)
- Error message text: specific (e.g., "Email is required", "Please enter a valid Philippine mobile number")

### Claude's Discretion
- Whether to show a small Class I/II indicator after Nature of Business selection (planner decides)
- Exact subtitle text for each step heading
- Whether Floor Area input uses inputMode="numeric" or type="number"
- Mobile keyboard handling for different field types
- Error animation (fade in, shake, etc.)

</decisions>

<specifics>
## Specific Ideas

- Reference project uses react-hook-form + zodResolver pattern: form defaults from store, save to store on submit
- Step component interface: `{ onNext, onBack, isFirstStep, isLastStep }` — same as Phase 1 shell components
- Each step validates before allowing Continue
- Floor area validation: numeric, > 0
- Email validation: standard email format
- Mobile number: Philippine format (+639XXXXXXXXX or 09XXXXXXXXX)
- Premium auto-calculates when Floor Area + Nature of Business are both filled — displayed in Contact & Coverage step

</specifics>

<deferred>
## Deferred Ideas

- Document upload (Business Permit, DTI/SEC, Valid ID) — Phase 3
- Cover note and billing display — Phase 3
- Payment and success page — Phase 3
- PDF generation — Phase 4

</deferred>

---

*Phase: 02-form-steps-1-3*
*Context gathered: 2026-03-21*
