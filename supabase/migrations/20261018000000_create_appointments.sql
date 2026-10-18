-- Online appointment requests from the website's /book page.
-- Run in the Supabase SQL editor (or `supabase db push`).

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services (id) on delete set null,
  -- Snapshot of the service at booking time, so later menu edits don't change past requests.
  service_name text not null,
  price_display text,
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  customer_phone text not null check (customer_phone ~ '^\+923[0-9]{9}$'),
  appointment_date date not null,
  appointment_time time not null,
  notes text check (notes is null or char_length(notes) <= 500),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  source text not null default 'website',
  created_at timestamptz not null default now()
);

create index if not exists appointments_date_idx
  on public.appointments (appointment_date, appointment_time);

alter table public.appointments enable row level security;

-- The public website may only create new pending requests. It cannot read,
-- update or delete appointments; staff access goes through authenticated roles.
drop policy if exists "Website can create pending appointments" on public.appointments;
create policy "Website can create pending appointments"
  on public.appointments for insert
  to anon
  with check (status = 'pending' and source = 'website');
