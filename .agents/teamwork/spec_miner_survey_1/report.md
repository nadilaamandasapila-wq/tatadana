# Specification Mining Report: TataDana UI/UX, Dashboards, Landing, Auth & Acceptance Criteria

**Author**: Spec Miner 1 (`spec_miner_survey_1`)  
**Parent Orchestrator**: `ffea170e-96ab-46c8-ba88-cc2c8db6b61f`  
**Date**: 2026-10-13  
**Status**: Completed  
**Authoritative Source**: `C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md` (Lines 1-108)

---

## 1. Executive Summary

This specification report details the exact requirements, technical interfaces, data schemas, visual guidelines, behavioral states, and error handling for:
1. **R3: User Dashboard & In-App Reports** (Full end-to-end user application experience)
2. **R4: Admin Dashboard** (Superadmin management console, AI orchestrator, user inspector, payment workflow)
3. **R5: Landing Page & Authentication** (14-section marketing landing page, split-layout auth, dev OTP bypass, account auto-setup)
4. **Subscription Limits & Feature Gating** (Starter vs Pro differentiation)
5. **Acceptance Criteria & Test Matrix** (Functional verification, responsive UI criteria, error constraints)

All visual designs adhere to the **Orange-White Fintech Premium Theme** (`#F97316` / Tailwind Orange-500, neutral-50/100 backgrounds, subtle borders, Inter / Plus Jakarta Sans fonts). All dates and clocks strictly adhere to **WIB (Asia/Jakarta, UTC+7)**.

---

## 2. Requirement 3: User Dashboard & In-App Reports Specification

### 2.1 Theme & Design System Standards
- **Brand Primary Color**: `#F97316` (Tailwind `orange-500`), with accents `#EA580C` (`orange-600` hover) and `#FFEDD5` (`orange-100` soft pill / badge).
- **Background Palette**: Light mode primary: `bg-neutral-50` / `bg-neutral-100` (`#F9FAFB` / `#F3F4F6`), card surfaces: `bg-white` (`#FFFFFF`).
- **Border & Dividers**: `border-neutral-200` (`#E5E7EB`) with subtle drop shadows (`shadow-sm` / `shadow-md`).
- **Typography**: Inter or Plus Jakarta Sans. Clean tabular numbers (`font-mono` / `tabular-nums`) for currency amounts.
- **Currency Format**: Indonesian Rupiah (`IDR`), formatted as `Rp 15.000`, `Rp 1.500.000` with thousands dot separator.
- **Timezone**: 100% Asia/Jakarta (`WIB`). Dates formatted as `DD MMMM YYYY, HH:mm WIB`.

---

### 2.2 Halaman Beranda (Home / Overview Dashboard)
**Route**: `/dashboard` or `/app`

#### UI Components & Data Contracts:
1. **Period Filter Bar**:
   - **Options**: Harian (Today), Mingguan (This Week), Bulanan (This Month - default), Tahunan (This Year), Custom Date Range (Date picker start to end).
   - **Behavior**: Filters stats cards, charts, and transaction feeds dynamically without full-page reload.
2. **4 Primary KPI Stats Cards**:
   - **Card 1: Saldo Total (Total Balance)**:
     - Aggregates `balance` across all active user wallets (`SUM(wallets.balance)`).
     - Indicator: Net percentage change vs previous period (green badge for positive, red for negative).
   - **Card 2: Pemasukan Bulan Ini (Monthly Income)**:
     - Aggregates income transactions (`type = 'income'`) within the selected period.
   - **Card 3: Pengeluaran Bulan Ini (Monthly Expense)**:
     - Aggregates expense transactions (`type = 'expense'`) within the selected period.
   - **Card 4: Budget Tersisa (Remaining Budget)**:
     - Calculates total budget allocated for the current month minus total monthly expense in budgeted categories.
     - Visual badge: `Aman` (Safe) if expense < 80%, `Waspada` (Warning) if 80%-99%, `Overbudget` if >= 100%.
3. **Data Visualizations & Charts**:
   - **Category Pie / Donut Chart**:
     - Distribution of expenses grouped by category (`categories.name`, `categories.color`, `categories.emoji`).
     - Interactive tooltip showing category name, total amount, and percentage share.
   - **6-Month Income vs Expense Bar Chart**:
     - Dual-bar grouped chart comparing total income (green/orange-tint) vs total expense (orange-500) over the trailing 6 calendar months.
   - **Daily Expense Trend Line**:
     - Area / Line chart showing daily spending trajectory throughout the current month to visualize spending spikes.
4. **Recent Transactions Feed (10 Transaksi Terbaru)**:
   - Displays the last 10 transactions ordered by `date DESC`.
   - Columns: Type icon (income/expense/transfer), Title/Note, Category badge (with emoji), Wallet pill, Date/Time WIB, Amount (+ / - formatted in bold).
   - "Lihat Semua Transaksi" link redirecting to `/transactions`.
5. **Empty State Onboarding Checklist**:
   - Displayed prominently for new users with <= 1 transaction:
     - [ ] Hubungkan Telegram Bot (links to `/settings?tab=telegram`).
     - [ ] Catat transaksi pertama via Web atau Bot (triggers quick action modal).
     - [ ] Tentukan batas anggaran bulanan pertama (links to `/budget`).
     - [ ] Tambahkan dompet atau rekening bank (links to `/wallets`).
   - Progress meter: e.g. "1 dari 4 langkah selesai (25%)". Dismissible once 100% completed.

---

### 2.3 Halaman Transaksi (Transactions Management)
**Route**: `/transactions`

#### UI Components & Actions:
1. **Quick Transaction Recording Form**:
   - Modal or slide-over drawer triggered by "Catat Transaksi" button.
   - **Fields**:
     - **Tipe Transaksi**: Tab selector: `Pengeluaran` (Expense), `Pemasukan` (Income), `Transfer` (Transfer Antar Dompet).
     - **Nominal (Amount)**: Numeric input with auto-formatting IDR currency mask.
     - **Dompet Sumber (Wallet)**: Dropdown of user wallets with current balances shown.
     - **Dompet Tujuan (Destination Wallet)**: Visible only when Tipe is `Transfer`. Prevents source == destination.
     - **Kategori**: Dropdown with search, filtered by income or expense type. Hidden for `Transfer`.
     - **Tanggal & Waktu**: Default to current WIB timestamp; custom datetime picker.
     - **Catatan / Deskripsi**: Text input for memo/notes.
     - **Lampiran Struk (Receipt Upload)**: Optional image file upload (.jpg, .png, .webp).
2. **Transactions Table**:
   - Columns: Date/Time (WIB), Category (Emoji + Name), Wallet, Notes, Input Method Badge (`text`, `receipt`, `voice`, `manual`), Amount.
   - Search filter by note/description text.
   - Type filter: All, Income, Expense, Transfer.
   - Wallet filter dropdown.
   - Category multi-select filter.
3. **Receipt Breakdown Item Expander**:
   - If transaction was generated via Vision OCR Struk or contains itemized receipts (`transaction_items`), an expand chevron (`▼`) is displayed.
   - Expanding the row reveals a nested sub-table:
     - Item Name (e.g., "Susu UHT 1L", "Roti Tawar")
     - Item Category (e.g., "Belanja Bulanan")
     - Item Price / Amount (e.g., "Rp 21.500")
   - Action to view full uploaded receipt image in a modal viewer with zoom/pan.

---

### 2.4 Halaman Budget (Budget & Alerts)
**Route**: `/budget`

#### UI Components & Alerts:
1. **Set Budget Modal**:
   - Select Category (from `categories`).
   - Specify Target Month & Year.
   - Enter Monthly Budget Limit Amount (IDR).
2. **Category Budget Progress Cards**:
   - Each card represents one budgeted category:
     - Category header with emoji and color indicator.
     - Target amount vs Actual spent (`spent / budget_amount`).
     - Remaining amount (`Rp X tersisa` or `Overbudget Rp Y`).
     - Progress Bar Visual:
       - Green/Neutral if spent < 80%.
       - Orange-500 warning if 80% <= spent < 100%.
       - Red alert if spent >= 100%.
3. **Threshold Alerts Logic**:
   - **80% Threshold**: Triggers `alert_80_sent = true` in `budgets` table; sends Telegram push alert: "⚠️ *Peringatan Budget:* Pengeluaran kategori [X] telah mencapai 80% dari batas bulanan!"
   - **100% Threshold**: Triggers `alert_100_sent = true` in `budgets` table; sends Telegram push alert: "🚨 *Budget Habis:* Kategori [X] telah melampaui 100% batas anggaran!".

---

### 2.5 Halaman Laporan (📊 In-App Reports & Exports)
**Route**: `/reports`

#### UI Components & Export Engine:
1. **Net Cashflow Summary Banner**:
   - Total Pemasukan Periode.
   - Total Pengeluaran Periode.
   - Net Cashflow = `Total Pemasukan - Total Pengeluaran` (positive highlighted in emerald green, negative in rose red).
   - Rasio Tabungan (Savings Rate) = `(Net Cashflow / Total Pemasukan) * 100%`.
2. **Advanced Filterable Transactions Table**:
   - Server-side / Client-side pagination (10, 25, 50, 100 rows per page).
   - Column sorting: Date (asc/desc), Amount (asc/desc), Category (a-z).
   - Filter criteria: Date range, Category, Wallet, Transaction Type, Min/Max amount.
3. **On-Demand Export Generator**:
   - **Export to PDF**:
     - Generates branded PDF document with TataDana orange header logo, summary cards, category pie chart snapshot, and formatted transaction records.
     - Formats all dates in WIB and amounts in IDR.
   - **Export to Excel (.xlsx)**:
     - Multi-sheet or formatted single sheet with columns: ID, Tanggal (WIB), Tipe, Dompet, Kategori, Nominal, Catatan, Input Type.
     - Auto-calculated summary formula rows for Total Income, Total Expense, Net Cashflow.
4. **Riwayat Export Tersimpan (Export History Table)**:
   - Backed by `export_history` table.
   - Columns: File Name, File Type (PDF badge / XLSX badge), Periode Laporan, Tanggal Dibuat (WIB), Status (`processing`, `completed`, `failed`), Download Button.
   - Download button fetches signed URL from private Supabase Storage bucket `tatadana-exports` (URL expires in 60 minutes for security).

---

### 2.6 Halaman Wallet (Multi-Wallet Management)
**Route**: `/wallets`

#### Features:
1. **Wallet List & Total Net Worth**:
   - Displays all wallets grouped by type:
     - `cash` (Tunai / Kas Fisik)
     - `bank` (BCA, Mandiri, BRI, BNI, Jago, dll.)
     - `ewallet` (GoPay, OVO, Dana, ShopeePay)
2. **Wallet CRUD Actions**:
   - **Add Wallet**: Name, Type, Initial Balance, Currency (`IDR`).
   - **Edit Wallet**: Rename, update type.
   - **Transfer Between Wallets**: Integrated shortcut to record a transfer transaction.
   - **Delete Wallet**: Restricted if transactions exist (or warns that associated transactions will become unassigned).
3. **Default Wallet Designation**:
   - Radio or star badge indicating which wallet is `is_default = true`.
   - **Crucial Integration**: All Telegram Bot voice and text transactions without an explicit wallet keyword are automatically assigned to this default wallet.
   - Switching default wallet ensures only exactly one wallet has `is_default = true` per user (enforced via database partial unique index or trigger).

---

### 2.7 Halaman Settings (Pengaturan)
**Route**: `/settings`

Contains 4 dedicated sub-tabs:
1. **Tab 1: Profil**:
   - Full Name, Email (read-only or update with re-auth), Phone Number (with OTP re-verify), Avatar Upload (Supabase storage), Plan Status Badge (Starter / Pro), Active Since date.
2. **Tab 2: Telegram Bot**:
   - Comprehensive 3-step setup guide:
     1. Buka Telegram dan cari bot `@TataDanaBot` (atau jalankan bot via `@BotFather`).
     2. Dapatkan token bot atau kirimkan `/start [connect_token]`.
     3. Hubungkan akun.
   - Input Token / Telegram User ID field.
   - **"Test Koneksi" Action Button**:
     - Sends live API requests to Telegram (`getMe` to verify bot credentials, `setWebhook` to register webhook URL).
     - Realtime visual status indicator states:
       - `⏳ Testing...` (spinner animation during probe)
       - `🟢 Terhubung` (successful ping with Bot username `@username` displayed)
       - `🔴 Tidak terhubung` (error message e.g. "Invalid bot token" or "Webhook failed").
3. **Tab 3: Reminder**:
   - Master Toggle: ON / OFF daily reminder.
   - Reminder Time Pickers: Configurable up to **2 times per day** (e.g. 08:00 WIB and 20:00 WIB).
   - Timezone confirmation: Asia/Jakarta (WIB).
   - **Preview Message Box**:
     - Visual rendering of the actual Telegram reminder message:
       ```
       🔔 Halo Nadia! Sudah catat pengeluaran makan siang dan jajanmu hari ini?
       Ketik saja langsung di sini, contoh: 'Kopi 25rb' ☕
       ```
4. **Tab 4: Kategori (Custom Categories)**:
   - List of active categories separated into Income and Expense tabs.
   - System categories marked with `is_system = true` (protected from accidental deletion).
   - "Tambah Kategori" modal: Name, Emoji picker (e.g., 🍔, 🚗, 💡, 💰), Color picker (hex palette matching UI), Type (`income` / `expense`).
   - Delete / Edit actions for user-created custom categories.

---

### 2.8 Supabase Realtime Synchronization
- **Realtime Channel Subscription**:
  - Dashboard client subscribes to Supabase postgres_changes:
    ```typescript
    supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, handleTransactionChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` }, handleWalletChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${user.id}` }, handleBudgetChange)
      .subscribe()
    ```
- **Observable Behavior**: When a user sends a message or receipt in Telegram Bot:
  1. The bot webhook records the transaction in Postgres.
  2. The browser dashboard receives the realtime event and updates stats cards, pie charts, and recent transaction table within < 500ms without page reload.
  3. Visual toast notification: "📥 Transaksi baru ditambahkan dari Telegram: [Nominal] ([Kategori])".

---

## 3. Requirement 4: Admin Dashboard Specification

### 3.1 Role & Security Model
- **Route Prefix**: `/admin` (e.g., `/admin/providers`, `/admin/users`, `/admin/logs`, `/admin/transactions`, `/admin/payments`, `/admin/export`).
- **Access Guard**: Middleware / Server Component verification:
  - Check user profile `profiles.role === 'admin'`.
  - If user is non-admin, redirect immediately to `/dashboard` with 403 Forbidden flash message.
  - Dedicated Superadmin Sidebar Navigation (Dark slate / orange accent styling to clearly distinguish from user dashboard).

---

### 3.2 AI Provider Manager
**Route**: `/admin/providers`
- **Supported Providers**:
  1. `gemini` (Google Gemini 1.5 / 2.0 Flash - Default multimodal for Text, OCR, Audio STT)
  2. `openai` (OpenAI GPT-4o-mini - Secondary failover)
  3. `deepseek` (DeepSeek V3 / R1 - Tertiary failover / cost-effective reasoning)
- **Configuration Controls**:
  - **API Key Management**: Form input with masked view (`••••••••sk-xyz`), encrypted at rest in `ai_providers.api_key_encrypted`.
  - **Operating Mode Toggle**:
    - `Single Mode`: Always route all requests strictly to the highest priority active provider.
    - `Failover Mode`: If primary provider fails (HTTP 429, 500, timeout > 5s), automatically fall back to priority 2, then priority 3.
  - **Priority Ordering**: Drag-and-drop or numerical priority setting (1 = Primary, 2 = Secondary, 3 = Fallback).
  - **Provider Health Status & Ping**:
    - Live health check button testing model invocation with a lightweight probe (`"ping"` test).
    - Status badges: `🟢 Operational (180ms)`, `🟡 Degraded / High Latency`, `🔴 Offline / Error`.
  - **Active Toggle**: Instant switch to enable/disable specific providers without deleting keys.

---

### 3.3 User Management & Impersonation
**Route**: `/admin/users`
- **User Directory Table**:
  - Columns: User ID, Avatar & Full Name, Email, Phone Number, Plan (`starter` / `pro`), Telegram User ID & Connection Status (`🟢 Connected` / `⚪ Not Connected`), Created At date.
  - Search by Name, Email, or Phone.
  - Filter by Plan (Starter, Pro) and Telegram Status.
- **"Impersonate" Feature**:
  - Action button on each user row.
  - **Security Flow**:
    1. Superadmin clicks "Impersonate".
    2. Confirmation dialog warns: "Anda akan login sementara sebagai [Nama User]. Semua aksi audit akan dicatat."
    3. Admin logs an entry into `admin_audit_logs`:
       - `action: 'impersonate_user'`
       - `target_user_id: user.id`
       - `details: { admin_id: current_admin.id, ip: client_ip, timestamp: now() }`
    4. Server generates an impersonation session token or JWT claim `impersonated_by: admin.id`.
    5. Redirects to `/dashboard` with a persistent top banner:
       - `⚠️ Sedang login sebagai [User Email] (Mode Impersonate) — [Kembali ke Admin Console]`

---

### 3.4 AI Logs & Analytics
**Route**: `/admin/logs`
- **Analytics KPI Cards**:
  - Total AI Calls (24h / 7d / 30d).
  - Average Latency (ms).
  - Total Token Consumption (Prompt + Completion).
  - Total Estimated Cost ($ USD and Rp IDR).
  - Error Rate percentage (e.g. `0.4%`).
- **Log Table (`ai_logs`)**:
  - Columns: Timestamp (WIB), User Email, Provider (`gemini` / `openai` / `deepseek`), Model, Purpose (`text_parse`, `receipt_ocr`, `voice_stt`, `advisor`, `onboarding`), Tokens (Prompt / Completion), Latency (ms), Status (`success` / `error`).
  - Filter by Purpose, Provider, Status (`success` vs `error`).
  - Error Inspector Drawer: Clicking an error row reveals the full error stack, raw prompt snippet, and upstream provider status code.

---

### 3.5 Transaction Inspector & Customer Support Audit Log
**Route**: `/admin/transactions`
- **Purpose**: Customer support transaction inspection for investigating user transaction discrepancies or bot ingestion failures.
- **Audit Requirement**:
  - Every time an admin opens or views a user's transaction details in the inspector, an entry MUST be automatically written to `admin_audit_logs`:
    - `admin_user_id`: ID of the admin.
    - `action`: `'inspect_transactions'`.
    - `target_user_id`: Target user whose transactions were viewed.
    - `target_resource`: `'transactions'`.
    - `details`: Reason or metadata (e.g. `{ viewed_at: WIB_timestamp, query_filters: filters }`).
- **Inspector Interface**:
  - Input user email or phone to pull complete raw ledger.
  - Inspect `raw_input` (the original text/voice message from Telegram), `input_type`, `receipt_image_url`, and associated `transaction_items`.

---

### 3.6 Payment Approvals
**Route**: `/admin/payments`
- **Payment Queue**:
  - Backed by `subscriptions` table.
  - Displays Midtrans automated payments as well as manual bank transfer requests.
  - Columns: Order ID, User (Name & Email), Plan Requested (`Pro`), Amount (Rp 99.000), Payment Channel (`midtrans_snap` / `manual_transfer`), Payment Status (`pending`, `active`, `expired`), Proof of Transfer Image (for manual transfer), Created At.
- **Approval / Rejection Controls**:
  - **Approve Button**:
    - Updates `subscriptions.status = 'active'`.
    - Sets `subscriptions.starts_at = now()`.
    - Upgrades user profile entitlements immediately.
    - Creates audit log in `admin_audit_logs`.
    - Triggers notification to user via Telegram Bot: "🎉 Selamat! Pembayaran Anda berhasil dikonfirmasi. Akun Anda telah aktif sebagai TataDana PRO."
  - **Reject Button**:
    - Marks subscription as `failed` or `rejected` with an optional admin note (e.g. "Bukti transfer tidak terbaca / nominal tidak sesuai").

---

### 3.7 Internal Data Export
**Route**: `/admin/export`
- **Platform Analytics Export**:
  - Export all users summary (User growth, conversion rate Starter to Pro).
  - Export aggregated transaction volume (Total IDR processed, transactions per category).
  - Export AI usage logs summary.
  - File formats: CSV, Excel (.xlsx), and JSON.

---

## 4. Requirement 5: Landing Page & Authentication Specification

### 4.1 Landing Page Architecture (14 Ordered Sections)
**Route**: `/` (Public Homepage)

The landing page must adhere strictly to the sequential 14 sections specified in ORIGINAL_REQUEST.md:

| Section # | Component / Title | Detailed Content & Requirements |
|---|---|---|
| **1** | **Sticky Navbar** | Fixed top header with TataDana logo (orange icon + modern typography), navigation anchor links (`Fitur`, `Cara Kerja`, `Harga`, `FAQ`), and auth buttons (`Masuk` -> `/login`, `Daftar Gratis` -> `/register`). Changes background from transparent to frosted blur (`backdrop-blur-md bg-white/90`) on scroll. |
| **2** | **Pre-headline Badge** | Centered pill badge above H1: `✨ Catat keuangan langsung dari Telegram` with soft orange background (`bg-orange-100 text-orange-700`). |
| **3** | **Headline (H1)** | High-impact typography: `Gaji habis sebelum akhir bulan? Sudah saatnya kamu tahu ke mana uangmu pergi.` styled with vibrant orange-to-amber gradient text (`bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent`). |
| **4** | **Sub-headline** | Supporting copy: `TataDana mencatat setiap pengeluaranmu langsung dari chat Telegram atau foto struk — sisanya kami yang urus.` |
| **5** | **Hero Video Placeholder** | Clean video player mock frame (16:9 aspect ratio) with play button overlay. Contains explicit code comment marker: `// TODO: ganti dengan video asli`. |
| **6** | **CTA Buttons** | Dual button CTA group: Primary orange button `Mulai Gratis Sekarang` (routes to `/register`) + Secondary outlined button `Lihat cara kerjanya →` (smooth-scrolls to Section 8/9). |
| **7** | **Problem Bullet Points** | Empathy cards detailing Indonesian millennials/gen-z financial pains: 1. *Aplikasi keuangan lain terlalu ribet buka-tutup form*, 2. *Uang gaji mendadak habis tanpa terlacak ke mana larinya*, 3. *Sudah bikin budget awal bulan, minggu kedua sudah lupa batasnya*. |
| **8** | **Solusi Section** | Transition header: `Bagaimana kalau mencatat keuangan semudah kirim pesan ke teman?` followed by sub-header `Introducing TataDana` with feature pillars. |
| **9** | **Interactive Dashboard Preview** | Live split-screen interactive simulator: **Left**: Mock Telegram chat interface showing realistic prompt ("Beli bensin 50rb", "Kopi kenangan 28rb", receipt photo) and TataDana bot reply with exact formatting, emojis, and `[████░░░░]` visual progress bar. **Right**: Synchronized mini dashboard UI updating numbers in real-time. |
| **10** | **Fitur Section (3 Alternating Features)** | Alternating layout (Text left + Visual right, then Visual left + Text right): <br>1. *Chat & Voice Note Bot AI*: Catat pengeluaran semudah kirim VN atau chat nominal slang (`15rb`, `1.5jt`, `500k`). <br>2. *Vision OCR Struk Otomatis*: Foto struk belanjaan supermarket, AI ekstrak semua item breakdown otomatis. <br>3. *Smart Budgeting & Realtime Analytics*: Notifikasi pengingat 80% dan 100% sebelum overbudget. |
| **11** | **Testimoni Masonry Grid** | Responsive card grid of social proof testimonials with user photos, names, roles. Contains explicit code comment marker: `// TODO: ganti dengan testimoni asli`. |
| **12** | **Pricing Section** | Interactive Billing Toggle: `Bulanan` vs `Sekali Bayar` (Lifetime). Card comparison: **Starter** (Rp 49.000 / bln) vs **Pro** (Rp 99.000 Sekali Bayar). Clear feature checkmarks and upgrade CTAs. |
| **13** | **FAQ (7 Pertanyaan Lengkap)** | Accordion list with 7 complete Indonesian fintech questions & answers: <br>1. *Apakah saya perlu install aplikasi tambahan di HP?* (Tidak, cukup gunakan aplikasi Telegram yang sudah Anda miliki). <br>2. *Bagaimana cara menghubungkan akun TataDana dengan Telegram?* (Cukup daftar di web, dapatkan token koneksi, lalu ketik /start di bot). <br>3. *Apakah data keuangan saya aman?* (Sangat aman, data terenkripsi dan hanya dapat diakses oleh Anda dengan Row Level Security). <br>4. *Berapa limit pencatatan di paket Starter?* (Maksimal 50 transaksi per bulan, cocok untuk pemula). <br>5. *Apa kelebihan paket Pro?* (Transaksi tanpa batas, OCR foto struk belanja, AI financial advisor proaktif, dan ekspor laporan). <br>6. *Metode pembayaran apa saja yang didukung?* (QRIS, GoPay, OVO, Virtual Account BCA/Mandiri/BRI via Midtrans, serta transfer manual). <br>7. *Apakah bisa ekspor laporan ke Excel atau PDF?* (Bisa, kapan saja on-demand langsung dari dashboard laporan). |
| **14** | **Final CTA & 4-Column Footer** | High-contrast Orange gradient card (`Mulai rapihkan keuanganmu hari ini`), followed by 4-column footer: 1. Brand logo & company bio, 2. Produk (Fitur, Bot Telegram, Harga), 3. Panduan (Dokumentasi, FAQ, Status Server), 4. Legal & Sosial (Ketentuan Layanan, Kebijakan Privasi, Kontak). |

---

### 4.2 Authentication Pages Architecture
**Routes**: `/login`, `/register`, `/auth/verify-otp`

#### Split Layout Design Standard:
- **Desktop (1280px)**:
  - **Left Column (40%)**: Branded orange background (`bg-gradient-to-br from-orange-500 to-orange-600`), white typography, TataDana logo, testimonial snippet, and graphic illustration of Telegram financial management.
  - **Right Column (60%)**: Clean white surface (`bg-white`), comfortable padding, modern form controls, tab/switch between Login and Register.
- **Mobile (375px)**:
  - Stacked layout: Compact orange header banner with logo and headline, followed by full-width white card form.

#### Authentication Methods:
1. **Email & Password**:
   - Standard Supabase Auth (`supabase.auth.signInWithPassword`, `signUp`).
   - Client-side validation: Valid email format, password minimum 8 characters.
2. **Google OAuth**:
   - Single-click social login button (`supabase.auth.signInWithOAuth({ provider: 'google' })`).
3. **Phone Number with OTP Verification**:
   - International Indonesian phone mask: `+62 8xx-xxxx-xxxx` or `08xx`.
   - **Dev OTP Bypass Engine**:
     - When testing in development / integrity mode, entering the bypass code `123456` successfully validates the session without sending actual SMS / Twilio / WhatsApp costs.
     - Production environment checks standard OTP provider.

#### Auto-Setup Account Engine (Onboarding Automation):
When a user successfully registers via any auth provider, the system automatically initializes their workspace via PostgreSQL trigger or post-signup server action:
1. **Default Wallet Creation**:
   - Name: `Tunai` (Cash)
   - Type: `'cash'`
   - Balance: `0`
   - Currency: `'IDR'`
   - `is_default: true`
2. **Default System Categories Seeding**:
   - **Expenses**:
     - 🍔 Makanan & Minuman (`#F97316`)
     - 🚗 Transportasi (`#3B82F6`)
     - 🛒 Belanja Harian (`#10B981`)
     - 💡 Tagihan & Utilitas (`#8B5CF6`)
     - 🎬 Hiburan & Rekreasi (`#EC4899`)
     - 💊 Kesehatan (`#EF4444`)
   - **Incomes**:
     - 💰 Gaji Pokok (`#10B981`)
     - 💼 Bonus & Freelance (`#06B6D4`)
     - 📈 Investasi & Bunga (`#84CC16`)
3. **Onboarding Checklist State**:
   - Inserts onboarding profile checklist items into user state.

---

## 5. Subscription Tiers: Starter vs Pro Limit Matrix

The application strictly differentiates between `Starter` and `Pro` plans. All limits must be enforced on both the backend API layer and the Telegram Bot engine:

| Feature / Limit | Starter Plan | Pro Plan | Enforcement Mechanism |
|---|---|---|---|
| **Pricing** | Rp 49.000 / bulan (or Free Tier) | Rp 99.000 (Sekali Bayar / Lifetime) | Midtrans Snap & manual verification in `subscriptions` |
| **Monthly Transactions** | **Maksimal 50 transaksi / bulan** | **Unlimited** | Count queries in current calendar month (`COUNT(transactions.id) WHERE user_id = X AND date >= start_of_month`). If >= 50, reject new input with upgrade prompt. |
| **Vision OCR Struk** | **Ditolak** (Rejected) | **Didukung Penuh** (Multimodal itemized receipt extraction) | When Starter user uploads receipt photo to bot or web, return educational message: *"Fitur Foto Struk hanya tersedia untuk pengguna Pro. Upgrade sekarang untuk nikmati ekstraksi struk otomatis!"* |
| **AI Financial Advisor** | **Tidak Aktif** | **Didukung Penuh** (Proactive anomaly & threshold alerts) | Bot engine checks user plan before running spending spike (>50%) analysis or advice prompts. |
| **Voice Note (VN) STT** | **Didukung** (Durasi maks 60 detik) | **Didukung** (Durasi maks 60 detik) | Whisper / Gemini audio duration check <= 60s for all users. |
| **Multi-Wallet Manager** | Didukung (Default + Dompet Tambahan) | Didukung (Unlimited dompet) | Supabase table `wallets`. |
| **Export PDF & Excel** | Terbatas (Laporan bulan berjalan) | Penuh (Export custom date range & arsip) | Backend export endpoint checks `subscriptions.plan`. |
| **Telegram Reminder** | Maksimal 2x / hari | Maksimal 2x / hari | Configurable in Settings -> Reminder. |

---

## 6. Comprehensive Acceptance Criteria & Verification Matrix

| AC # | Acceptance Criterion | Source Reference | Verifiable Condition & Test Method |
|---|---|---|---|
| **AC-1** | Database Migration Execution | ORIGINAL_REQUEST.md line 101 | SQL script in `supabase/migrations/001_initial_schema.sql` runs cleanly without syntax errors, creates all 12 tables, indexes, triggers, and RLS policies. |
| **AC-2** | Webhook Idempotency & WIB Timezone | ORIGINAL_REQUEST.md line 102 | POST `/api/telegram/webhook` with duplicate `update_id` returns HTTP 200 without creating duplicate transaction records. Timestamps formatted in Asia/Jakarta (UTC+7). |
| **AC-3** | Indonesian Slang NLP Parsing | ORIGINAL_REQUEST.md line 103 | Parser converts `beli bakso 15rb` -> Expense Rp 15.000, `gajian 5jt` -> Income Rp 5.000.000, `500k` -> Rp 500.000 with appropriate category assignments. |
| **AC-4** | PDF & Excel Export Generation | ORIGINAL_REQUEST.md line 104 | Clicking export buttons in `/reports` produces valid `.pdf` and `.xlsx` files with signed URLs downloadable and readable by Excel/Acrobat. |
| **AC-5** | Telegram Bot Connection Test | ORIGINAL_REQUEST.md line 105 | "Test Koneksi" button in `/settings` triggers `getMe` and `setWebhook`, rendering `⏳ Testing...`, then `🟢 Terhubung` or `🔴 Tidak terhubung`. |
| **AC-6** | Starter Plan Restrictions Enforcement | ORIGINAL_REQUEST.md line 106 | 51st transaction of the month is blocked with upgrade CTA. Receipt photo uploads on Starter tier are rejected with educational upgrade message. AI Advisor is disabled. |
| **AC-7** | Responsive Orange-White Fintech UI | ORIGINAL_REQUEST.md line 107 | All views (Landing 14 sections, User Dashboard, Admin Dashboard, Auth) adopt `#F97316` orange-white styling and render without horizontal overflow at **375px** (Mobile) and **1280px** (Desktop). |
| **AC-8** | Receipt Breakdown in Transaction Table | ORIGINAL_REQUEST.md line 60 | Expanding a receipt transaction row reveals itemized `transaction_items` (name, category, amount) with receipt photo viewer. |
| **AC-9** | Budget Threshold Alerts (80% & 100%) | ORIGINAL_REQUEST.md line 61 | When category spending crosses 80% and 100%, visual indicator changes color (orange -> red) and alert flags are toggled. |
| **AC-10** | Admin User Impersonation & Audit Log | ORIGINAL_REQUEST.md lines 70, 72 | Superadmin impersonation logs `impersonate_user` to `admin_audit_logs`. Viewing user transactions in Inspector logs `inspect_transactions`. |
| **AC-11** | AI Provider Manager Single vs Failover | ORIGINAL_REQUEST.md line 69 | Admin can switch between Single and Failover modes, reorder priority, and update encrypted API keys for Gemini, OpenAI, and DeepSeek. |
| **AC-12** | Auth OTP Dev Bypass (`123456`) | ORIGINAL_REQUEST.md line 93 | Entering phone number and OTP `123456` in dev mode successfully signs in user without third-party SMS cost. |
| **AC-13** | Auto-Setup Onboarding | ORIGINAL_REQUEST.md line 94 | New user registration automatically creates default `Tunai` wallet, default categories, and checklist. |
| **AC-14** | Supabase Realtime Sync | ORIGINAL_REQUEST.md line 65 | Ingesting a transaction via Telegram immediately updates web dashboard balance and recent transaction list without page refresh. |

---

## 7. Features Discovered

The following table catalogs all discovered features, interfaces, observable inputs, outputs, and error states across the assigned UI and Dashboard scope:

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R3 - Overview | 4 Primary Stats Cards | Realtime KPI summary of Saldo Total, Monthly Income, Monthly Expense, and Remaining Budget | Selected period filter (Daily, Weekly, Monthly, Yearly, Custom) | Formatted IDR numbers, delta percentages, budget health badges | Displays `Rp 0` on empty data, handles null values gracefully | ORIGINAL_REQUEST.md:58 |
| 2 | R3 - Overview | Period Filter Bar | Dynamic date filtering across dashboard widgets | Click selection (Daily, Weekly, Monthly, Yearly, Custom Range) | Re-calculated aggregated metrics | Invalid custom range (start > end) shows validation toast | ORIGINAL_REQUEST.md:59 |
| 3 | R3 - Overview | Category Donut Chart | Visual expense breakdown by category with legend | User expense transaction dataset | Interactive chart rendering slice percentages and IDR sums | Displays empty gray donut placeholder when expenses = 0 | ORIGINAL_REQUEST.md:58 |
| 4 | R3 - Overview | 6-Month Income vs Expense Bar Chart | Comparative monthly bar chart over trailing 6 months | Past 6 months transaction history | Dual-color grouped bars comparing income vs expense | Zero values render flat baseline bars without throwing render errors | ORIGINAL_REQUEST.md:58 |
| 5 | R3 - Overview | Daily Expense Trend Line | Trailing daily spending trajectory within current month | Daily timestamped expense records | Area / line graph highlighting spending spikes | Single data point renders line marker cleanly | ORIGINAL_REQUEST.md:58 |
| 6 | R3 - Overview | Recent Transactions List | Quick feed of 10 latest transactions with direct detail link | User transactions ordered by date DESC | 10 list rows with icons, notes, wallets, categories, amounts | Empty state illustration and onboarding checklist if count = 0 | ORIGINAL_REQUEST.md:58 |
| 7 | R3 - Overview | Onboarding Checklist Widget | Interactive setup checklist for new users (Telegram, first tx, budget, wallet) | User completion status across 4 milestones | Progress percentage and actionable deep-links | Automatically hidden once 100% completed or dismissed | ORIGINAL_REQUEST.md:58, 94 |
| 8 | R3 - Transactions | Transaction Recording Modal | Form to record income, expense, or wallet transfers | Type, amount, wallet, destination wallet, category, date, notes, receipt file | Created transaction record and updated wallet balances | Form validation prevents negative amount, missing wallet, or same-wallet transfer | ORIGINAL_REQUEST.md:60 |
| 9 | R3 - Transactions | Receipt Breakdown Expander | Collapsible sub-row showing OCR itemized breakdown (`transaction_items`) | Click expand icon on receipt transaction row | Nested table with item name, category, and line-item amount | If items missing, shows notice and opens raw receipt image | ORIGINAL_REQUEST.md:34, 60 |
| 10 | R3 - Budget | Category Budget Limits | Set monthly spending limits per category | Category ID, month, year, target amount | Budget record created in `budgets` table | Prevents duplicate budget for same category in same month | ORIGINAL_REQUEST.md:35, 61 |
| 11 | R3 - Budget | Visual Budget Progress Bar | Progress meter showing spent vs budget with 80% & 100% alerts | Aggregated spending in category for target month | Multi-color progress bar (Normal / Orange warning at 80% / Red at 100%) | Handles overbudget (>100%) by clamping visual bar to 100% with overflow text | ORIGINAL_REQUEST.md:61 |
| 12 | R3 - Reports | Net Cashflow Banner | Financial health summary comparing income vs expense | Date range filter | Net cashflow amount, savings rate percentage | Handles zero income (savings rate = 0% without division-by-zero crash) | ORIGINAL_REQUEST.md:62 |
| 13 | R3 - Reports | Filterable Transaction Table | Paginated, searchable, and sortable transaction records | Page size, page index, sort column, sort direction, category/wallet filters | Structured data table with formatted currency and WIB timestamps | Shows "Tidak ada transaksi ditemukan" on zero filter matches | ORIGINAL_REQUEST.md:62 |
| 14 | R3 - Reports | PDF Export Generator | On-demand generation of branded financial summary PDF | Selected date range, active filters, user ID | Downloadable PDF file uploaded to `tatadana-exports` | Generation failure returns 500 with error toast and marks history as `failed` | ORIGINAL_REQUEST.md:22, 62 |
| 15 | R3 - Reports | Excel (.xlsx) Export Generator | On-demand generation of spreadsheet ledger | Selected date range, active filters, user ID | Downloadable .xlsx file with formulas and multiple sheets | Corrupted stream returns friendly retry error message | ORIGINAL_REQUEST.md:22, 62 |
| 16 | R3 - Reports | Export History Ledger | Persistent log of generated export reports (`export_history`) | Query user export records | Table with file name, type, date, status, and signed download URL | Expired signed URLs automatically regenerated on click | ORIGINAL_REQUEST.md:36, 62 |
| 17 | R3 - Wallets | Multi-Wallet Manager | Create, edit, and view balances across Cash, Bank, and E-Wallet accounts | Name, type (`cash`, `bank`, `ewallet`), initial balance | Updated `wallets` table and wallet cards | Disallows deleting wallet with active transactions unless reallocated | ORIGINAL_REQUEST.md:31, 63 |
| 18 | R3 - Wallets | Default Wallet Selector | Assign one wallet as primary for Telegram Bot auto-logging | Toggle `is_default` on target wallet | Exactly one wallet set as default (`is_default = true`) | Automatically unsets previous default wallet atomically | ORIGINAL_REQUEST.md:31, 63 |
| 19 | R3 - Settings | User Profile Management | Edit user profile information and view account plan | Name, phone number, avatar image file | Updated `profiles` record, uploaded avatar | Rejects file upload > 2MB or invalid image MIME types | ORIGINAL_REQUEST.md:30, 64 |
| 20 | R3 - Settings | Telegram Bot Setup Guide | Step-by-step instructions for connecting Telegram Bot | Visual UI documentation | Rendered copyable bot username and connect commands | N/A (Static guide) | ORIGINAL_REQUEST.md:64 |
| 21 | R3 - Settings | Bot Connection Tester | Live test verifying bot token and webhook status | Click "Test Koneksi" button | Status cycle: `⏳ Testing...` -> `🟢 Terhubung` or `🔴 Tidak terhubung` | Displays exact failure reason (e.g. 401 Unauthorized, Webhook Error) | ORIGINAL_REQUEST.md:64, 105 |
| 22 | R3 - Settings | Daily Reminder Scheduler | Configure daily spending reminders (up to 2x/day WIB) | Toggle switch, time picker 1, time picker 2 | Scheduled cron reminder settings saved | Enforces maximum 2 reminder schedules per day | ORIGINAL_REQUEST.md:53, 64 |
| 23 | R3 - Settings | Reminder Message Preview | Realistic preview bubble showing how reminder appears in Telegram | User name and configured times | Formatted simulated Telegram message card | Displays fallback template if user name is unset | ORIGINAL_REQUEST.md:64 |
| 24 | R3 - Settings | Category Customizer | Create custom categories with emoji and custom color | Name, emoji, hex color, type (`income` / `expense`) | Added category record in `categories` | System categories (`is_system = true`) protected from deletion | ORIGINAL_REQUEST.md:32, 64 |
| 25 | R3 - Realtime | Supabase Realtime Sync | Realtime data synchronization between Telegram Bot and Web UI | Postgres change events on `transactions`, `wallets`, `budgets` | Instant UI re-render and toast notification | Reconnects automatically with exponential backoff on WebSocket drop | ORIGINAL_REQUEST.md:18, 65 |
| 26 | R4 - Admin | Superadmin Route Guard | Restricts `/admin` paths strictly to users with `role = 'admin'` | Session auth token and user profile role | Authorized access to Admin Console | Non-admin redirected to `/dashboard` with 403 Forbidden alert | ORIGINAL_REQUEST.md:30, 68 |
| 27 | R4 - Admin | AI Provider Manager | Configure Gemini, OpenAI, and DeepSeek API keys and priorities | API key strings, priority integers, active toggles | Encrypted storage in `ai_providers` table | Rejects empty key when enabling provider; warns on all providers disabled | ORIGINAL_REQUEST.md:37, 69 |
| 28 | R4 - Admin | AI Mode Switcher | Switch between Single Provider and Automatic Failover mode | Select `single` or `failover` mode | System routing policy updated | Failover mode requires at least 2 active providers configured | ORIGINAL_REQUEST.md:37, 69 |
| 29 | R4 - Admin | AI Provider Health Check | Live ping probe testing upstream AI provider connectivity | Click "Check Health" button | Response time in ms and status badge (`Operational` / `Offline`) | Captures upstream HTTP error code and message on failure | ORIGINAL_REQUEST.md:69 |
| 30 | R4 - Admin | User Management Directory | Complete user directory with plan, contact, and bot status | Search term, plan filter, page index | Paginated table of user profiles | Empty table when search yields no match | ORIGINAL_REQUEST.md:70 |
| 31 | R4 - Admin | User Impersonation | Allows admin to log in as any user without credentials | Click "Impersonate" on user row | Swapped session with admin audit banner and return button | Logs action to `admin_audit_logs`; prevents impersonating superadmins | ORIGINAL_REQUEST.md:40, 70 |
| 32 | R4 - Admin | AI Logs & Analytics | Monitor token usage, latency, purpose, and estimated cost | Date range filter, purpose filter, provider filter | Aggregated KPI cards and granular execution log table | Displays full error stack trace for failed executions | ORIGINAL_REQUEST.md:38, 71 |
| 33 | R4 - Admin | Transaction Inspector | Customer support inspection of user transactions and raw input | Target User ID or email query | Chronological list of user transactions with `raw_input` and receipts | Automatically writes view event to `admin_audit_logs` | ORIGINAL_REQUEST.md:40, 72 |
| 34 | R4 - Admin | Payment Approvals Queue | Review and approve/reject Midtrans and manual bank transfer payments | Status filter (`pending`, `active`, `expired`) | Payment list with proof attachment viewer and Approve/Reject buttons | Approving updates subscription status and notifies user; Rejecting requires note | ORIGINAL_REQUEST.md:39, 73 |
| 35 | R4 - Admin | Platform Data Export | Export platform-wide users, transactions, and AI telemetry | Date range, export dataset selector, format (CSV/XLSX/JSON) | Downloadable data archive | Large query handles streaming or pagination to prevent memory exhaustion | ORIGINAL_REQUEST.md:74 |
| 36 | R5 - Landing | Sticky Header Navbar | Top navigation with logo, anchor links, and auth buttons | Window scroll offset | Dynamic styling transition from transparent to frosted backdrop blur | Mobile hamburger menu toggles responsive drawer at < 768px | ORIGINAL_REQUEST.md:78 |
| 37 | R5 - Landing | Hero Section | High-impact fintech value proposition with gradient H1 | Page load | Pre-headline badge, gradient H1, sub-headline, CTA buttons | Graceful typography scaling on 375px mobile screens | ORIGINAL_REQUEST.md:79-83 |
| 38 | R5 - Landing | Hero Video Placeholder | Video mock player with placeholder comment | Click play button | Video modal or placeholder toast (`// TODO: ganti dengan video asli`) | Handled gracefully without broken media error | ORIGINAL_REQUEST.md:82 |
| 39 | R5 - Landing | Pain Points & Solution | Visual problem cards and transition to TataDana solution | Page scroll | 3 problem bullet cards followed by solution introduction | Readable contrast across all screen sizes | ORIGINAL_REQUEST.md:84-85 |
| 40 | R5 - Landing | Interactive Bot Simulator | Split interactive preview showing Telegram chat & mini dashboard | User clicks simulated prompt buttons | Simulated bot reply with formatted progress bar and live dashboard sync | Responsive layout collapses to vertical stack on mobile | ORIGINAL_REQUEST.md:86 |
| 41 | R5 - Landing | Alternating Features Grid | 3 core feature showcases with alternating text and visuals | Page scroll | Feature 1 (Chat/VN Bot), Feature 2 (Vision OCR), Feature 3 (Smart Budget) | Flex layout flips direction on alternating rows | ORIGINAL_REQUEST.md:87 |
| 42 | R5 - Landing | Testimonial Masonry Grid | Social proof grid with placeholder comments | Page scroll | Customer quote cards (`// TODO: ganti dengan testimoni asli`) | CSS grid prevents overlapping cards | ORIGINAL_REQUEST.md:88 |
| 43 | R5 - Landing | Pricing Toggle & Cards | Interactive toggle between Monthly and One-Time payment | Billing interval toggle (Monthly vs One-Time) | Starter (Rp 49k/bln) vs Pro (Rp 99k lifetime) pricing cards | Dynamic price text swap without layout jump | ORIGINAL_REQUEST.md:89 |
| 44 | R5 - Landing | 7-Question FAQ Accordion | Collapsible accordion answering top 7 fintech questions | Click accordion header | Smooth expand/collapse of question answers | Multiple accordions can expand independently or auto-collapse | ORIGINAL_REQUEST.md:90 |
| 45 | R5 - Landing | Final CTA & 4-Column Footer | Bottom conversion card and structured site links | Page scroll | Orange gradient CTA card and 4-column link footer | Responsive footer collapses to 1-2 columns on mobile (375px) | ORIGINAL_REQUEST.md:91 |
| 46 | R5 - Auth | Split Layout Auth Shell | 40% orange branding + 60% white form container | Page navigation to `/login` or `/register` | Desktop split screen, mobile stacked view | Responsive breakpoint at lg (1024px) | ORIGINAL_REQUEST.md:92 |
| 47 | R5 - Auth | Email & Password Auth | Traditional email/password sign-in and sign-up | Email string, password string | Supabase session token and redirect to `/dashboard` | Invalid credentials display clear Indonesian error message | ORIGINAL_REQUEST.md:93 |
| 48 | R5 - Auth | Google OAuth Single Sign-On | One-click social authentication | Click "Lanjutkan dengan Google" | Redirects to Google consent screen and back to `/auth/callback` | OAuth cancellation redirects back to auth screen with notice | ORIGINAL_REQUEST.md:93 |
| 49 | R5 - Auth | Phone Number OTP Auth | Phone number sign-in with SMS OTP verification | Indonesian phone number, 6-digit OTP code | Validated session token | Rate-limits OTP resends to 60-second cooldown | ORIGINAL_REQUEST.md:93 |
| 50 | R5 - Auth | Dev OTP Bypass Code | Development bypass code `123456` for instant OTP verification | OTP input = `123456` | Bypasses SMS provider and logs user in immediately | Only permitted when app runs in development / integrity mode | ORIGINAL_REQUEST.md:93 |
| 51 | R5 - Auth | Account Auto-Setup Engine | Post-registration creation of default wallet and categories | New user ID from auth trigger | Default `Tunai` wallet, default categories, and checklist record | Idempotent execution (skips if wallet already exists) | ORIGINAL_REQUEST.md:42, 94 |
| 52 | Limits | Monthly Transaction Limiter | Enforces 50 tx/month limit on Starter plan | Attempted transaction creation | Allows if count < 50; blocks if count >= 50 with upgrade CTA | Rejection returns HTTP 403 / Bot error message explaining limit | ORIGINAL_REQUEST.md:54, 106 |
| 53 | Limits | Vision OCR Plan Gating | Restricts receipt image processing to Pro subscribers | Receipt image upload | Pro: processed via OCR; Starter: rejected with educational upgrade CTA | Educational message sent without debiting transaction quota | ORIGINAL_REQUEST.md:48, 54, 106 |
| 54 | Limits | AI Advisor Plan Gating | Restricts proactive spending advice alerts to Pro subscribers | Anomaly detection trigger (>50% spike) | Pro: proactive advice message; Starter: suppressed | No error thrown to user, silent feature suppression | ORIGINAL_REQUEST.md:52, 54, 106 |

---

## 8. Edge Cases

The following edge cases must be handled robustly across the application:

| # | Feature | Input / Scenario | Observed / Required Behavior |
|---|---------|------------------|------------------------------|
| 1 | Stats Cards | User has zero transactions in the selected period | Cards display `Rp 0` for income and expense; delta shows `0%` or `-`; no `NaN` or `undefined` rendered. |
| 2 | Budget Progress Bar | Actual spending strictly exceeds 100% of the allocated budget (e.g. Spent Rp 2.500.000 of Rp 2.000.000 budget) | Visual progress bar clamps at 100% width with bold red color; text label explicitly states `Overbudget Rp 500.000 (125%)`; alert status remains `alert_100_sent = true`. |
| 3 | Net Cashflow Banner | Income is Rp 0 and Expense is Rp 1.500.000 | Net cashflow renders `-Rp 1.500.000` in red; savings rate safely handles division-by-zero, displaying `0%` instead of crashing with `NaN%`. |
| 4 | Multi-Wallet Manager | User attempts to delete the wallet currently marked as `is_default = true` | Operation blocked with warning: "Tidak dapat menghapus dompet default. Silakan pilih dompet default lain terlebih dahulu." |
| 5 | Multi-Wallet Manager | User initiates a transfer with Source Wallet equal to Destination Wallet | Form validation disables submission with error: "Dompet tujuan tidak boleh sama dengan dompet asal." |
| 6 | Default Wallet Selection | User marks a new wallet as default when an existing default wallet already exists | Database transaction or server action atomically updates the previous default wallet to `is_default = false` and sets the new wallet to `is_default = true`. |
| 7 | Custom Categories | User attempts to delete a system category (`is_system = true`) | Delete action is disabled in UI; backend API returns HTTP 403 Forbidden: "Kategori bawaan sistem tidak dapat dihapus." |
| 8 | Telegram Bot Test Connection | User clicks "Test Koneksi" with an invalid or expired Telegram Bot Token | Status transitions to `⏳ Testing...`, then renders `🔴 Tidak terhubung` with verbatim error details (e.g. `401 Unauthorized: Invalid Token`). |
| 9 | Daily Reminder Scheduler | User attempts to set a 3rd reminder in a single day | UI blocks addition of extra reminder slots; enforces max 2 reminders per day constraint per spec. |
| 10 | Daily Reminder Scheduler | Timezone shift or DST evaluation | All reminder triggers strictly execute in Asia/Jakarta (`WIB`, UTC+7) regardless of browser client timezone. |
| 11 | Transaction Table Expand | Transaction has input_type = 'receipt' but OCR failed to parse individual items (zero `transaction_items`) | Expander reveals note: "Detail item tidak terdeteksi otomatis. Klik tombol di bawah untuk melihat foto struk asli." |
| 12 | Export Engine | User requests PDF/Excel export for a date range with zero matching transactions | File generator produces a valid document containing headers and a clean "Tidak ada transaksi pada periode ini" row instead of corrupted empty binary. |
| 13 | Export History Download | User attempts to download an export after the original signed URL has expired | Clicking download triggers an on-demand regeneration of the Supabase Storage signed URL (60-minute TTL) and initiates download smoothly. |
| 14 | Supabase Realtime Sync | Browser loses internet connectivity and reconnects after Telegram bot transactions were created | Realtime channel triggers automatic resubscribe and refetches full dataset on reconnect to ensure consistency. |
| 15 | Superadmin Impersonation | Admin impersonates a user and then attempts to access `/admin` URLs | System detects active impersonation session and blocks admin privilege escalation; displays "Akses admin dinonaktifkan saat mode impersonate." |
| 16 | Superadmin Impersonation | Admin attempts to impersonate another Superadmin account | Operation rejected with security error: "Tidak dapat melakukan impersonate terhadap sesama akun admin." |
| 17 | Transaction Inspector | Admin opens the Transaction Inspector to review a user's transactions | System synchronously creates an immutable row in `admin_audit_logs`; if the audit log insert fails, transaction inspection is aborted. |
| 18 | AI Provider Manager | Primary AI provider experiences HTTP 429 rate limit or 504 gateway timeout | In Failover mode, system immediately dispatches request to the secondary provider (e.g. fallback from Gemini to OpenAI GPT-4o-mini), logs failover incident, and returns result transparently. |
| 19 | AI Provider Manager | Admin accidentally disables all AI providers while the bot is active | Requests return graceful fallback message: "Layanan asisten AI sedang dalam pemeliharaan. Silakan coba beberapa saat lagi." Admin console shows critical warning. |
| 20 | Phone OTP Auth | User inputs dev bypass OTP `123456` in development environment | Authentication succeeds immediately, bypassing SMS gateway. |
| 21 | Phone OTP Auth | User inputs dev bypass OTP `123456` in production environment | Bypass code is treated as an invalid OTP unless explicitly matched against real SMS gateway verification. |
| 22 | Starter Plan Quota | Starter user with exactly 50 transactions attempts to create a 51st transaction via web or bot | Request is rejected with HTTP 403 / bot message: "Batas 50 transaksi bulan ini telah tercapai. Upgrade ke TataDana Pro untuk pencatatan tanpa batas!" |
| 23 | Starter Plan Quota | Calendar month rolls over from last day of month 23:59 WIB to first day 00:00 WIB | Transaction count resets to 0 for the new month; Starter user can immediately record transactions again without admin intervention. |
| 24 | Vision OCR Struk | Starter plan user sends a photo of a receipt to Telegram Bot | Bot replies with educational rejection: "📸 Foto struk diterima, namun ekstraksi OCR otomatis adalah fitur eksklusif TataDana PRO. Yuk upgrade ke PRO hanya Rp99.000 sekali bayar!" |
| 25 | Payment Approvals | Admin clicks "Reject" on a pending manual bank transfer | Admin must supply a rejection reason; subscription status transitions to `failed`; user receives explanation on next login. |
| 26 | Responsive Layout | User accesses application on narrow mobile viewport (375px width, iPhone SE / Mini) | All 14 landing page sections, dashboard tables, charts, and forms render without horizontal scrollbar (`overflow-x: hidden`); table switches to stacked card view or horizontal swipe container. |
| 27 | Large Currency Values | User records transaction with extreme amount (e.g. Rp 10.000.000.000 / 10 Miliar) | Currency formatting preserves full numeric precision without rounding error (`numeric` column in Postgres); UI displays readable abbreviation on tight cards (`Rp 10 M`). |
| 28 | Concurrent Webhook Deliveries | Telegram sends duplicate webhook deliveries for the same update with identical `update_id` | Database unique constraint on `telegram_processed_updates.update_id` catches duplicate; second request returns HTTP 200 immediately without reprocessing. |

---

## 9. Conclusion & Implementation Guidance

The requirements for **R3 (User Dashboard & In-App Reports)**, **R4 (Admin Dashboard)**, **R5 (Landing Page & Authentication)**, **Subscription Limits**, and **Acceptance Criteria** are comprehensively mapped, detailed, and validated against `ORIGINAL_REQUEST.md`.

### Recommended Technical Blueprint for Implementation Workers:
1. **Frontend Architecture**:
   - Next.js 14/15 App Router (`app/(marketing)` for landing page, `app/(auth)` for split-screen login/register, `app/(dashboard)` for user app, `app/(admin)` for superadmin portal).
   - Tailwind CSS with custom configuration for `#F97316` brand colors and `Inter` / `Plus Jakarta Sans` typography.
   - Lucide React for clean UI iconography.
   - Recharts or Chart.js for Donut, Bar, and Line charts.
2. **State & Realtime**:
   - Supabase Client with Realtime channels on `transactions`, `wallets`, `budgets`.
   - TanStack React Query for cached data fetching, optimistic updates, and cache invalidation on realtime events.
3. **Export Engine**:
   - Server-side PDF generation using `@react-pdf/renderer` or `jspdf` / `pdfkit`.
   - Server-side Excel generation using `xlsx` (SheetJS).
   - Direct upload to Supabase Storage bucket `tatadana-exports` and short-lived signed URL generation.
4. **Security & Impersonation**:
   - Supabase Auth cookies with middleware role checking.
   - Impersonation session cookie with strict visual banner and administrative audit log triggers.

This report serves as the complete, authoritative reference for the architecture and implementation phases of TataDana.
