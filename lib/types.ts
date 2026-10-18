// Mirrors the `public.services` table in Supabase.
export type Service = {
  id: string;
  name: string;
  category: string;
  price: number | null;
  price_display: string | null;
  description: string | null;
  duration_minutes: number | null;
  is_active: boolean;
};

export type ServicesResult =
  /** "pos": read from the POS app's database; "website": this site's own `services` table. */
  | { ok: true; source: "pos" | "website"; services: Service[] }
  | { ok: false; error: string };
