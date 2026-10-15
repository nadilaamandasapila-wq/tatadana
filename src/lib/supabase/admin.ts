import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const FALLBACK_SUPABASE_URL = 'https://demo-tatadana.supabase.co';
export const FALLBACK_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.tatadana-demo-service-role-placeholder';

export function getSafeAdminSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.trim() === '' || url.includes('your_') || url.includes('placeholder')) {
    return FALLBACK_SUPABASE_URL;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
  } catch {
    // URL parsing failed
  }
  return FALLBACK_SUPABASE_URL;
}

export function getSafeServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key || key.trim() === '' || key.includes('your_') || key.includes('placeholder')) {
    return FALLBACK_SERVICE_ROLE_KEY;
  }
  return key;
}

export function createAdminClient() {
  const supabaseUrl = getSafeAdminSupabaseUrl();
  const serviceRoleKey = getSafeServiceRoleKey();

  try {
    return createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error) {
    console.warn('[Supabase Admin] Fallback client created due to initialization error:', error);
    return createClient<Database>(FALLBACK_SUPABASE_URL, FALLBACK_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}
