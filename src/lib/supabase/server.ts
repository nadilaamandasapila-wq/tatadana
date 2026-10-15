import { createServerClient as createSSRServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export const FALLBACK_SUPABASE_URL = 'https://kiyvrmycehnaxljepevj.supabase.co';
export const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpeXZybXljZWhuYXhsamVwZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDkyODYsImV4cCI6MjEwNzYyNTI4Nn0.wW1J32cMuSPg2MVnV7TtXhRrdbcq66NixiBIEDC_-ww';

export function getSafeServerSupabaseUrl(): string {
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

export function getSafeServerAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key || key.trim() === '' || key.includes('your_') || key.includes('placeholder')) {
    return FALLBACK_ANON_KEY;
  }
  return key;
}

export function createServerClient() {
  const supabaseUrl = getSafeServerSupabaseUrl();
  const supabaseKey = getSafeServerAnonKey();

  let cookieStore: any = null;
  try {
    cookieStore = cookies();
  } catch {
    // Outside request context (e.g., test runner, background script, or build phase)
  }

  try {
    return createSSRServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          try {
            return cookieStore?.get(name)?.value;
          } catch {
            return undefined;
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore?.set({ name, value, ...options });
          } catch {
            // Can occur when set from Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore?.set({ name, value: '', ...options });
          } catch {
            // Can occur when set from Server Component
          }
        },
      },
    });
  } catch (error) {
    console.warn('[Supabase Server] Fallback server client created due to initialization error:', error);
    return createSSRServerClient<Database>(FALLBACK_SUPABASE_URL, FALLBACK_ANON_KEY, {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    });
  }
}
