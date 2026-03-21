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
| Phase | 1 of 5 — Foundation |
| Plan | Executing 01-foundation-02 (next) |
| Status | In progress — 1/4 plans complete |
| Progress | █░░░░░░░░░░░░░░░░░░░ 1/5 phases (Phase 1 in progress) |

---

## Phase Summary

| # | Phase | Status | Requirements | Plans | Completed |
|---|-------|--------|--------------|-------|-----------|
| 1 | Foundation | In progress | 10 | 4 | 1 |
| 2 | Form Steps 1-3 | Not started | 17 | 0 | - |
| 3 | Form Steps 4-7 | Not started | 26 | 0 | - |
| 4 | PDF Generation | Not started | 4 | 0 | - |
| 5 | Polish | Not started | 1 | 0 | - |

**Total v1:** 58 requirements across 5 phases

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 0 / 5 |
| Requirements completed | 3 / 58 |
| Plans created | 4 / ~15 estimated |
| Plans completed | 1 / 4 |
| Blockers | 0 |

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01-foundation | P01 | 25min | 3 | 15 |

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

### Blockers

(None)

### Open Questions

(None)

---

## Session Continuity

### What's Been Done
- Project scaffolded: Next.js 16, TypeScript, Tailwind v4, shadcn/ui configured
- Base components: Button (Bethel blue-600), Input, Label ready
- Global styles: --primary #2563EB, zinc theme, Inter font, no dark mode
- Root layout with "Bethel CGL" metadata, redirect to /apply
- Requirements completed: UI-02, UI-03, UI-06

### What Comes Next
1. Plan 02: Zustand store (can run parallel with Plan 03)
2. Plan 03: ProgressBar + wizard layout (can run parallel with Plan 02)
3. Plan 04: Human verification checkpoint

### Key Files
- `.planning/phases/01-foundation/01-foundation-01-SUMMARY.md` — Plan 1 completed
- `.planning/phases/01-foundation/01-foundation-02-PLAN.md` — Plan 2: Zustand store
- `.planning/phases/01-foundation/01-foundation-03-PLAN.md` — Plan 3: ProgressBar + wizard
- `.planning/phases/01-foundation/01-foundation-04-PLAN.md` — Plan 4: Human verification
- `C:\Users\ampoy\Bethel\bethel-cgl\src\components\ui\button.tsx` — Bethel blue Button
- `C:\Users\ampoy\Bethel\bethel-cgl\src\app\globals.css` — Brand styles

---

*Created: 2026-03-21 by roadmap initialization*
