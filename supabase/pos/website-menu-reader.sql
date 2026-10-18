-- Website menu reader for the POS app's database (github.com/Logicman23/saloon).
--
-- Run this in the Supabase SQL editor of the POS project, NOT this website's project.
-- It creates a login, `website_menu`, that can read ONLY the active, non-archived
-- services and packages. It cannot see clients, invoices, users or anything else,
-- and it cannot write. Safe to re-run (to change the password, edit it below and run again).
--
-- 1. Replace CHANGE_ME_TO_A_LONG_RANDOM_PASSWORD with a long random password
--    (letters and digits only, so it needs no escaping in the connection URL).
-- 2. Run the whole script.
-- 3. In Vercel -> sanasaloon -> Settings -> Environment Variables, add MENU_DATABASE_URL:
--      postgresql://website_menu.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
--    [PROJECT-REF] and [REGION] are in the POS project's Connect -> Transaction pooler string.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'website_menu') then
    create role website_menu login password 'CHANGE_ME_TO_A_LONG_RANDOM_PASSWORD';
  else
    alter role website_menu with login password 'CHANGE_ME_TO_A_LONG_RANDOM_PASSWORD';
  end if;
end $$;

alter role website_menu set statement_timeout = '5s';

grant usage on schema public to website_menu;

-- Only the menu columns. Prices and descriptions are public on the website anyway.
grant select (id, title, category, duration_mins, price, description, active, archived_at)
  on public.services to website_menu;
grant select (id, name, description, price, active, archived_at)
  on public.service_packages to website_menu;
grant select (package_id, service_id)
  on public.package_services to website_menu;

-- RLS is already on for these tables (the POS hardening step). These policies let the
-- website role see live menu rows only. The POS app's own connection is unaffected.
drop policy if exists "website_menu reads live services" on public.services;
create policy "website_menu reads live services"
  on public.services for select to website_menu
  using (active and archived_at is null);

drop policy if exists "website_menu reads live packages" on public.service_packages;
create policy "website_menu reads live packages"
  on public.service_packages for select to website_menu
  using (active and archived_at is null);

drop policy if exists "website_menu reads package contents" on public.package_services;
create policy "website_menu reads package contents"
  on public.package_services for select to website_menu
  using (true);
