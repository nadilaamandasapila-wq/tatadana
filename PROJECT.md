# Project: TataDana Fintech SaaS with Telegram Bot Integration

## Architecture
TataDana is an Indonesian Fintech SaaS monorepo built on Next.js 14/15 App Router (TypeScript, Tailwind CSS, Lucide React, Radix UI/shadcn) integrated with Supabase PostgreSQL (Auth, Storage, Realtime), Multi-Provider AI (Gemini Flash default, OpenAI GPT-4o-mini & Whisper failover, DeepSeek V3 text failover), Telegram Bot (hybrid webhook + dev long-polling runner), Midtrans Snap payment gateway, and an On-Demand Export Engine (PDF & Excel).

### Data Flow
1. **User / Telegram Ingestion**: Telegram user sends text, receipt photo, or voice note. Webhook `/api/telegram/webhook` records `update_id` in `telegram_processed_updates` (atomic idempotency).
2. **AI Processing**: Service parses Indonesian slang amounts or transcribes audio/OCR receipts into structured transactions, checking user subscription plan limits (Starter: 50 tx/mo, no OCR/advisor; Pro: unlimited).
3. **Ledger & Realtime Persistence**: Supabase PostgreSQL triggers enforce balance updates and auto-provisioning. Changes publish via Supabase Realtime to the Next.js web application.
4. **Web Portal & Dashboards**: Authenticated users access 6 dashboard views in a premium orange-white (#F97316) theme. Administrators access a role-guarded portal (`/admin`) for AI providers, users, audits, and payment approvals.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Monorepo Setup & Tooling | Next.js 14/15 App Router, TypeScript, Tailwind CSS, Lucide React, package.json | M1 | ORIGINAL_REQUEST §16-17 |
| F02 | Supabase Client Triad & Types | Browser client, server client (cookies), admin service role client, TypeScript DB schema | M1 | ORIGINAL_REQUEST §18 |
| F03 | Database Schema (12 Tables) | profiles, wallets, categories, transactions, transaction_items, budgets, export_history, ai_providers, ai_logs, subscriptions, admin_audit_logs, telegram_processed_updates | M1 | ORIGINAL_REQUEST §R1 |
| F04 | Automated Database Triggers | handle_new_user, handle_wallet_balance_change, handle_single_default_wallet, handle_updated_at | M1 | ORIGINAL_REQUEST §R1, AC-1 |
| F05 | Row-Level Security Policies | User isolation RLS on all tables, is_admin() security definer, service-role webhook access | M1 | ORIGINAL_REQUEST §R1 |
| F06 | Supabase Realtime Publication | Publication on transactions, wallets, budgets for instant browser sync | M1 | ORIGINAL_REQUEST §18, R3 |
| F07 | Supabase Storage Buckets | Private bucket tatadana-exports and receipt-images with access policies | M1 | ORIGINAL_REQUEST §18 |
| F08 | AI Multi-Provider Service | Gemini Flash 1.5/2.0 default, OpenAI GPT-4o-mini & Whisper failover, DeepSeek V3 text failover | M2 | ORIGINAL_REQUEST §19, R4 |
| F09 | AI Telemetry & Observability | Telemetry logger writing tokens, latency, cost estimate to ai_logs | M2 | ORIGINAL_REQUEST §R1, R4 |
| F10 | Indonesian Slang NLP Parser | Regex normalization + LLM structured output parsing 15rb, 1.5jt, 500k, ceban, gocap | M2 | ORIGINAL_REQUEST §R2, AC-3 |
| F11 | Multimodal Vision OCR Receipt Parser | Extract merchant, date, items, amounts into parent transaction + transaction_items | M2 | ORIGINAL_REQUEST §R2 |
| F12 | Voice Note STT Pipeline | Transcription of audio <= 60s via Gemini/Whisper, formatted with 🎙️ Transkrip: "[hasil]" | M2 | ORIGINAL_REQUEST §R2 |
| F13 | Proactive AI Financial Advisor | Expense spike (>50%) & income threshold warnings for Pro subscribers | M2 | ORIGINAL_REQUEST §R2 |
| F14 | On-Demand PDF Report Generator | Styled PDF export using pdfkit with Indonesian currency formatting & WIB timestamps | M2 | ORIGINAL_REQUEST §22, R3, AC-4 |
| F15 | On-Demand Excel Report Generator | Formatted Excel .xlsx export using xlsx with transactions ledger & summary | M2 | ORIGINAL_REQUEST §22, R3, AC-4 |
| F16 | Storage Signed URL Persistence | Secure storage in tatadana-exports bucket with 60-min signed URLs and export_history record | M2 | ORIGINAL_REQUEST §22, R3, AC-4 |
| F17 | Telegram Bot Webhook Endpoint | /api/telegram/webhook with secret token validation and 200 OK contract | M3 | ORIGINAL_REQUEST §20, R2, AC-2 |
| F18 | Webhook Atomic Idempotency | telegram_processed_updates update_id deduplication via ON CONFLICT DO NOTHING | M3 | ORIGINAL_REQUEST §20, R2, AC-2 |
| F19 | Telegram Bot API Wrapper | getMe, setWebhook, sendMessage, sendPhoto with HTML parsing mode | M3 | ORIGINAL_REQUEST §R2, AC-5 |
| F20 | Telegram Local Dev Runner | scripts/bot-dev.ts (npm run bot:dev) long-polling with identical handler parity | M3 | ORIGINAL_REQUEST §20, R2 |
| F21 | Telegram Command Suite | /start, /saldo, /hari ini, /minggu ini, /bulan ini, /budget, /sheet, /bantuan | M3 | ORIGINAL_REQUEST §R2 |
| F22 | Precision WIB Reply Templates | HTML templates formatted in Asia/Jakarta with 10-block visual progress bar (█ and ░) | M3 | ORIGINAL_REQUEST §23, R2 |
| F23 | Starter Tier Limit Enforcement | 50 tx/month ceiling, photo OCR rejection, advisor rejection with educational upgrade CTA | M3 | ORIGINAL_REQUEST §R2, AC-6 |
| F24 | Scheduled Reminders & Alerts | Scheduled daily reminder (up to 2x/day) and 80%/100% budget threshold alerts | M3 | ORIGINAL_REQUEST §R2 |
| F25 | Supabase Auth Integration | Email/Password, Google OAuth sign-in and sign-up flows | M4 | ORIGINAL_REQUEST §18, R5 |
| F26 | Phone OTP with Dev Bypass | Phone number authentication with deterministic 123456 verification bypass | M4 | ORIGINAL_REQUEST §18, R5 |
| F27 | Split-Layout Auth Pages | /login and /register with 40% orange branding accent and 60% white form container | M4 | ORIGINAL_REQUEST §R5 |
| F28 | Registration Auto-Setup | Automatic profile, default 'Tunai' wallet, default Indonesian categories, onboarding checklist | M4 | ORIGINAL_REQUEST §R1, R5 |
| F29 | 14-Section Landing Page | Sticky navbar, badges, H1 gradient, hero placeholder, problem/solution, pricing, FAQ, footer | M4 | ORIGINAL_REQUEST §R5 |
| F30 | Interactive Telegram Bot Simulator | Landing page interactive widget simulating bot chat with real reply templates & mini dashboard | M4 | ORIGINAL_REQUEST §R5 |
| F31 | Midtrans Snap Payment Integration | /api/payment/create-snap-token generating Snap token for Starter/Pro packages | M4 | ORIGINAL_REQUEST §21 |
| F32 | Midtrans Webhook Handler | /api/payment/midtrans-webhook with SHA-512 signature verification and status update | M4 | ORIGINAL_REQUEST §21 |
| F33 | Subscription Lifecycle Management | Activation, expiration, renewal tracking in subscriptions table | M4 | ORIGINAL_REQUEST §R1 |
| F34 | User Dashboard Beranda / Overview | 4 stats cards, category pie chart, 6-month bar chart, trend line, 10 transactions, checklist | M5 | ORIGINAL_REQUEST §R3 |
| F35 | Dashboard Period Filtering | Global period filter: Harian, Mingguan, Bulanan, Tahunan, Custom date range | M5 | ORIGINAL_REQUEST §R3 |
| F36 | Transactions Management Page | Income/expense/transfer form, filterable table, expandable receipt item breakdown | M5 | ORIGINAL_REQUEST §R3 |
| F37 | Budget Management Page | Category budget setup with 80% and 100% threshold visual alerts | M5 | ORIGINAL_REQUEST §R3 |
| F38 | In-App Reports & Export History | Paginated report table, net cashflow summary, on-demand PDF/Excel download, export history | M5 | ORIGINAL_REQUEST §R3 |
| F39 | Multi-Wallet Management | Wallet management (cash, bank, ewallet), default wallet selection for Telegram bot | M5 | ORIGINAL_REQUEST §R3 |
| F40 | Settings Page Tabs | Profile, Telegram Bot test connection (⏳/🟢/🔴), Scheduled Reminders, Categories manager | M5 | ORIGINAL_REQUEST §R3, AC-5 |
| F41 | Supabase Realtime Sync | Realtime channel listener updating UI immediately upon incoming Telegram transactions | M5 | ORIGINAL_REQUEST §R3 |
| F42 | Admin AI Provider Manager | /admin/ai-providers: key encryption, Single vs Failover toggle, provider health check | M5 | ORIGINAL_REQUEST §R4 |
| F43 | Admin User Management & Impersonation | /admin/users: user directory, plan status, phone, Telegram status, Impersonate session switch | M5 | ORIGINAL_REQUEST §R4 |
| F44 | Admin AI Telemetry & Observability | /admin/ai-logs: invocation history, latency, token usage, cost analytics, error filters | M5 | ORIGINAL_REQUEST §R4 |
| F45 | Admin Transaction Inspector | /admin/transactions: support audit tool logging every access to admin_audit_logs | M5 | ORIGINAL_REQUEST §R4 |
| F46 | Admin Payment Approvals | /admin/payments: Midtrans & manual transfer queue with Approve/Reject actions | M5 | ORIGINAL_REQUEST §R4 |
| F47 | Admin Platform Data Export | /admin/export: summary export for platform users and financial analytics | M5 | ORIGINAL_REQUEST §R4 |
| F48 | Fintech Orange-Putih Theme | Theme tokens (#F97316), Inter/Plus Jakarta Sans typography, responsive 375px & 1280px | M5 | ORIGINAL_REQUEST §R3, AC-7 |
| F49 | E2E Test Suite Full Pass (Tiers 1-4) | Pass 100% of requirement-driven opaque-box E2E test suite published by E2E test track | M6 | ORIGINAL_REQUEST §Acceptance Criteria |
| F50 | Adversarial Coverage Hardening (Tier 5) | White-box stress testing, boundary condition exploitation, bug fixing | M6 | Dual Track Phase 2 |

## Milestones
| # | Name | Scope | Dependencies | Status | Assignee (Conv ID) |
|---|------|-------|-------------|--------|---------------------|
| M1 | Core Foundation & Database Infrastructure | Monorepo config, Supabase migration 001_initial_schema.sql (12 tables, triggers, RLS, storage, realtime), Supabase client triad, DB types, currency & date helpers | none | DONE | worker_supabase_m1 (aaad74d9-5d0c-46bb-acbf-4bb79a9b8045) |
| M2 | AI Multi-Provider & Export Engine | Multi-provider service (Gemini/OpenAI/DeepSeek), AI logs telemetry, Indonesian slang NLP parser, Vision OCR receipt parser, Voice Note STT pipeline, PDF & Excel export generators with signed URLs | M1 | DONE | worker_ai_export_m2 (d15818c1-0c24-42ae-a24c-d216499ec477) |
| M3 | Telegram Bot Engine & Webhook | Telegram wrapper, /api/telegram/webhook, update_id idempotency, scripts/bot-dev.ts, 8 commands, precision WIB reply templates with progress bars, reminders, Starter tier gating | M1, M2 | DONE | worker_telegram_m3 (bbb2371d-8896-408e-a7fc-df680b975902) |
| M4 | Auth, Landing Page & Payment Subsystem | Next.js Auth pages (split layout, dev OTP bypass 123456, onboarding auto-setup), 14-section Landing Page with interactive bot simulator, Midtrans Snap payment & webhook handler | M1 | DONE | worker_fullstack_auth_m4 (826d3389-3aa4-403e-9fcc-b4ed26bc42b5) |
| M5 | User & Admin Dashboards with Realtime Sync | 6 User Dashboard views (Overview, Transactions, Budget, Reports, Wallets, Settings with bot test connection), Realtime sync, 6 Admin Dashboard submodules (AI manager, users with impersonation, AI logs, transaction inspector with audit, payments, export) in orange-putih theme | M1, M2, M4 | DONE | worker_ui_dashboard_m5 (f67e88a4-6c7f-4a22-9d1f-e463afbbb86a) |
| M6 | Final Milestone: E2E Test Pass & Adversarial Hardening | Phase 1: Pass 100% of E2E tests (Tiers 1-4). Phase 2: Adversarial coverage hardening (Tier 5) with Challenger -> Worker -> Reviewer loop | M1, M2, M3, M4, M5, TEST_READY.md | DONE | worker_remediation_m6, worker_final_polish, verifier_final_signoff |

## Interface Contracts

### M1 (Database & Foundation) -> All Modules
- Database Schema: Defined in `supabase/migrations/001_initial_schema.sql`.
- Supabase Clients:
  - `src/lib/supabase/client.ts`: `createBrowserClient()` -> Supabase client for browser components.
  - `src/lib/supabase/server.ts`: `createServerClient()` -> Supabase client for Server Components & Actions with cookie handling.
  - `src/lib/supabase/admin.ts`: `createAdminClient()` -> Supabase client with `SUPABASE_SERVICE_ROLE_KEY` for webhooks and background jobs.
- Types: `src/types/database.ts` provides complete TypeScript types for all 12 tables and enums.
- Helpers: `src/lib/utils/currency.ts` (`formatRupiah(amount: number): string`) and `src/lib/utils/date.ts` (`formatWIB(date: Date | string, formatStr?: string): string`).

### M2 (AI & Export) -> M3 (Bot) & M5 (Dashboard)
- AI Parser Contract (`src/lib/ai/nlp-parser.ts`):
  ```typescript
  export interface ParsedTransaction {
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    category_name: string;
    notes?: string;
    destination_wallet_name?: string;
    raw_input: string;
  }
  export async function parseTransactionText(text: string, context: { categories: string[], wallets: string[] }): Promise<ParsedTransaction>;
  ```
- Vision OCR Contract (`src/lib/ai/ocr-service.ts`):
  ```typescript
  export interface OCRReceiptResult {
    merchant_name: string;
    total_amount: number;
    date?: string;
    items: Array<{ name: string; amount: number; category_name?: string }>;
  }
  export async function parseReceiptImage(imageBuffer: Buffer, mimeType: string): Promise<OCRReceiptResult>;
  ```
- Voice STT Contract (`src/lib/ai/voice-service.ts`):
  ```typescript
  export async function transcribeVoiceNote(audioBuffer: Buffer, mimeType: string): Promise<string>;
  ```
- Export Engine Contract (`src/lib/export/index.ts`):
  ```typescript
  export async function generateReportExport(params: {
    userId: string;
    fileType: 'pdf' | 'xlsx';
    period: string;
    transactions: any[];
  }): Promise<{ fileUrl: string; fileName: string; exportId: string }>;
  ```

### M3 (Telegram Bot) -> M5 (User Settings)
- Telegram Bot Connection Test (`src/lib/telegram/bot-api.ts`):
  ```typescript
  export async function testBotConnection(token: string): Promise<{
    ok: boolean;
    botUsername?: string;
    webhookSet?: boolean;
    error?: string;
  }>;
  ```

### M4 (Payments) -> M5 (Admin & Subscriptions)
- Payment Snap Contract (`src/lib/payment/midtrans.ts`):
  ```typescript
  export async function createSnapToken(params: {
    userId: string;
    plan: 'starter' | 'pro';
    amount: number;
  }): Promise<{ snapToken: string; orderId: string; redirectUrl: string }>;
  ```

## Code Layout
```
tatadana/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── .env.example
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── scripts/
│   └── bot-dev.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # Landing page (14 sections)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx                # Split layout login
│   │   │   └── register/page.tsx             # Split layout register
│   │   ├── (dashboard)/                      # User dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx            # Beranda 4 stats + charts
│   │   │   ├── transactions/page.tsx         # Transactions form & table
│   │   │   ├── budgets/page.tsx              # Budgets & alerts
│   │   │   ├── reports/page.tsx              # Reports & export
│   │   │   ├── wallets/page.tsx              # Multi-wallet
│   │   │   └── settings/page.tsx             # Settings & Bot test
│   │   ├── admin/                            # Admin portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                      # Admin overview
│   │   │   ├── ai-providers/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── ai-logs/page.tsx
│   │   │   ├── transactions/page.tsx
│   │   │   ├── payments/page.tsx
│   │   │   └── export/page.tsx
│   │   └── api/
│   │       ├── telegram/
│   │       │   ├── webhook/route.ts
│   │       │   └── test-connection/route.ts
│   │       ├── payment/
│   │       │   ├── create-snap-token/route.ts
│   │       │   └── midtrans-webhook/route.ts
│   │       ├── reports/
│   │       │   └── export/route.ts
│   │       └── cron/
│   │           └── reminders/route.ts
│   ├── components/
│   │   ├── ui/                               # Button, Input, Card, Modal, etc.
│   │   ├── landing/                          # Landing page sections
│   │   ├── dashboard/                        # Charts, stats cards, tables
│   │   └── admin/                            # Admin components
│   ├── lib/
│   │   ├── supabase/                         # client.ts, server.ts, admin.ts
│   │   ├── ai/                               # provider-manager, nlp, ocr, voice
│   │   ├── telegram/                         # bot-api, message-handler, templates
│   │   ├── payment/                          # midtrans service
│   │   ├── export/                           # pdf-generator, excel-generator
│   │   └── utils/                            # currency, date, formatting
│   └── types/
│       ├── database.ts
│       └── index.ts
└── tests/
    └── e2e/                                  # Opaque-box E2E test suite (Tiers 1-4)
```
