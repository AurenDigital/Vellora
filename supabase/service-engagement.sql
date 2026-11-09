alter table public.reviews
  add column if not exists service_id uuid references public.services(id) on delete set null,
  add column if not exists reviewer_name text not null default 'Cliente Vellora';

create table if not exists public.service_likes (
  service_id uuid not null references public.services(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (service_id, customer_id)
);

create index if not exists reviews_service_idx
  on public.reviews (service_id, created_at desc);

alter table public.service_likes enable row level security;

update public.reviews r
set service_id = a.service_id,
    reviewer_name = coalesce(nullif(trim(p.full_name), ''), 'Cliente Vellora')
from public.appointments a
join public.profiles p on p.id = a.customer_id
where r.appointment_id = a.id
  and r.customer_id = a.customer_id
  and r.store_id = a.store_id
  and a.status = 'completed'
  and a.service_id is not null
  and (r.service_id is distinct from a.service_id
    or r.reviewer_name = 'Cliente Vellora');

create or replace view public.service_like_counts as
  select service_id, count(*)::integer as like_count
  from public.service_likes
  group by service_id;

revoke all on public.service_like_counts from public;
grant select on public.service_like_counts to anon, authenticated;

create or replace view public.service_reviews with (security_barrier = true) as
  select r.id, r.store_id, r.service_id, s.name as service_name,
    r.reviewer_name, r.rating, r.comment, r.image_urls, r.created_at,
    r.appointment_id
  from public.reviews r
  left join public.services s on s.id = r.service_id;

revoke all on public.service_reviews from public;
grant select on public.service_reviews to anon, authenticated;

drop policy if exists "Reviews are public" on public.reviews;
drop policy if exists "Customers read their own reviews" on public.reviews;
create policy "Customers read their own reviews" on public.reviews
  for select using (customer_id = (select auth.uid()) or public.current_user_is_admin());

drop policy if exists "Customers review completed appointments" on public.reviews;
create policy "Customers review completed appointments" on public.reviews
  for insert with check (
    customer_id = (select auth.uid())
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true'
    and exists (
      select 1
      from public.appointments a
      where a.id = appointment_id
        and a.customer_id = (select auth.uid())
        and a.status = 'completed'
        and a.store_id = reviews.store_id
        and a.service_id is not distinct from reviews.service_id
    )
  );

drop policy if exists "Customers edit their completed service reviews" on public.reviews;
create policy "Customers edit their completed service reviews" on public.reviews
  for update
  using (
    customer_id = (select auth.uid())
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true'
  )
  with check (
    customer_id = (select auth.uid())
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true'
    and exists (
      select 1
      from public.appointments a
      where a.id = appointment_id
        and a.customer_id = (select auth.uid())
        and a.status = 'completed'
        and a.store_id = reviews.store_id
        and a.service_id is not distinct from reviews.service_id
    )
  );

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

drop trigger if exists prepare_service_review_before_insert on public.reviews;
drop trigger if exists prepare_service_review_before_write on public.reviews;
create trigger prepare_service_review_before_write
  before insert or update on public.reviews
  for each row execute procedure public.prepare_service_review();

drop policy if exists "Service likes are public" on public.service_likes;
drop policy if exists "Users read their own service likes" on public.service_likes;
create policy "Users read their own service likes" on public.service_likes
  for select using (customer_id = (select auth.uid()));

drop policy if exists "Customers like active services" on public.service_likes;
create policy "Customers like active services" on public.service_likes
  for insert with check (
    customer_id = (select auth.uid())
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true'
    and (select public.current_user_role()) = 'customer'
    and exists (
      select 1
      from public.services service
      join public.stores store on store.id = service.store_id
      where service.id = service_id and service.is_active and store.is_active
    )
  );

drop policy if exists "Customers remove their service likes" on public.service_likes;
create policy "Customers remove their service likes" on public.service_likes
  for delete using (customer_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-images', 'review-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Review images are publicly readable" on storage.objects;
create policy "Review images are publicly readable" on storage.objects
  for select using (bucket_id = 'review-images');

drop policy if exists "Customers upload their review images" on storage.objects;
create policy "Customers upload their review images" on storage.objects
  for insert with check (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and coalesce((select auth.jwt() ->> 'is_anonymous'), 'false') <> 'true'
    and (select public.current_user_role()) = 'customer'
  );

drop policy if exists "Customers delete their review images" on storage.objects;
create policy "Customers delete their review images" on storage.objects
  for delete using (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

notify pgrst, 'reload schema';
