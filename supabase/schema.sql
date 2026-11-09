create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type public.user_role as enum ('customer', 'professional', 'admin');
create type public.appointment_status as enum ('pending', 'confirmed', 'completed', 'canceled', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  owner_name text not null,
  category text not null,
  description text not null default '',
  city text not null,
  address text,
  phone text,
  email text,
  whatsapp text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  constraint stores_coordinates_pair check ((latitude is null) = (longitude is null)),
  image_url text,
  cover_url text,
  instagram text,
  timezone text not null default 'America/Sao_Paulo',
  is_active boolean not null default true,
  featured boolean not null default false,
  rating numeric(2,1) not null default 5.0 check (rating between 1 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  service_id uuid references public.services(id),
  customer_id uuid not null references public.profiles(id),
  customer_name text not null,
  customer_phone text not null,
  appointment_date date not null,
  appointment_time time not null,
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  note text not null default '',
  status public.appointment_status not null default 'pending',
  proposed_date date,
  proposed_time time,
  proposal_message text not null default '',
  proposal_status text not null default 'none' check (
    proposal_status in ('none', 'pending', 'accepted', 'declined')
    and ((proposal_status = 'pending' and proposed_date is not null and proposed_time is not null)
      or proposal_status <> 'pending')
  ),
  created_at timestamptz not null default now(),
  constraint appointments_no_overlapping_booking exclude using gist (
    store_id with =,
    tsrange(
      (appointment_date + appointment_time)::timestamp,
      (appointment_date + appointment_time)::timestamp + make_interval(mins => duration_minutes),
      '[)'
    ) with &&
  ) where (status in ('pending', 'confirmed'))
);

create or replace function public.validate_appointment()
returns trigger language plpgsql set search_path = '' as $$
declare
  service_duration integer;
begin
  if new.appointment_date < current_date and (
    tg_op = 'INSERT'
    or new.appointment_date is distinct from old.appointment_date
    or new.appointment_time is distinct from old.appointment_time
  ) then
    raise exception 'Appointment date must not be in the past';
  end if;
  if new.service_id is not null then
    select duration_minutes into service_duration
    from public.services
    where id = new.service_id and store_id = new.store_id;
    if service_duration is null then
      raise exception 'The selected service is unavailable for this store';
    end if;
    new.duration_minutes := service_duration;
  end if;
  if (tg_op = 'INSERT' or new.store_id is distinct from old.store_id)
    and not exists (select 1 from public.stores where id = new.store_id and is_active) then
    raise exception 'This store is unavailable';
  end if;
  return new;
end;
$$;

create trigger validate_appointment_before_write
  before insert or update on public.appointments
  for each row execute procedure public.validate_appointment();

create table public.store_hours (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time,
  closes_at time,
  break_start time,
  break_end time,
  is_closed boolean not null default false,
  unique (store_id, weekday),
  check (is_closed or (opens_at is not null and closes_at > opens_at)),
  constraint store_hours_break_pair_check check ((break_start is null and break_end is null) or
    (break_start is not null and break_end is not null
      and break_start > opens_at and break_end < closes_at and break_start < break_end))
);

create table public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '',
  check (ends_at > starts_at)
);

create table public.favorites (
  customer_id uuid not null references public.profiles(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, store_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_name text not null default 'Cliente Vellora',
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.service_likes (
  service_id uuid not null references public.services(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (service_id, customer_id)
);

create view public.service_like_counts as
  select service_id, count(*)::integer as like_count
  from public.service_likes
  group by service_id;

revoke all on public.service_like_counts from public;
grant select on public.service_like_counts to anon, authenticated;

create view public.service_reviews with (security_barrier = true) as
  select r.id, r.store_id, r.service_id, s.name as service_name,
    r.reviewer_name, r.rating, r.comment, r.image_urls, r.created_at,
    r.appointment_id
  from public.reviews r
  left join public.services s on s.id = r.service_id;

revoke all on public.service_reviews from public;
grant select on public.service_reviews to anon, authenticated;

create view public.store_review_stats with (security_barrier = true) as
  select store_id, round(avg(rating)::numeric, 1) as rating, count(*)::integer as review_count
  from public.reviews
  group by store_id;

revoke all on public.store_review_stats from public;
grant select on public.store_review_stats to anon, authenticated;

create or replace function public.prepare_service_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  appointment_customer_id uuid;
  appointment_store_id uuid;
  appointment_service_id uuid;
  appointment_status public.appointment_status;
  customer_name text;
begin
  select a.customer_id, a.store_id, a.service_id, a.status, p.full_name
  into appointment_customer_id, appointment_store_id, appointment_service_id, appointment_status, customer_name
  from public.appointments a
  join public.profiles p on p.id = a.customer_id
  where a.id = new.appointment_id;

  if not found
    or appointment_customer_id is distinct from (select auth.uid())
    or appointment_status <> 'completed'
    or appointment_store_id is distinct from new.store_id
    or new.service_id is distinct from appointment_service_id then
    raise exception 'A review requires the customer''s completed appointment';
  end if;

  new.customer_id := appointment_customer_id;
  new.store_id := appointment_store_id;
  new.reviewer_name := coalesce(nullif(trim(customer_name), ''), 'Cliente Vellora');
  return new;
end;
$$;

create trigger prepare_service_review_before_write
  before insert or update on public.reviews
  for each row execute procedure public.prepare_service_review();

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  appointment_id uuid references public.appointments(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null unique references public.stores(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  status text not null default 'active',
  provider_reference text,
  period_ends_at timestamptz,
  created_at timestamptz not null default now()
);

create index stores_active_city_idx on public.stores (is_active, city);
create index services_store_idx on public.services (store_id, is_active);
create index appointments_customer_date_idx on public.appointments (customer_id, appointment_date);
create index appointments_store_date_idx on public.appointments (store_id, appointment_date);
create index reviews_store_idx on public.reviews (store_id, created_at desc);
create index reviews_service_idx on public.reviews (service_id, created_at desc);
create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);

create or replace function public.current_user_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
$$;

create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create or replace function public.prevent_profile_role_escalation()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.role is distinct from old.role
    and not public.current_user_is_admin()
    and current_setting('vellora.allow_role_upgrade', true) is distinct from 'true' then
    raise exception 'Profile roles can only be changed by an authorized workflow';
  end if;
  return new;
end;
$$;

create trigger prevent_profile_role_escalation_before_update
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_escalation();

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop function if exists public.create_store_with_first_service(text, text, text, text, text, text, text, numeric, integer);
drop function if exists public.create_store_with_first_service(text, text, text, text, text, text, text, numeric, integer, text, text, text);

create or replace function public.create_store_with_first_service(
  p_name text,
  p_owner_name text,
  p_category text,
  p_city text,
  p_description text,
  p_image_url text,
  p_service_name text,
  p_service_price numeric,
  p_service_duration integer,
  p_email text default null,
  p_phone text default null,
  p_whatsapp text default null,
  p_address text default null,
  p_latitude double precision default null,
  p_longitude double precision default null
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  new_store_id uuid;
  current_id uuid := auth.uid();
begin
  if current_id is null then
    raise exception 'Authentication required';
  end if;
  if auth.jwt() ->> 'is_anonymous' = 'true' then
    raise exception 'A verified account is required to create a store';
  end if;
  if length(trim(p_name)) not between 2 and 100
    or length(trim(p_owner_name)) not between 2 and 100
    or length(trim(p_category)) not between 2 and 80
    or length(trim(p_city)) not between 2 and 120
    or length(trim(p_service_name)) not between 2 and 120
    or p_service_price < 0
    or p_service_duration not between 5 and 720
    or (p_latitude is null) <> (p_longitude is null)
    or p_latitude not between -90 and 90
    or p_longitude not between -180 and 180 then
    raise exception 'Invalid store or service details';
  end if;
  perform set_config('vellora.allow_role_upgrade', 'true', true);
  update public.profiles
  set role = 'professional', full_name = trim(p_owner_name)
  where id = current_id and role = 'customer';
  perform set_config('vellora.allow_role_upgrade', 'false', true);
  if not found and not exists (select 1 from public.profiles where id = current_id and role in ('professional', 'admin')) then
    raise exception 'A customer profile is required';
  end if;
  insert into public.stores (owner_id, name, owner_name, category, city, address, latitude, longitude, description, image_url, email, phone, whatsapp)
  values (current_id, trim(p_name), trim(p_owner_name), trim(p_category), trim(p_city), nullif(trim(p_address), ''), p_latitude, p_longitude,
    coalesce(p_description, ''), p_image_url, nullif(trim(p_email), ''), nullif(trim(p_phone), ''), nullif(trim(p_whatsapp), ''))
  returning id into new_store_id;
  insert into public.services (store_id, name, description, price, duration_minutes)
  values (new_store_id, trim(p_service_name), '', p_service_price, p_service_duration);
  return new_store_id;
end;
$$;

revoke all on function public.create_store_with_first_service(text, text, text, text, text, text, text, numeric, integer, text, text, text, text, double precision, double precision) from public;
grant execute on function public.create_store_with_first_service(text, text, text, text, text, text, text, numeric, integer, text, text, text, text, double precision, double precision) to authenticated;

create or replace function public.get_store_booked_slots(p_store_id uuid, p_date date)
returns table (appointment_time text, duration_minutes integer)
language sql stable security definer set search_path = '' as $$
  select to_char(a.appointment_time, 'HH24:MI'), a.duration_minutes
  from public.appointments a
  join public.stores s on s.id = a.store_id
  where a.store_id = p_store_id
    and a.appointment_date = p_date
    and a.status in ('pending', 'confirmed')
    and s.is_active
$$;

revoke all on function public.get_store_booked_slots(uuid, date) from public;
grant execute on function public.get_store_booked_slots(uuid, date) to anon, authenticated;

create or replace function public.get_store_blocked_times(p_store_id uuid, p_date date)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select bt.starts_at, bt.ends_at
  from public.blocked_times bt
  join public.stores s on s.id = bt.store_id
  where bt.store_id = p_store_id
    and s.is_active
    and bt.starts_at < ((p_date + 1)::timestamp at time zone s.timezone)
    and bt.ends_at > (p_date::timestamp at time zone s.timezone)
$$;

revoke all on function public.get_store_blocked_times(uuid, date) from public;
grant execute on function public.get_store_blocked_times(uuid, date) to anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.stores enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.store_hours enable row level security;
alter table public.blocked_times enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.service_likes enable row level security;
alter table public.notifications enable row level security;
alter table public.products enable row level security;
alter table public.subscriptions enable row level security;

create policy "Profiles are visible to their owner and admins" on public.profiles for select using (id = (select auth.uid()) or public.current_user_is_admin());
create policy "Users create their own profile" on public.profiles for insert with check (id = (select auth.uid()) and role = 'customer');
create policy "Users update their own profile" on public.profiles for update using (id = (select auth.uid())) with check (id = (select auth.uid()) and (role = (select public.current_user_role()) or public.current_user_is_admin()));
create policy "Categories are public" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Active stores are public" on public.stores for select using (is_active or owner_id = (select auth.uid()) or public.current_user_is_admin());
create policy "Professionals create stores" on public.stores for insert with check (owner_id = (select auth.uid()) and exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('professional', 'admin')));
create policy "Owners manage stores" on public.stores for update using (owner_id = (select auth.uid()) or public.current_user_is_admin()) with check (owner_id = (select auth.uid()) or public.current_user_is_admin());
create policy "Owners delete stores" on public.stores for delete using (owner_id = (select auth.uid()) or public.current_user_is_admin());
create policy "Active services are public" on public.services for select using (is_active or exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin());
create policy "Store owners manage services" on public.services for all using (exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin()) with check (exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin());
create policy "Customers and owners read appointments" on public.appointments for select using (customer_id = (select auth.uid()) or exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin());
create policy "Customers request appointments" on public.appointments for insert with check (
  customer_id = (select auth.uid()) and status = 'pending'
  and exists (select 1 from public.stores where id = store_id and is_active)
  and (service_id is null or exists (select 1 from public.services where id = service_id and store_id = appointments.store_id and is_active))
);
create policy "Store owners and admins manage appointments" on public.appointments for update
  using (exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin())
  with check (exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin());
create policy "Customers cancel own appointments" on public.appointments for update
  using (customer_id = (select auth.uid()) and status in ('pending', 'confirmed'))
  with check (customer_id = (select auth.uid()) and status = 'canceled');
create policy "Store hours are public" on public.store_hours for select using (true);
create policy "Store owners manage hours" on public.store_hours for all using (exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin()) with check (exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin());
create policy "Blocked times are private to owners" on public.blocked_times for all using (exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin()) with check (exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin());
create policy "Users manage their favorites" on public.favorites for all using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()));
create policy "Customers read their own reviews" on public.reviews for select using (customer_id = (select auth.uid()) or public.current_user_is_admin());
create policy "Customers review completed appointments" on public.reviews for insert with check (
  customer_id = (select auth.uid())
  and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true'
  and exists (
    select 1 from public.appointments a
    where a.id = appointment_id
      and a.customer_id = (select auth.uid())
      and a.status = 'completed'
      and a.store_id = reviews.store_id
      and a.service_id is not distinct from reviews.service_id
  )
);
create policy "Customers edit their completed service reviews" on public.reviews for update
  using (customer_id = (select auth.uid())
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true')
  with check (customer_id = (select auth.uid())
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true'
    and exists (
      select 1 from public.appointments a
      where a.id = appointment_id and a.customer_id = (select auth.uid())
        and a.status = 'completed' and a.store_id = reviews.store_id
        and a.service_id is not distinct from reviews.service_id
    ));
create policy "Review owners and admins moderate" on public.reviews for delete using (customer_id = (select auth.uid()) or public.current_user_is_admin());
create policy "Users read their own service likes" on public.service_likes for select using (customer_id = (select auth.uid()));
create policy "Customers like active services" on public.service_likes for insert with check (
  customer_id = (select auth.uid())
  and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true'
  and (select public.current_user_role()) = 'customer'
  and exists (
    select 1 from public.services service
    join public.stores store on store.id = service.store_id
    where service.id = service_id and service.is_active and store.is_active
  )
);
create policy "Customers remove their service likes" on public.service_likes for delete using (customer_id = (select auth.uid()));
create policy "Users read their notifications" on public.notifications for select using (recipient_id = (select auth.uid()));
create policy "Users mark their notifications read" on public.notifications for update using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));
create policy "Active products are public" on public.products for select using (is_active or exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin());
create policy "Store owners manage products" on public.products for all using (exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin()) with check (exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin());
create policy "Subscription owners read their plan" on public.subscriptions for select using (exists (select 1 from public.stores where id = store_id and owner_id = (select auth.uid())) or public.current_user_is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('store-images', 'store-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Store images are publicly readable" on storage.objects for select using (bucket_id = 'store-images');
create policy "Professionals upload their own store images" on storage.objects for insert
  with check (bucket_id = 'store-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Professionals delete their own store images" on storage.objects for delete
  using (bucket_id = 'store-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-images', 'review-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Review images are publicly readable" on storage.objects for select using (bucket_id = 'review-images');
create policy "Customers upload their review images" on storage.objects for insert
  with check (bucket_id = 'review-images' and (storage.foldername(name))[1] = (select auth.uid())::text
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true'
    and (select public.current_user_role()) = 'customer');
create policy "Customers delete their review images" on storage.objects for delete
  using (bucket_id = 'review-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

insert into public.categories (name, slug) values
  ('Manicure e pedicure', 'manicure-e-pedicure'),
  ('Cabeleireiras', 'cabeleireiras'),
  ('Maquiagem', 'maquiagem'),
  ('Design de sobrancelhas', 'design-de-sobrancelhas'),
  ('Extensão de cílios', 'extensao-de-cilios'),
  ('Depilação', 'depilacao'),
  ('Estética facial', 'estetica-facial'),
  ('Massagem', 'massagem'),
  ('Unhas em gel e alongamento', 'unhas-em-gel-e-alongamento'),
  ('Outros serviços de beleza', 'outros-servicos-de-beleza')
on conflict (slug) do nothing;
