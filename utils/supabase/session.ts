import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { SupabaseConfigError } from "@/utils/supabase/server";

/**
 * Supabase client bound to the signed-in staff member's auth cookies. Reads
 * cookies, so callers must render behind <Suspense> (or run in a Server Action).
 */
export async function createSessionClient() {
  // Read cookies before anything can throw, so pages using this always render per request
  // (never prerendered with a stale "not configured" state).
  const cookieStore = await cookies();
  // Validating the session compares token expiry with the current time, which Cache Components
  // only allows once the render is explicitly request-time.
  await connection();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new SupabaseConfigError();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only. proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
