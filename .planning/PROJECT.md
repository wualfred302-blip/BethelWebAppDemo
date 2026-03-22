# Bethel CGL Web Application

## What This Is

A mobile-first web application for Bethel General Insurance and Surety Corporation that lets business owners apply for Comprehensive General Liability (CGL) insurance online. The app walks applicants through a 7-step wizard — from filling out business details to uploading documents, generating a cover note with billing invoice, making payment, and receiving an electronic policy via email.

## Core Value

Business owners can complete a CGL insurance application entirely online in one session — no agent visit, no paperwork — and receive a valid policy document delivered to their email.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 4-step wizard flow: Business → Contact & Docs → Review & Pay → Done
- [ ] Cascading Philippine address selects (Region → Province → City → Barangay) using PSGC data
- [ ] Document upload for Business Permit, DTI/SEC Registration, and Valid Government ID
- [ ] Auto-generated Cover Note PDF with control number and 6-hour validity countdown
- [ ] Auto-generated Billing Invoice showing premium amount (calculated on Review step)
- [ ] Payment options: Online Banking, Bank Transfer, Over-the-Counter, GCash
- [ ] Proof of payment upload
- [ ] Auto-generated Electronic Policy PDF
- [ ] Success page with Bethel contact info and links to other insurance products
- [ ] Progress bar showing 4-step completion
- [ ] Form validation on every step
- [ ] State in Zustand (NO localStorage — page refresh starts fresh)
- [ ] Smooth page transitions (Framer Motion)

### Out of Scope

- Authentication / login — no user accounts, applicants are anonymous
- Admin dashboard — separate project
- Real payment gateway integration — stub payment details only
- Email delivery — PDFs are downloadable on-screen, email sending is simulated
- Mobile app — web-first, responsive design only

## Context

**Company:** Bethel General Insurance and Surety Corporation (formerly BF General Insurance Company, founded 1961)
**Website:** bethelgen.com
**Head Office:** Unit 200, 2nd Floor Valero Plaza 124, Valero St., Salcedo Village, Makati City 1227
**Phone:** +632 8817-2002 to 05
**Email:** inquiries@bethelgen.com

**Products offered:** Fire, Motor Car, Bonds, Engineering, Casualty (CGL), Marine

**Reference project:** Barangay Linkod Web Registration (`C:\Users\ampoy\Barangay Linkod Project\BarangayLinkodWebRegistration-main`)
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui (new-york style)
- react-hook-form + Zod + @hookform/resolvers
- Zustand with persist middleware
- Framer Motion step transitions
- Lucide React icons, Inter font
- Custom CVA-based Button, Input, Select components
- Mobile-first single-column layout (max-w-md centered)
- Neon mint (#00FFA3) accent → replaced with blue (#2563EB)

**PSGC data:** `C:\Users\ampoy\Downloads\App Assets\philippine_full.json` — hierarchical: region → province → municipality → barangay

**CGL context:** Required by Philippine LGUs before issuing business permits. Premium based on floor area (sqm), nature of business, location, and desired coverage limit.

## Constraints

- **Reference patterns:** Must replicate Barangay Linkod project architecture and component patterns
- **Color scheme:** Professional blue (#2563EB) instead of neon mint (#00FFA3)
- **No auth:** No login/signup — pure application wizard
- **No logo:** Text-only branding ("Bethel"), no logo assets required
- **Mobile-first:** Single-column max-w-md layout, primary use case is mobile browsers
- **PDF generation:** Must produce realistic-looking Cover Note and E-Policy PDFs
- **Premium calculation:** Placeholder until user provides pricing table

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No authentication | Simplifies flow, matches real PH insurer CGL web apps (Allied Bankers has no auth) | — Pending |
| Blue accent (#2563EB) | User preference, professional insurance feel | — Pending |
| 7-step wizard | Matches Bethel's documented flow from their PDF spec | — Pending |
| PSGC cascading address | User provided PSGC data file, standard for PH addresses | — Pending |
| pdf-lib for PDFs | Lightweight, no server dependency, works client-side | — Pending |
| Placeholder pricing | User has pricing table but wants form built first | — Pending |

---
*Last updated: 2026-03-21 after project initialization*
