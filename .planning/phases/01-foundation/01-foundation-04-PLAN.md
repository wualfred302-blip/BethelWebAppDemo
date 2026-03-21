---
phase: 01-foundation
plan: 04
type: execute
wave: 3
depends_on: [02, 03]
files_modified: []
autonomous: false
requirements: []

must_haves:
  truths:
    - "App loads at localhost:3000/apply without console errors"
    - "Progress bar shows 7 dots at the top, first dot highlighted"
    - "Step 1 (Business Information) placeholder content is visible"
    - "Continue button navigates to Step 2 with right-to-left slide animation"
    - "Back button returns to Step 1 with left-to-right slide animation"
    - "Progress bar updates: completed dot shows checkmark, current dot shows ring"
    - "Start Over button on Step 1 resets to initial state"
    - "User cannot advance past Step 7"
    - "User cannot go back before Step 1"
    - "Page is mobile-width (max-w-md centered) with no header"
    - "Browser tab reads 'Bethel CGL'"
  artifacts: []
  key_links: []
---

<objective>
Human verification that the Phase 1 wizard skeleton works correctly end-to-end.

Purpose: Confirm all observable truths from Phase 1 must_haves before proceeding to Phase 2. This is the quality gate.
Output: Approved or issues list for remediation.
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

<task type="checkpoint:human-verify">
  <name>Verify Phase 1 wizard skeleton</name>
  <what-built>
    Complete Phase 1 foundation: Next.js project with shadcn/ui, Zustand store (no persistence), ProgressBar component (7 dots, animated fill, display-only), wizard page with Framer Motion slide transitions, 7 step shell components with Back/Continue navigation, Start Over button on Step 1, Bethel blue (#2563EB) brand color throughout, Inter font, mobile-first max-w-md layout, no header.
  </what-built>
  <how-to-verify>
    1. Run `npm run dev` in the bethel-cgl directory
    2. Open http://localhost:3000 — should redirect to /apply
    3. Verify browser tab title is "Bethel CGL"
    4. Verify page layout: centered max-w-md column, no header bar, progress bar at top
    5. Verify progress bar: 7 dots, first dot is blue with ring, rest are grey, no labels
    6. Verify Step 1 content: "Business Information" heading, placeholder text, Continue button
    7. Verify Start Over button visible on Step 1
    8. Click Continue — verify slide animation (right to left), Step 2 loads
    9. Verify progress bar updated: dot 1 is now blue filled with checkmark, dot 2 has ring
    10. Click Back — verify reverse slide animation (left to right), Step 1 loads
    11. Click Continue through all 7 steps — verify each transition animates
    12. On Step 7 — verify Continue says "Submit" and does not advance further
    13. Navigate to Step 1, click Start Over — verify resets to Step 1
    14. Resize browser to mobile width (375px) — verify layout stays centered, nothing overflows
    15. Check browser console — no errors or warnings
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues found</resume-signal>
</task>

</tasks>

<verification>
1. All 15 verification steps pass
2. No console errors
3. Navigation works in both directions
4. Progress bar correctly reflects step state
5. Mobile layout is correct at 375px width
</verification>

<success_criteria>
- Human confirms all 15 verification steps pass with "approved"
- Or issues are documented for remediation in follow-up plan
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-04-SUMMARY.md`
</output>
