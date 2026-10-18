import "server-only";
import postgres from "postgres";

/**
 * Read-only connection to the salon POS app's database (github.com/Logicman23/saloon),
 * which owns the real services and packages. Uses the `website_menu` role created by
 * supabase/pos/website-menu-reader.sql, which can only SELECT the active menu.
 *
 * Returns null when MENU_DATABASE_URL is not set, so the site falls back to its own
 * Supabase `services` table.
 */
let client: postgres.Sql | null = null;

export function posMenuDb(): postgres.Sql | null {
  const url = process.env.MENU_DATABASE_URL;
  if (!url) return null;
  // prepare: false is required by Supabase's transaction pooler (port 6543).
  client ??= postgres(url, { prepare: false, max: 1, idle_timeout: 20, connect_timeout: 10 });
  return client;
}
