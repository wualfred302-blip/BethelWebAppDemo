# Phase 1: Foundation - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

A working Next.js app with the wizard shell, progress bar, navigation logic, and state management — no form content yet, just the skeleton that works on mobile. This phase delivers the scaffolding that all subsequent form steps plug into.

</domain>

<decisions>
## Implementation Decisions

### Progress bar
- Dots only — no step labels (saves space on mobile)
- 7 dots representing the 7 steps
- Completed step: blue filled dot with checkmark icon
- Current step: blue ring/border around dot (not filled)
- Pending step: grey dot
- Animated fill line connecting the dots — fills blue as steps complete
- Display only — not clickable for navigation (use Back button instead)

### Step transitions
- Horizontal slide animation between steps
- Fast: 200-300ms spring animation
- Directional: going forward → new content slides in from right; going back → new content slides in from left
- Old content exits in the opposite direction

### Initial & resume state
- Cold start: user lands directly on Step 1 (Business Information) — no welcome/intro screen
- No persistence at all — page refresh = start over from Step 1
- Close browser = start over
- "Start Over" button on Step 1 to clear all data and restart
- Brief spinner while app initializes (Zustand hydration)
- Zustand store WITHOUT persist middleware — state lives only in memory during session

### Header layout
- No header at all — no "Bethel" text, no header bar
- Just the progress bar at the very top of the page
- The app starts with the progress bar, then the step content below
- "Bethel" branding appears only in PDFs and success page contact info

### Claude's Discretion
- Exact spring animation curve (stiffness, damping values)
- Spinner design and placement during initial load
- How to handle Zustand store structure (with or without slices)
- Whether to add a subtle page background or keep it plain white

</decisions>

<specifics>
## Specific Ideas

- Reference project uses Framer Motion `AnimatePresence` with spring physics: `stiffness: 300, damping: 30`
- Reference project ProgressBar: animated progress width using Framer Motion, completed dots show Check icon from Lucide
- Layout: `min-h-screen bg-zinc-50 flex flex-col` with `max-w-md mx-auto w-full px-4 py-6` for content area
- No footer — navigation buttons are inside each step component

</specifics>

<deferred>
## Deferred Ideas

- Persistence (localStorage/sessionStorage) — could be added later if needed
- Welcome/intro screen — out of scope for v1
- Clickable progress bar for navigation — future enhancement

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-21*
