---
phase: 01-foundation
plan: 03
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/components/ProgressBar.tsx
  - src/app/apply/page.tsx
  - src/app/apply/steps/BusinessInfoStep.tsx
  - src/app/apply/steps/LocationStep.tsx
  - src/app/apply/steps/ContactCoverageStep.tsx
  - src/app/apply/steps/DocumentsStep.tsx
  - src/app/apply/steps/CoverNoteStep.tsx
  - src/app/apply/steps/PaymentStep.tsx
  - src/app/apply/steps/SuccessStep.tsx
autonomous: true
requirements:
  - UI-01
  - UI-02
  - UI-05
  - FLOW-05

must_haves:
  truths:
    - "Progress bar shows 7 dots at the top of every step"
    - "Completed steps show a blue filled dot with a Check icon"
    - "Current step shows a blue ring around the dot (not filled)"
    - "Pending steps show a grey dot"
    - "An animated blue line connects completed dots, filling as steps complete"
    - "Progress bar is display-only — not clickable for navigation"
    - "Page layout is max-w-md centered, single-column, mobile-first"
    - "No header bar — progress bar sits at the very top of the page (brand identity present via 'Bethel CGL' browser tab title from Plan 01)"
    - "Steps slide horizontally: right on forward, left on back, spring animation ~250ms"
    - "7 step shell components exist, each with Back/Continue navigation buttons"
  artifacts:
    - path: "src/components/ProgressBar.tsx"
      provides: "7-dot animated progress bar with fill line"
      exports: ["ProgressBar"]
    - path: "src/app/apply/page.tsx"
      provides: "Wizard page driving step rendering with AnimatePresence transitions"
    - path: "src/app/apply/steps/BusinessInfoStep.tsx"
      provides: "Step 1 shell"
    - path: "src/app/apply/steps/LocationStep.tsx"
      provides: "Step 2 shell"
    - path: "src/app/apply/steps/ContactCoverageStep.tsx"
      provides: "Step 3 shell"
    - path: "src/app/apply/steps/DocumentsStep.tsx"
      provides: "Step 4 shell"
    - path: "src/app/apply/steps/CoverNoteStep.tsx"
      provides: "Step 5 shell"
    - path: "src/app/apply/steps/PaymentStep.tsx"
      provides: "Step 6 shell"
    - path: "src/app/apply/steps/SuccessStep.tsx"
      provides: "Step 7 shell"
  key_links:
    - from: "src/app/apply/page.tsx"
      to: "src/components/ProgressBar.tsx"
      via: "imports ProgressBar and renders at top of wizard"
      pattern: "import.*ProgressBar"
    - from: "src/app/apply/page.tsx"
      to: "src/store/useApplicationStore.ts"
      via: "reads currentStep, calls nextStep/prevStep/reset"
      pattern: "useApplicationStore"
    - from: "src/app/apply/page.tsx"
      to: "src/app/apply/steps/*.tsx"
      via: "maps step registry array to render current step component"
      pattern: "import.*Step"
---

<objective>
Create the ProgressBar component and wizard page with animated step transitions, navigation buttons, and 7 placeholder step shells.

Purpose: This is the user-facing skeleton — the wizard shell that all form content plugs into in later phases. Combined with Plan 02's store, it delivers the complete Phase 1 experience.
Output: ProgressBar with 7 animated dots, /apply page with Framer Motion slide transitions, and 7 step shell components with Back/Continue navigation.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/execute-plan.md
@./.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

@.planning/phases/01-foundation/01-foundation-02-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create ProgressBar component</name>
  <files>src/components/ProgressBar.tsx</files>
  <action>
    Create `src/components/ProgressBar.tsx` as a `'use client'` component.

    **Spec:**
    - 7 dots in a row, evenly spaced across full width
    - Background line: full width, zinc-200, 0.5px height, centered vertically
    - Animated fill line: from left, blue-600 (`#2563EB`), width animates with Framer Motion based on `(currentStep - 1) / 6 * 100%`
    - Each dot: `h-2.5 w-2.5 rounded-full`
    - Completed (step < currentStep): blue-600 bg, contains Check icon from lucide-react (h-2 w-2, white, strokeWidth 3)
    - Current (step === currentStep): blue-600 bg with ring/border — use `ring-2 ring-blue-600 ring-offset-2` and scale to 1.3 via Framer Motion
    - Pending (step > currentStep): zinc-400 bg (`#a1a1aa`)
    - NO labels — dots only (per user decision)
    - NO onClick handler — display only (per user decision)
    - Props: `currentStep: number`, optional `className?: string`
    - Use `motion.div` for dots (scale animation) and fill line (width animation)

    Adapt from reference: `C:\Users\ampoy\Barangay Linkod Project\BarangayLinkodWebRegistration-main\BarangayLinkodWebRegistration-main\src\components\ProgressBar.tsx`

    Key changes from reference:
    - 7 dots not 6, no `steps` array with labels — just use indices 1-7
    - Brand color: `#2563EB` / blue-600 NOT `#00FFA3`
    - No labels
    - Current step gets ring style instead of just color change
  </action>
  <verify>Run `npm run build` — no TypeScript errors. The component should accept `currentStep` prop (1-7) and render 7 dots with animated fill line.</verify>
  <done>ProgressBar renders 7 dots, animated blue fill line, completed dots show Check icon, current dot has ring, pending dots grey. Display-only.</done>
</task>

<task type="auto">
  <name>Task 2: Create wizard page and step shell components</name>
  <files>src/app/apply/page.tsx, src/app/apply/steps/BusinessInfoStep.tsx, src/app/apply/steps/LocationStep.tsx, src/app/apply/steps/ContactCoverageStep.tsx, src/app/apply/steps/DocumentsStep.tsx, src/app/apply/steps/CoverNoteStep.tsx, src/app/apply/steps/PaymentStep.tsx, src/app/apply/steps/SuccessStep.tsx</files>
  <action>
    **Step shell components** — Create 7 files in `src/app/apply/steps/`:

    Each step shell follows this pattern (adapting the label per step):
    ```tsx
    'use client';

    import { Button } from '@/components/ui/button';

    interface StepProps {
      onNext: () => void;
      onBack: () => void;
      isFirstStep: boolean;
      isLastStep: boolean;
    }

    export default function [Name]Step({ onNext, onBack, isFirstStep, isLastStep }: StepProps) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900">[Step Title]</h2>
          <p className="text-sm text-zinc-500">Form fields will go here in a later phase.</p>

          <div className="flex gap-3 pt-4">
            {!isFirstStep && (
              <Button variant="outline" onClick={onBack} className="flex-1">
                Back
              </Button>
            )}
            <Button onClick={onNext} className="flex-1">
              {isLastStep ? 'Submit' : 'Continue'}
            </Button>
          </div>
        </div>
      );
    }
    ```

    Step names and titles:
    1. `BusinessInfoStep.tsx` — "Business Information"
    2. `LocationStep.tsx` — "Business Location"
    3. `ContactCoverageStep.tsx` — "Contact & Coverage"
    4. `DocumentsStep.tsx` — "Document Upload"
    5. `CoverNoteStep.tsx` — "Cover Note & Billing"
    6. `PaymentStep.tsx` — "Payment"
    7. `SuccessStep.tsx` — "Application Submitted"

    **Wizard page** — Create `src/app/apply/page.tsx` as `'use client'`:

    Structure:
    ```tsx
    'use client';

    import { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useApplicationStore, TOTAL_STEPS } from '@/store/useApplicationStore';
    import { ProgressBar } from '@/components/ProgressBar';
    import { Button } from '@/components/ui/button';
    import BusinessInfoStep from './steps/BusinessInfoStep';
    import LocationStep from './steps/LocationStep';
    import ContactCoverageStep from './steps/ContactCoverageStep';
    import DocumentsStep from './steps/DocumentsStep';
    import CoverNoteStep from './steps/CoverNoteStep';
    import PaymentStep from './steps/PaymentStep';
    import SuccessStep from './steps/SuccessStep';
    ```

    Step registry array:
    ```tsx
    const steps = [
      { component: BusinessInfoStep },
      { component: LocationStep },
      { component: ContactCoverageStep },
      { component: DocumentsStep },
      { component: CoverNoteStep },
      { component: PaymentStep },
      { component: SuccessStep },
    ];
    ```

    Layout structure:
    - Outer: `min-h-screen bg-zinc-50 flex flex-col`
    - ProgressBar at top: `bg-white px-4 pt-4` → `max-w-md mx-auto` → `<ProgressBar currentStep={currentStep} />`
    - Main: `flex-1 max-w-md mx-auto w-full px-4 py-6`
    - NO header (per user decision)
    - Start Over button: `<Button variant="ghost" onClick={reset}>Start Over</Button>` — show only on step 1, positioned at top-right of main content area

    Animation variants (adapted from reference):
    ```tsx
    const variants = {
      enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
      }),
      center: { x: 0, opacity: 1 },
      exit: (direction: number) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
      }),
    };
    ```

    AnimatePresence config:
    - `mode="wait"`
    - `custom={direction}` (1 for forward, -1 for back)
    - `key={currentStep}` on motion.div
    - Transition: `x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 }`

    Navigation:
    - `handleNext`: setDirection(1), nextStep()
    - `handleBack`: setDirection(-1), prevStep()
    - Pass to step: onNext, onBack, isFirstStep, isLastStep

    Reference: `C:\Users\ampoy\Barangay Linkod Project\BarangayLinkodWebRegistration-main\BarangayLinkodWebRegistration-main\src\app\register\page.tsx`
  </action>
  <verify>Run `npm run build` — no TypeScript errors. Verify all 7 step files exist. Verify page.tsx imports all steps and uses AnimatePresence.</verify>
  <done>7 step shell components created with Back/Continue buttons. Wizard page renders ProgressBar, current step with slide transitions, and Start Over on step 1. Build succeeds.</done>
</task>

</tasks>

<verification>
1. `npm run build` completes without errors
2. All 7 step files exist in `src/app/apply/steps/`
3. `src/app/apply/page.tsx` exists and imports all 7 steps
4. `src/components/ProgressBar.tsx` exists and exports ProgressBar
5. ProgressBar uses blue-600 for completed/current dots (NOT green)
6. ProgressBar has no onClick handlers — display only
7. ProgressBar has no labels — dots only
8. Wizard page has no header — just ProgressBar at top
9. Start Over button visible on step 1
10. `npm run dev` → localhost:3000/apply loads with progress bar and step 1 placeholder
</verification>

<success_criteria>
- ProgressBar renders 7 dots with animated blue fill line
- Completed steps: blue dot with Check icon
- Current step: blue dot with ring
- Pending steps: grey dot
- No labels on progress bar, not clickable
- Wizard page layout: min-h-screen, max-w-md centered, no header
- Start Over button on step 1 calls store reset
- Steps slide right on forward, left on back, ~250ms spring
- 7 step shells exist with Back/Continue buttons
- Build succeeds, app loads at /apply
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-03-SUMMARY.md`
</output>
