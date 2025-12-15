import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } from '@/shared/config/env.public';

export async function createSupabaseMiddlewareClient(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { supabase: null, response };
    }

    const cookieMethods: CookieMethodsServer = {
        getAll() {
            return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
                request: {
                    headers: request.headers,
                },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
            );
        },
    };

    const supabase = createServerClient(
        NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: cookieMethods,
        }
    );

    return { supabase, response };
}
