import 'server-only';

export const GEMINI_API_KEY: string = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
export const SUPABASE_SERVICE_ROLE_KEY: string = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

