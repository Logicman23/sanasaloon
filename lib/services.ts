import { cacheLife, cacheTag } from "next/cache";
import { CATEGORY_ORDER, DEALS_CATEGORY, isDeal } from "@/lib/site";
import type { Service, ServicesResult } from "@/lib/types";
import { posMenuDb } from "@/utils/pos-menu/db";
import { createPublicClient, SupabaseConfigError } from "@/utils/supabase/server";

const SERVICE_COLUMNS =
  "id, name, category, price, price_display, description, duration_minutes, is_active";

// The POS stores categories as an enum; these are the names shown on the website.
const POS_CATEGORY_LABELS: Record<string, string> = {
  MAKEUP: "Bridal & Makeup",
  HAIR: "Hair Treatments",
  SKIN: "Skincare & Facials",
  NAILS: "Nails",
  SPA: "Spa & Body",
};

/**
 * The public menu (website pages and booking form), cached for a few minutes.
 * Reads the POS app's services and packages when MENU_DATABASE_URL is set, otherwise
 * this site's own Supabase `services` table. Call `revalidateTag("services")` to refresh.
 */
export async function getActiveServices(): Promise<ServicesResult> {
  "use cache";
  cacheTag("services");

  const result = posMenuDb() ? await getPosMenu() : await loadWebsiteServices();
  if (result.ok) cacheLife("minutes");
  // Refresh a failed load after 30s. Expiry stays at 5 min, the shortest that can still be prerendered.
  else cacheLife({ stale: 30, revalidate: 30, expire: 300 });
  return result;
}

/** Active services and packages from the POS app. Packages are listed as Deals. */
async function getPosMenu(): Promise<ServicesResult> {
  try {
    return await queryPosMenu();
  } catch (err) {
    // The pooler closes idle connections; one retry opens a fresh one.
    console.warn("[services] POS menu query failed, retrying:", err instanceof Error ? err.message : err);
    try {
      return await queryPosMenu();
    } catch (retryErr) {
      console.error("[services] POS menu query failed:", retryErr instanceof Error ? retryErr.message : retryErr);
      return { ok: false, error: "We couldn't load our services right now." };
    }
  }
}

async function queryPosMenu(): Promise<ServicesResult> {
  const sql = posMenuDb()!;
  const [services, packages] = await Promise.all([
    sql<{ id: string; title: string; category: string; duration_mins: number; price: number; description: string | null }[]>`
      select id, title, category::text as category, duration_mins, price::float8 as price, description
      from services
      where active and archived_at is null
      order by price desc`,
    sql<{ id: string; name: string; description: string | null; price: number; includes: string[] | null }[]>`
      select p.id, p.name, p.description, p.price::float8 as price,
             array_agg(s.title order by s.title) filter (where s.id is not null) as includes
      from service_packages p
      left join package_services ps on ps.package_id = p.id
      left join services s on s.id = ps.service_id and s.active and s.archived_at is null
      where p.active and p.archived_at is null
      group by p.id
      order by p.price desc`,
  ]);

  const menu: Service[] = [
    ...packages.map((p) => ({
      id: p.id,
      name: p.name,
      category: DEALS_CATEGORY,
      price: p.price,
      price_display: null,
      description: p.description?.trim() || (p.includes?.length ? `Includes ${p.includes.join(", ")}.` : null),
      // Packages can span several visits, so a summed duration would mislead.
      duration_minutes: null,
      is_active: true,
    })),
    ...services.map((s) => ({
      id: s.id,
      name: s.title,
      category: POS_CATEGORY_LABELS[s.category] ?? s.category,
      price: s.price,
      price_display: null,
      description: s.description,
      duration_minutes: s.duration_mins,
      is_active: true,
    })),
  ];
  return { ok: true, source: "pos", services: sortByCategory(menu) };
}

/** This site's own Supabase `services` table. The website's /pos checkout always uses this one. */
export async function getWebsiteServices(): Promise<ServicesResult> {
  "use cache";
  cacheTag("services");

  const result = await loadWebsiteServices();
  if (result.ok) cacheLife("minutes");
  // Refresh a failed load after 30s. Expiry stays at 5 min, the shortest that can still be prerendered.
  else cacheLife({ stale: 30, revalidate: 30, expire: 300 });
  return result;
}

async function loadWebsiteServices(): Promise<ServicesResult> {
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

    return { ok: true, source: "website", services: sortByCategory((data ?? []) as Service[]) };
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
