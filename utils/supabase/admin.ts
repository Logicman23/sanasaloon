import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class SupabaseAdminConfigError extends Error {
  constructor() {
    super("POS writes are not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local.");
    this.name = "SupabaseAdminConfigError";
  }
}

/**
 * Service-role client that bypasses RLS. Server-only: use it for POS writes
 * after the caller has been verified as active staff.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new SupabaseAdminConfigError();

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
