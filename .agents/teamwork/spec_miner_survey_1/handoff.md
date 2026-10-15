# Handoff Report: Survey Phase Specification Mining (UI, Dashboards, Landing, Auth, Limits & AC)

**Agent**: `spec_miner_survey_1`  
**Parent**: `ffea170e-96ab-46c8-ba88-cc2c8db6b61f`  
**Milestone**: Survey & Decomposition Phase  
**Output Report**: `C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\spec_miner_survey_1\report.md`  

---

## 1. Observation

Direct observations from authoritative project specification at `C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md`:

1. **R3 User Dashboard & In-App Reports** (Lines 56-65):
   - Line 57: *"Tema orange-putih (#F97316 / Orange 500, background neutral-50/100, border subtle, font Inter/Plus Jakarta Sans)."*
   - Line 58: *"Halaman Beranda: 4 stats cards (Saldo Total, Pemasukan Bulan Ini, Pengeluaran Bulan Ini, Budget Tersisa), Pie Chart kategori, Bar Chart 6 bulan pemasukan vs pengeluaran, Trend line harian, 10 transaksi terbaru, empty state onboarding checklist."*
   - Line 59: *"Filter periode: Harian, Mingguan, Bulanan, Tahunan, Custom date range."*
   - Line 60: *"Halaman Transaksi: Form catat pemasukan/pengeluaran/transfer, tabel transaksi dengan expand item struk."*
   - Line 61: *"Halaman Budget: Set budget per kategori, progress bar 80% & 100% threshold alert."*
   - Line 62: *"Halaman Laporan (📊 Laporan): Tabel transaksi pagination & sorting, filter lengkap, ringkasan net cashflow, tombol export on-demand ke PDF & Excel (.xlsx), riwayat export tersimpan."*
   - Line 63: *"Halaman Wallet: Manajemen multi-wallet dan pemilihan 1 default wallet untuk bot Telegram."*
   - Line 64: *"Halaman Settings: Tab Profil, Tab Telegram Bot (panduan @BotFather, input token, tombol "Test Koneksi" dengan indikator "⏳ Testing...", "🟢 Terhubung", "🔴 Tidak terhubung"), Tab Reminder (toggle ON/OFF, jam, preview), Tab Kategori (kategori custom dengan emoji & warna)."*
   - Line 65: *"Supabase Realtime integrasi agar data sinkron seketika saat ada input dari Telegram."*

2. **R4 Admin Dashboard** (Lines 67-74):
   - Line 68: *"Halaman terpisah khusus role superadmin dengan navigasi admin."*
   - Line 69: *"AI Provider Manager: Konfigurasi API keys (Gemini, OpenAI, DeepSeek), switch mode Single vs Failover, status kesehatan provider."*
   - Line 70: *"User Management: Daftar semua user, plan aktif, nomor HP, status koneksi Telegram, tombol "Impersonate" untuk login sebagai user tanpa kredensial."*
   - Line 71: *"AI Logs & Analytics: Riwayat pemanggilan AI, latensi, token usage, estimasi biaya, filter error."*
   - Line 72: *"Transaction Inspector: Fitur audit transaksi user untuk keperluan customer support yang mencatat setiap pembukaan ke `admin_audit_logs`."*
   - Line 73: *"Payment Approvals: Daftar transaksi Midtrans & manual transfer dengan tombol Approve/Reject."*
   - Line 74: *"Internal Data Export: Export ringkasan data users & platform."*

3. **R5 Landing Page & Auth** (Lines 76-95):
   - Lines 77-91: Landing page with 14 sequential sections: 1. Sticky Navbar, 2. Pre-headline badge (`✨ Catat keuangan langsung dari Telegram`), 3. Headline H1 (`Gaji habis sebelum akhir bulan? Sudah saatnya kamu tahu ke mana uangmu pergi.` with orange gradient), 4. Sub-headline, 5. Hero video placeholder (`// TODO: ganti dengan video asli`), 6. CTA buttons (`Mulai Gratis Sekarang` + `Lihat cara kerjanya →`), 7. Problem bullet points, 8. Solusi, 9. Interactive Dashboard Preview (Dummy bot chat Telegram with visual progress bar `█` and `░` + mini dashboard), 10. Fitur section (alternating 3 features), 11. Testimoni masonry grid (`// TODO: ganti dengan testimoni asli`), 12. Pricing toggle (Starter Rp49k/bln vs Pro Rp99k sekali bayar), 13. FAQ (7 questions), 14. Final CTA orange gradient & 4-column footer.
   - Lines 92-94: *"Auth Pages (Login & Register): Split layout 40% branding orange + 60% form putih. Opsi: Email/Password, Google OAuth, Nomor HP dengan verifikasi OTP (kode dev 123456). Auto-setup akun saat registrasi (default wallet, kategori rekomendasi onboarding, onboarding checklist)."*

4. **Starter vs Pro Limits** (Lines 54, 89, 106):
   - Starter: Rp 49.000 / bln, max 50 transactions/month, receipt photo OCR rejected with educational upgrade message, proactive AI advisor disabled, daily reminder max 2x/day.
   - Pro: Rp 99.000 one-time payment, unlimited transactions, multimodal vision receipt OCR enabled, proactive AI advisor enabled.

5. **Acceptance Criteria** (Lines 98-107):
   - AC-1: Database migration SQL script in `supabase/migrations/001_initial_schema.sql` clean execution.
   - AC-2: Endpoint `/api/telegram/webhook` idempotency via `update_id` and WIB timezone.
   - AC-3: NLP parser handles Indonesian currency slangs (`15rb`, `500k`, `1.5jt`, `2.500.000`).
   - AC-4: PDF and Excel export generation from `/reports` with signed URLs in `tatadana-exports`.
   - AC-5: "Test Koneksi" button in settings calls `getMe` & `setWebhook` displaying real-time states (`⏳ Testing...`, `🟢 Terhubung`, `🔴 Tidak terhubung`).
   - AC-6: Starter plan limits strictly enforced (50 tx/month ceiling, receipt OCR block, AI advisor block).
   - AC-7: Responsive orange-white fintech design across 375px (mobile) and 1280px (desktop).

---

## 2. Logic Chain

1. **Architecture & Scope Mapping**:
   - From Observation 1, R3 encompasses 6 major views (Home/Overview, Transactions, Budget, Reports, Wallets, Settings) and a live WebSocket synchronization layer (Supabase Realtime).
   - From Observation 2, R4 requires a role-guarded portal (`role = 'admin'`) with 6 distinct operational modules: AI Provider Manager, User Directory with Impersonation, AI Observability Logs, Transaction Inspector, Payment Approvals, and Platform Export.
   - From Observation 3, R5 demands a 14-section marketing landing page, an interactive dual-panel bot simulator, and a split-screen authentication framework supporting Email, Google OAuth, and Phone OTP with a deterministic dev bypass (`123456`).

2. **Data & Schema Dependencies**:
   - The user dashboard directly queries `wallets`, `categories`, `transactions`, `transaction_items`, `budgets`, and `export_history`.
   - The admin dashboard interacts with `ai_providers`, `ai_logs`, `subscriptions`, `profiles`, and writes tamper-evident records to `admin_audit_logs`.
   - Auto-setup on registration triggers insertion into `wallets` (default cash wallet `Tunai`), default system categories in `categories`, and user onboarding state.

3. **Feature Gating & Limits Enforcement**:
   - From Observation 4, transaction creation endpoints (both REST/Server Action and Telegram Bot webhook) must check monthly transaction volume for users on the `Starter` plan (`COUNT(*) >= 50`).
   - Struk OCR endpoints must inspect `subscriptions.plan === 'pro'` before triggering multimodal AI vision.
   - AI Advisor checks must be restricted to Pro users.

4. **UI/UX Consistency**:
   - From Observations 1, 3, and 5, all pages must maintain `#F97316` brand accents, Inter / Plus Jakarta Sans fonts, neutral backgrounds (`neutral-50/100`), clean tabular Rupiah formatting (`Rp 15.000`), and full responsiveness at mobile (375px) and desktop (1280px).

---

## 3. Caveats

1. **No Backend Codebase Implemented Yet**:
   - The project directory `tatadana` currently contains only `.agents/teamwork/` metadata. All specifications were derived authoritatively from `ORIGINAL_REQUEST.md` without runnable code to probe.
2. **Payment Gateway Credentials**:
   - Midtrans Snap API integration details and secret server keys will be supplied via environment variables; UI mockups and approval queues must support both Midtrans automated webhooks and manual transfer verification flows.
3. **SMS Gateway in Production**:
   - While the dev bypass code `123456` is explicitly required for Phone OTP, production OTP dispatch depends on Supabase Auth Phone / Twilio configurations.

---

## 4. Conclusion

The specification mining for R3 (User Dashboard & In-App Reports), R4 (Admin Dashboard), R5 (Landing Page & Authentication), Plan Limits, and Acceptance Criteria is complete, thorough, and unambiguous.

- **54 Discrete Features** were identified, categorized, and documented with exact inputs, outputs, observable behaviors, and error handling in `report.md`.
- **28 Critical Edge Cases** were analyzed and mapped with concrete expected outcomes (including zero-data states, overbudget calculation clamping, division-by-zero prevention, impersonation security constraints, and mobile 375px responsive constraints).
- Full implementation guidance has been compiled in `C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\spec_miner_survey_1\report.md`.

---

## 5. Verification Method

To independently verify this specification report:
1. **Source Inspection**:
   - Open `C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md` and verify all quoted line references (Lines 11, 17-23, 30-42, 54, 56-95, 98-107).
2. **Specification Document Inspection**:
   - Open and read `C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\spec_miner_survey_1\report.md`.
   - Verify that all 54 features in the *Features Discovered* table match the required schema: `# | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via`.
   - Verify that all 28 edge cases in the *Edge Cases* table contain precise inputs and expected behaviors.
3. **Acceptance Criteria Cross-Reference**:
   - Confirm that every checkbox in `ORIGINAL_REQUEST.md` (lines 101-107) has a corresponding verification test mapped in Section 6 of `report.md`.
