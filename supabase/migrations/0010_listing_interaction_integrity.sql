alter table public.listing_interactions
add column if not exists visitor_session_id text,
add column if not exists interaction_day date,
add column if not exists actor_user_id uuid references public.profiles(id) on delete set null,
add column if not exists is_owner_or_admin boolean not null default false;

create unique index if not exists listing_interactions_daily_session_unique_idx
on public.listing_interactions (listing_id, event_type, visitor_session_id, interaction_day)
where visitor_session_id is not null and interaction_day is not null;

drop policy if exists "Anyone can record approved listing interactions" on public.listing_interactions;

create or replace function public.record_listing_interaction(
  p_listing_id uuid,
  p_event_type text,
  p_visitor_session_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_listing_owner_id uuid;
  v_counted boolean := false;
  v_is_owner boolean := false;
  v_is_owner_or_admin boolean := false;
begin
  if p_event_type not in ('view', 'contact_click', 'whatsapp_click') then
    return false;
  end if;

  if nullif(trim(p_visitor_session_id), '') is null then
    return false;
  end if;

  select listings.owner_id
  into v_listing_owner_id
  from public.listings
  where listings.id = p_listing_id
  and listings.status = 'approved';

  if v_listing_owner_id is null then
    return false;
  end if;

  v_is_owner := v_actor_user_id is not null and v_listing_owner_id = v_actor_user_id;
  v_is_owner_or_admin := coalesce(v_is_owner, false) or public.is_admin();

  insert into public.listing_interactions (
    listing_id,
    event_type,
    visitor_session_id,
    interaction_day,
    actor_user_id,
    is_owner_or_admin
  )
  values (
    p_listing_id,
    p_event_type,
    p_visitor_session_id,
    (now() at time zone 'utc')::date,
    v_actor_user_id,
    v_is_owner_or_admin
  )
  on conflict (listing_id, event_type, visitor_session_id, interaction_day)
  where visitor_session_id is not null and interaction_day is not null
  do nothing
  returning true into v_counted;

  return coalesce(v_counted, false);
end;
$$;

revoke all on function public.record_listing_interaction(uuid, text, text) from public;
revoke execute on function public.record_listing_interaction(uuid, text, text) from anon;
revoke execute on function public.record_listing_interaction(uuid, text, text) from authenticated;
grant execute on function public.record_listing_interaction(uuid, text, text) to anon;
grant execute on function public.record_listing_interaction(uuid, text, text) to authenticated;
