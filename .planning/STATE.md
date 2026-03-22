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
| Phase | 1 of 5 — Foundation |
| Plan | 01-01 complete |
| Status | Wizard restructured to 4-step flow |
| Progress | ▓░░░░░░░░░░░░░░░░░░░ 1/5 phases (Phase 1 plan 1 done) |

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
| 1 | Foundation | In progress | 10 | 1/1 | 01-01 ✅ |
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
| Requirements completed | 17 / 58 (added FLOW-01, FLOW-05, UI-05 from Phase 1 Plan 1) |
| Plans created | 1 |
| Plans completed | 1 (01-01) |
| Blockers | None |

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
| 2026-03-21 | Dots-only progress bar | No step labels. Completed=blue+check, Current=scale(1.3) no ring, Pending=grey. Animated fill line. |
| 2026-03-21 | Horizontal slide transitions | 200-300ms spring. Forward=from right, Back=from left. |
| 2026-03-21 | ~~Ring style on current step dot~~ | Superseded: ring removed, scale 1.3 only |
| 2026-03-21 | Standalone Select (no shadcn) | Full control, simpler for cascading dropdowns |
| 2026-03-22 | **4-step flow (Option A)** | UX improvement — 7 steps over-fragmented a simple task. Merged Business+Location, Contact+Docs, Review+Pay+Payment |
| 2026-03-22 | Billing on Review step | Coverage/premium calculated on Step 3 (Review & Pay), not on contact entry step |
| 2026-03-22 | No execution verifier | User disabled verifier in GSD settings |

### Blockers

- Old Phase 2 plans (02-01 through 02-06) are deprecated. Phase 2 scope changed (now 21 requirements, includes documents).

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260323-3ft | Fix UI/UX issues found in Vercel audit | 2026-03-22 | 9be19ee | [260323-3ft-fix-ui-ux-issues-found-in-vercel-audit](./quick/260323-3ft-fix-ui-ux-issues-found-in-vercel-audit/) |

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
- **Plan 01-01 complete:** Wizard page restructured to 4-step flow with ReviewPayStep/DoneStep placeholders, browser back navigation, ease-out transitions, Enter key support

### What Comes Next
1. ~~Rework Phase 1: update store (7→4 steps), ProgressBar (7→4 dots), wizard page (7→4 step components)~~ ✅ Done
2. Replan Phase 2: Steps 1-2 (Business + Contact & Docs, 21 requirements)
3. Plan Phase 3: Step 3 (Review & Pay, 15 requirements)
4. Plan Phase 4: Step 4 + PDF (Done + PDF, 11 requirements)

### Key Files
- `src/store/useApplicationStore.ts` — Zustand store (TOTAL_STEPS=4, ready)
- `src/components/ProgressBar.tsx` — Progress bar (4 dots, ready)
- `src/app/apply/page.tsx` — Wizard page (4-step flow, ✅ restructured)
- `src/app/apply/steps/BusinessInfoStep.tsx` — Business form (Step 1, ready)
- `src/app/apply/steps/ContactCoverageStep.tsx` — Contact form (Step 2, ready)
- `src/app/apply/steps/ReviewPayStep.tsx` — Step 3 placeholder (✅ created)
- `src/app/apply/steps/DoneStep.tsx` — Step 4 placeholder (✅ created)
- `src/app/apply/steps/LocationStep.tsx` — Location cascading dropdowns (moves into Step 1 Phase 2)
- `src/lib/validation.ts` — Zod schemas
- `src/lib/psgc-data.ts` — PSGC data utility
- `src/components/ui/select.tsx` — Select compound component
- `src/components/ui/input.tsx` — Input with suffix
- `.planning/ROADMAP.md` — Updated for 4-step flow
- `.planning/REQUIREMENTS.md` — Updated with BILL-* and DONE-* requirement IDs

---

*Created: 2026-03-21 by roadmap initialization*
*Last activity: 2026-03-22 — Completed quick task 260323-3ft: Fix UI/UX issues found in Vercel audit*
