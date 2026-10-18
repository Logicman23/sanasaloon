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
  | { ok: true; services: Service[] }
  | { ok: false; error: string };
