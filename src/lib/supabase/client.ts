import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export const FALLBACK_SUPABASE_URL = 'https://kiyvrmycehnaxljepevj.supabase.co';
export const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpeXZybXljZWhuYXhsamVwZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDkyODYsImV4cCI6MjEwNzYyNTI4Nn0.wW1J32cMuSPg2MVnV7TtXhRrdbcq66NixiBIEDC_-ww';

export function getSafeSupabaseUrl(): string {
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

export function getSafeAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key || key.trim() === '' || key.includes('your_') || key.includes('placeholder')) {
    return FALLBACK_ANON_KEY;
  }
  return key;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('demo-tatadana') || url.includes('your-project') || url.includes('your_') || url.includes('placeholder')) {
    return false;
  }
  return true;
}

export function createBrowserClient() {
  const supabaseUrl = getSafeSupabaseUrl();
  const supabaseKey = getSafeAnonKey();

  try {
    return createSSRBrowserClient<Database>(supabaseUrl, supabaseKey);
  } catch (error) {
    console.warn('[Supabase Client] Fallback client created due to initialization error:', error);
    return createSSRBrowserClient<Database>(FALLBACK_SUPABASE_URL, FALLBACK_ANON_KEY);
  }
}

