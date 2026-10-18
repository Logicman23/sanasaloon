import { cacheLife, cacheTag } from "next/cache";
import { CATEGORY_ORDER, DEALS_CATEGORY, isDeal } from "@/lib/site";
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

/** Splits the catalog into the Deals page items and the Services page items. */
export function splitDeals(services: Service[]): { deals: Service[]; regular: Service[] } {
  return { deals: services.filter(isDeal), regular: services.filter((s) => !isDeal(s)) };
}

/**
 * Up to `limit` services for the home page: deals and bridal packages first, then the
 * top item from each remaining category so every category is represented.
 */
export function pickFeatured(services: Service[], limit = 6): Service[] {
  const isPriority = (s: Service) => isDeal(s) || s.category === CATEGORY_ORDER[0];
  const bridal = [...services.filter(isDeal), ...services.filter((s) => s.category === CATEGORY_ORDER[0])];
  const rest = services.filter((s) => !isPriority(s));

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

// Deals lead wherever every category is listed together (booking form, POS).
const DISPLAY_ORDER: readonly string[] = [DEALS_CATEGORY, ...CATEGORY_ORDER];

export function getCategories(services: Service[]): string[] {
  const present = new Set(services.map((s) => s.category));
  const known = DISPLAY_ORDER.filter((c) => present.has(c));
  const extra = [...present].filter((c) => !DISPLAY_ORDER.includes(c)).sort();
  return [...known, ...extra];
}

function sortByCategory(services: Service[]): Service[] {
  const rank = (category: string) => {
    const i = DISPLAY_ORDER.indexOf(category);
    return i === -1 ? DISPLAY_ORDER.length : i;
  };
  // Array.prototype.sort is stable, so the price ordering from the query is kept within each category.
  return [...services].sort((a, b) => rank(a.category) - rank(b.category));
}
