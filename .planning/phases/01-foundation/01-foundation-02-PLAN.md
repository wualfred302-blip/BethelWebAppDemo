---
phase: 01-foundation
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/store/useApplicationStore.ts
autonomous: true
requirements:
  - FLOW-01
  - FLOW-02
  - FLOW-03
  - FLOW-04

must_haves:
  truths:
    - "Zustand store tracks currentStep (1-7) and all form data sections"
    - "Calling nextStep() increments step within bounds (max 7)"
    - "Calling prevStep() decrements step within bounds (min 1)"
    - "Calling reset() clears all data and returns to step 1"
    - "State lifecycle is managed correctly — no persistence middleware, page refresh starts fresh from Step 1, reset clears all state to initial values"
    - "Each form data section has typed interfaces and merge-style setters"
  artifacts:
    - path: "src/store/useApplicationStore.ts"
      provides: "Zustand store for 7-step wizard state"
      exports: ["useApplicationStore", "TOTAL_STEPS"]
      contains: "create<WizardState>()"
  key_links:
    - from: "src/store/useApplicationStore.ts"
      to: "all step components"
      via: "useApplicationStore() hook provides currentStep and data"
      pattern: "useApplicationStore"
---

<objective>
Create the Zustand store that manages wizard navigation and form data across all 7 steps.

Purpose: Every step component and the wizard page depend on this store for state management. It is the single source of truth.
Output: src/store/useApplicationStore.ts with typed interfaces, navigation actions, and data setters — no persistence.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/execute-plan.md
@./.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Zustand store with typed interfaces</name>
  <files>src/store/useApplicationStore.ts</files>
  <action>
    Create `src/store/useApplicationStore.ts` with the following structure.

    **Key constraints (per user decisions):**
    - NO persist middleware — use `create<WizardState>()` directly, NOT `create<WizardState>()(persist(...))`
    - 7 steps (TOTAL_STEPS = 7), indices 1-7
    - All form data typed with interfaces (no `any`)

    **Data interfaces:**
    ```typescript
    interface BusinessInfoData {
      fullName: string;
      businessName: string;
      floorArea: string;
      natureOfBusiness: string;
      streetAddress: string;
    }

    interface LocationData {
      regionCode: string;
      regionName: string;
      provinceCode: string;
      provinceName: string;
      cityCode: string;
      cityName: string;
      barangayCode: string;
      barangayName: string;
    }

    interface ContactCoverageData {
      email: string;
      mobile: string;
      limitOfLiability: string;
      premium: string;
    }

    interface DocumentsData {
      businessPermit: string | null;
      dtiSec: string | null;
      validId: string | null;
    }

    interface PaymentData {
      method: string;
      proofOfPayment: string | null;
    }
    ```

    **Store state:**
    ```typescript
    interface WizardState {
      currentStep: number;
      businessInfo: BusinessInfoData;
      location: LocationData;
      contactCoverage: ContactCoverageData;
      documents: DocumentsData;
      payment: PaymentData;
      // Actions
      nextStep: () => void;
      prevStep: () => void;
      goToStep: (step: number) => void;
      setBusinessInfo: (data: Partial<BusinessInfoData>) => void;
      setLocation: (data: Partial<LocationData>) => void;
      setContactCoverage: (data: Partial<ContactCoverageData>) => void;
      setDocuments: (data: Partial<DocumentsData>) => void;
      setPayment: (data: Partial<PaymentData>) => void;
      reset: () => void;
    }
    ```

    **Implementation details:**
    - `nextStep`: `Math.min(state.currentStep + 1, TOTAL_STEPS)`
    - `prevStep`: `Math.max(state.currentStep - 1, 1)`
    - `goToStep`: clamp to [1, TOTAL_STEPS]
    - Each setter: merge-style `{ ...state.section, ...data }`
    - `reset`: restore all data to initial empty values, set currentStep to 1
    - Export `TOTAL_STEPS = 7` constant

    Follow the exact pattern from the reference store at:
    `C:\Users\ampoy\Barangay Linkod Project\BarangayLinkodWebRegistration-main\BarangayLinkodWebRegistration-main\src\store\useRegistrationStore.ts`

    Adapt by: removing `persist` wrapper, expanding to 7 data sections, adding `goToStep`, and using Bethel's data fields.
  </action>
  <verify>Run `npm run build` — no TypeScript errors. Verify file exists at `src/store/useApplicationStore.ts` and exports `useApplicationStore` and `TOTAL_STEPS`.</verify>
  <done>Zustand store created with 7 data sections, navigation actions, merge-style setters, no persistence. Build succeeds.</done>
</task>

</tasks>

<verification>
1. `npm run build` completes without errors
2. `src/store/useApplicationStore.ts` exists
3. Store exports `useApplicationStore` and `TOTAL_STEPS`
4. Store has NO `persist` middleware import
5. `nextStep` clamps at 7, `prevStep` clamps at 1
6. `reset` clears all data to initial empty values and sets step to 1
</verification>

<success_criteria>
- src/store/useApplicationStore.ts exists with typed interfaces for all 7 step data sections
- Store created with `create<WizardState>()` — no persist middleware
- Navigation: nextStep, prevStep, goToStep (all clamped to [1, 7])
- Data setters: setBusinessInfo, setLocation, setContactCoverage, setDocuments, setPayment (merge-style)
- reset() restores all data to empty and currentStep to 1
- TOTAL_STEPS exported as 7
- Build succeeds with no TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-02-SUMMARY.md`
</output>
