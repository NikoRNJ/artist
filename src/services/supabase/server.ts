import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } from '@/shared/config/env.public';
import { SUPABASE_SERVICE_ROLE_KEY } from '@/shared/config/env.server';

type SupabaseServerClient = SupabaseClient;

function getSupabaseUrl(): string | null {
  return NEXT_PUBLIC_SUPABASE_URL || null;
}

function getSupabaseAnonKey(): string | null {
  return NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
}

function getSupabaseServiceRoleKey(): string | null {
  return SUPABASE_SERVICE_ROLE_KEY || null;
}

export function createSupabaseServerClient(): SupabaseServerClient | null {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createSupabaseServiceClient(): SupabaseServerClient | null {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
