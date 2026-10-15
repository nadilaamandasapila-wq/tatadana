# Dispatch Assignment: Supabase Database & Storage Engineer (M1)

Working Directory: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_supabase_m1
Project Root: C:\Users\nadil\.gemini\antigravity\scratch\tatadana
Original Request Path: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Project Plan: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\PROJECT.md
Audit Report: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_codebase_audit\report.md

## Exclusive File Ownership:
- `supabase/migrations/**`
- `src/lib/supabase/**`
- `src/types/database.ts`

## Mandatory Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mission:
You are the Supabase Database & Storage Engineer for TataDana.
1. Read `ORIGINAL_REQUEST.md` and `PROJECT.md`.
2. Address the M1 audit findings from `report.md`:
   - Complete `supabase/migrations/001_initial_schema.sql` (or add `supabase/migrations/002_storage_and_triggers.sql`) to include:
     - `handle_updated_at` trigger function and triggers for tables with `updated_at`.
     - Storage bucket provisioning SQL (`INSERT INTO storage.buckets`) for `tatadana-exports` (private) and `receipt-images` (private) with storage RLS policies for authenticated users and service_role.
     - Verify triggers: `handle_new_user`, `handle_wallet_balance_change`, `handle_single_default_wallet`.
     - Verify Realtime publications for `transactions`, `wallets`, `budgets`.
   - Update `src/lib/supabase/client.ts`, `server.ts`, and `admin.ts`:
     - Provide robust fallbacks for development if environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are missing or placeholders, so imports never throw runtime errors.
   - Update `src/types/database.ts` with accurate TypeScript types for all 12 tables and storage entities.
3. Test and verify your changes.
4. Write `changes.md` and `handoff.md` in your working directory.
5. Send completion message to parent orchestrator (`f97a728b-f0fe-408f-8312-c163fb72bca4`).

## 2026-10-15T03:59:11Z
Received dispatch from parent `f97a728b-f0fe-408f-8312-c163fb72bca4`.
Tasks:
1. Complete migration 001_initial_schema.sql (or add 002_storage_and_triggers.sql) with handle_updated_at trigger and storage bucket setup for tatadana-exports and receipt-images with RLS.
2. Update src/lib/supabase/client.ts, server.ts, admin.ts with robust environment variable fallbacks so imports never crash in dev mode.
3. Update src/types/database.ts with full schema types.
4. Verify schema and implementation.
5. Write changes.md and handoff.md, then send completion message to parent orchestrator.
