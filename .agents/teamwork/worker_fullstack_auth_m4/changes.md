# Changes Record — Milestone M4: Full-Stack Next.js & Payment Integration

**Worker Role:** Full-Stack Next.js & Payment Engineer (M4)  
**Date:** 2026-10-15  
**Working Directory:** `C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_fullstack_auth_m4`  

---

## 1. Summary of Edits

### A. Routing & Navigation Fix (Fixes 404 Route Mismatches)
1. **`next.config.js`**:
   - Added asynchronous `rewrites()` rule mapping `/auth/:path*` -> `/:path*`.
   - Ensures legacy/direct visits to `/auth/login` or `/auth/register` automatically resolve to `/login` and `/register` without 404 errors.
2. **`src/components/landing/Navbar.tsx`**:
   - Replaced all desktop and mobile menu links from `/auth/login` to `/login` and `/auth/register` to `/register`.
3. **`src/components/landing/Hero.tsx`**:
   - Replaced CTA link from `/auth/register` to `/register`.
4. **`src/components/landing/Pricing.tsx`**:
   - Replaced all tier plan buttons from `/auth/register` to `/register`.
5. **`src/components/landing/FinalCTA.tsx`**:
   - Replaced bottom CTA button link from `/auth/register` to `/register`.
6. **`src/app/(auth)/login/page.tsx`**:
   - Replaced "Daftar Gratis" link from `/auth/register` to `/register`.
7. **`src/app/(auth)/register/page.tsx`**:
   - Replaced "Masuk di sini" link from `/auth/login` to `/login`.

---

### B. Landing Page Compliance (14 Sections Verification)
1. **`src/app/page.tsx`**:
   - Verified 14-section rendering order:
     1. Sticky Navbar (`Navbar.tsx`)
     2. Pre-headline badge (`Hero.tsx`)
     3. Gradient orange H1 headline (`Hero.tsx`)
     4. Sub-headline (`Hero.tsx`)
     5. Hero video placeholder (`Hero.tsx`)
     6. Primary & secondary CTA buttons (`Hero.tsx`)
     7. Problem bullet points (`ProblemSolution.tsx`)
     8. Solution transition ("Introducing TataDana" / `ProblemSolution.tsx`)
     9. Interactive Telegram Bot Simulator (`BotSimulator.tsx`)
     10. Dashboard preview card & stats (`DashboardPreview.tsx`)
     11. Alternating 3 features (`Features.tsx`)
     12. Testimonials masonry grid (`Testimonials.tsx`)
     13. Pricing toggle: Starter Rp49k/bln vs Pro Rp99k lifetime (`Pricing.tsx`)
     14. FAQ (7 questions) (`FAQ.tsx`), Final CTA (`FinalCTA.tsx`) & 4-Column Footer (`Footer.tsx`).
2. **`src/components/landing/Hero.tsx`**:
   - Aligned Pre-headline badge to: `"✨ Catat keuangan langsung dari Telegram"`.
   - Aligned Gradient H1 to: `"Gaji habis sebelum akhir bulan? Sudah saatnya kamu tahu ke mana uangmu pergi."`.
   - Aligned Sub-headline to: `"TataDana mencatat setiap pengeluaranmu langsung dari chat Telegram atau foto struk — sisanya kami yang urus."`.
   - Added placeholder comment: `{/* // TODO: ganti dengan video asli */}`.
3. **`src/components/landing/Testimonials.tsx`**:
   - Added placeholder comment: `{/* // TODO: ganti dengan testimoni asli */}`.
4. **`src/components/landing/Pricing.tsx`**:
   - Implemented toggle for **Bulanan (Starter Rp49k/bln)** vs **Sekali Bayar (Pro Rp99k Lifetime)**.
   - Accurately displays Starter price at Rp 49.000 / bulan and Pro at Rp 99.000 sekali bayar (Lifetime).

---

### C. Split-Layout Authentication & Auto-Setup
1. **`src/app/(auth)/login/page.tsx`**:
   - Preserved 40% orange branding accent (`lg:col-span-5`) + 60% clean white container (`lg:col-span-7`).
   - Integrated Supabase `createBrowserClient` with password authentication and graceful offline demo fallback.
   - Maintained phone OTP dev bypass with code `123456`.
   - Integrated Google OAuth via Supabase `signInWithOAuth` with redirect to `/dashboard`.
2. **`src/app/(auth)/register/page.tsx`**:
   - Preserved 40% orange branding accent + 60% clean white container.
   - Built genuine registration auto-setup:
     - Sets up user profile with name, email, and phone.
     - Automatically verifies and provisions default `Tunai Dompet` (`is_default = true`, `type = 'cash'`).
     - Provisions 9 default categories (both income & expense).
     - Initializes onboarding checklist state in `localStorage` (`tatadana_onboarding_checklist`).
     - Integrated Supabase `signUp` when live Supabase credentials are present.
     - Wired Google OAuth registration button.

---

### D. Midtrans Payment Subsystem & Cryptographic Webhook
1. **`src/lib/payment/midtrans.ts`**:
   - `createSnapToken`: Added sequential atomic counter (`orderSequence++`) to guarantee strictly unique order IDs (`TATADANA-<timestamp>-<seq>-<rand>`) and snap tokens across rapid consecutive requests, passing boundary case `PAY-B4`.
   - `verifyMidtransSignature`: Implements genuine SHA-512 cryptographic verification (`crypto.createHash('sha512').update(payload).digest('hex')`).
   - `handleMidtransNotification`:
     - Upgrades subscription to `pro` and sets `status = 'active'` upon `capture` (with `fraud_status = accept`) or `settlement`.
     - Updates subscription status to `expired` on `transaction_status === 'expire'`.
     - Updates subscription status to `cancelled` on `transaction_status === 'cancel' | 'deny'`.
     - Leaves subscription unchanged on `transaction_status === 'pending'`.
     - Syncs updates to PostgreSQL via `createAdminClient()` when configured.
2. **`src/app/api/payment/midtrans-webhook/route.ts`**:
   - Enforced cryptographic SHA-512 signature verification (`verifyMidtransSignature`) prior to updating subscription state.
   - Rejects unverified signatures with HTTP 403 Forbidden.
   - Returns 200 OK with lifecycle status acknowledgment upon valid notification.
