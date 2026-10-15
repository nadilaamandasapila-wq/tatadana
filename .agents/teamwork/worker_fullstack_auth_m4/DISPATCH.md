# Dispatch Assignment: Full-Stack Next.js & Payment Engineer (M4)

Working Directory: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_fullstack_auth_m4
Project Root: C:\Users\nadil\.gemini\antigravity\scratch\tatadana
Original Request Path: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Project Plan: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\PROJECT.md
Audit Report: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_codebase_audit\report.md

## Exclusive File Ownership:
- `src/app/(auth)/**`
- `src/components/landing/**`
- `src/lib/payment/**`
- `src/app/api/payment/**`
- `src/app/page.tsx`
- `next.config.js`

## Mandatory Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mission:
You are the Full-Stack Next.js & Payment Engineer for TataDana.
1. Read `ORIGINAL_REQUEST.md` and `PROJECT.md`.
2. Address M4 audit findings:
   - **CRITICAL ROUTING FIX**:
     - Fix the 404 links: in `Navbar.tsx`, `Hero.tsx`, `Pricing.tsx`, `FinalCTA.tsx`, and auth pages, change `/auth/login` and `/auth/register` to `/login` and `/register`.
     - In `next.config.js`, also add `rewrites()` so that `/auth/login` rewrites to `/login` and `/auth/register` rewrites to `/register` for maximum backwards compatibility!
   - Landing Page (14 sections):
     - Verify all 14 ordered sections: Sticky Navbar, Pre-headline badge, H1 gradient, Sub-headline, Hero video placeholder (`// TODO: ganti dengan video asli`), CTA buttons, Problem bullets, Solution, Interactive Bot simulator, Alternating 3 features, Testimonial masonry (`// TODO: ganti dengan testimoni asli`), Pricing toggle (Starter Rp49k/bln vs Pro Rp99k lifetime), FAQ (7 questions), Final CTA & 4-column footer.
   - Auth Pages:
     - Split layout (40% orange branding, 60% white form).
     - Support Email/Password, Google OAuth, and Phone OTP with dev bypass code `123456`.
     - Auto-setup on registration: default wallet `Tunai`, default categories, and onboarding checklist.
   - Midtrans Payment Integration:
     - In `src/app/api/payment/midtrans-webhook/route.ts`, enforce cryptographic SHA-512 signature verification (`verifyMidtransSignature`) before updating subscription status.
     - Support `/api/payment/create-snap-token/route.ts`.
     - Ensure proper subscription lifecycle status updates (`active`, `pending`, `expired`).
3. Verify your changes.
4. Write `changes.md` and `handoff.md` in your working directory.
5. Send completion message to parent orchestrator (`f97a728b-f0fe-408f-8312-c163fb72bca4`).

## 2026-10-15T03:59:11Z
You are the Full-Stack Next.js & Payment Engineer (M4) for TataDana.
Your working directory is: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_fullstack_auth_m4
Project root: C:\Users\nadil\.gemini\antigravity\scratch\tatadana
Dispatch file: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_fullstack_auth_m4\DISPATCH.md
Original user request file: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Project plan: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\PROJECT.md
Audit Report: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_codebase_audit\report.md

Read DISPATCH.md and ORIGINAL_REQUEST.md immediately.
Set up BRIEFING.md and progress.md in your working directory.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your exclusive file ownership:
- src/app/(auth)/**
- src/components/landing/**
- src/lib/payment/**
- src/app/api/payment/**
- src/app/page.tsx
- next.config.js

Execute your tasks per DISPATCH.md:
1. CRITICAL ROUTING FIX: In Navbar.tsx, Hero.tsx, Pricing.tsx, FinalCTA.tsx, and auth pages, change all /auth/login and /auth/register links to /login and /register. Also in next.config.js add rewrites for /auth/:path* -> /:path* so both paths work seamlessly.
2. Landing Page: Verify 14 sequential sections with interactive Telegram Bot simulator.
3. Auth Pages: Split layout (40% orange branding / 60% white form), Email/Password, Google OAuth, and Phone OTP with dev bypass 123456. Auto-setup on registration (default Tunai wallet, categories, onboarding checklist).
4. Midtrans Payment: Enforce SHA-512 signature verification in /api/payment/midtrans-webhook/route.ts before updating subscription status. Snap token creation route.
5. Verify tests: npx tsx tests/e2e/tier1_features/t1_auth_payment.test.ts.
6. Write changes.md and handoff.md, then send completion message to parent orchestrator (f97a728b-f0fe-408f-8312-c163fb72bca4).

