'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } from '@/shared/config/env.public';

let supabaseClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient(): SupabaseClient {
    if (supabaseClient) {
        return supabaseClient;
    }

    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase environment variables');
    }

    supabaseClient = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });

    return supabaseClient;
}
