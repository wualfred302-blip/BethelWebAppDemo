# Stack Research: Bethel CGL Web Application

## Recommended Stack

| Category | Technology | Version | Confidence |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | High |
| Language | TypeScript | 5.x | High |
| React | React 19 | 19.x | High |
| Styling | Tailwind CSS v4 | 4.x | High |
| Components | shadcn/ui (new-york) | 3.x | High |
| Form Management | react-hook-form | 7.x | High |
| Validation | Zod | 4.x | High |
| Form-Zod Bridge | @hookform/resolvers | 5.x | High |
| State Management | Zustand (persist) | 5.x | High |
| Animations | Framer Motion | 12.x | High |
| Icons | Lucide React | 0.575.x | High |
| PDF Generation | pdf-lib | 1.17.x | Medium |
| CSS Utilities | clsx + tailwind-merge | 2.x / 3.x | High |
| CSS Variants | class-variance-authority | 0.7.x | High |
| Font | Inter (next/font/google) | — | High |
| Deployment | Vercel | — | High |

## Rationale

### Why replicate the reference stack exactly
The Barangay Linkod project is a proven, working implementation with identical patterns (multi-step wizard, form validation, state management, file uploads). Replicating it means:
- No unknowns in architecture
- Proven component patterns
- Same developer experience
- Can copy-paste and adapt rather than build from scratch

### Why pdf-lib for PDF generation
- Lightweight (~300KB), no server dependency
- Works entirely client-side
- Good for generating structured PDFs (cover notes, policies)
- Alternative: @react-pdf/renderer (React-based PDFs, heavier)
- Alternative: Puppeteer (server-side only, overkill for this)

### Why Zustand over Redux/Context
- Minimal boilerplate
- Built-in persist middleware (localStorage)
- Already proven in reference project
- Perfect for wizard state that survives page refresh

### Why no backend
- This is a frontend demo/prototype
- No database needed for form submission
- PDFs generated client-side
- Payment is simulated
- Can add backend later if needed

## What NOT to use
- **Redux:** Overkill for wizard state
- **Material UI / Ant Design:** Wrong aesthetic for insurance app
- **Prisma / Drizzle:** No database in scope
- **NextAuth:** No authentication in scope
- **React-PDF:** pdf-lib is simpler for structured documents

---
*Research conducted: 2026-03-21*
