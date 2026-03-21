# State: Bethel CGL Web Application

**Last updated:** 2026-03-21

---

## Project Reference

| Field | Value |
|-------|-------|
| Core Value | Business owners can complete a CGL insurance application entirely online in one session and receive a valid policy document. |
| Stack | Next.js 16, React 19, Tailwind v4, shadcn/ui, react-hook-form, Zod, Zustand, pdf-lib, Framer Motion |
| Reference | Barangay Linkod Web Registration (same stack, same patterns) |
| Deployment | Vercel |

---

## Current Position

| Field | Value |
|-------|-------|
| Phase | 2 of 5 — Form Steps 1-3 |
| Plan | Completed 02-02 (next: 02-03) |
| Status | In progress — 1/6 plans complete |
| Progress | ██░░░░░░░░░░░░░░░░░░ 2/5 phases (Phase 2 in progress) |

---

## Phase Summary

| # | Phase | Status | Requirements | Plans | Completed |
|---|-------|--------|--------------|-------|-----------|
| 1 | Foundation | In progress | 10 | 4 | 3 |
| 2 | Form Steps 1-3 | In progress | 17 | 6 | 1 |
| 3 | Form Steps 4-7 | Not started | 26 | 0 | - |
| 4 | PDF Generation | Not started | 4 | 0 | - |
| 5 | Polish | Not started | 1 | 0 | - |

**Total v1:** 58 requirements across 5 phases

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 0 / 5 |
| Requirements completed | 11 / 58 |
| Plans created | 10 / ~15 estimated |
| Plans completed | 4 / 10 |
| Blockers | 0 |

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01-foundation | P01 | 25min | 3 | 15 |
| 01-foundation | P02 | 1min | 1 | 1 |
| 01-foundation | P03 | 2min | 2 | 9 |
| 02-form-steps-1-3 | P02 | ~8min | 2 | 2 |

## Accumulated Context

### Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-21 | No authentication | Simplifies flow, matches real PH insurer CGL web apps |
| 2026-03-21 | Blue accent (#2563EB) | User preference, professional insurance feel |
| 2026-03-21 | 7-step wizard | Matches Bethel's documented flow from their PDF spec |
| 2026-03-21 | PSGC cascading address | User provided PSGC data file, standard for PH addresses |
| 2026-03-21 | pdf-lib for PDFs | Lightweight, no server dependency, works client-side |
| 2026-03-21 | Placeholder pricing | User has pricing table but wants form built first |
| 2026-03-21 | 5-phase roadmap | Derived from requirements; Foundation → Form Steps 1-3 → Steps 4-7 → PDF → Polish |
| 2026-03-21 | No persistence | Page refresh = start over. State lives in memory only (Zustand without persist). |
| 2026-03-21 | No header text | Just progress bar at top. No "Bethel" text in header. |
| 2026-03-21 | Dots-only progress bar | No step labels. Completed=blue+check, Current=ring, Pending=grey. Animated fill line. |
| 2026-03-21 | Horizontal slide transitions | 200-300ms spring. Forward=from right, Back=from left. |
| 2026-03-21 | Ring style on current step dot | ring-2 ring-blue-600 ring-offset-2 + scale 1.3 via Framer Motion for visual prominence |
| 2026-03-21 | Standalone Select (no shadcn) | Avoids Radix/shadcn dependency, full control over open/close behavior, simpler for cascading dropdowns |

### Blockers

(None)

### Open Questions

(None)

---

## Session Continuity

### What's Been Done
- Project scaffolded: Next.js 16, TypeScript, Tailwind v4, shadcn/ui configured
- Base components: Button (Bethel blue-600), Input (with suffix support), Label ready
- Global styles: --primary #2563EB, zinc theme, Inter font, no dark mode
- Root layout with "Bethel CGL" metadata, redirect to /apply
- Zustand store with 7 data sections, navigation, no persistence
- ProgressBar: 7 dots, animated fill line, display-only
- Wizard page: slide transitions, Start Over on step 1
- 7 step shell components with Back/Continue navigation
- Phase 1 plans created and executed (3 of 4 plans complete, Plan 04 is human checkpoint)
- Phase 2 context gathered: form layout, cascading address, validation decisions locked
- Select compound component built (standalone, no shadcn, React Context, outside-click dismiss)
- Input component updated: forwardRef, label, error, icon, suffix support
- Requirements completed: UI-01, UI-02, UI-03, UI-05, UI-06, FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05

### What Comes Next
1. Execute 02-03-PLAN.md: BusinessInfoStep form (4 fields, blur validation)
2. Execute 02-04-PLAN.md: LocationStep cascading PSGC dropdowns
3. Execute 02-05-PLAN.md: ContactCoverageStep + auto-calculated coverage/premium

### Key Files
- `.planning/phases/01-foundation/01-foundation-01-SUMMARY.md` — Plan 1: scaffold
- `.planning/phases/01-foundation/01-foundation-02-SUMMARY.md` — Plan 2: Zustand store
- `.planning/phases/01-foundation/01-foundation-03-SUMMARY.md` — Plan 3: ProgressBar + wizard
- `.planning/phases/01-foundation/01-foundation-04-PLAN.md` — Plan 4: Human verification
- `.planning/phases/02-form-steps-1-3/02-CONTEXT.md` — Phase 2 decisions
- `.planning/phases/02-form-steps-1-3/02-02-SUMMARY.md` — Plan 2: Select + Input UI components
- `src/components/ui/select.tsx` — Standalone Select compound component
- `src/components/ui/input.tsx` — Input with label, error, icon, suffix
- `src/components/ProgressBar.tsx` — 7-dot animated progress bar
- `src/app/apply/page.tsx` — Wizard page with slide transitions
- `src/store/useApplicationStore.ts` — Zustand wizard state

---

*Created: 2026-03-21 by roadmap initialization*
