# Architecture Research: Bethel CGL Web Application

## Component Architecture

### Page Structure
```
/apply (page.tsx)
├── ProgressBar component
├── Step content (animated via Framer Motion)
│   ├── BusinessInfoStep
│   ├── LocationStep
│   ├── ContactCoverageStep
│   ├── DocumentsStep
│   ├── CoverNoteStep
│   ├── PaymentStep
│   └── SuccessStep
└── Navigation buttons (Back / Continue)
```

### Data Flow
```
User Input → react-hook-form → Zod Validation → Zustand Store (persisted)
                                                     ↓
                                              localStorage
                                                     ↓
                                              All steps read from store
                                                     ↓
                                              PDF Generation (pdf-lib)
                                                     ↓
                                              Download / Display
```

### State Management Pattern
```typescript
useApplicationStore (Zustand + persist)
├── businessInfo: { fullName, businessName, floorArea, natureOfBusiness, streetAddress }
├── location: { regionCode, regionName, provinceCode, provinceName, cityCode, cityName, barangayCode, barangayName }
├── contactCoverage: { email, mobile, limitOfLiability }
├── documents: { businessPermit, dtiSec, validId }
├── payment: { method, proofOfPayment }
├── currentStep: number (0-6)
├── coverNote: { controlNumber, generatedAt, validUntil }
└── actions: setBusinessInfo, setLocation, setContactCoverage, setDocuments, setPayment, setCurrentStep, setCoverNote, reset
```

### Form Validation Architecture
Each step has a Zod schema:
```
businessInfoSchema → BusinessInfoStep
locationSchema → LocationStep
contactCoverageSchema → ContactCoverageStep
documentsSchema → DocumentsStep
(no schema for CoverNote, Payment, Success — display only)
```

Steps 1-3 use react-hook-form + zodResolver.
Steps 4-7 use manual validation (file uploads don't work well with react-hook-form).

## Build Order (Dependency-Aware)

1. **UI Components** (Button, Input, Select) — everything depends on these
2. **ProgressBar** — visual step indicator, no dependencies
3. **PSGC Data Loader** — cascading selects need this
4. **Zustand Store** — all steps depend on state
5. **Validation Schemas** — form steps depend on these
6. **Step Components** (1-7) — the core application
7. **PDF Generator** — cover note and policy generation
8. **Multi-step Page** — wires everything together

## Key Patterns (from reference project)

### Multi-step wizard pattern
- `currentStep` in Zustand store drives which step renders
- `onNext` increments step, `onBack` decrements
- Framer Motion `AnimatePresence` wraps step content
- Slide direction: forward = from right, backward = from left

### Form step pattern
```tsx
const form = useForm<SchemaType>({
  resolver: zodResolver(schema),
  defaultValues: store.data,
});

const onSubmit = (data) => {
  store.setStepData(data);
  store.setCurrentStep(store.currentStep + 1);
};
```

### File upload pattern
- Drag-and-drop zone with dashed border
- Convert file to base64 data URL on select
- Store base64 string in Zustand
- Show preview for images, filename for documents
- Remove button to clear

### Cascading select pattern
```tsx
// Region → Province → City → Barangay
// Each select is disabled until parent is selected
// Options filter based on parent selection
```

## PDF Structure

### Cover Note PDF
- Bethel header (text-based, no logo)
- Control number (generated)
- Applicant details (name, business, address)
- Coverage details (nature of business, floor area, limit of liability)
- Validity period (generated time + 6 hours)
- Terms and conditions (standard CGL terms)

### E-Policy PDF
- Policy number (generated)
- Declarations section (insured details, period, premises)
- Insuring Agreements (Coverage A: BI, Coverage B: PD, Coverage C: PI)
- Limits of Insurance
- Exclusions
- Conditions
- Signature block

---
*Research conducted: 2026-03-21*
