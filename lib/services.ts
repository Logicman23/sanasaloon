import { cacheLife, cacheTag } from "next/cache";
import { CATEGORY_ORDER } from "@/lib/site";
import type { Service, ServicesResult } from "@/lib/types";
import { createPublicClient, SupabaseConfigError } from "@/utils/supabase/server";

const SERVICE_COLUMNS =
  "id, name, category, price, price_display, description, duration_minutes, is_active";

/**
 * All active services, cached for a few minutes. Call `revalidateTag("services")`
 * (e.g. from the POS/admin after editing prices) to refresh immediately.
 */
export async function getActiveServices(): Promise<ServicesResult> {
  "use cache";
  cacheLife("minutes");
  cacheTag("services");

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("services")
      .select(SERVICE_COLUMNS)
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("price", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("[services] Supabase query failed:", error.message);
      return { ok: false, error: "We couldn't load our services right now." };
    }

    return { ok: true, services: sortByCategory((data ?? []) as Service[]) };
  } catch (err) {
    if (err instanceof SupabaseConfigError) {
      console.error(`[services] ${err.message}`);
      return { ok: false, error: "The services menu is not connected yet." };
    }
    console.error("[services] Unexpected error:", err);
    return { ok: false, error: "We couldn't load our services right now." };
  }
}

/**
 * Up to `limit` services for the home page: bridal packages first, then the
 * top item from each remaining category so every category is represented.
 */
export function pickFeatured(services: Service[], limit = 6): Service[] {
  const bridal = services.filter((s) => s.category === CATEGORY_ORDER[0]);
  const rest = services.filter((s) => s.category !== CATEGORY_ORDER[0]);

  const firstPerCategory: Service[] = [];
  const seen = new Set<string>();
  for (const s of rest) {
    if (!seen.has(s.category)) {
      seen.add(s.category);
      firstPerCategory.push(s);
    }
  }

  const picked = [...bridal.slice(0, Math.max(0, limit - firstPerCategory.length)), ...firstPerCategory];
  const pickedIds = new Set(picked.map((s) => s.id));
  const filler = services.filter((s) => !pickedIds.has(s.id));

  return [...picked, ...filler].slice(0, limit);
}

export function getCategories(services: Service[]): string[] {
  const present = new Set(services.map((s) => s.category));
  const known = CATEGORY_ORDER.filter((c) => present.has(c));
  const extra = [...present].filter((c) => !(CATEGORY_ORDER as readonly string[]).includes(c)).sort();
  return [...known, ...extra];
}

function sortByCategory(services: Service[]): Service[] {
  const rank = (category: string) => {
    const i = (CATEGORY_ORDER as readonly string[]).indexOf(category);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  // Array.prototype.sort is stable, so the price ordering from the query is kept within each category.
  return [...services].sort((a, b) => rank(a.category) - rank(b.category));
}
