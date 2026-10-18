import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class SupabaseConfigError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
    this.name = "SupabaseConfigError";
  }
}

/**
 * Anonymous, session-less Supabase client for reading public data (e.g. the
 * services menu) on the server. It does not touch cookies, so it is safe to
 * call inside `"use cache"` scopes.
 */
export function createPublicClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) throw new SupabaseConfigError();

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
