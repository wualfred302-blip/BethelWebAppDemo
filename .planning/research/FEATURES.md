# Features Research: Bethel CGL Web Application

## Domain Context

Comprehensive General Liability (CGL) insurance is required by Philippine LGUs before issuing business permits. The application process is traditionally done in-person with insurance agents. Bethel General Insurance wants to digitize this process.

## Feature Categories

### Table Stakes (Must Have)

These are features users expect from any online insurance application:

- **Business information form** — Name of assured, business name, floor area, nature of business
- **Address input** — Cascading Philippine address (Region → Province → City → Barangay)
- **Contact collection** — Email and mobile number
- **Coverage selection** — Limit of liability options
- **Document upload** — Business permit, DTI/SEC, valid ID
- **Form validation** — Every field validated before proceeding
- **Progress indicator** — Users know where they are in the flow
- **Cover note generation** — Auto-generated with control number
- **Billing invoice** — Shows premium amount
- **Payment instructions** — How and where to pay
- **Proof of payment upload** — Screenshot of transaction
- **Policy delivery** — Electronic policy document
- **Mobile responsive** — Must work on phones (primary use case)

### Differentiators (Nice to Have)

Features that make this better than competitor implementations:

- **Validity countdown timer** — Real-time countdown on cover note (1-6 hours)
- **State persistence** — Resume application after page refresh
- **Smooth transitions** — Framer Motion page transitions between steps
- **Realistic PDF generation** — Professional-looking cover note and policy PDFs
- **Post-completion upsell** — Links to other Bethel products (Fire, Motor, Bonds, etc.)
- **Drag-and-drop upload** — Better UX than click-only file input

### Anti-Features (Things to Avoid)

- **User accounts / login** — Adds friction, not needed for one-time application
- **Complex branching logic** — Keep flow linear and simple
- **Real payment integration** — Stub only, real gateway is future work
- **Email sending** — Download PDFs on-screen, real email is future work
- **Admin panel** — Separate project entirely

## Philippine CGL Application Fields

Based on research of real PH CGL insurers (Allied Bankers, SGI Philippines, Liberty Insurance, Bethel's own product):

### Required Fields
| Field | Purpose |
|---|---|
| Full Name of Assured | Person/entity on the policy |
| Business Name | Entity being insured |
| Business Address | Location of insured premises |
| Floor Area (sqm) | Primary pricing factor |
| Nature of Business | Risk classification |
| Email Address | Policy delivery |
| Mobile Number | Contact/coordination |
| Limit of Liability | Coverage amount |

### Required Documents
| Document | Purpose |
|---|---|
| Business Permit | LGU requirement for business permit renewal |
| DTI or SEC Registration | Business registration proof |
| Valid Government ID | Identity verification |

### Nature of Business Categories (24 types)
1. Office / Professional Services
2. Retail / Wholesale Trade
3. Restaurant / Food Service / Food Processing
4. Hotel / Accommodation / Inn
5. Manufacturing / Industrial
6. Construction / Contractors
7. Warehouse / Storage
8. Healthcare / Clinic / Hospital
9. Education / School / Training Center
10. Entertainment / Recreation / Amusement
11. Transportation / Logistics
12. Real Estate / Property Management
13. Financial Services / Bank / Insurance
14. Salon / Spa / Personal Care
15. Gym / Fitness / Sports Facility
16. Gasoline Station / Fuel Depot
17. Pharmacy / Drugstore
18. Auto Shop / Car Wash / Motor Repair
19. Laundry / Dry Cleaning
20. Printing / Publishing
21. Agriculture / Farming
22. Mining / Quarrying
23. IT / Tech / BPO
24. Other (specify)

## Competitor Reference: Allied Bankers Online CGL

Allied Bankers Insurance Corporation (ABIC) has a working online CGL at cglinsurance.alliedbankers.com.ph:
- Collects: area, nature of business, location, contact info
- Pricing by floor area (1-20 sqm = ₱1,121.49 in Makati)
- Payment: online banking, OTC, bills payment, remittance
- Policy sent via email after payment verification
- No login required

---
*Research conducted: 2026-03-21*
