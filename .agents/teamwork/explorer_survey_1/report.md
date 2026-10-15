# TataDana Survey & Technical Architecture Report
**Module Focus**: Architecture, Monorepo Setup, and Database Schema (R1)  
**Author**: Explorer Survey 1 (`explorer_survey_1`)  
**Target Project**: TataDana — Indonesian Fintech SaaS with Telegram Bot Integration  
**Date**: October 2026  
**Reference Document**: `ORIGINAL_REQUEST.md`

---

## Executive Summary

TataDana is an enterprise-grade Indonesian personal finance SaaS engineered around an **Orange & White** visual identity (`#F97316` / Orange 500), offering deep conversational Telegram bot integration, multimodal AI processing (Google Gemini, OpenAI, DeepSeek), Midtrans payment gateway, automated PDF/Excel reporting, and live synchronization via Supabase Realtime.

This report establishes the complete structural blueprint for:
1. **Next.js 14/15 App Router Monorepo Architecture**: Unified full-stack directory hierarchy, module boundaries, Server vs Client Component contracts, Supabase Client Triad, and Tailwind CSS design tokens.
2. **Complete PostgreSQL Database Specification (R1)**: 12 relational tables, DDL column data types, foreign key constraints, deletion cascades, check constraints, composite performance indexes, and audit structures.
3. **Automated Database Functions & Triggers**: Auth user profile auto-provisioning, default wallet creation (`Tunai`), standard Indonesian category seeding, automated wallet balance reconciliation, and `updated_at` timestamps.
4. **Row-Level Security (RLS) Matrix**: Complete policy enumeration across all tables for authenticated users, role-based admin escalation (`role = 'admin'`), and backend Service Role bypass.
5. **Supabase Realtime & Storage Architecture**: Private storage buckets (`tatadana-exports`, `receipt-images`), storage RLS policies, signed URL workflows, and Realtime websocket publications.
6. **Package Dependencies & Scripts Catalog**: Complete dependency inventory (`package.json`) and development/production scripts including `bot:dev`.

---

## 1. Monorepo Setup & System Architecture

### 1.1 Architecture Blueprint

TataDana operates as a **unified Next.js 14/15 App Router monorepo**. The web application, backend API routes, Telegram webhook handler, AI provider orchestration, and export generators live in a single cohesive repository. This eliminates cross-repo synchronization overhead while allowing shared TypeScript models across client and server.

```
+--------------------------------------------------------------------------------------------------+
|                                    TataDana Monorepo Architecture                                |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   +----------------------------------------------------+  +----------------------------------+   |
|   |                   Presentation                     |  |         Telegram Bot Engine      |   |
|   |  - Landing Page (14 sections, interactive preview) |  |  - Webhook (/api/telegram/...)   |   |
|   |  - Auth Pages (Email, Google, Phone OTP dev bypass)|  |  - Dev Runner (scripts/bot-dev)  |   |
|   |  - User Dashboard (Beranda, Tx, Budget, Laporan)   |  |  - Idempotency & Slang Parser    |   |
|   |  - Admin Dashboard (AI, Users, Audit, Approvals)   |  |  - Vision OCR & Voice STT        |   |
|   +----------------------------------------------------+  +----------------------------------+   |
|                            |                                                |                    |
|                            v                                                v                    |
|   +------------------------------------------------------------------------------------------+   |
|   |                                Next.js App Router Core (src/)                            |   |
|   |  - Server Actions & Route Handlers (/api/...)                                            |   |
|   |  - Middleware (Auth guard, role guard, admin redirect)                                   |   |
|   |  - Service Layer: /lib/ai, /lib/telegram, /lib/midtrans, /lib/export, /lib/supabase      |   |
|   +------------------------------------------------------------------------------------------+   |
|                                                |                                                 |
|                                                v                                                 |
|   +------------------------------------------------------------------------------------------+   |
|   |                       Supabase Infrastructure (PostgreSQL 15+)                           |   |
|   |  - 12 Tables with Strict RLS Policies & Triggers                                         |   |
|   |  - Supabase Auth (GoTrue + Phone OTP)                                                    |   |
|   |  - Supabase Storage (tatadana-exports, receipt-images)                                   |   |
|   |  - Supabase Realtime (transactions, wallets, budgets publications)                       |   |
|   +------------------------------------------------------------------------------------------+   |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

---

### 1.2 Target Directory Hierarchy

The recommended directory structure follows modern Next.js conventions with `src/` root:

```
tatadana/
├── .env.example
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json                  # shadcn/ui configuration
│
├── supabase/
│   ├── config.toml
│   ├── seed.sql                     # Admin seed and reference data
│   └── migrations/
│       └── 001_initial_schema.sql   # R1: 12 tables + RLS + triggers + storage
│
├── scripts/
│   └── bot-dev.ts                   # Telegram bot long-polling dev runner
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│
└── src/
    ├── middleware.ts                # Route protection, session refresh, admin role check
    │
    ├── app/
    │   ├── layout.tsx               # Root layout (Inter / Plus Jakarta Sans font, Toast provider)
    │   ├── page.tsx                 # Landing Page (14 sections)
    │   ├── globals.css              # Tailwind base, components, utilities, orange color tokens
    │   │
    │   ├── (auth)/
    │   │   ├── layout.tsx           # Split layout: 40% orange branding + 60% form container
    │   │   ├── login/page.tsx       # Email/Google/Phone login
    │   │   └── register/page.tsx    # Registration + onboarding trigger
    │   │
    │   ├── (dashboard)/
    │   │   ├── layout.tsx           # Authenticated shell (Sidebar, Header, Profile, Realtime sync)
    │   │   ├── beranda/page.tsx     # 4 stats cards, charts, recent transactions, onboarding checklist
    │   │   ├── transaksi/page.tsx   # Transaction form (income/expense/transfer), table with receipt modal
    │   │   ├── budget/page.tsx      # Monthly budget tracker, 80% & 100% threshold visual alerts
    │   │   ├── laporan/page.tsx     # Pagination, filter, cashflow stats, PDF/Excel export triggers
    │   │   ├── wallet/page.tsx      # Multi-wallet management, default bot wallet selection
    │   │   └── settings/page.tsx    # Tabs: Profil, Telegram Bot, Reminder, Kategori
    │   │
    │   ├── (admin)/
    │   │   ├── admin/
    │   │   │   ├── layout.tsx       # Admin shell (Superadmin navigation & audit context)
    │   │   │   ├── page.tsx         # Admin dashboard overview
    │   │   │   ├── ai-providers/    # API keys, failover switch, health status
    │   │   │   ├── users/           # User management + Impersonation action
    │   │   │   ├── ai-logs/         # AI analytics, latency, tokens, cost estimate
    │   │   │   ├── transactions/    # Transaction Inspector (audited read access)
    │   │   │   ├── payments/        # Midtrans transactions & manual transfer approvals
    │   │   │   └── exports/         # Platform & user data summary exporter
    │   │
    │   └── api/
    │       ├── auth/
    │       │   └── callback/route.ts# Supabase Auth code exchange handler
    │       ├── telegram/
    │       │   ├── webhook/route.ts # Webhook handler (idempotent, update_id tracking)
    │       │   └── test/route.ts    # Test koneksi endpoint (getMe, setWebhook)
    │       ├── ai/
    │       │   └── parse/route.ts   # NLP parsing endpoint
    │       ├── midtrans/
    │       │   ├── snap/route.ts    # Create Snap transaction token
    │       │   └── webhook/route.ts # Payment notification callback
    │       ├── export/
    │       │   ├── pdf/route.ts     # Generate PDF report & upload to storage
    │       │   └── excel/route.ts   # Generate XLSX report & upload to storage
    │       └── cron/
    │           └── reminder/route.ts# Scheduled bot reminder dispatcher
    │
    ├── components/
    │   ├── ui/                      # Radix / shadcn atomic primitives
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── tabs.tsx
    │   │   ├── card.tsx
    │   │   ├── progress.tsx
    │   │   ├── badge.tsx
    │   │   ├── toast.tsx / sonner.tsx
    │   │   ├── select.tsx
    │   │   ├── table.tsx
    │   │   ├── sheet.tsx
    │   │   ├── switch.tsx
    │   │   └── avatar.tsx
    │   ├── landing/                 # 14 Landing page sections
    │   │   ├── navbar.tsx
    │   │   ├── hero.tsx
    │   │   ├── interactive-preview.tsx
    │   │   ├── features.tsx
    │   │   ├── pricing.tsx
    │   │   ├── faq.tsx
    │   │   └── footer.tsx
    │   ├── dashboard/               # Reusable dashboard widgets
    │   │   ├── stats-card.tsx
    │   │   ├── cashflow-chart.tsx
    │   │   ├── category-pie-chart.tsx
    │   │   ├── daily-trend-chart.tsx
    │   │   ├── transaction-modal.tsx
    │   │   ├── budget-progress-bar.tsx
    │   │   └── onboarding-checklist.tsx
    │   └── shared/
    │       ├── currency-input.tsx
    │       ├── date-picker.tsx
    │       └── empty-state.tsx
    │
    ├── hooks/
    │   ├── use-realtime-transactions.ts
    │   ├── use-user-profile.ts
    │   └── use-budget-summary.ts
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts            # Browser client (createBrowserClient)
    │   │   ├── server.ts            # Server Component & Action client (createServerClient)
    │   │   ├── admin.ts             # Service Role admin client (bypasses RLS)
    │   │   └── middleware.ts        # Supabase session cookie refresh helper
    │   ├── ai/
    │   │   ├── provider-factory.ts  # Multi-provider router (Gemini default, OpenAI/DeepSeek failover)
    │   │   ├── gemini.ts            # Google Gemini multimodal client
    │   │   ├── openai.ts            # OpenAI client
    │   │   ├── deepseek.ts          # DeepSeek client
    │   │   ├── nlp-parser.ts        # Indonesian currency & category parser
    │   │   ├── vision-ocr.ts        # Receipt scanner & item breakdown
    │   │   └── voice-stt.ts         # Audio transcription pipeline
    │   ├── telegram/
    │   │   ├── bot-client.ts        # Telegram Bot API wrapper (sendMessage, sendPhoto, etc.)
    │   │   ├── message-formatter.ts # Indonesian text formatting + visual progress bar (█ / ░)
    │   │   └── commands.ts          # Telegram slash commands handler
    │   ├── midtrans/
    │   │   └── client.ts            # Midtrans Snap API & signature validation
    │   ├── export/
    │   │   ├── pdf-generator.ts     # jsPDF / pdfkit report generation
    │   │   └── excel-generator.ts   # xlsx spreadsheet generation
    │   ├── timezone.ts              # Asia/Jakarta (WIB) date formatting utilities
    │   └── utils.ts                 # cn, formatRupiah, slugify, etc.
    │
    └── types/
        ├── database.types.ts        # Generated Supabase database types
        ├── telegram.types.ts        # Telegram Bot update payloads
        ├── ai.types.ts              # Structured LLM outputs
        └── transaction.types.ts     # Transaction, Wallet, and Budget DTOs
```

---

### 1.3 Client & Server Boundary Strategy

Next.js App Router enforces strict boundary separation between Server Components (RSC) and Client Components (`"use client"`). The architectural protocol for TataDana is:

1. **Server Components (Default)**:
   - Data fetching occurs directly in Server Components using `createServerClient` (`src/lib/supabase/server.ts`).
   - Sensitive computations, API secrets, and server-side redirects happen exclusively on the server.
   - Initial dashboard renders fetch user wallets, recent transactions, and category lists with zero client-side bundle impact.

2. **Client Components (`"use client"`)**:
   - Interactive components: form inputs, modals, tabs, chart tooltips, and file pickers.
   - Realtime listeners: `useRealtimeTransactions` leverages `@supabase/supabase-js` realtime channel subscriptions to invalidate router cache or update local state immediately when Telegram bot records an entry.
   - Interactive dashboard preview on Landing Page.

3. **Supabase Client Triad**:
   To prevent token leakage and permission bugs, exactly three Supabase client instantiation patterns are permitted:

   - **Browser Client (`src/lib/supabase/client.ts`)**:
     ```typescript
     import { createBrowserClient } from '@supabase/ssr'
     export function createClient() {
       return createBrowserClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
       )
     }
     ```
   - **Server Client (`src/lib/supabase/server.ts`)**:
     ```typescript
     import { createServerClient } from '@supabase/ssr'
     import { cookies } from 'next/headers'
     export async function createClient() {
       const cookieStore = await cookies()
       return createServerClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
         {
           cookies: {
             getAll() { return cookieStore.getAll() },
             setAll(cookiesToSet) {
               try {
                 cookiesToSet.forEach(({ name, value, options }) =>
                   cookieStore.set(name, value, options)
                 )
               } catch {}
             },
           },
         }
       )
     }
     ```
   - **Admin / Service Role Client (`src/lib/supabase/admin.ts`)**:
     ```typescript
     import { createClient as createSupabaseClient } from '@supabase/supabase-js'
     // STRICT RULE: Only import in Server Actions, Route Handlers, or CLI scripts!
     // Never expose SUPABASE_SERVICE_ROLE_KEY to client bundle!
     export const supabaseAdmin = createSupabaseClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!,
       { auth: { persistSession: false, autoRefreshToken: false } }
     )
     ```

---

### 1.4 Design Tokens & Theme Specification

Per R3 & R5 specifications, the application utilizes a **Fintech Orange & White** theme:

- **Primary Brand Color**:
  - `primary-50`: `#FFF7ED`
  - `primary-100`: `#FFEDD5`
  - `primary-500` (Default Brand Accent): `#F97316` (Tailwind `orange-500`)
  - `primary-600` (Hover / Active): `#EA580C` (Tailwind `orange-600`)
  - `primary-700`: `#C2410C`
- **Surface & Backgrounds**:
  - Main App Background: `neutral-50` (`#FAFAFA`)
  - Elevated Cards / Containers: `#FFFFFF`
  - Subtle Borders: `neutral-200` (`#E5E7EB` / `#E2E8F0`)
- **Typography**:
  - Primary Font Family: `Inter`, `Plus Jakarta Sans`, sans-serif
  - Monospace (Code / Numbers / Terminal): `JetBrains Mono`, monospace
- **Financial Status Semantic Palette**:
  - Pemasukan (Income): `emerald-500` (`#10B981`)
  - Pengeluaran (Expense): `rose-500` (`#F43F5E`) / `orange-500`
  - Warning (Budget 80% Threshold): `amber-500` (`#F59E0B`)
  - Danger (Budget 100% Exceeded): `red-600` (`#DC2626`)
  - Transfer: `blue-500` (`#3B82F6`)
- **Responsive Target Viewports**:
  - Mobile Small: `375px` (iPhone SE / standard compact)
  - Desktop Standard: `1280px` (MacBook / 1080p display)

---

## 2. Comprehensive Database Specification (R1)

The database consists of **12 core relational tables** in PostgreSQL 15+ hosted on Supabase, guarded by Row-Level Security (RLS) and automated via triggers.

```
                                      +------------------------+
                                      |       auth.users       |
                                      +------------------------+
                                                  |
                                                  | 1:1
                                                  v
     +-------------------+              +-------------------+               +-------------------+
     |   subscriptions   | <----------- |     profiles      | ------------> |      wallets      |
     +-------------------+      1:N     +-------------------+      1:N      +-------------------+
                                                  |                                   |
                                                  | 1:N                               | 1:N
                                                  v                                   v
+------------------------+              +-------------------+               +-------------------+
|     export_history     |              |    categories     | <------------ |   transactions    |
+------------------------+              +-------------------+      N:1      +-------------------+
                                                  |                                   |
                                                  | 1:N                               | 1:N
                                                  v                                   v
                                        +-------------------+               +-------------------+
                                        |      budgets      |               | transaction_items |
                                        +-------------------+               +-------------------+

+------------------------+              +-------------------+               +-------------------+
|      ai_providers      |              |      ai_logs      |               | admin_audit_logs  |
+------------------------+              +-------------------+               +-------------------+

                                        +----------------------------+
                                        | telegram_processed_updates |
                                        +----------------------------+
```

---

### Table 1: `profiles`
Represents user profiles, linked 1:1 with Supabase Auth (`auth.users`), storing role and Telegram linkage.

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE` | - | Supabase Auth user UUID |
| `email` | `TEXT` | `NOT NULL` | - | User email address |
| `phone_number` | `TEXT` | `NULL` | `NULL` | Phone number for OTP auth |
| `full_name` | `TEXT` | `NULL` | `NULL` | Display name |
| `avatar_url` | `TEXT` | `NULL` | `NULL` | Avatar image URL |
| `role` | `TEXT` | `NOT NULL, CHECK (role IN ('user', 'admin'))` | `'user'` | Role RBAC guard |
| `telegram_user_id` | `BIGINT` | `UNIQUE, NULL` | `NULL` | Telegram numeric user ID |
| `telegram_chat_id` | `BIGINT` | `UNIQUE, NULL` | `NULL` | Telegram direct chat ID |
| `telegram_connected_at` | `TIMESTAMPTZ` | `NULL` | `NULL` | Timestamp when Telegram was linked |
| `daily_reminder_enabled`| `BOOLEAN` | `NOT NULL` | `false` | Scheduled reminder switch |
| `reminder_time_1` | `TIME` | `NOT NULL` | `'12:00:00'` | First daily reminder (WIB) |
| `reminder_time_2` | `TIME` | `NOT NULL` | `'20:00:00'` | Second daily reminder (WIB) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Last update timestamp |

**Indexes**:
- `CREATE INDEX idx_profiles_role ON profiles(role);`
- `CREATE INDEX idx_profiles_telegram_chat ON profiles(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;`

---

### Table 2: `wallets`
Stores financial accounts (Cash, Bank, E-Wallet) per user.

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Unique wallet identifier |
| `user_id` | `UUID` | `NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE` | - | Owner user UUID |
| `name` | `TEXT` | `NOT NULL` | - | Wallet name (e.g. 'Tunai', 'BCA', 'GoPay') |
| `type` | `TEXT` | `NOT NULL, CHECK (type IN ('cash', 'bank', 'ewallet'))` | `'cash'` | Account type classification |
| `balance` | `NUMERIC(15, 2)`| `NOT NULL` | `0.00` | Current balance in Rupiah |
| `is_default` | `BOOLEAN` | `NOT NULL` | `false` | Default wallet for bot input |
| `currency` | `TEXT` | `NOT NULL` | `'IDR'` | Currency code |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Record created at |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Record updated at |

**Indexes & Rules**:
- `CREATE INDEX idx_wallets_user_id ON wallets(user_id);`
- Unique constraint / partial index: Exactly one default wallet per user is enforced either via index or trigger:
  `CREATE UNIQUE INDEX idx_wallets_one_default_per_user ON wallets(user_id) WHERE is_default = true;`

---

### Table 3: `categories`
Stores expense and income categories, supporting both system presets and user custom additions.

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Unique category UUID |
| `user_id` | `UUID` | `NULL, REFERENCES profiles(id) ON DELETE CASCADE` | `NULL` | Owner user ID (NULL for system templates) |
| `name` | `TEXT` | `NOT NULL` | - | Category label (e.g. 'Makanan & Minuman') |
| `emoji` | `TEXT` | `NOT NULL` | `'🏷️'` | Visual icon emoji |
| `color` | `TEXT` | `NOT NULL` | `'#F97316'` | Hex color code |
| `type` | `TEXT` | `NOT NULL, CHECK (type IN ('income', 'expense'))` | `'expense'` | Category type |
| `is_system` | `BOOLEAN` | `NOT NULL` | `false` | System-wide template category flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Record created at |

**Indexes**:
- `CREATE INDEX idx_categories_user_type ON categories(user_id, type);`
- `CREATE INDEX idx_categories_system ON categories(is_system) WHERE is_system = true;`

---

### Table 4: `transactions`
Core ledger recording financial events (Income, Expense, Transfer) across all input channels.

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Transaction identifier |
| `user_id` | `UUID` | `NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE` | - | Owner user UUID |
| `wallet_id` | `UUID` | `NOT NULL, REFERENCES wallets(id) ON DELETE RESTRICT` | - | Source wallet UUID |
| `category_id` | `UUID` | `NULL, REFERENCES categories(id) ON DELETE SET NULL` | `NULL` | Assigned category UUID |
| `type` | `TEXT` | `NOT NULL, CHECK (type IN ('income', 'expense', 'transfer'))`| - | Transaction nature |
| `amount` | `NUMERIC(15, 2)`| `NOT NULL, CHECK (amount > 0)` | - | Transaction value |
| `date` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Transaction occurrence time (WIB stored as UTC) |
| `notes` | `TEXT` | `NULL` | `NULL` | Description notes |
| `raw_input` | `TEXT` | `NULL` | `NULL` | Original chat/voice/form raw text |
| `input_type` | `TEXT` | `NOT NULL, CHECK (input_type IN ('text', 'receipt', 'voice', 'manual'))`| `'manual'`| Input channel origin |
| `receipt_image_url` | `TEXT` | `NULL` | `NULL` | Signed/public URL to receipt image in Storage |
| `voice_transcript` | `TEXT` | `NULL` | `NULL` | STT transcription result |
| `destination_wallet_id`| `UUID` | `NULL, REFERENCES wallets(id) ON DELETE RESTRICT` | `NULL` | Destination wallet for transfer |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Record update timestamp |

**Check Constraints**:
- `CHECK ((type = 'transfer' AND destination_wallet_id IS NOT NULL AND destination_wallet_id <> wallet_id) OR (type <> 'transfer' AND destination_wallet_id IS NULL))`

**Indexes**:
- `CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);`
- `CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);`
- `CREATE INDEX idx_transactions_category ON transactions(category_id);`

---

### Table 5: `transaction_items`
Breakdown items for receipt OCR scans (e.g. Indomaret receipt with multiple items).

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Item identifier |
| `transaction_id`| `UUID` | `NOT NULL, REFERENCES transactions(id) ON DELETE CASCADE` | - | Parent transaction UUID |
| `name` | `TEXT` | `NOT NULL` | - | Item description / name |
| `amount` | `NUMERIC(15, 2)`| `NOT NULL, CHECK (amount >= 0)` | - | Subtotal for this line item |
| `category_id` | `UUID` | `NULL, REFERENCES categories(id) ON DELETE SET NULL` | `NULL` | Granular item category |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Creation timestamp |

**Indexes**:
- `CREATE INDEX idx_transaction_items_tx_id ON transaction_items(transaction_id);`

---

### Table 6: `budgets`
Monthly budgeting limits per category with proactive alert flags.

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Budget record UUID |
| `user_id` | `UUID` | `NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE` | - | Owner user UUID |
| `category_id` | `UUID` | `NOT NULL, REFERENCES categories(id) ON DELETE CASCADE` | - | Budgeted expense category |
| `month` | `INTEGER` | `NOT NULL, CHECK (month BETWEEN 1 AND 12)` | - | Calendar month (1-12) |
| `year` | `INTEGER` | `NOT NULL, CHECK (year >= 2020)` | - | Calendar year (e.g. 2026) |
| `amount` | `NUMERIC(15, 2)`| `NOT NULL, CHECK (amount > 0)` | - | Allocated budget threshold |
| `alert_80_sent` | `BOOLEAN` | `NOT NULL` | `false` | True when 80% warning has been notified |
| `alert_100_sent`| `BOOLEAN` | `NOT NULL` | `false` | True when 100% warning has been notified |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Update timestamp |

**Unique Constraint**:
- `CREATE UNIQUE INDEX idx_budgets_unique_period ON budgets(user_id, category_id, month, year);`

---

### Table 7: `export_history`
Tracks user-generated PDF and Excel reports stored in Supabase Storage.

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Export job identifier |
| `user_id` | `UUID` | `NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE` | - | Requester user UUID |
| `file_name` | `TEXT` | `NOT NULL` | - | Storage path / file name |
| `file_url` | `TEXT` | `NOT NULL` | - | Storage object key or signed URL |
| `file_type` | `TEXT` | `NOT NULL, CHECK (file_type IN ('pdf', 'xlsx'))` | - | Export format |
| `period` | `TEXT` | `NOT NULL` | - | Label period (e.g. 'Oktober 2026') |
| `status` | `TEXT` | `NOT NULL, CHECK (status IN ('completed', 'processing', 'failed'))`| `'processing'`| Job state |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Job request time |

**Indexes**:
- `CREATE INDEX idx_export_history_user ON export_history(user_id, created_at DESC);`

---

### Table 8: `ai_providers`
Superadmin configuration for LLM provider routing and failover.

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Provider config UUID |
| `provider_name` | `TEXT` | `NOT NULL, CHECK (provider_name IN ('gemini', 'openai', 'deepseek'))`| - | AI Vendor name |
| `api_key_encrypted`| `TEXT` | `NOT NULL` | - | Encrypted API key / vault key |
| `is_active` | `BOOLEAN` | `NOT NULL` | `true` | Operational status toggle |
| `priority` | `INTEGER` | `NOT NULL` | `1` | Routing sequence priority |
| `mode` | `TEXT` | `NOT NULL, CHECK (mode IN ('single', 'failover'))` | `'failover'` | Routing execution mode |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Record created at |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Record updated at |

**Unique Constraint**:
- `CREATE UNIQUE INDEX idx_ai_providers_name ON ai_providers(provider_name);`

---

### Table 9: `ai_logs`
Operational telemetry, token consumption, latency, and error auditing for all AI requests.

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Log entry UUID |
| `user_id` | `UUID` | `NULL, REFERENCES profiles(id) ON DELETE SET NULL` | `NULL` | User who invoked AI |
| `provider_name` | `TEXT` | `NOT NULL` | - | Provider used (gemini, openai, deepseek) |
| `model` | `TEXT` | `NOT NULL` | - | Exact model ID (e.g. gemini-1.5-flash) |
| `prompt_tokens` | `INTEGER` | `NOT NULL` | `0` | Prompt token count |
| `completion_tokens`| `INTEGER`| `NOT NULL` | `0` | Completion token count |
| `latency_ms` | `INTEGER` | `NOT NULL` | `0` | Duration in milliseconds |
| `purpose` | `TEXT` | `NOT NULL, CHECK (purpose IN ('text_parse', 'receipt_ocr', 'voice_stt', 'advisor', 'onboarding'))`| - | AI task intent |
| `status` | `TEXT` | `NOT NULL, CHECK (status IN ('success', 'error'))` | `'success'` | Execution outcome |
| `error_message` | `TEXT` | `NULL` | `NULL` | Error stack / explanation |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Log entry timestamp |

**Indexes**:
- `CREATE INDEX idx_ai_logs_created_at ON ai_logs(created_at DESC);`
- `CREATE INDEX idx_ai_logs_user_id ON ai_logs(user_id);`
- `CREATE INDEX idx_ai_logs_status ON ai_logs(status) WHERE status = 'error';`

---

### Table 10: `subscriptions`
User tier subscription state (Starter vs Pro) and Midtrans payment tracking.

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Subscription record UUID |
| `user_id` | `UUID` | `NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE` | - | Subscriber user UUID |
| `plan` | `TEXT` | `NOT NULL, CHECK (plan IN ('starter', 'pro'))` | `'starter'` | Entitlement tier |
| `status` | `TEXT` | `NOT NULL, CHECK (status IN ('active', 'expired', 'pending'))`| `'active'` | Subscription lifecycle state |
| `midtrans_order_id`| `TEXT` | `UNIQUE, NULL` | `NULL` | Midtrans unique order ID |
| `midtrans_payment_type`|`TEXT`| `NULL` | `NULL` | e.g. 'qris', 'bank_transfer', 'gopay' |
| `midtrans_status`| `TEXT` | `NULL` | `NULL` | settlement / pending / expire / cancel |
| `starts_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Subscription commencement |
| `expires_at` | `TIMESTAMPTZ` | `NULL` | `NULL` | Expiration (NULL for Pro lifetime) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Created at |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Updated at |

**Indexes**:
- `CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);`
- `CREATE INDEX idx_subscriptions_midtrans_order ON subscriptions(midtrans_order_id) WHERE midtrans_order_id IS NOT NULL;`

---

### Table 11: `admin_audit_logs`
Immutable compliance and security audit log recording administrative actions (such as Transaction Inspector reads).

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Audit record UUID |
| `admin_user_id` | `UUID` | `NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE` | - | Admin performing action |
| `action` | `TEXT` | `NOT NULL` | - | Action name (e.g. 'inspect_transactions') |
| `target_user_id`| `UUID` | `NULL, REFERENCES profiles(id) ON DELETE SET NULL` | `NULL` | Target affected user |
| `target_resource`| `TEXT` | `NOT NULL` | - | Target table/entity |
| `details` | `JSONB` | `NOT NULL` | `'{}'::jsonb` | Contextual payload / filters used |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Action timestamp |

**Indexes**:
- `CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);`
- `CREATE INDEX idx_admin_audit_logs_admin_user ON admin_audit_logs(admin_user_id);`

---

### Table 12: `telegram_processed_updates`
Idempotency table preventing duplicate processing of Telegram webhook updates (AC-2).

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `update_id` | `BIGINT` | `PRIMARY KEY` | - | Telegram numeric update_id |
| `processed_at` | `TIMESTAMPTZ` | `NOT NULL` | `timezone('utc', now())` | Timestamp update was committed |

**Indexes**:
- Primary key automatically indexes `update_id`. A cleanup index or retention policy can prune updates older than 7 days:
  `CREATE INDEX idx_telegram_processed_at ON telegram_processed_updates(processed_at);`

---

## 3. Database Triggers & Automated Functions

To guarantee business integrity and zero-lag user onboarding, four automated PostgreSQL functions and triggers are required:

### 3.1 Trigger 1: `on_auth_user_created` (User Auto-Provisioning)
When a user signs up via Supabase Auth (Email, Google OAuth, or Phone OTP), this trigger automatically:
1. Inserts the profile in `profiles`.
2. Creates the default wallet: `Tunai` (type `cash`, balance `0.00`, `is_default = true`).
3. Seeds standard Indonesian financial categories (both income and expense).
4. Creates the default `starter` subscription in `subscriptions`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_profile_id UUID;
  default_wallet_id UUID;
BEGIN
  -- 1. Create Profile
  INSERT INTO public.profiles (
    id,
    email,
    phone_number,
    full_name,
    avatar_url,
    role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user'
  ) RETURNING id INTO new_profile_id;

  -- 2. Create Default Wallet: Tunai (Cash)
  INSERT INTO public.wallets (
    user_id,
    name,
    type,
    balance,
    is_default,
    currency
  ) VALUES (
    new_profile_id,
    'Tunai',
    'cash',
    0.00,
    true,
    'IDR'
  ) RETURNING id INTO default_wallet_id;

  -- 3. Seed Default Indonesian Categories (Expenses & Incomes)
  INSERT INTO public.categories (user_id, name, emoji, color, type, is_system) VALUES
    (new_profile_id, 'Makanan & Minuman', '🍔', '#EF4444', 'expense', false),
    (new_profile_id, 'Transportasi',      '🚗', '#F59E0B', 'expense', false),
    (new_profile_id, 'Belanja',           '🛍️', '#EC4899', 'expense', false),
    (new_profile_id, 'Tagihan & Utilitas','💡', '#3B82F6', 'expense', false),
    (new_profile_id, 'Hiburan',           '🎬', '#8B5CF6', 'expense', false),
    (new_profile_id, 'Kesehatan',         '💊', '#10B981', 'expense', false),
    (new_profile_id, 'Pendidikan',        '📚', '#06B6D4', 'expense', false),
    (new_profile_id, 'Lain-lain',         '📦', '#6B7280', 'expense', false),
    (new_profile_id, 'Gaji',              '💰', '#10B981', 'income',  false),
    (new_profile_id, 'Freelance / Usaha', '💼', '#3B82F6', 'income',  false),
    (new_profile_id, 'Investasi',         '📈', '#8B5CF6', 'income',  false),
    (new_profile_id, 'Bonus & Hadiah',    '🎁', '#F59E0B', 'income',  false),
    (new_profile_id, 'Pemasukan Lain',    '💵', '#6B7280', 'income',  false);

  -- 4. Create Initial Starter Subscription
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    status,
    starts_at
  ) VALUES (
    new_profile_id,
    'starter',
    'active',
    timezone('utc', now())
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### 3.2 Trigger 2: `update_wallet_balance_on_transaction` (Ledger Balance Reconciliation)
Maintains real-time ledger consistency on `wallets.balance` across INSERT, UPDATE, and DELETE actions on `transactions`:

- **Income**: Adds amount to source wallet.
- **Expense**: Deducts amount from source wallet.
- **Transfer**: Deducts amount from source wallet, adds amount to destination wallet.

```sql
CREATE OR REPLACE FUNCTION public.handle_wallet_balance_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle DELETE or OLD record in UPDATE
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    IF OLD.type = 'expense' THEN
      UPDATE public.wallets
      SET balance = balance + OLD.amount, updated_at = timezone('utc', now())
      WHERE id = OLD.wallet_id;
    ELSIF OLD.type = 'income' THEN
      UPDATE public.wallets
      SET balance = balance - OLD.amount, updated_at = timezone('utc', now())
      WHERE id = OLD.wallet_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE public.wallets
      SET balance = balance + OLD.amount, updated_at = timezone('utc', now())
      WHERE id = OLD.wallet_id;
      
      IF OLD.destination_wallet_id IS NOT NULL THEN
        UPDATE public.wallets
        SET balance = balance - OLD.amount, updated_at = timezone('utc', now())
        WHERE id = OLD.destination_wallet_id;
      END IF;
    END IF;
  END IF;

  -- Handle INSERT or NEW record in UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.type = 'expense' THEN
      UPDATE public.wallets
      SET balance = balance - NEW.amount, updated_at = timezone('utc', now())
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'income' THEN
      UPDATE public.wallets
      SET balance = balance + NEW.amount, updated_at = timezone('utc', now())
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE public.wallets
      SET balance = balance - NEW.amount, updated_at = timezone('utc', now())
      WHERE id = NEW.wallet_id;
      
      IF NEW.destination_wallet_id IS NOT NULL THEN
        UPDATE public.wallets
        SET balance = balance + NEW.amount, updated_at = timezone('utc', now())
        WHERE id = NEW.destination_wallet_id;
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_wallet_balance_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_wallet_balance_change();
```

---

### 3.3 Trigger 3: `handle_single_default_wallet` (Single Default Wallet Invariant)
Ensures that setting a wallet as `is_default = true` automatically unsets `is_default` on all other wallets owned by the same user:

```sql
CREATE OR REPLACE FUNCTION public.handle_single_default_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.wallets
    SET is_default = false
    WHERE user_id = NEW.user_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_single_default_wallet
  BEFORE INSERT OR UPDATE OF is_default ON public.wallets
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.handle_single_default_wallet();
```

---

### 3.4 Trigger 4: `set_updated_at` (Automated Timestamp Refresh)
Generic trigger updating `updated_at = timezone('utc', now())` on record updates:

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_ai_providers_updated_at BEFORE UPDATE ON public.ai_providers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

---

## 4. Row-Level Security (RLS) Specification

All 12 tables have `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;` activated.

### 4.1 RBAC Helper Function: `is_admin()`
To avoid recursive RLS checks on the `profiles` table, a dedicated security definer function is created:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
```

---

### 4.2 Comprehensive RLS Policy Matrix

| Table | Policy Name | Command | Expression (`USING` / `WITH CHECK`) | Access Grant |
|---|---|---|---|---|
| **profiles** | `Users can read own profile` | `SELECT` | `auth.uid() = id` | Authenticated user |
| | `Admins can read all profiles` | `SELECT` | `is_admin()` | Superadmin |
| | `Users can update own profile` | `UPDATE` | `auth.uid() = id` (cannot change role without admin) | Authenticated user |
| | `Admins can update any profile` | `UPDATE` | `is_admin()` | Superadmin |
| **wallets** | `Users manage own wallets` | `ALL` | `auth.uid() = user_id` | Authenticated user |
| | `Admins view all wallets` | `SELECT` | `is_admin()` | Superadmin |
| **categories** | `Users read system or own categories`| `SELECT` | `is_system = true OR auth.uid() = user_id` | Authenticated user |
| | `Users insert/update own categories` | `INSERT, UPDATE, DELETE` | `auth.uid() = user_id AND is_system = false` | Authenticated user |
| | `Admins manage all categories` | `ALL` | `is_admin()` | Superadmin |
| **transactions** | `Users manage own transactions` | `ALL` | `auth.uid() = user_id` | Authenticated user |
| | `Admins read transactions (Audited)` | `SELECT` | `is_admin()` | Superadmin |
| **transaction_items** | `Users manage items of their tx` | `ALL` | `EXISTS (SELECT 1 FROM transactions WHERE transactions.id = transaction_items.transaction_id AND transactions.user_id = auth.uid())` | Authenticated user |
| | `Admins read transaction items` | `SELECT` | `is_admin()` | Superadmin |
| **budgets** | `Users manage own budgets` | `ALL` | `auth.uid() = user_id` | Authenticated user |
| | `Admins read all budgets` | `SELECT` | `is_admin()` | Superadmin |
| **export_history** | `Users manage own export history` | `ALL` | `auth.uid() = user_id` | Authenticated user |
| | `Admins read all export history` | `SELECT` | `is_admin()` | Superadmin |
| **ai_providers** | `Admins manage ai providers` | `ALL` | `is_admin()` | Superadmin |
| **ai_logs** | `Admins read all ai logs` | `SELECT` | `is_admin()` | Superadmin |
| | `Users read own ai logs` | `SELECT` | `auth.uid() = user_id` | Authenticated user |
| | `Service role insert logs` | `INSERT` | `true` (via Service Role) | Backend |
| **subscriptions** | `Users read own subscription` | `SELECT` | `auth.uid() = user_id` | Authenticated user |
| | `Admins manage all subscriptions` | `ALL` | `is_admin()` | Superadmin |
| **admin_audit_logs** | `Admins read audit logs` | `SELECT` | `is_admin()` | Superadmin |
| | `Admins insert audit logs` | `INSERT` | `is_admin() AND auth.uid() = admin_user_id` | Superadmin |
| **telegram_processed_updates** | `Service role only` | `ALL` | `false` (bypassed only by Service Role) | Webhook Service |

*Note*: The Telegram Bot Webhook (`/api/telegram/webhook`), Midtrans Webhook (`/api/midtrans/webhook`), and cron tasks use the Supabase Service Role client (`SUPABASE_SERVICE_ROLE_KEY`), which inherently bypasses RLS while maintaining strict isolation for direct user client queries.

---

## 5. Supabase Realtime & Storage Architecture

### 5.1 Realtime Publication Setup

To fulfill R3 line 65 (*"Supabase Realtime integrasi agar data sinkron seketika saat ada input dari Telegram"*), the following tables must be published to `supabase_realtime`:

```sql
-- Enable Realtime publication for reactive client UI
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
```

**Client Realtime Hook Implementation**:
```typescript
// src/hooks/use-realtime-transactions.ts
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeTransactions(userId: string) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`realtime-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Instantly refresh Server Component data
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, router, supabase])
}
```

---

### 5.2 Storage Buckets & Policies

Two dedicated storage buckets are required:

1. **`tatadana-exports` (Private Bucket)**:
   - Stores on-demand generated `.pdf` and `.xlsx` reports.
   - Files are stored using prefix paths: `{user_id}/{filename}`.
   - Access is strictly governed via **Signed URLs** (`createSignedUrl`, e.g. 3600 seconds TTL).

2. **`receipt-images` (Private Bucket)**:
   - Stores user-uploaded receipt scans from Telegram Bot and Web Dashboard.
   - Files stored using prefix paths: `{user_id}/{uuid}.jpg`.

**Storage RLS Migration Script**:
```sql
-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('tatadana-exports', 'tatadana-exports', false, 10485760, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('receipt-images', 'receipt-images', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies for tatadana-exports
CREATE POLICY "Users can upload their own exports"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'tatadana-exports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can download their own exports"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'tatadana-exports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Storage RLS Policies for receipt-images
CREATE POLICY "Users can upload their own receipt images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'receipt-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can download their own receipt images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'receipt-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 6. Timezone Handling: Asia/Jakarta (WIB)

All database timestamps are stored in UTC `timestamptz`. For Indonesian financial reporting:
- Day starts at `00:00:00 WIB` (UTC `17:00:00` previous day).
- Monthly budgets align with calendar months in `Asia/Jakarta`.
- When calculating monthly totals for Starter limit checks (max 50 tx/month) or budget calculations, queries must cast to WIB:
  ```sql
  -- Example monthly transaction count in WIB
  SELECT count(*) 
  FROM public.transactions 
  WHERE user_id = $1 
    AND timezone('Asia/Jakarta', date) >= date_trunc('month', timezone('Asia/Jakarta', now()))
    AND timezone('Asia/Jakarta', date) < date_trunc('month', timezone('Asia/Jakarta', now())) + interval '1 month';
  ```

---

## 7. Dependencies & Package Catalog (`package.json`)

To support Next.js 14/15, Supabase SSR, Lucide icons, Radix UI, AI multi-providers, Telegram, Midtrans, and Exports, the following dependencies are specified:

```json
{
  "name": "tatadana",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "bot:dev": "tsx scripts/bot-dev.ts",
    "db:types": "supabase gen types typescript --project-id local > src/types/database.types.ts"
  },
  "dependencies": {
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.45.6",
    "@supabase/ssr": "^0.5.1",
    "@google/genai": "^0.1.1",
    "openai": "^4.68.4",
    "midtrans-client": "^1.3.1",
    "jspdf": "^2.5.2",
    "jspdf-autotable": "^3.8.3",
    "xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz",
    "lucide-react": "^0.453.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8",
    "date-fns": "^4.1.0",
    "date-fns-tz": "^3.2.0",
    "sonner": "^1.5.0"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "@types/node": "^22.7.7",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "tsx": "^4.19.1",
    "eslint": "^8.57.1",
    "eslint-config-next": "14.2.15"
  }
}
```

---

## 8. Migration Blueprint: `001_initial_schema.sql`

The complete, cleanly executable SQL migration script incorporates all 12 tables, constraints, trigger functions, RLS policies, and storage configs:

```sql
-- ==============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Complete TataDana R1 Database Schema with RLS, Triggers & Storage
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Enumerated Helper Types (or use CHECK constraints)
-- Check constraints are used throughout for native Supabase UI compatibility.

-- 3. Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone_number TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  telegram_user_id BIGINT UNIQUE,
  telegram_chat_id BIGINT UNIQUE,
  telegram_connected_at TIMESTAMPTZ,
  daily_reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_time_1 TIME NOT NULL DEFAULT '12:00:00',
  reminder_time_2 TIME NOT NULL DEFAULT '20:00:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. Table: wallets
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'cash' CHECK (type IN ('cash', 'bank', 'ewallet')),
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  is_default BOOLEAN NOT NULL DEFAULT false,
  currency TEXT NOT NULL DEFAULT 'IDR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Table: categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🏷️',
  color TEXT NOT NULL DEFAULT '#F97316',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. Table: transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  notes TEXT,
  raw_input TEXT,
  input_type TEXT NOT NULL DEFAULT 'manual' CHECK (input_type IN ('text', 'receipt', 'voice', 'manual')),
  receipt_image_url TEXT,
  voice_transcript TEXT,
  destination_wallet_id UUID REFERENCES public.wallets(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_tx_transfer_destination CHECK (
    (type = 'transfer' AND destination_wallet_id IS NOT NULL AND destination_wallet_id <> wallet_id) OR
    (type <> 'transfer' AND destination_wallet_id IS NULL)
  )
);

-- 7. Table: transaction_items
CREATE TABLE IF NOT EXISTS public.transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 8. Table: budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  alert_80_sent BOOLEAN NOT NULL DEFAULT false,
  alert_100_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_budgets_user_cat_month_year UNIQUE (user_id, category_id, month, year)
);

-- 9. Table: export_history
CREATE TABLE IF NOT EXISTS public.export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'xlsx')),
  period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('completed', 'processing', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. Table: ai_providers
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL UNIQUE CHECK (provider_name IN ('gemini', 'openai', 'deepseek')),
  api_key_encrypted TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  mode TEXT NOT NULL DEFAULT 'failover' CHECK (mode IN ('single', 'failover')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. Table: ai_logs
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  provider_name TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  purpose TEXT NOT NULL CHECK (purpose IN ('text_parse', 'receipt_ocr', 'voice_stt', 'advisor', 'onboarding')),
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. Table: subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
  midtrans_order_id TEXT UNIQUE,
  midtrans_payment_type TEXT,
  midtrans_status TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 13. Table: admin_audit_logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_resource TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 14. Table: telegram_processed_updates
CREATE TABLE IF NOT EXISTS public.telegram_processed_updates (
  update_id BIGINT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 15. Indexes for Performance
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat ON public.profiles(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_tx_items_transaction ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, month, year);
CREATE INDEX IF NOT EXISTS idx_export_history_user ON public.export_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON public.ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON public.ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON public.admin_audit_logs(created_at DESC);

-- ==============================================================================
-- 16. Security Definer Helper: is_admin()
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ==============================================================================
-- 17. Row-Level Security Activation & Policies
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_processed_updates ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin());

-- Wallets Policies
CREATE POLICY "wallets_user_all" ON public.wallets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wallets_admin_select" ON public.wallets FOR SELECT TO authenticated
  USING (public.is_admin());

-- Categories Policies
CREATE POLICY "categories_select" ON public.categories FOR SELECT TO authenticated
  USING (is_system = true OR auth.uid() = user_id OR public.is_admin());
CREATE POLICY "categories_user_mutate" ON public.categories FOR ALL TO authenticated
  USING (auth.uid() = user_id AND is_system = false)
  WITH CHECK (auth.uid() = user_id AND is_system = false);
CREATE POLICY "categories_admin_all" ON public.categories FOR ALL TO authenticated
  USING (public.is_admin());

-- Transactions Policies
CREATE POLICY "transactions_user_all" ON public.transactions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_admin_select" ON public.transactions FOR SELECT TO authenticated
  USING (public.is_admin());

-- Transaction Items Policies
CREATE POLICY "tx_items_user_all" ON public.transaction_items FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.transactions
    WHERE transactions.id = transaction_items.transaction_id AND transactions.user_id = auth.uid()
  ));
CREATE POLICY "tx_items_admin_select" ON public.transaction_items FOR SELECT TO authenticated
  USING (public.is_admin());

-- Budgets Policies
CREATE POLICY "budgets_user_all" ON public.budgets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budgets_admin_select" ON public.budgets FOR SELECT TO authenticated
  USING (public.is_admin());

-- Export History Policies
CREATE POLICY "export_history_user_all" ON public.export_history FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "export_history_admin_select" ON public.export_history FOR SELECT TO authenticated
  USING (public.is_admin());

-- AI Providers Policies (Superadmin only)
CREATE POLICY "ai_providers_admin_all" ON public.ai_providers FOR ALL TO authenticated
  USING (public.is_admin());

-- AI Logs Policies
CREATE POLICY "ai_logs_user_select" ON public.ai_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "ai_logs_admin_all" ON public.ai_logs FOR ALL TO authenticated
  USING (public.is_admin());

-- Subscriptions Policies
CREATE POLICY "subscriptions_user_select" ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_admin_all" ON public.subscriptions FOR ALL TO authenticated
  USING (public.is_admin());

-- Admin Audit Logs Policies
CREATE POLICY "audit_logs_admin_select" ON public.admin_audit_logs FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "audit_logs_admin_insert" ON public.admin_audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND auth.uid() = admin_user_id);

-- Telegram processed updates (Service Role only, no policies grant authenticated user direct access)
-- Service Role bypasses RLS automatically.

-- ==============================================================================
-- 18. Functions & Triggers
-- ==============================================================================

-- 18.1 Timestamp Updater
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_ai_providers_updated_at BEFORE UPDATE ON public.ai_providers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 18.2 Single Default Wallet Enforcement
CREATE OR REPLACE FUNCTION public.handle_single_default_wallet()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.wallets
    SET is_default = false
    WHERE user_id = NEW.user_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_single_default_wallet
  BEFORE INSERT OR UPDATE OF is_default ON public.wallets
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.handle_single_default_wallet();

-- 18.3 Wallet Balance Ledger Reconciliation
CREATE OR REPLACE FUNCTION public.handle_wallet_balance_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    IF OLD.type = 'expense' THEN
      UPDATE public.wallets SET balance = balance + OLD.amount, updated_at = timezone('utc', now()) WHERE id = OLD.wallet_id;
    ELSIF OLD.type = 'income' THEN
      UPDATE public.wallets SET balance = balance - OLD.amount, updated_at = timezone('utc', now()) WHERE id = OLD.wallet_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE public.wallets SET balance = balance + OLD.amount, updated_at = timezone('utc', now()) WHERE id = OLD.wallet_id;
      IF OLD.destination_wallet_id IS NOT NULL THEN
        UPDATE public.wallets SET balance = balance - OLD.amount, updated_at = timezone('utc', now()) WHERE id = OLD.destination_wallet_id;
      END IF;
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.type = 'expense' THEN
      UPDATE public.wallets SET balance = balance - NEW.amount, updated_at = timezone('utc', now()) WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'income' THEN
      UPDATE public.wallets SET balance = balance + NEW.amount, updated_at = timezone('utc', now()) WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE public.wallets SET balance = balance - NEW.amount, updated_at = timezone('utc', now()) WHERE id = NEW.wallet_id;
      IF NEW.destination_wallet_id IS NOT NULL THEN
        UPDATE public.wallets SET balance = balance + NEW.amount, updated_at = timezone('utc', now()) WHERE id = NEW.destination_wallet_id;
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_wallet_balance_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_wallet_balance_change();

-- 18.4 New User Registration Auto-Setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_profile_id UUID;
  default_wallet_id UUID;
BEGIN
  INSERT INTO public.profiles (
    id, email, phone_number, full_name, avatar_url, role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user'
  ) RETURNING id INTO new_profile_id;

  INSERT INTO public.wallets (
    user_id, name, type, balance, is_default, currency
  ) VALUES (
    new_profile_id, 'Tunai', 'cash', 0.00, true, 'IDR'
  ) RETURNING id INTO default_wallet_id;

  INSERT INTO public.categories (user_id, name, emoji, color, type, is_system) VALUES
    (new_profile_id, 'Makanan & Minuman', '🍔', '#EF4444', 'expense', false),
    (new_profile_id, 'Transportasi',      '🚗', '#F59E0B', 'expense', false),
    (new_profile_id, 'Belanja',           '🛍️', '#EC4899', 'expense', false),
    (new_profile_id, 'Tagihan & Utilitas','💡', '#3B82F6', 'expense', false),
    (new_profile_id, 'Hiburan',           '🎬', '#8B5CF6', 'expense', false),
    (new_profile_id, 'Kesehatan',         '💊', '#10B981', 'expense', false),
    (new_profile_id, 'Pendidikan',        '📚', '#06B6D4', 'expense', false),
    (new_profile_id, 'Lain-lain',         '📦', '#6B7280', 'expense', false),
    (new_profile_id, 'Gaji',              '💰', '#10B981', 'income',  false),
    (new_profile_id, 'Freelance / Usaha', '💼', '#3B82F6', 'income',  false),
    (new_profile_id, 'Investasi',         '📈', '#8B5CF6', 'income',  false),
    (new_profile_id, 'Bonus & Hadiah',    '🎁', '#F59E0B', 'income',  false),
    (new_profile_id, 'Pemasukan Lain',    '💵', '#6B7280', 'income',  false);

  INSERT INTO public.subscriptions (
    user_id, plan, status, starts_at
  ) VALUES (
    new_profile_id, 'starter', 'active', timezone('utc', now())
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 19. Realtime Publication
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
```

---

## 9. Next Steps & Recommendations for Implementation Track

1. **Migration Execution**:
   Place the full DDL script directly at `supabase/migrations/001_initial_schema.sql`. In local Supabase development, execute via `supabase db reset` or `supabase migration up`.
2. **Environment Configuration**:
   Provide `.env.example` defining:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_WEBHOOK_SECRET`
   - `MIDTRANS_SERVER_KEY`
   - `MIDTRANS_CLIENT_KEY`
   - `GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`
3. **Database Types Generation**:
   Run `npm run db:types` once local Supabase has executed `001_initial_schema.sql` to generate strictly typed interfaces at `src/types/database.types.ts`.
