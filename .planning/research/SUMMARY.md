# Bethel CGL — Research Summary

## What This Is

A single-page web application for Bethel General Insurance that digitizes the Comprehensive General Liability (CGL) insurance application process for Philippine businesses renewing LGU business permits. No login, no database, no backend — a frontend prototype that collects applicant data, validates it, and generates downloadable PDF cover notes and e-policies.

---

## Recommended Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Proven in reference project (Barangay Linkod), identical wizard pattern |
| UI | React 19 + Tailwind v4 + shadcn/ui | Clean, professional look appropriate for insurance |
| Forms | react-hook-form + Zod + @hookform/resolvers | Type-safe validation, minimal boilerplate |
| State | Zustand (persist middleware) | Survives page refresh, ~50 lines of store code |
| PDF | pdf-lib | Client-side, no server dependency, ~300KB |
| Animations | Framer Motion | Smooth step transitions |
| Deployment | Vercel | Zero-config Next.js hosting |

**Key decision:** Replicate the Barangay Linkod reference stack exactly. Same patterns, same libraries, same conventions. Copy-paste-and-adapt, not build-from-scratch.

---

## Table Stakes Features (v1 Must-Haves)

1. **Multi-step wizard** (7 steps): Business Info → Location → Contact & Coverage → Documents → Cover Note → Payment → Success
2. **Cascading Philippine address**: Region → Province → City → Barangay (~2.3MB PSGC data)
3. **Document upload**: Business permit, DTI/SEC, Valid ID (drag-and-drop, base64 storage)
4. **Form validation**: Zod schemas per step, no skipping allowed
5. **Cover note PDF**: Auto-generated with control number and 6-hour validity
6. **E-Policy PDF**: Declarations, insuring agreements, exclusions, conditions
7. **Payment stub**: Simulated payment with proof-of-payment upload
8. **State persistence**: Zustand + localStorage so users can resume after refresh
9. **Mobile-first**: Primary use case is phone-based applications

**Deferred to v2:** Real payment gateway, email delivery, user accounts, admin panel.

---

## Architecture Pattern

**Single-route wizard** at `/apply`. Zustand store is the single source of truth — forms read defaults from it and write back on submit. Each step is a separate component wrapped in Framer Motion `AnimatePresence`. Data flows: `User Input → react-hook-form → Zod → Zustand → localStorage → PDF generation`.

```
/apply
├── ProgressBar (0-6)
├── Step components (animated transitions)
├── Navigation (Back / Continue — disabled until valid)
└── Zustand store (persisted to localStorage)
```

---

## Critical Pitfalls

1. **PSGC JSON is 2.3MB** — Load lazily (fetch on Location step, not on page load) or let Next.js bundle it statically. Don't block initial render.

2. **Base64 files blow up localStorage** — Limit uploads to 5MB each, validate in UI. Acceptable for demo; production needs server upload.

3. **PDF generation is manual positioning** — Use Helvetica built-in fonts only, test with long names, keep layout tabular and simple. Filipino names in insurance rarely have special characters.

4. **Cascading select race conditions** — When Region changes, clear Province/City/Barangay. Form validation must check location consistency.

5. **State desynchronization** — Always save to Zustand on step advancement. Load form defaults from store. Never let form state and store state diverge.

---

## Build Order

| Phase | What | Depends On |
|-------|------|-----------|
| **1. Foundation** | Project setup, Tailwind, shadcn/ui, layout, ProgressBar | — |
| **2. State & Validation** | Zustand store, Zod schemas, PSGC data loader | Phase 1 |
| **3. Form Steps** | Steps 1-4 (BusinessInfo, Location, Contact, Documents) | Phase 2 |
| **4. PDF Generation** | Cover note and e-policy PDF generators | Phase 3 |
| **5. Completion Flow** | Steps 5-7 (CoverNote, Payment, Success), wiring | Phase 4 |
| **6. Polish** | Animations, mobile testing, edge cases, error handling | Phase 5 |

Phases 1-2 are foundational. Phase 3 is the bulk of the work. Phases 4-5 close the loop. Phase 6 makes it production-presentable.

---

*Research completed: 2026-03-21 | Sources: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*
