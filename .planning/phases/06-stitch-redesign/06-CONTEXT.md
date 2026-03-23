# Phase 6: Stitch Design Redesign - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

## Task Boundary

Incorporate the Stitch AI design philosophy into the Bethel CGL application. Stitch generated 4 polished mobile-first screens that are visually superior to the current implementation. This phase is a visual overhaul — same functionality, new look.

## Design Philosophy

### Source
Google Stitch AI design tool. Generated 5 screens for the Bethel CGL project.

### Screens Generated
1. **Business Form (Step 1)** — header with back arrow + title + help icon, segmented progress bar with "Step 1 of 4" label, two-column grid for TIN/Floor Area, location in pill-shaped container, security notice card, gradient Continue button fixed at bottom
2. **Contact & Docs (Step 2)** — document upload with icons, image previews
3. **Review & Pay (Step 3)** — clean cover note card, payment methods with icons (GCash, bank, store), proof of payment upload
4. **Done (Step 4)** — success checkmark, e-policy download, Bethel contact info with icons, product links with icons, footer

### Design Files
- Project: `projects/5423967205714988199`
- HTML exports: `C:\Users\ampoy\Downloads\stitch_bethel_cgl_application.zip`

## Key Design Changes

| Element | Current | Stitch |
|---------|---------|--------|
| Progress bar | Dots with animated line | Segmented bar + "Step X of 4" label |
| Header | None (white strip) | Back arrow + title + help icon |
| Labels | `text-sm font-medium` | `text-[11px] font-bold uppercase tracking-wider` |
| Inputs | White, bordered | Filled bg (`surface-container-highest`), borderless, larger padding |
| Layout | Single column | Two-column grid (TIN + Floor Area) |
| Location | Flat list | Pill-shaped container (`rounded-[2rem]`) |
| Buttons | Solid blue | Gradient `from-primary to-primary-container`, fixed bottom with backdrop blur |
| Security notice | None | Icon + encrypted data message |
| Review payment | Flat cards | Icons on each payment method (GCash, bank, store) |
| Done | Placeholder | Full contact cards, product links with icons, footer |
| Color system | Simple zinc + blue-600 | Material Design 3 tokens (surface, on-surface, etc.) |

## Implementation Decisions

### Color System
- Keep existing CSS variables but add new surface tokens
- Primary: `#003d9b` (darker blue from Stitch) — OR keep `#2563EB` (current)
- Add: `--surface`, `--on-surface`, `--surface-container`, `--surface-container-highest`, `--on-surface-variant`
- Keep shadcn/ui component structure

### Layout Changes
- Add header component (back arrow + title + help icon)
- Change progress bar from dots to segments
- Two-column grid for TIN + Floor Area
- Location section in pill-shaped container
- Security notice card on form screen
- Fixed bottom button with gradient

### Component Changes
- Input: borderless filled style, larger padding
- Select: borderless filled style, dropdown icon
- Label: smaller, uppercase, bold, wider tracking
- Button: gradient, fixed bottom positioning

### What NOT to Change
- Form validation logic (react-hook-form + Zod)
- Zustand store structure
- Cascading PSGC logic
- Document upload functionality
- Pricing logic
- PDF generation

## Agent's Discretion
- Exact shade of primary blue
- How to add Material Design 3 tokens without breaking shadcn/ui
- Whether to use the Stitch HTML directly as a reference or adapt to existing Tailwind conventions
- Specific padding/sizing values for inputs
