-- POS: staff accounts, orders and manager-discount audit trail.
-- Run in the Supabase SQL editor after the appointments migration.
--
-- Security model:
--   * Staff sign in with Supabase Auth. Only users listed in public.staff (and active) can use the POS.
--   * Staff can READ orders through RLS. All WRITES go through the Next.js server using the
--     service-role key, which is where prices are re-checked and the ADMIN_OVERRIDE_PIN is enforced.
--     There are deliberately no insert/update/delete policies, so the browser can't bypass those checks.

create table if not exists public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'cashier' check (role in ('cashier', 'manager', 'owner')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff where user_id = (select auth.uid()) and is_active
  );
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  invoice_no bigint generated always as identity unique,
  staff_id uuid not null references public.staff (user_id),
  customer_name text check (customer_name is null or char_length(customer_name) <= 80),
  customer_phone text,
  payment_method text not null check (payment_method in ('cash', 'card', 'bank_transfer', 'jazzcash', 'easypaisa')),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  discount_type text check (discount_type in ('percent', 'fixed')),
  discount_value numeric(12, 2) not null default 0 check (discount_value >= 0),
  discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  discount_reason text,
  total numeric(12, 2) not null check (total >= 0),
  status text not null default 'paid' check (status in ('paid', 'void')),
  created_at timestamptz not null default now(),
  check (discount_amount <= subtotal),
  check (total = subtotal - discount_amount)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  service_name text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 99),
  line_total numeric(12, 2) not null check (line_total = unit_price * quantity)
);

create table if not exists public.discount_override_attempts (
  id bigint generated always as identity primary key,
  staff_id uuid not null references public.staff (user_id),
  succeeded boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists discount_attempts_staff_idx on public.discount_override_attempts (staff_id, created_at desc);

alter table public.staff enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.discount_override_attempts enable row level security;

drop policy if exists "Staff can read own staff row" on public.staff;
create policy "Staff can read own staff row"
  on public.staff for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Active staff can read orders" on public.orders;
create policy "Active staff can read orders"
  on public.orders for select to authenticated
  using ((select public.is_active_staff()));

drop policy if exists "Active staff can read order items" on public.order_items;
create policy "Active staff can read order items"
  on public.order_items for select to authenticated
  using ((select public.is_active_staff()));
-- discount_override_attempts: no policies, so it is service-role only.

-- Creates an order and its items in one transaction. Called only by the server (service role).
create or replace function public.create_pos_order(p_order jsonb, p_items jsonb)
returns table (id uuid, invoice_no bigint, created_at timestamptz)
language plpgsql
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  insert into public.orders (
    staff_id, customer_name, customer_phone, payment_method, subtotal,
    discount_type, discount_value, discount_amount, discount_reason, total
  ) values (
    (p_order ->> 'staff_id')::uuid,
    nullif(p_order ->> 'customer_name', ''),
    nullif(p_order ->> 'customer_phone', ''),
    p_order ->> 'payment_method',
    (p_order ->> 'subtotal')::numeric,
    nullif(p_order ->> 'discount_type', ''),
    coalesce((p_order ->> 'discount_value')::numeric, 0),
    coalesce((p_order ->> 'discount_amount')::numeric, 0),
    nullif(p_order ->> 'discount_reason', ''),
    (p_order ->> 'total')::numeric
  )
  returning * into v_order;

  insert into public.order_items (order_id, service_id, service_name, unit_price, quantity, line_total)
  select
    v_order.id,
    (item ->> 'service_id')::uuid,
    item ->> 'service_name',
    (item ->> 'unit_price')::numeric,
    (item ->> 'quantity')::integer,
    (item ->> 'unit_price')::numeric * (item ->> 'quantity')::integer
  from jsonb_array_elements(p_items) as item;

  return query select v_order.id, v_order.invoice_no, v_order.created_at;
end;
$$;

revoke all on function public.create_pos_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_pos_order(jsonb, jsonb) to service_role;

-- To add a staff member: create the user in Authentication -> Users, then run e.g.
--   insert into public.staff (user_id, full_name, role)
--   values ('<auth user id>', 'Sana', 'owner');
