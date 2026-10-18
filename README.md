# Sana's Beauty Saloon

Website and staff POS for Sana's Beauty Saloon, Nadeem Center, Satellite Town, Rawalpindi.

Built with Next.js 16 (App Router, Cache Components), Tailwind CSS v4, Lucide icons and Supabase.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in the values (see below)
npm run dev
```

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Public site reads and staff sign-in |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page (secret) | Server-only. The POS uses it to save sales |
| `ADMIN_OVERRIDE_PIN` | You choose (6+ digits) | Manager PIN required for any POS discount |

### Database

1. **Services (public read).** The site reads `public.services` with the anon key, so allow public reads of active services:

   ```sql
   create policy "Public can read active services"
     on public.services for select to anon, authenticated
     using (is_active = true);
   ```

2. **Appointments.** Run `supabase/migrations/20261018000000_create_appointments.sql`. The website can only insert pending requests. The public can't read, edit or delete them.

3. **POS.** Run `supabase/migrations/20261018010000_create_pos.sql`. It creates `staff`, `orders`, `order_items`, `discount_override_attempts` and the `create_pos_order` function.

4. **Deals.** Run `supabase/migrations/20261018020000_deals_category.sql`. Any active service with category `Deals` is shown on the website's Deals page (and the POS Deals tab). Every other active service is shown on the Services page.

### Menu from the POS app

The salon's main POS ([Logicman23/saloon](https://github.com/Logicman23/saloon)) owns the real menu. When `MENU_DATABASE_URL` is set, the website's Services page, Deals page, home page and booking form read it directly: POS **services** appear under Services, and POS **packages** appear under Deals. Anything staff add, pause, or archive in the POS shows up on the website within a few minutes.

1. In the **POS** Supabase project's SQL editor, set a password in `supabase/pos/website-menu-reader.sql` and run it. It creates `website_menu`, a login that can only read active services and packages (not clients, invoices or users) and cannot write.
2. In Vercel, add `MENU_DATABASE_URL` (server-only) with that login's transaction-pooler URL, as shown in `.env.local.example`, then redeploy.

Without `MENU_DATABASE_URL` the site uses this project's own `services` table. The website's staff `/pos` checkout always uses its own table.

### Adding POS staff

1. In Supabase → Authentication → Users, **Add user** with an email and password.
2. Link them as staff, using the user's id:

   ```sql
   insert into public.staff (user_id, full_name, role)
   values ('<auth user id>', 'Sana', 'owner');
   ```

3. Recommended: turn off public sign-ups (Authentication → Sign In / Providers) so only accounts you create exist.

Only active rows in `staff` can open `/pos`. To revoke access, set `is_active = false`.

## POS security model

- Staff sign in with Supabase Auth. Every POS page and Server Action re-checks the session and the `staff` row.
- Staff can **read** orders through RLS but can't write them. Sales are saved only by the server (service role) after it:
  - re-prices every line from the database (charging above the menu price is allowed for price ranges, charging below is not);
  - computes totals itself and ignores any totals sent from the browser;
  - requires `ADMIN_OVERRIDE_PIN` for any discount, compared in constant time, with a lockout after 5 wrong attempts in 15 minutes per staff member. Every attempt is logged in `discount_override_attempts`;
  - saves the order and its items in one transaction (`create_pos_order`).

## Where things live

- `lib/site.ts`: business details, hours, phone/WhatsApp, social links and nav. Edit this first.
- `lib/services.ts`: public services query, cached about a minute under the `services` tag.
- `lib/booking.ts`: booking slots, Pakistan-time dates and phone validation.
- `lib/pos/`: POS pricing (shared by the screen and the server), staff auth and the manager PIN check.
- `utils/supabase/`: `server.ts` (public, cookie-less), `session.ts` (staff session), `admin.ts` (service role, server-only).
- `proxy.ts`: refreshes staff sessions on `/pos` routes.
- `app/(site)/`: public website (Home, Services, Deals, About, Book, Contact).
- `app/pos/`: staff login and checkout.
