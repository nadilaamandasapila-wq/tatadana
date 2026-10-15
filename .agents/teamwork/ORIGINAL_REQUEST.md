# Original User Request

## 2026-10-13T10:21:41Z

# Teamwork Project Prompt — TataDana

> Status: Launched
> Goal: Build TataDana Fintech SaaS end-to-end with Telegram Bot Integration
> Requested team: kerjakan project ini dengan menggunakan beberapa agent

TataDana adalah aplikasi SaaS manajemen keuangan pribadi fintech Indonesia kelas dunia yang terintegrasi penuh dengan Telegram Bot, Supabase (Postgres + Auth + Storage + Realtime), AI multi-provider (Gemini, GPT, DeepSeek), dan pembayaran Midtrans, dengan desain premium modern bernuansa orange-putih.

Working directory: C:\Users\nadil\.gemini\antigravity\scratch\tatadana
Integrity mode: development

## Architecture & Technology Stack
- **Web App & Backend**: Next.js 14/15 App Router (TypeScript, Tailwind CSS, Lucide React, Radix UI / shadcn style) dalam satu kesatuan codebase monorepo.
- **Database & Auth**: Supabase PostgreSQL dengan skema migrasi terstruktur di `supabase/migrations/`, Supabase Auth (Email, Google, Phone OTP dengan dev bypass `123456`), Supabase Storage (bucket privat `tatadana-exports`), dan Supabase Realtime.
- **AI Engine**: Multi-provider service (Google Gemini 1.5/2.0 Flash sebagai default multimodal untuk teks natural, OCR foto struk, dan audio Voice Note STT; failover ke OpenAI GPT-4o-mini & DeepSeek).
- **Telegram Bot**: Hybrid mode — endpoint webhook `/api/telegram/webhook` (idempotent dengan `update_id` tracking) + skrip dev runner (`npm run bot:dev`) untuk pengujian lokal tanpa HTTPS tunnel.
- **Payment**: Midtrans Snap API + Webhook notifikasi pembayaran otomatis serta manual approval di admin dashboard.
- **Export Engine**: Generator PDF (pdfkit/jspdf) dan Excel (xlsx) on-demand dengan signed URL Supabase Storage.
- **Timezone**: 100% Asia/Jakarta (WIB) untuk semua timestamp, reminder, dan reply bot.

---

## Requirements

### R1. Database Schema & Migration (`supabase/migrations/`)
- `profiles`: id (UUID references auth.users), email, phone_number, full_name, avatar_url, role ('user' | 'admin'), telegram_user_id, telegram_chat_id, telegram_connected_at, created_at, updated_at.
- `wallets`: id, user_id, name, type ('cash' | 'bank' | 'ewallet'), balance (numeric), is_default (boolean), currency (default 'IDR'), created_at.
- `categories`: id, user_id, name, emoji, color, type ('income' | 'expense'), is_system (boolean), created_at.
- `transactions`: id, user_id, wallet_id, category_id, type ('income' | 'expense' | 'transfer'), amount (numeric), date (timestamptz), notes (text), raw_input (text), input_type ('text' | 'receipt' | 'voice' | 'manual'), receipt_image_url, voice_transcript, destination_wallet_id, created_at.
- `transaction_items`: id, transaction_id, name, amount (numeric), category_id, created_at.
- `budgets`: id, user_id, category_id, month (int), year (int), amount (numeric), alert_80_sent (boolean), alert_100_sent (boolean), created_at.
- `export_history`: id, user_id, file_name, file_url, file_type ('pdf' | 'xlsx'), period (text), status ('completed' | 'processing' | 'failed'), created_at.
- `ai_providers`: id, provider_name ('gemini' | 'openai' | 'deepseek'), api_key_encrypted, is_active, priority, mode ('single' | 'failover'), created_at.
- `ai_logs`: id, user_id, provider_name, model, prompt_tokens, completion_tokens, latency_ms, purpose ('text_parse' | 'receipt_ocr' | 'voice_stt' | 'advisor' | 'onboarding'), status, error_message, created_at.
- `subscriptions`: id, user_id, plan ('starter' | 'pro'), status ('active' | 'expired' | 'pending'), midtrans_order_id, midtrans_payment_type, midtrans_status, starts_at, expires_at, created_at.
- `admin_audit_logs`: id, admin_user_id, action, target_user_id, target_resource, details, created_at.
- `telegram_processed_updates`: update_id (bigint primary key), processed_at (timestamptz).
- Lengkapi dengan Row-Level Security (RLS) policies dan trigger otomatis pembuatan profil, default wallet (Cash), dan kategori default saat user mendaftar.

### R2. Telegram Bot Engine & Webhook
- Webhook endpoint publik `/api/telegram/webhook` yang mengecek keunikan `update_id` pada `telegram_processed_updates` sebelum memproses pesan.
- API wrapper Telegram: `getMe`, `setWebhook`, `sendMessage`, `sendPhoto`.
- NLP Parser (LLM Structured Output): memahami nominal slang Indonesia (`15rb`, `15ribu`, `1.5jt`, `1,5jt`, `500k`, `2.500.000`) dan mengkategorikan transaksi serta wallet default secara cerdas.
- Vision OCR Struk (Pro only): ekstraksi item struk belanja, harga per item, nama merchant, dan membuat 1 transaksi induk beserta breakdown `transaction_items`.
- Voice Note STT (semua paket, durasi maks 60 detik): transkripsi audio ke teks via Gemini/Whisper, kemudian diproses ke pipeline NLP dengan penambahan baris `🎙️ Transkrip: "[hasil]"` pada reply.
- Format reply presisi pengeluaran dan pemasukan sesuai template part 4 dengan tanggal/jam WIB dan progress bar visual budget (`█` dan `░`).
- Command Telegram: `/saldo`, `/hari ini`, `/minggu ini`, `/bulan ini`, `/budget`, `/sheet`, `/bantuan`.
- AI Financial Advisor proaktif untuk user Pro (peringatan saat pengeluaran melompat >50% atau mendekati batas pemasukan).
- Reminder harian terjadwal (maksimal 2x/hari sesuai pengaturan user).
- Pembatasan paket Starter: maksimal 50 transaksi/bulan, tolak foto struk & advisor dengan pesan edukatif + ajakan upgrade.

### R3. User Dashboard & In-App Reports
- Tema orange-putih (#F97316 / Orange 500, background neutral-50/100, border subtle, font Inter/Plus Jakarta Sans).
- Halaman Beranda: 4 stats cards (Saldo Total, Pemasukan Bulan Ini, Pengeluaran Bulan Ini, Budget Tersisa), Pie Chart kategori, Bar Chart 6 bulan pemasukan vs pengeluaran, Trend line harian, 10 transaksi terbaru, empty state onboarding checklist.
- Filter periode: Harian, Mingguan, Bulanan, Tahunan, Custom date range.
- Halaman Transaksi: Form catat pemasukan/pengeluaran/transfer, tabel transaksi dengan expand item struk.
- Halaman Budget: Set budget per kategori, progress bar 80% & 100% threshold alert.
- Halaman Laporan (📊 Laporan): Tabel transaksi pagination & sorting, filter lengkap, ringkasan net cashflow, tombol export on-demand ke PDF & Excel (.xlsx), riwayat export tersimpan.
- Halaman Wallet: Manajemen multi-wallet dan pemilihan 1 default wallet untuk bot Telegram.
- Halaman Settings: Tab Profil, Tab Telegram Bot (panduan @BotFather, input token, tombol "Test Koneksi" dengan indikator "⏳ Testing...", "🟢 Terhubung", "🔴 Tidak terhubung"), Tab Reminder (toggle ON/OFF, jam, preview), Tab Kategori (kategori custom dengan emoji & warna).
- Supabase Realtime integrasi agar data sinkron seketika saat ada input dari Telegram.

### R4. Admin Dashboard
- Halaman terpisah khusus role superadmin dengan navigasi admin.
- AI Provider Manager: Konfigurasi API keys (Gemini, OpenAI, DeepSeek), switch mode Single vs Failover, status kesehatan provider.
- User Management: Daftar semua user, plan aktif, nomor HP, status koneksi Telegram, tombol "Impersonate" untuk login sebagai user tanpa kredensial.
- AI Logs & Analytics: Riwayat pemanggilan AI, latensi, token usage, estimasi biaya, filter error.
- Transaction Inspector: Fitur audit transaksi user untuk keperluan customer support yang mencatat setiap pembukaan ke `admin_audit_logs`.
- Payment Approvals: Daftar transaksi Midtrans & manual transfer dengan tombol Approve/Reject.
- Internal Data Export: Export ringkasan data users & platform.

### R5. Landing Page & Authentication
- Landing Page premium dengan 12 section urut:
  1. Sticky Navbar dengan logo TataDana & tombol auth.
  2. Pre-headline badge: "✨ Catat keuangan langsung dari Telegram".
  3. Headline (H1): "Gaji habis sebelum akhir bulan? Sudah saatnya kamu tahu ke mana uangmu pergi." (gradient orange).
  4. Sub-headline: "TataDana mencatat setiap pengeluaranmu langsung dari chat Telegram atau foto struk — sisanya kami yang urus."
  5. Hero video placeholder (ditandai `// TODO: ganti dengan video asli`).
  6. CTA buttons: "Mulai Gratis Sekarang" + "Lihat cara kerjanya →".
  7. Problem bullet points (aplikasi ribet, uang habis tak terlacak, budget seminggu lupa).
  8. Solusi: "Bagaimana kalau mencatat keuangan semudah kirim pesan ke teman?" -> "Introducing TataDana".
  9. Interactive Dashboard Preview: Dummy bot chat Telegram dengan format reply asli + mini dashboard.
  10. Fitur section (alternating 3 fitur utama).
  11. Testimoni masonry grid placeholder (`// TODO: ganti dengan testimoni asli`).
  12. Pricing: Toggle bulanan/sekali bayar (Starter Rp49k/bln vs Pro Rp99k sekali bayar).
  13. FAQ: 7 pertanyaan lengkap.
  14. Final CTA orange gradient & Footer 4 kolom.
- Auth Pages (Login & Register): Split layout 40% branding orange + 60% form putih.
  - Opsi: Email/Password, Google OAuth, Nomor HP dengan verifikasi OTP (kode dev `123456`).
  - Auto-setup akun saat registrasi (default wallet, kategori rekomendasi onboarding, onboarding checklist).

---

## Acceptance Criteria

### Functionality & Verification
- [ ] Database migration SQL script di `supabase/migrations/001_initial_schema.sql` valid dan dapat dieksekusi secara bersih.
- [ ] Endpoint `/api/telegram/webhook` memproses request webhook dengan verifikasi idempotency `update_id` dan timezone WIB.
- [ ] NLP parser mengenali format nominal bahasa Indonesia (`beli bakso 15rb`, `gajian 5jt`, `500k`) dan menghasilkan transaksi valid.
- [ ] Generator export PDF dan Excel menghasilkan file valid yang dapat diunduh dari dashboard laporan.
- [ ] Tombol "Test Koneksi" bot memanggil `getMe` dan `setWebhook`, menampilkan status real-time dengan akurat.
- [ ] Limit paket Starter (maks 50 tx/bln, tanpa OCR struk, tanpa AI advisor) ditegakkan di backend dan bot.
- [ ] Seluruh tampilan antarmuka (Landing page, Dashboard User, Admin Dashboard, Auth) mengadopsi tema orange-putih fintech premium dan responsif pada 375px & 1280px.


## 2026-10-15T03:44:24Z

# TataDana — Full-Stack Fintech SaaS & Telegram Bot Engine

> Status: Launched
> Goal: Eksekusi build end-to-end menggunakan multi-agent teamwork
> Requested team: Full multi-agent team (Full-Stack Next.js, Supabase Engineer, Telegram Bot Specialist, AI Engine Integrator, UI/UX Designer)

TataDana adalah aplikasi manajemen keuangan pribadi premium Indonesia berbasis Next.js (App Router) dan Supabase, terintegrasi penuh dengan 1 shared Telegram Bot, multi-provider AI (teks natural, audio voice note STT, dan vision OCR struk), sistem budgeting interaktif, laporan keuangan real-time dengan export PDF/Excel, serta payment Midtrans.

Working directory: C:\Users\nadil\.gemini\antigravity\scratch\tatadana
Integrity mode: development

---

## Architecture & Technology Stack
- **Framework & Frontend**: Next.js 14/15 (App Router, TypeScript, Tailwind CSS, Lucide Icons, Radix/shadcn UI). Tema oranye-putih fintech modern, geometric modern font (Inter / Plus Jakarta Sans), 100% Bahasa Indonesia.
- **Database & Auth**: Supabase (Postgres, Supabase Auth, Row Level Security, Supabase Storage). Seluruh skema database ditulis rapi dalam `supabase/migrations`.
- **Telegram Bot**: 1 Shared Bot untuk semua user via endpoint `/api/telegram/webhook`. Dilengkapi dual-mode testing: HTTPS webhook (Cloudflare Tunnel/Ngrok) + runner fallback Long-Polling (`npm run bot:poll`) untuk kemudahan pengujian di localhost. Idempotent update_id handling.
- **AI Engine**: Multi-provider dengan adapter pattern (Google Gemini sebagai default untuk NLU text parsing, Gemini Audio untuk Voice Note STT maks 60 detik, Gemini Vision untuk OCR struk belanja Pro), dengan arsitektur failover ke OpenAI (GPT-4o mini, Whisper) dan DeepSeek.
- **Payment & Subscription**: Midtrans integration (Snap/Core API) + opsi transfer manual dengan verifikasi admin. Tier Starter (Rp49rb/bln) vs Pro (Rp99rb sekali bayar).
- **Export Engine**: In-app PDF & Excel generator (.xlsx), file disimpan ke Supabase Storage (bucket privat per user) dengan signed URL otomatis.

---

## Requirements

### R1. Database Schema, Storage, & Supabase Setup
- Seluruh migrasi database berada di `supabase/migrations/001_initial_schema.sql` dan file pendukung.
- Tabel lengkap: `profiles` (termasuk nomor HP, plan_tier, telegram_chat_id, status_koneksi), `wallets` (multi-wallet: BCA, Cash, GoPay, dsb. dengan flag is_default), `categories` (nama, icon emoji, color, jenis, is_custom), `transactions` (nominal, jenis: pemasukan/pengeluaran/transfer, wallet_id, category_id, catatan, timezone Asia/Jakarta), `transaction_items` (rincian item untuk transaksi struk belanja), `budgets` (kategori, target_nominal, periode_bulan), `export_history` (tipe_file, file_url, rentang_tanggal), `ai_providers` (nama provider, api_key_enc, is_active, priority), `otp_verifications` (nomor_hp, otp_code, expired_at, is_used), dan `audit_logs`.
- Storage bucket privat `tatadana-exports` untuk file laporan PDF dan Excel dengan RLS.

### R2. Telegram Bot Engine & Webhook (End-to-End Functional)
- Endpoint publik `/api/telegram/webhook` yang memproses update dari Telegram secara idempotent (cache/tabel pemrosesan update_id).
- Tab Settings Telegram Bot: integrasi `/getMe` dan `/setWebhook` saat user mengonfigurasi token, dengan status connection indicator 🟢/🔴 dan spinner ⏳ Testing.
- Script fallback Long-Polling (`scripts/telegram-polling.ts`) yang menggunakan bot token dari env/database untuk testing lokal instan tanpa tunnel jika diperlukan.
- **Input Teks Natural (NLU)**: Parsing kalimat Indonesia (contoh: "beli sate 25rb", "gajian 8jt", "kopi 35k") menggunakan LLM structured output menjadi `{ jenis, nominal, kategori, catatan }`.
- **Input Voice Note (STT)**: Menerima audio/voice Telegram, transkripsi via Gemini Audio / Whisper (maks 60 detik), parsing ke transaksi, dan balasan mencantumkan `🎙️ Transkrip: "[hasil suara]"`.
- **Input Struk Belanja (Vision OCR - Pro Plan)**: Menerima foto struk, ekstraksi nama merchant, tanggal, serta item-item belanjaan dengan nominal masing-masing. User Starter ditolak dengan pesan edukatif & CTA upgrade.
- **Format Reply Standar TataDana**: Tampilan terstruktur (Hari, Tanggal, Jam WIB, Nominal, Kategori, Dompet, Saldo Baru, serta visual progress bar budget `█░░░░ 20%`).
- **Commands Bot**: `/saldo`, `/hari ini`, `/minggu ini`, `/bulan ini`, `/budget`, `/sheet`, `/bantuan`.
- **Financial Advisor (Pro)** & **Reminder Harian** (maks 2x sehari sesuai jam pilihan user).
- **Limit Enforcement**: Starter dibatasi 50 transaksi/bulan, 3 wallet, 5 kategori budget.

### R3. Web Application Dashboard & Laporan Interaktif
- **Dashboard Overview**: 4 stats cards (Saldo Total, Pemasukan Bulan Ini, Pengeluaran Bulan Ini, Sisa Budget), Donut/Pie Chart kategori, Bar Chart pemasukan vs pengeluaran 6 bulan, Trend Line harian, List 10 transaksi terbaru, filter periode (harian, mingguan, bulanan, tahunan, custom).
- **Multi-Wallet Manager**: Kelola dompet (saldo awal, tambah/edit/hapus, set default telegram).
- **Budgeting Visual**: Progress bar interaktif, alert visual status 80% & 100%.
- **Halaman Laporan Native**: Tabel transaksi lengkap dengan pagination, sorting, search, filter mendalam. Transaksi struk belanja yang memiliki multi-item dapat di-expand untuk melihat detail item.
- **Export Laporan PDF & Excel**: Generate on-demand langsung dari dashboard, unduh instan, serta tersimpan di riwayat export.
- **Realtime Updates**: Menggunakan Supabase Realtime agar transaksi baru dari Telegram langsung muncul di web dashboard tanpa perlu reload.

### R4. Admin Dashboard & AI Provider Management
- Terpisah dari dashboard user biasa, memiliki menu impersonation untuk troubleshoot user.
- Manajemen multi-provider AI: konfigurasi API key (Gemini, OpenAI, DeepSeek), set active provider, toggle failover mode.
- Log pemanggilan AI (latency, status, provider yang merespons).
- Manajemen user & persetujuan pembayaran manual Midtrans.
- Audit log akses data untuk privasi pengguna.

### R5. Landing Page, Onboarding, & Auth System
- **Landing Page Fintech Premium**: Sesuai urutan spec (Navbar sticky, Pre-headline badge, Headline dengan gradient orange, Sub-headline, Video placeholder, Problem bullets, Solution transition, Interactive Preview dashboard & chat Telegram, 3 Fitur alternating, Testimoni masonry, Pricing toggle bulanan vs sekali bayar, 7 FAQ mendalam, Final CTA gradient, Footer 4 kolom).
- **Auth Page**: Split layout 40/60 (kiri branding panel, kanan login/register). Mendukung Email/Password, Google OAuth, dan verifikasi OTP Nomor HP.
- **Onboarding Cerdas**: Rekomendasi kategori awal berbasis AI setelah user register.

---

## Acceptance Criteria

### Verification & Quality Gate
- [ ] **Database & Migrations**: Folder `supabase/migrations/` memiliki skema SQL komplit, RLS policies, trigger saldo wallet otomatis, dan enum yang siap dieksekusi tanpa error.
- [ ] **Telegram Parsing**: Natural language parsing menangani format nominal Indonesia ("15rb", "500k", "1.5jt", "2,5jt") dan mengembalikan respon berformat WIB resmi.
- [ ] **Voice Note & OCR**: Voice note ditranskrip dan dicatat; foto struk mengekstrak rincian item (dan memblokir Starter secara elegan).
- [ ] **Realtime & Export**: Transaksi tercermin di dashboard secara realtime; file PDF & Excel berhasil digenerate dan dapat didownload dengan link valid.
- [ ] **Mobile & Design**: Tampilan responsive sempurna di 375px (mobile) dan 1280px (desktop), warna primer oranye `#F97316` / `#EA580C` bersih, modern, dan bebas kesan template murahan.
