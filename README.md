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

Online bookings are saved to a `public.appointments` table. Create it by running
`supabase/migrations/20261018000000_create_appointments.sql` in the Supabase SQL editor. Its RLS policy lets the
website insert pending requests only. The public cannot read, edit or delete appointments.

## Where things live

- `lib/site.ts`: business details, phone/WhatsApp, social links and nav. Edit this first.
- `lib/services.ts`: Supabase queries. Results are cached for about a minute under the `services` tag.
- `utils/supabase/server.ts`: the session-less Supabase client used for public reads.
- `lib/booking.ts`: time slots, Pakistan-time date handling and phone validation.
- `app/page.tsx`: home page. `app/services/page.tsx`: services and deals with category filters.
- `app/book/`: booking page and its Server Action (`actions.ts`). Links like `/book?service=<id>` preselect a service.
- `app/contact/page.tsx`: address, map, call/WhatsApp, hours, reviews and socials.

## Status

Done: header/footer, Home, Services & Deals, Book Appointment, Contact.
To do: About and the POS (`/pos`). The nav already links to them.
