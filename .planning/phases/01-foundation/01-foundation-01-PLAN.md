---
phase: 01-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - tsconfig.json
  - next.config.ts
  - postcss.config.mjs
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/page.tsx
  - components.json
  - src/lib/utils.ts
  - src/components/ui/button.tsx
  - src/components/ui/input.tsx
  - src/components/ui/label.tsx
autonomous: true
requirements:
  - UI-02
  - UI-03
  - UI-06

must_haves:
  truths:
    - "App runs at localhost:3000 without errors"
    - "Browser tab shows 'Bethel CGL' as title"
    - "Inter font loads and applies to body text"
    - "Primary blue (#2563EB) is available as CSS variable and Tailwind class"
  artifacts:
    - path: "package.json"
      provides: "Project dependencies (next, react, zustand, framer-motion, react-hook-form, zod, lucide-react, shadcn/ui libs)"
    - path: "src/app/layout.tsx"
      provides: "Root layout with Inter font, metadata title 'Bethel CGL', no ThemeProvider"
    - path: "src/app/globals.css"
      provides: "Tailwind v4 imports, --primary CSS variable (#2563EB oklch), @theme inline block, no dark mode"
    - path: "postcss.config.mjs"
      provides: "@tailwindcss/postcss plugin config"
    - path: "components.json"
      provides: "shadcn/ui config (new-york style, zinc base, CSS variables)"
    - path: "src/lib/utils.ts"
      provides: "cn() utility combining clsx + tailwind-merge"
    - path: "src/components/ui/button.tsx"
      provides: "Button component with CVA variants, forwardRef, isLoading state"
    - path: "src/components/ui/input.tsx"
      provides: "Input component with label, error, icon props, forwardRef"
  key_links:
    - from: "src/app/globals.css"
      to: "all components"
      via: "--primary CSS variable drives accent color globally"
      pattern: "--primary.*2563EB"
    - from: "src/app/layout.tsx"
      to: "src/app/globals.css"
      via: "import './globals.css' in layout"
      pattern: "import.*globals.css"
---

<objective>
Set up the Bethel CGL Next.js project with all dependencies, shadcn/ui configuration, global styles, base UI components, and root layout.

Purpose: Every subsequent plan depends on the project existing with correct dependencies, styling, and base components.
Output: Working Next.js 16 project with TypeScript, Tailwind v4, shadcn/ui (new-york), and core dependencies installed.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/execute-plan.md
@./.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Initialize Next.js project</name>
  <files>package.json, tsconfig.json, next.config.ts</files>
  <action>
    Run `npx create-next-app@latest bethel-cgl --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` inside `C:\Users\ampoy\Bethel`.

    Then install all dependencies using the exact versions from the Barangay Linkod reference project:
    ```
    npm install @hookform/resolvers class-variance-authority clsx framer-motion lucide-react react-hook-form tailwind-merge zod zustand
    ```

    Versions to pin (matching reference):
    - framer-motion: ^12.34.3
    - lucide-react: ^0.575.0
    - zustand: ^5.0.11
    - react-hook-form: ^7.71.2
    - zod: ^4.3.6
    - @hookform/resolvers: ^5.2.2
    - class-variance-authority: ^0.7.1
    - clsx: ^2.1.1
    - tailwind-merge: ^3.5.0

    Do NOT install next-themes, @radix-ui packages, radix-ui, or tw-animate-css (not needed — no dark mode, shadcn adds Radix deps automatically).

    After install, delete the default `src/app/favicon.ico` content page styles (keep file, just clean up the default page content).
  </action>
  <verify>Run `npm run build` in the bethel-cgl directory — should complete without errors.</verify>
  <done>Project initializes, all dependencies install without errors, build succeeds.</done>
</task>

<task type="auto">
  <name>Task 2: Configure shadcn/ui and add base components</name>
  <files>components.json, src/lib/utils.ts, src/components/ui/button.tsx, src/components/ui/input.tsx, src/components/ui/label.tsx</files>
  <action>
    Run `npx shadcn@latest init` with these settings:
    - Style: new-york
    - Base color: zinc
    - CSS variables: yes

    Then add components:
    ```
    npx shadcn@latest add button input label
    ```

    After shadcn generates the files, customize `src/components/ui/button.tsx`:
    - Change primary variant from default zinc to use `bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600`
    - Change outline variant to use `border-2 border-blue-600 text-blue-600 hover:bg-blue-600/10 focus-visible:ring-blue-600`
    - Keep all other variants (secondary, ghost) and sizes unchanged
    - Keep the isLoading spinner and forwardRef pattern

    The generated `src/lib/utils.ts` should contain the standard `cn()` function combining clsx + twMerge. Verify it matches:
    ```typescript
    import { clsx, type ClassValue } from "clsx"
    import { twMerge } from "tailwind-merge"
    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs))
    }
    ```

    The generated `src/components/ui/input.tsx` should be left as-is (shadcn defaults are sufficient — focus ring color comes from --ring CSS variable).
  </action>
  <verify>Run `npm run build` — no TypeScript errors. Verify `components.json` exists with style "new-york". Verify Button component has blue-600 in primary variant.</verify>
  <done>shadcn/ui configured, Button customized with Bethel blue, Input and Label added, all compile without errors.</done>
</task>

<task type="auto">
  <name>Task 3: Set up globals.css, postcss, and root layout</name>
  <files>src/app/globals.css, postcss.config.mjs, src/app/layout.tsx, src/app/page.tsx</files>
  <action>
    **globals.css** — Overwrite with Bethel-specific styles. Use Tailwind v4 syntax. NO dark mode support.

    ```css
    @import "tailwindcss";
    @import "shadcn/tailwind.css";

    :root {
      /* Bethel brand color */
      --primary: oklch(0.5406 0.1809 264.05);
      --primary-foreground: #ffffff;

      /* shadcn/ui zinc theme (light mode only) */
      --background: oklch(1 0 0);
      --foreground: oklch(0.145 0 0);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.145 0 0);
      --popover: oklch(1 0 0);
      --popover-foreground: oklch(0.145 0 0);
      --secondary: oklch(0.97 0 0);
      --secondary-foreground: oklch(0.205 0 0);
      --muted: oklch(0.97 0 0);
      --muted-foreground: oklch(0.556 0 0);
      --accent: oklch(0.97 0 0);
      --accent-foreground: oklch(0.205 0 0);
      --destructive: oklch(0.577 0.245 27.325);
      --destructive-foreground: #ffffff;
      --border: oklch(0.922 0 0);
      --input: oklch(0.922 0 0);
      --ring: oklch(0.5406 0.1809 264.05);
      --radius: 0.625rem;
    }

    @theme inline {
      --color-background: var(--background);
      --color-foreground: var(--foreground);
      --color-primary: var(--primary);
      --color-primary-foreground: var(--primary-foreground);
      --color-secondary: var(--secondary);
      --color-secondary-foreground: var(--secondary-foreground);
      --color-muted: var(--muted);
      --color-muted-foreground: var(--muted-foreground);
      --color-accent: var(--accent);
      --color-accent-foreground: var(--accent-foreground);
      --color-destructive: var(--destructive);
      --color-destructive-foreground: var(--destructive-foreground);
      --color-border: var(--border);
      --color-input: var(--input);
      --color-ring: var(--ring);
      --radius-sm: calc(var(--radius) - 4px);
      --radius-md: calc(var(--radius) - 2px);
      --radius-lg: var(--radius);
      --radius-xl: calc(var(--radius) + 4px);
      --radius-2xl: calc(var(--radius) + 8px);
      --font-sans: var(--font-inter), system-ui, sans-serif;
    }

    * {
      border-color: var(--border);
    }

    body {
      font-family: var(--font-sans);
      min-height: 100vh;
      background: var(--background);
      color: var(--foreground);
    }

    @layer base {
      * {
        @apply border-border outline-ring/50;
      }
      body {
        @apply bg-background text-foreground;
      }
    }
    ```

    **postcss.config.mjs** — Confirm it has only the @tailwindcss/postcss plugin (create-next-app should generate this):
    ```js
    const config = {
      plugins: {
        "@tailwindcss/postcss": {},
      },
    };
    export default config;
    ```

    **layout.tsx** — Replace with Bethel layout. Import Inter from next/font/google, set metadata title to "Bethel CGL", description to "Bethel General Insurance — Comprehensive General Liability Application". NO ThemeProvider wrapper.
    ```tsx
    import type { Metadata } from "next";
    import { Inter } from "next/font/google";
    import "./globals.css";

    const inter = Inter({
      variable: "--font-inter",
      subsets: ["latin"],
      display: "swap",
    });

    export const metadata: Metadata = {
      title: "Bethel CGL",
      description: "Bethel General Insurance — Comprehensive General Liability Application",
    };

    export default function RootLayout({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) {
      return (
        <html lang="en">
          <body className={`${inter.variable} font-sans antialiased`}>
            {children}
          </body>
        </html>
      );
    }
    ```

    **page.tsx** — Replace with redirect to /apply:
    ```tsx
    import { redirect } from "next/navigation";
    export default function Home() {
      redirect("/apply");
    }
    ```
  </action>
  <verify>Run `npm run build` — no errors. Check that build output shows no dark mode warnings.</verify>
  <done>globals.css has Bethel blue as --primary, no dark mode. Layout loads Inter font, title is "Bethel CGL", no ThemeProvider. Root redirects to /apply.</done>
</task>

</tasks>

<verification>
1. `npm run build` completes without errors
2. `npm run dev` starts without errors
3. Browser tab at localhost:3000 shows "Bethel CGL" as title
4. Root page redirects to /apply
5. Inter font is applied to body
6. shadcn/ui Button and Input components compile
</verification>

<success_criteria>
- Next.js 16 project exists at C:\Users\ampoy\Bethel\bethel-cgl
- All dependencies installed (zustand, framer-motion, react-hook-form, zod, lucide-react, shadcn/ui libs)
- shadcn/ui configured with new-york style, zinc base, CSS variables
- Button component uses blue-600 for primary variant
- globals.css has --primary as Bethel blue (#2563EB), no dark mode
- Root layout uses Inter font, title "Bethel CGL", no ThemeProvider
- Root page redirects to /apply
- Build succeeds with no TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-01-SUMMARY.md`
</output>
