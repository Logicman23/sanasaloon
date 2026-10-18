# Sana's Beauty Saloon

Website and (upcoming) staff POS for Sana's Beauty Saloon, Nadeem Center, Satellite Town, Rawalpindi.

Built with Next.js 16 (App Router, Cache Components), Tailwind CSS v4, Lucide icons and Supabase.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase URL and anon key
npm run dev
```

The site reads the `public.services` table with the anon key, so the table needs a Row Level Security policy that allows public reads of active services:

```sql
create policy "Public can read active services"
  on public.services for select
  to anon
  using (is_active = true);
```

## Where things live

- `lib/site.ts`: business details, phone/WhatsApp, social links and nav. Edit this first.
- `lib/services.ts`: Supabase queries. Results are cached for about a minute under the `services` tag.
- `utils/supabase/server.ts`: the session-less Supabase client used for public reads.
- `app/page.tsx`: home page. `app/services/page.tsx`: services and deals with category filters.

## Status

Done: header/footer, Home, Services & Deals.
To do: About, Contact, Book Appointment and the POS (`/pos`). The nav already links to them.
