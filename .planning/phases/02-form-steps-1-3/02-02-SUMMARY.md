---
phase: 02-form-steps-1-3
plan: "02"
subsystem: ui-primitives
tags: [select, input, form-components, ui]
dependency_graph:
  requires: []
  provides:
    - src/components/ui/select.tsx (Select compound component for PSGC dropdowns)
    - src/components/ui/input.tsx (Input with suffix for floor area display)
  affects:
    - src/app/apply/steps/ (future consumers in Plans 03-05)
tech_stack:
  added: []
  patterns:
    - Compound component pattern with React Context
    - forwardRef for native input
    - cn() utility for class merging
key_files:
  created:
    - src/components/ui/select.tsx
  modified:
    - src/components/ui/input.tsx
decisions:
  - "Standalone Select without Radix/shadcn dependency — keeps component self-contained"
  - "Replaced @base-ui/react InputPrimitive with native input — removes dependency, full control over styling"
  - "No dark mode classes anywhere — project convention"
  - "Bethel blue (#2563EB) focus rings — project convention"
metrics:
  duration: ~8min
  completed: 2026-03-21
  tasks_completed: 2/2
  files_changed: 2
---

# Phase 02 Plan 02: Form UI Primitives — Select & Input Summary

## One-liner

Standalone compound Select component with outside-click dismiss and updated Input component with inline suffix support for floor area 'sqm' display.

## What Was Built

### 1. Select Compound Component (`src/components/ui/select.tsx`)

**5 sub-components** exported as a compound API:
- `Select` — root wrapper managing open/close state via React Context
- `SelectTrigger` — button showing current value or placeholder, with chevron icon
- `SelectValue` — label display (updates trigger's visible text)
- `SelectContent` — dropdown panel positioned absolute below trigger, max-h-[300px] scrollable
- `SelectItem` — individual option with hover highlight and selected state

**Behavior:**
- Opens/closes on trigger click
- Closes on outside click (useEffect + mousedown listener)
- Closes on Escape key
- Closes on item select (calls onValueChange)
- Disabled state prevents open

**Styling:**
- Trigger: h-12 w-full rounded-lg border-gray-300 bg-white
- Focus ring: focus:ring-2 focus:ring-[#2563EB]
- No dark mode classes anywhere
- Selected item: bg-blue-50 + text-[#2563EB]

### 2. Updated Input Component (`src/components/ui/input.tsx`)

**Replaced** the `@base-ui/react` `InputPrimitive` with a native `forwardRef` input element.

**Props (extending InputHTMLAttributes):**
- `label?: string` — label text above input
- `error?: string` — red error message below input
- `icon?: ReactNode` — left icon slot (absolute positioned)
- `suffix?: string` — inline text after input (e.g., 'sqm')

**Styling:**
- Input: h-11 w-full rounded-lg border-gray-300 bg-white
- Focus ring: focus:ring-2 focus:ring-[#2563EB]
- Error state: border-red-500 + focus:ring-red-500
- Icon padding: pl-10 when icon present
- No dark mode classes

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `src/components/ui/select.tsx` exists — 226 lines, 5 sub-components
- [x] `src/components/ui/input.tsx` exists — 57 lines, forwardRef with suffix
- [x] Both components compile (npx tsc --noEmit passes)
- [x] No dark mode classes in either file
- [x] Bethel blue (#2563EB) focus rings in both
- [x] Commit `2a382c8` — Select component
- [x] Commit `27876e5` — Input component

## Commits

| Hash | Message |
|------|---------|
| `2a382c8` | `feat(02-02): create standalone Select compound component` |
| `27876e5` | `feat(02-02): update Input component with suffix support and forwardRef` |
