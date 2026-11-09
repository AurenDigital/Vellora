create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid())
$$;

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile" on public.profiles for update
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and (role = (select public.current_user_role()) or public.current_user_is_admin())
  );

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
