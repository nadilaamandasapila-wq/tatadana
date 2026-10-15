# TataDana - Fintech Personal Finance SaaS & Telegram Bot

TataDana adalah platform manajemen keuangan pribadi dan UMKM Indonesia terintegrasi dengan **Telegram Bot**, **Supabase** (Postgres + Auth + Storage + Realtime), **AI Multi-Provider** (Google Gemini Flash default, OpenAI GPT-4o-mini & Whisper, DeepSeek V3), dan **Midtrans Snap Payment**, dengan desain fintech modern oranye-putih (#F97316).

---

## 🚀 Menjalankan di Localhost

Aplikasi dilengkapi dengan **Mock & Demo Fallback Mode** yang aktif secara otomatis. Anda dapat langsung menjalankan dan menguji seluruh fitur tanpa perlu mengonfigurasi database atau API key eksternal terlebih dahulu!

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Jalankan Dev Server
```bash
npm run dev
```
Buka browser di: **[http://localhost:3000](http://localhost:3000)**

### 3. Halaman yang Dapat Langsung Dicoba:
- **Landing Page (14 Seksi)**: `http://localhost:3000/`
  - Termasuk **Simulator Bot Telegram Interaktif** (coba ketik *"Makan siang 25rb"*, *"Beli bensin 50k"*, */saldo*, */budget*).
- **Halaman Autentikasi**:
  - Login: `http://localhost:3000/auth/login` (Mendukung bypass OTP pengujian: `123456`)
  - Register: `http://localhost:3000/auth/register` (Auto-setup profil, dompet Tunai, & 9 kategori)
- **User Dashboard**:
  - Beranda (4 Kartu Statistik, Donut Chart, 6-Month Bar Chart, Trend Line, 10 Transaksi): `http://localhost:3000/dashboard`
  - Manajemen Transaksi & Breakdown Struk OCR: `http://localhost:3000/dashboard/transactions`
  - Kontrol Anggaran & Peringatan 80%/100%: `http://localhost:3000/dashboard/budgets`
  - Laporan & Ekspor On-Demand Excel (.xlsx) / PDF: `http://localhost:3000/dashboard/reports`
  - Manajemen Multi-Dompet (Cash, Bank, eWallet): `http://localhost:3000/dashboard/wallets`
  - Pengaturan & Test Koneksi Telegram Bot: `http://localhost:3000/dashboard/settings`
- **Admin Portal**:
  - Ringkasan Platform & Audit: `http://localhost:3000/admin`
  - AI Provider Manager (Single vs Failover Mode): `http://localhost:3000/admin/ai-providers`
  - Manajemen Pengguna & 1-Klik Impersonasi: `http://localhost:3000/admin/users`
  - AI Telemetry & Observability: `http://localhost:3000/admin/ai-logs`
  - Inspektur Transaksi Nasabah: `http://localhost:3000/admin/transactions`
  - Persetujuan Pembayaran Midtrans: `http://localhost:3000/admin/payments`
  - Ekspor Database Platform: `http://localhost:3000/admin/export`

### 4. Menjalankan Bot Telegram Lokal (Tanpa Tunnel)
```bash
npm run bot:dev
```

### 5. Menjalankan Unit Tests (NLP Slang & Telegram Templates)
```bash
npm test
```

---

## 🛠️ Arsitektur & Struktur Folder

```
tatadana/
├── supabase/migrations/
│   └── 001_initial_schema.sql         # 12 Tabel, RLS, Triggers, Realtime Publication
├── scripts/
│   └── bot-dev.ts                     # Runner long-polling lokal
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Login & Register (Split 40% orange / 60% white)
│   │   ├── (dashboard)/               # 6 Modul Dashboard User
│   │   ├── admin/                     # 7 Modul Admin Portal Superadmin
│   │   ├── api/
│   │   │   ├── telegram/webhook/      # Endpoint webhook dengan idempotency
│   │   │   ├── telegram/test-connection/
│   │   │   ├── payment/               # Snap token & Midtrans webhook
│   │   │   ├── reports/export/        # Unduh Excel (.xlsx) & PDF cetak
│   │   │   └── cron/reminders/        # Pengingat harian Telegram
│   │   ├── layout.tsx
│   │   └── page.tsx                   # 14-seksi Landing Page fintech
│   ├── components/
│   │   ├── ui/                        # Button, Card, Input, Modal, Badge, SVG Charts
│   │   ├── landing/                   # Komponen Landing Page & Bot Simulator
│   │   ├── dashboard/                 # Sidebar, Header, Period Filter
│   │   └── admin/                     # Admin Sidebar & Header
│   ├── lib/
│   │   ├── ai/                        # Provider Manager, NLP Slang Parser, OCR, Voice STT, Advisor, Telemetry
│   │   ├── telegram/                  # Bot API, Message Handler, Precision WIB Templates
│   │   ├── export/                    # Excel (.xlsx) & PDF generator
│   │   ├── payment/                   # Midtrans helper
│   │   ├── mock/store.ts              # In-memory & LocalStorage demo data engine
│   │   └── utils/                     # Currency (Rupiah), Date (WIB), Tailwind cn
│   └── types/
│       ├── database.ts                # TypeScript types untuk 12 tabel
│       └── index.ts
└── tests/
    ├── nlp-parser.test.ts             # Pengujian nominal gaul (15rb, 1.5jt, ceban, gocap, dll)
    └── telegram-templates.test.ts     # Pengujian visual progress bar (█ & ░) dan format WIB
```
