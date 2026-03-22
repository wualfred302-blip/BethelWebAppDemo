# Phase 1: Foundation - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

A working Next.js app with the 4-step wizard shell — progress bar, navigation, slide transitions, and in-memory state management (no persistence). No form content yet, just the skeleton that works on mobile. This phase delivers the scaffolding that all subsequent form steps plug into.

</domain>

<decisions>
## Implementation Decisions

### Progress bar
- 4 dots only — no step labels (saves space on mobile)
- Completed step: blue filled dot with white checkmark icon (Lucide Check)
- Current step: physically larger dot (not ring)
- Pending step: grey dot
- Animated fill line connecting the dots — fills blue as steps complete
- Display only — not clickable for navigation
- Inside a white header strip at the top of the page

### Transitions
- Horizontal slide: forward = new content slides in from right, back = slides in from left
- Quick snap: ~200ms duration
- Ease-out curve — no bounce, smooth deceleration
- Wait mode: old step fully exits before new step enters (AnimatePresence mode="wait")

### Initial & resume state
- Cold start: user lands directly on Step 1 (Business) — no welcome/intro screen
- No persistence at all — page refresh = start over from Step 1
- No Start Over button — page refresh is the restart mechanism
- Zustand store WITHOUT persist middleware — state lives only in memory during session

### Header layout
- No header at all — no "Bethel" text, no header bar
- Just the progress bar in a white strip at the very top of the page
- "Bethel" branding appears only in PDFs and success page contact info

### Step shells
- 4 step components: BusinessInfoStep, ContactStep, ReviewPayStep, DoneStep
- Step 1 (Business): use the existing BusinessInfoStep form (already built from old Phase 2)
- Steps 2-4: placeholder shells showing step title + description, with working Back/Continue buttons for navigation testing
- Step layout: `max-w-md mx-auto space-y-6`

### Navigation
- Browser mobile back button navigates between wizard steps (push history state)
- Enter key submits current step's form and advances
- URL stays at /apply for all steps (step tracked in state, not in URL)
- Back/Continue buttons inside each step component (no separate footer)

### Claude's Discretion
- Exact spring animation curve (ease-out timing function values)
- Spinner design and placement during initial load (if any)
- How to handle Zustand store structure (with or without slices)
- Whether to add a subtle page background or keep it plain white
- How to implement browser back button navigation without URL changes (history state approach)

</decisions>

<specifics>
## Specific Ideas

- Reference project uses Framer Motion `AnimatePresence` with `mode="wait"` for clean transitions
- Reference project ProgressBar: animated progress width using Framer Motion, completed dots show Check icon from Lucide
- Layout: `min-h-screen bg-zinc-50 flex flex-col` with `max-w-md mx-auto w-full px-4 py-6` for content area
- No footer — navigation buttons are inside each step component
- Step 2 placeholder: "Contact & Docs — Phone, email, and document uploads"
- Step 3 placeholder: "Review & Pay — Summary, billing, and payment"
- Step 4 placeholder: "Done — Confirmation and e-policy download"

</specifics>

<deferred>
## Deferred Ideas

- Persistence (localStorage/sessionStorage) — could be added later if needed
- Welcome/intro screen — out of scope for v1
- Clickable progress bar for navigation — future enhancement
- Start Over button — deferred, page refresh serves as restart
- Per-step URLs (/apply/step-1, etc.) — deferred, single URL for now

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-22*
