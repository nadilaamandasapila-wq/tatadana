# Dispatch Assignment: Sub-Orchestrator Milestone 1 (Core Foundation & Database Infrastructure)

Working Directory: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\sub_orch_m1
Project Root: C:\Users\nadil\.gemini\antigravity\scratch\tatadana
Original Request Path: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Project Index: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\PROJECT.md

## Scope:
Milestone 1: Core Foundation & Database Infrastructure
- Monorepo package setup (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.js`, dependencies).
- Complete PostgreSQL schema migration script in `supabase/migrations/001_initial_schema.sql` covering all 12 tables (`profiles`, `wallets`, `categories`, `transactions`, `transaction_items`, `budgets`, `export_history`, `ai_providers`, `ai_logs`, `subscriptions`, `admin_audit_logs`, `telegram_processed_updates`).
- 4 Database triggers (`handle_new_user`, `handle_wallet_balance_change`, `handle_single_default_wallet`, `handle_updated_at`).
- Complete Row-Level Security (RLS) policies and `is_admin()` security definer function.
- Supabase Storage buckets (`tatadana-exports`, `receipt-images`) and Realtime publications.
- Supabase Client Triad (`src/lib/supabase/client.ts`, `server.ts`, `admin.ts`) and TypeScript database types (`src/types/database.ts`).
- Currency (Rupiah) and Date (WIB) utility helpers (`src/lib/utils/currency.ts`, `src/lib/utils/date.ts`).

## Instructions:
1. Create `SCOPE.md` in your working directory.
2. Execute the iteration loop (Explorer -> Worker -> Reviewers -> Challengers -> Forensic Auditor -> Gate) per the Project pattern instructions.
3. Verify that build and tests pass for M1.
4. Report completion back to parent.
