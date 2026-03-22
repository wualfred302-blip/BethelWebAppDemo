# Quick Task 260323-3ft: Fix UI/UX issues found in Vercel audit - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

## Task Boundary

Execute a focused UI/UX polish pass on the Bethel CGL application based on a thorough Vercel-grade audit. The audit evaluated all 4 steps of the wizard flow.

## Audit Findings (Vercel-Grade)

### Critical Issues (P0)
1. **Step 4 (Done) is a placeholder** — no success animation, no e-policy download, no Bethel contact info, no product links, no "Back" button should be removed
2. **Color palette inconsistency** — mixed `gray-*` and `zinc-*` classes throughout forms and components

### High Priority Issues (P1)
3. **Weak typographic hierarchy** — step titles too small, section headings compete with labels, premium amount not visually dominant
4. **Excessive whitespace** — `space-y-6` too generous between sections, progress bar `py-4` too generous
5. **Input/Select height mismatch** — input is `h-11`, select is `h-12`

### Medium Priority Issues (P2)
6. **Progress bar visual weight** — completed dots too small, current dot barely different
7. **Step 1 lacks section separation** — Personal/Business/Location feel like one long list
8. **Step 2 combined feels like two unrelated pages** — no visual connection between Contact and Documents
9. **Document upload zones are generic** — no differentiation between Business Permit, DTI, and ID
10. **Payment method cards are flat** — no icons, no visual hierarchy

### Low Priority Issues (P3)
11. **Accessibility** — focus rings are subtle, no keyboard navigation on selects
12. **Button uses hardcoded `blue-600`** — should use `--primary` CSS variable

## Implementation Decisions

### Scope
- Focus on P0 and P1 items — these change the visual feel most
- Step 4 (Done) is Phase 4 work — this quick task should NOT build it yet (Phase 4 hasn't started)
- For this quick task: fix color palette, typography, spacing, component consistency, progress bar

### Approach
- No new dependencies
- No architecture changes
- Tailwind classes only
- Preserve existing component structure
- Test each change visually after modification

### What NOT to do
- Don't build Step 4 (Done) — that's Phase 4 scope
- Don't redesign the overall flow
- Don't add new components
- Don't add new dependencies

## Agent's Discretion
- Exact typography sizes (the specialist can tune these based on visual judgment)
- Whether to add section dividers to Step 1
- Progress bar visual weight specifics
- Which specific classes to standardize

## Specific References
- Reference project: `C:\Users\ampoy\Barangay Linkod Project\BarangayLinkodWebRegistration-main\` (for typographic hierarchy reference)
- Design spec: Vercel product UI standards
- Color: `#2563EB` / blue-600 is the primary accent throughout
- Stack: Next.js 16, Tailwind v4, shadcn/ui, Inter font
