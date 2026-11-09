alter table public.stores
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists latitude double precision check (latitude between -90 and 90),
  add column if not exists longitude double precision check (longitude between -180 and 180);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'stores_coordinates_pair'
      and conrelid = 'public.stores'::regclass
  ) then
    alter table public.stores
      add constraint stores_coordinates_pair check ((latitude is null) = (longitude is null));
  end if;
end;
$$;

create or replace view public.store_review_stats with (security_barrier = true) as
  select store_id, round(avg(rating)::numeric, 1) as rating, count(*)::integer as review_count
  from public.reviews
  group by store_id;

revoke all on public.store_review_stats from public;
grant select on public.store_review_stats to anon, authenticated;

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

notify pgrst, 'reload schema';
