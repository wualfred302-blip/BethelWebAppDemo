---
phase: 01-foundation
plan: "02"
subsystem: ui-components
tags: [progress-bar, visual-polish, framer-motion]
tech_stack:
  added: []
  patterns: [motion.div for animated scaling, Lucide Check for completed markers]
dependency_graph:
  requires: []
  provides:
    - "src/components/ProgressBar.tsx (corrected current-step styling)"
  affects: [apply-wizard-flow]
key_files:
  modified:
    - src/components/ProgressBar.tsx
  created: []
decisions: []
metrics:
  duration: "00:01:30"
  completed: "2026-03-22"
  tasks: 1
  files_modified: 1
---

# Phase 01 Plan 02: Remove Ring from Current Step Dot — Summary

**One-liner:** Removed ring-2 styling from current progress dot; step now indicated solely by scale(1.3) animation and blue fill, matching the locked "larger dot (not ring)" decision.

---

## Task 1: Remove ring from current step dot — ✅ COMPLETE

**Commit:** `c8a5983`

**Files modified:**
- `src/components/ProgressBar.tsx` — removed 4 lines (`ring-2 ring-blue-600 ring-offset-2`), replaced `cn()` className with static string

**What changed:**
- Removed: `isCurrent && 'ring-2 ring-blue-600 ring-offset-2'` conditional class
- Removed: `cn()` utility import usage (class was static after removal)
- Preserved: `scale: 1.3` animation via Framer Motion for current step prominence
- Preserved: `backgroundColor: '#2563EB'` for completed and current dots
- Preserved: White Lucide `Check` icon on completed dots
- Preserved: Animated fill line with `motion.div` width animation
- Preserved: `TOTAL_DOTS = 4`

**Verification:**
- ✅ TypeScript compiles cleanly (`npx tsc --noEmit` — no output)
- ✅ No ring classes remain on any element
- ✅ Current dot scales to 1.3x
- ✅ Completed dots show checkmark on blue background
- ✅ Fill line animation logic unchanged

---

## Deviations from Plan

None — plan executed exactly as written.

## Auth Gates

None.

## Self-Check

- ✅ `src/components/ProgressBar.tsx` exists (62 lines, >50 minimum)
- ✅ Commit `c8a5983` exists in git log
- ✅ No `ring-2` / `ring-blue-600` / `ring-offset-2` classes remain
- ✅ `Check` from `lucide-react` still imported and used
- ✅ `motion` from `framer-motion` still imported and used
- ✅ TypeScript compiles without errors

## Self-Check: PASSED
