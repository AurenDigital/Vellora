alter table public.stores
  add column if not exists timezone text not null default 'America/Sao_Paulo';

alter table public.store_hours
  add column if not exists break_start time,
  add column if not exists break_end time;

alter table public.store_hours
  drop constraint if exists store_hours_break_pair_check;

alter table public.store_hours
  add constraint store_hours_break_pair_check check (
    (break_start is null and break_end is null)
    or (break_start is not null and break_end is not null
      and break_start > opens_at and break_end < closes_at and break_start < break_end)
  );

alter table public.appointments
  add column if not exists proposed_date date,
  add column if not exists proposed_time time,
  add column if not exists proposal_message text not null default '',
  add column if not exists proposal_status text not null default 'none';

alter table public.appointments
  drop constraint if exists appointments_proposal_status_check;

alter table public.appointments
  add constraint appointments_proposal_status_check check (
    proposal_status in ('none', 'pending', 'accepted', 'declined')
    and ((proposal_status = 'pending' and proposed_date is not null and proposed_time is not null)
      or proposal_status <> 'pending')
  );

alter table public.notifications
  add column if not exists appointment_id uuid references public.appointments(id) on delete cascade;

create or replace function public.get_store_blocked_times(p_store_id uuid, p_date date)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
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

create or replace function public.assert_store_slot_available(
  p_store_id uuid,
  p_date date,
  p_time time,
  p_duration integer,
  p_exclude_appointment_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  schedule public.store_hours%rowtype;
  store_timezone text;
  slot_start timestamp := p_date + p_time;
  slot_end timestamp := p_date + p_time + make_interval(mins => p_duration);
  slot_start_instant timestamptz;
  slot_end_instant timestamptz;
begin
  select s.timezone into store_timezone
  from public.stores s
  where s.id = p_store_id and s.is_active;

  if store_timezone is null then
    raise exception 'This store is unavailable';
  end if;

  select sh.* into schedule
  from public.store_hours sh
  where sh.store_id = p_store_id and sh.weekday = extract(dow from p_date)::smallint;

  if not found then
    raise exception 'The store has not configured availability for this weekday';
  end if;
  if schedule.is_closed then
    raise exception 'The store is not available on the selected weekday';
  end if;

  if schedule.opens_at is null or schedule.closes_at is null
    or p_time < schedule.opens_at
    or slot_end::time > schedule.closes_at
    or slot_end::date > p_date then
    raise exception 'The selected time is outside business hours';
  end if;

  if schedule.break_start is not null
    and slot_start < p_date + schedule.break_end
    and p_date + schedule.break_start < slot_end then
    raise exception 'The selected time overlaps the business break';
  end if;

  slot_start_instant := slot_start at time zone store_timezone;
  slot_end_instant := slot_end at time zone store_timezone;
  if slot_start_instant < now() then
    raise exception 'The selected time must be in the future';
  end if;

  if exists (
    select 1
    from public.blocked_times bt
    where bt.store_id = p_store_id
      and bt.starts_at < slot_end_instant
      and bt.ends_at > slot_start_instant
  ) then
    raise exception 'The selected time is blocked';
  end if;

  if exists (
    select 1
    from public.appointments a
    where a.store_id = p_store_id
      and a.id is distinct from p_exclude_appointment_id
      and a.status in ('pending', 'confirmed')
      and tsrange(
        (a.appointment_date + a.appointment_time)::timestamp,
        (a.appointment_date + a.appointment_time)::timestamp + make_interval(mins => a.duration_minutes),
        '[)'
      ) && tsrange(slot_start, slot_end, '[)')
  ) then
    raise exception 'The selected time is already booked';
  end if;
end;
$$;

revoke all on function public.assert_store_slot_available(uuid, date, time, integer, uuid) from public;

create or replace function public.validate_appointment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  service_duration integer;
begin
  if new.service_id is not null then
    select s.duration_minutes into service_duration
    from public.services s
    where s.id = new.service_id and s.store_id = new.store_id;
    if service_duration is null then
      raise exception 'The selected service is unavailable for this store';
    end if;
    new.duration_minutes := service_duration;
  end if;

  if tg_op = 'INSERT' then
    perform public.assert_store_slot_available(
      new.store_id, new.appointment_date, new.appointment_time, new.duration_minutes, null
    );
  elsif new.store_id is distinct from old.store_id
    or new.appointment_date is distinct from old.appointment_date
    or new.appointment_time is distinct from old.appointment_time
    or new.duration_minutes is distinct from old.duration_minutes then
    perform public.assert_store_slot_available(
      new.store_id, new.appointment_date, new.appointment_time, new.duration_minutes, old.id
    );
  end if;

  return new;
end;
$$;

create or replace function public.propose_appointment_time(
  p_appointment_id uuid,
  p_proposed_date date,
  p_proposed_time time,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  appointment public.appointments%rowtype;
  store_owner uuid;
begin
  select a.* into appointment
  from public.appointments a
  where a.id = p_appointment_id
  for update;

  if not found then
    raise exception 'Appointment not found or not owned by the current professional';
  end if;
  select s.owner_id into store_owner
  from public.stores s
  where s.id = appointment.store_id;
  if store_owner <> auth.uid() then
    raise exception 'Appointment not found or not owned by the current professional';
  end if;
  if appointment.status <> 'pending' or appointment.proposal_status = 'pending' then
    raise exception 'This appointment cannot receive another time proposal';
  end if;
  if length(trim(coalesce(p_message, ''))) not between 1 and 240 then
    raise exception 'Invalid proposed date or message';
  end if;

  perform public.assert_store_slot_available(
    appointment.store_id, p_proposed_date, p_proposed_time, appointment.duration_minutes, appointment.id
  );

  update public.appointments
  set proposed_date = p_proposed_date,
      proposed_time = p_proposed_time,
      proposal_message = trim(p_message),
      proposal_status = 'pending'
  where id = appointment.id;

  insert into public.notifications (recipient_id, appointment_id, kind, title, body)
  values (
    appointment.customer_id, appointment.id, 'reschedule_proposal',
    'A profissional sugeriu outro horário', trim(p_message)
  );
end;
$$;

create or replace function public.respond_to_appointment_proposal(
  p_appointment_id uuid,
  p_accept boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  appointment public.appointments%rowtype;
  store_owner uuid;
begin
  select a.* into appointment
  from public.appointments a
  where a.id = p_appointment_id
  for update;

  if not found then
    raise exception 'Appointment not found or not owned by the current customer';
  end if;
  select s.owner_id into store_owner
  from public.stores s
  where s.id = appointment.store_id;
  if appointment.customer_id <> auth.uid() then
    raise exception 'Appointment not found or not owned by the current customer';
  end if;
  if p_accept is null then
    raise exception 'A response is required for this time proposal';
  end if;
  if appointment.status <> 'pending' or appointment.proposal_status <> 'pending' then
    raise exception 'There is no pending time proposal for this appointment';
  end if;

  if p_accept then
    perform public.assert_store_slot_available(
      appointment.store_id, appointment.proposed_date, appointment.proposed_time,
      appointment.duration_minutes, appointment.id
    );
    update public.appointments
    set appointment_date = proposed_date,
        appointment_time = proposed_time,
        status = 'confirmed',
        proposal_status = 'accepted'
    where id = appointment.id;
  else
    update public.appointments
    set proposal_status = 'declined'
    where id = appointment.id;
  end if;

  insert into public.notifications (recipient_id, appointment_id, kind, title, body)
  values (
    store_owner, appointment.id,
    case when p_accept then 'reschedule_accepted' else 'reschedule_declined' end,
    case when p_accept then 'A cliente aceitou o novo horário' else 'A cliente recusou o novo horário' end,
    case when p_accept
      then to_char(appointment.proposed_date, 'DD/MM/YYYY') || ' às ' || to_char(appointment.proposed_time, 'HH24:MI')
      else appointment.customer_name
    end
  );
end;
$$;

revoke all on function public.propose_appointment_time(uuid, date, time, text) from public;
revoke all on function public.respond_to_appointment_proposal(uuid, boolean) from public;
grant execute on function public.propose_appointment_time(uuid, date, time, text) to authenticated;
grant execute on function public.respond_to_appointment_proposal(uuid, boolean) to authenticated;

create or replace function public.notify_appointment_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  store_owner uuid;
begin
  select s.owner_id into store_owner
  from public.stores s
  where s.id = new.store_id;

  if tg_op = 'INSERT' then
    insert into public.notifications (recipient_id, appointment_id, kind, title, body)
    values (store_owner, new.id, 'new_appointment', 'Novo pedido de agendamento', new.customer_name || ' enviou uma solicitação.');
  elsif new.status is distinct from old.status then
    insert into public.notifications (recipient_id, appointment_id, kind, title, body)
    values (
      new.customer_id, new.id, 'appointment_status',
      case new.status
        when 'confirmed' then 'Agendamento confirmado'
        when 'rejected' then 'Agendamento recusado'
        when 'canceled' then 'Agendamento cancelado'
        when 'completed' then 'Agendamento concluído'
        else 'Agendamento atualizado'
      end,
      to_char(new.appointment_date, 'DD/MM/YYYY') || ' às ' || to_char(new.appointment_time, 'HH24:MI')
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notify_appointment_changes_after_write on public.appointments;
create trigger notify_appointment_changes_after_write
  after insert or update of status on public.appointments
  for each row execute procedure public.notify_appointment_changes();
