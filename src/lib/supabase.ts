// ─── Supabase client singleton ─────────────────────────────────────────────────
// Returns null when env vars are not configured — all callers guard with `if (supabase)`.
// ──────────────────────────────────────────────────────────────────────────────
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** `null` when Supabase env vars are missing. Guard every call with `if (supabase)`. */
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON
    ? createClient(SUPABASE_URL, SUPABASE_ANON)
    : null;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON);
