# State: Bethel CGL Web Application

**Last updated:** 2026-03-22

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
| Phase | 1 of 5 — Foundation (needs rework for 4-step flow) |
| Plan | TBD |
| Status | Needs rework — flow changed from 7 steps to 4 steps |
| Progress | ░░░░░░░░░░░░░░░░░░░░ 0/5 phases (Phase 1 needs rework) |

---

## Flow (Option A — 4 Steps)

| Step | Name | Contents |
|------|------|----------|
| 1 | **Business** | Name, TIN, Nature of Business, Floor Area, Street Address, Location (Region→Province→City→Barangay) |
| 2 | **Contact & Docs** | Phone, Email, Upload Business Permit, DTI/SEC, Valid ID |
| 3 | **Review & Pay** | Summary, premium calculated, billing invoice, cover note PDF, payment method, proof of payment |
| 4 | **Done** | Success checkmark, e-policy PDF, Bethel contact info, product links |

---

## Phase Summary

| # | Phase | Status | Requirements | Plans | Completed |
|---|-------|--------|--------------|-------|-----------|
| 1 | Foundation | Needs rework | 10 | TBD | - |
| 2 | Steps 1-2 | Not started | 21 | 0 | - |
| 3 | Step 3 | Not started | 15 | 0 | - |
| 4 | Step 4 + PDF | Not started | 11 | 0 | - |
| 5 | Polish | Not started | 1 | 0 | - |

**Total v1:** 58 requirements across 5 phases

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 0 / 5 |
| Requirements completed | 10 / 58 (UI-02, UI-03, UI-06, FLOW-02, FLOW-03, FLOW-04 from Phase 1) |
| Plans created | 0 (old plans deprecated) |
| Plans completed | 0 |
| Blockers | Phase 1 needs rework for 4-step flow |

---

## Accumulated Context

### Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-21 | No authentication | Simplifies flow, matches real PH insurer CGL web apps |
| 2026-03-21 | Blue accent (#2563EB) | User preference, professional insurance feel |
| 2026-03-21 | PSGC cascading address | User provided PSGC data file, standard for PH addresses |
| 2026-03-21 | pdf-lib for PDFs | Lightweight, no server dependency, works client-side |
| 2026-03-21 | No persistence | Page refresh = start over. State lives in memory only (Zustand without persist). |
| 2026-03-21 | No header text | Just progress bar at top. No "Bethel" text in header. |
| 2026-03-21 | Dots-only progress bar | No step labels. Completed=blue+check, Current=ring, Pending=grey. Animated fill line. |
| 2026-03-21 | Horizontal slide transitions | 200-300ms spring. Forward=from right, Back=from left. |
| 2026-03-21 | Ring style on current step dot | ring-2 ring-blue-600 ring-offset-2 + scale 1.3 via Framer Motion |
| 2026-03-21 | Standalone Select (no shadcn) | Full control, simpler for cascading dropdowns |
| 2026-03-22 | **4-step flow (Option A)** | UX improvement — 7 steps over-fragmented a simple task. Merged Business+Location, Contact+Docs, Review+Pay+Payment |
| 2026-03-22 | Billing on Review step | Coverage/premium calculated on Step 3 (Review & Pay), not on contact entry step |
| 2026-03-22 | No execution verifier | User disabled verifier in GSD settings |

### Blockers

- Phase 1 needs rework: store has 7 step definitions, ProgressBar has 7 dots, wizard page has 7 step components. Needs update to 4-step structure.
- Old Phase 2 plans (02-01 through 02-06) are deprecated. Phase 2 scope changed (now 21 requirements, includes documents).

### Open Questions

(None)

---

## Session Continuity

### What's Been Done (carries over)
- Project scaffolded: Next.js 16, TypeScript, Tailwind v4, shadcn/ui configured
- Base components: Button, Input (with suffix), Label, Select (standalone compound)
- Global styles: --primary #2563EB, zinc theme, Inter font, no dark mode
- Zustand store with typed state sections, navigation, no persistence
- Zod validation schemas: businessInfo, location, contact
- PSGC data utility: load, getRegions, getProvinces, getCities, getBarangays
- BusinessInfoStep built (4 fields, blur validation, 24 business categories)
- LocationStep built (4 cascading PSGC dropdowns, parent-clears-children)
- ContactCoverageStep built (needs split — contact stays, coverage/premium moves to Phase 3)

### What Comes Next
1. Rework Phase 1: update store (7→4 steps), ProgressBar (7→4 dots), wizard page (7→4 step components)
2. Replan Phase 2: Steps 1-2 (Business + Contact & Docs, 21 requirements)
3. Plan Phase 3: Step 3 (Review & Pay, 15 requirements)
4. Plan Phase 4: Step 4 + PDF (Done + PDF, 11 requirements)

### Key Files
- `src/store/useApplicationStore.ts` — Zustand store (needs 7→4 step update)
- `src/components/ProgressBar.tsx` — Progress bar (needs 7→4 dot update)
- `src/app/apply/page.tsx` — Wizard page (needs 7→4 step update)
- `src/app/apply/steps/BusinessInfoStep.tsx` — Business form (still valid for Step 1)
- `src/app/apply/steps/LocationStep.tsx` — Location cascading dropdowns (moves into Step 1)
- `src/app/apply/steps/ContactCoverageStep.tsx` — Needs split: contact part stays, coverage moves
- `src/lib/validation.ts` — Zod schemas
- `src/lib/psgc-data.ts` — PSGC data utility
- `src/components/ui/select.tsx` — Select compound component
- `src/components/ui/input.tsx` — Input with suffix
- `.planning/ROADMAP.md` — Updated for 4-step flow
- `.planning/REQUIREMENTS.md` — Updated with BILL-* and DONE-* requirement IDs

---

*Created: 2026-03-21 by roadmap initialization*
*Last updated: 2026-03-22 — Reworked to 4-step flow*
