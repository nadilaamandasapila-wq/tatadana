import fs from 'fs';
import path from 'path';
import { describe, it, expect } from '../harness';
import { createAdminClient } from '../../../src/lib/supabase/admin';
import { createBrowserClient } from '../../../src/lib/supabase/client';
import { createServerClient } from '../../../src/lib/supabase/server';

describe('Tier 1: Foundation & Database Infrastructure (F01-F07)', () => {
  const projectRoot = path.resolve(__dirname, '../../../');

  it('F01: Monorepo Setup & Tooling Configuration', () => {
    const pkgPath = path.join(projectRoot, 'package.json');
    expect(fs.existsSync(pkgPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.name).toBe('tatadana');
    expect(Boolean(pkg.dependencies['next'])).toBe(true);
    expect(Boolean(pkg.dependencies['@supabase/supabase-js'])).toBe(true);
    expect(Boolean(pkg.dependencies['xlsx'])).toBe(true);
    expect(Boolean(pkg.dependencies['lucide-react'])).toBe(true);
  });

  it('F02: Supabase Client Triad Factory Functions', () => {
    // Admin client (service role)
    const adminClient = createAdminClient();
    expect(typeof adminClient).toBe('object');

    // Browser client
    const browserClient = createBrowserClient();
    expect(typeof browserClient).toBe('object');

    // Server client
    const serverClient = createServerClient();
    expect(typeof serverClient).toBe('object');
  });

  it('F03: Database Migration Script defines all 12 Required Tables', () => {
    const migrationPath = path.join(projectRoot, 'supabase/migrations/001_initial_schema.sql');
    expect(fs.existsSync(migrationPath)).toBe(true);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    const expectedTables = [
      'profiles',
      'wallets',
      'categories',
      'transactions',
      'transaction_items',
      'budgets',
      'export_history',
      'ai_providers',
      'ai_logs',
      'subscriptions',
      'admin_audit_logs',
      'telegram_processed_updates',
    ];

    for (const table of expectedTables) {
      const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}`, 'i');
      expect(tableRegex.test(sql)).toBe(true);
    }
  });

  it('F04: Automated Database Triggers are defined in Migration', () => {
    const migrationPath = path.join(projectRoot, 'supabase/migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Trigger functions
    expect(sql.includes('handle_new_user')).toBe(true);
    expect(sql.includes('handle_wallet_balance_change')).toBe(true);
    expect(sql.includes('handle_single_default_wallet')).toBe(true);
    expect(sql.includes('handle_updated_at')).toBe(true);

    // Associated triggers
    expect(sql.includes('tr_on_auth_user_created')).toBe(true);
    expect(sql.includes('tr_on_transaction_balance_change')).toBe(true);
  });

  it('F05: Row-Level Security (RLS) & is_admin() Security Definer', () => {
    const migrationPath = path.join(projectRoot, 'supabase/migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    expect(sql.includes('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY')).toBe(true);
    expect(sql.includes('ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY')).toBe(true);
    expect(sql.includes('CREATE OR REPLACE FUNCTION public.is_admin()')).toBe(true);
    expect(sql.includes('SECURITY DEFINER')).toBe(true);
  });

  it('F06: Supabase Realtime Publication configuration', () => {
    const migrationPath = path.join(projectRoot, 'supabase/migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    expect(sql.includes('supabase_realtime')).toBe(true);
    expect(sql.includes('ADD TABLE public.transactions')).toBe(true);
    expect(sql.includes('ADD TABLE public.wallets')).toBe(true);
    expect(sql.includes('ADD TABLE public.budgets')).toBe(true);
  });

  it('F07: Supabase Storage Buckets and Private Policies', () => {
    const migrationPath = path.join(projectRoot, 'supabase/migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    expect(sql.includes('tatadana-exports')).toBe(true);
    expect(sql.includes('storage.buckets')).toBe(true);
  });
});
