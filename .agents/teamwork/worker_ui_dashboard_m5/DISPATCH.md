# Dispatch Assignment: UI/UX & Dashboard Specialist (M5)

Working Directory: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_ui_dashboard_m5
Project Root: C:\Users\nadil\.gemini\antigravity\scratch\tatadana
Original Request Path: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Project Plan: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\PROJECT.md
Audit Report: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_codebase_audit\report.md

## Exclusive File Ownership:
- `src/app/(dashboard)/**`
- `src/app/admin/**`
- `src/components/dashboard/**`
- `src/components/admin/**`
- `src/components/ui/**`
- `src/hooks/**`

## Mandatory Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mission:
You are the UI/UX & Dashboard Specialist for TataDana.
1. Read `ORIGINAL_REQUEST.md` and `PROJECT.md`.
2. Address M5 audit findings and requirements:
   - User Dashboard (6 Views in Orange-Putih Fintech Theme `#F97316`):
     - Beranda (`/dashboard`): 4 stats cards (Saldo Total, Pemasukan, Pengeluaran, Sisa Budget), Donut chart kategori, 6-Month bar chart, Daily trend line, 10 recent transactions, empty state onboarding checklist.
     - Transaksi (`/transactions`): Form catat pemasukan/pengeluaran/transfer, table with pagination & search, receipt item breakdown expander with receipt image modal viewer.
     - Budget (`/budgets`): Category budget limits, visual progress bar with 80% & 100% threshold alerts.
     - Laporan (`/reports`): Filterable paginated transactions, net cashflow summary, on-demand PDF & Excel export triggers, export history table with signed download URLs.
     - Wallets (`/wallets`): Multi-wallet management (cash, bank, ewallet), default wallet selection for Telegram bot.
     - Settings (`/settings`): Profil tab, Telegram Bot tab with setup guide and "Test Koneksi" button (`⏳ Testing...`, `🟢 Terhubung`, `🔴 Tidak terhubung`), Reminder tab (toggle, up to 2x/day, preview), Kategori tab (custom with emoji & color).
   - Supabase Realtime Sync:
     - Implement `useRealtimeTransactions` hook subscribing to `supabase.channel` for instant sync when transactions are ingested from Telegram or other devices.
   - Admin Dashboard (`/admin`):
     - Role-guarded: superadmin access only (`role = 'admin'`).
     - AI Provider Manager (`/admin/ai-providers`): Single vs Failover mode switch, priority ordering, health check ping button.
     - User Management (`/admin/users`): User directory, plan status, Telegram status, Impersonate action.
     - AI Logs & Telemetry (`/admin/ai-logs`): Latency, token count, cost estimation, filter by error.
     - Transaction Inspector (`/admin/transactions`): Customer support audit tool logging every read access to `admin_audit_logs`.
     - Payment Approvals (`/admin/payments`): Midtrans & manual transfer queue with Approve/Reject actions.
     - Platform Data Export (`/admin/export`): Summary export for users & platform.
   - Responsiveness: Perfect display at 375px (mobile) and 1280px (desktop).
3. Verify your changes and ensure clean builds.
4. Write `changes.md` and `handoff.md` in your working directory.
5. Send completion message to parent orchestrator (`f97a728b-f0fe-408f-8312-c163fb72bca4`).


## 2026-10-15T03:59:11Z
You are the UI/UX & Dashboard Specialist (M5) for TataDana.
Your working directory is: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_ui_dashboard_m5
Project root: C:\Users\nadil\.gemini\antigravity\scratch\tatadana
Dispatch file: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_ui_dashboard_m5\DISPATCH.md
Original user request file: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Project plan: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\PROJECT.md
Audit Report: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_codebase_audit\report.md

Execute your tasks per DISPATCH.md:
1. Implement useRealtimeTransactions hook with Supabase Realtime channel subscription listener for live balance & transaction updates.
2. Complete 6 User Dashboard views (Overview/Beranda with 4 stats cards, Donut chart, 6-mo bar chart, trend line, 10 transactions, checklist; Transaksi with receipt expander & modal viewer; Budget with 80% & 100% threshold visual alerts; Laporan with filters, pagination, export triggers; Wallets with multi-wallet and default bot wallet selector; Settings with Profile, Bot test connection button with ⏳/🟢/🔴 states, Reminders, Categories).
3. Complete 6 Admin Dashboard submodules (AI manager, Users with impersonation & audit log, AI logs & telemetry, Transaction inspector with audit log, Payments queue, Platform data export).
4. Ensure Orange-Putih Fintech Theme (#F97316) is fully responsive at 375px and 1280px.
5. Verify tests: npx tsx tests/e2e/tier1_features/t1_dashboard_admin.test.ts.
6. Write changes.md and handoff.md, then send completion message to parent orchestrator (f97a728b-f0fe-408f-8312-c163fb72bca4).
