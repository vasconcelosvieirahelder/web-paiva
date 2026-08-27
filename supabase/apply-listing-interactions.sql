create table if not exists public.listing_interactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'contact_click', 'whatsapp_click')),
  created_at timestamptz not null default now(),
  visitor_session_id text,
  interaction_day date,
  actor_user_id uuid references public.profiles(id) on delete set null,
  is_owner_or_admin boolean not null default false
);

alter table public.listing_interactions
add column if not exists visitor_session_id text,
add column if not exists interaction_day date,
add column if not exists actor_user_id uuid references public.profiles(id) on delete set null,
add column if not exists is_owner_or_admin boolean not null default false;

create index if not exists listing_interactions_listing_created_at_idx
on public.listing_interactions (listing_id, created_at desc);

create index if not exists listing_interactions_listing_event_type_idx
on public.listing_interactions (listing_id, event_type);

create unique index if not exists listing_interactions_daily_session_unique_idx
on public.listing_interactions (listing_id, event_type, visitor_session_id, interaction_day)
where visitor_session_id is not null and interaction_day is not null;

alter table public.listing_interactions enable row level security;

drop policy if exists "Anyone can record approved listing interactions" on public.listing_interactions;
drop policy if exists "Listing owners and admins can read interactions" on public.listing_interactions;
drop policy if exists "Listing owners, advertiser profile owners and admins can read interactions" on public.listing_interactions;

create policy "Listing owners, advertiser profile owners and admins can read interactions"
on public.listing_interactions
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.listings
    where listings.id = listing_interactions.listing_id
    and (
      listings.owner_id = auth.uid()
      or exists (
        select 1
        from public.advertiser_profiles
        where advertiser_profiles.id = listings.advertiser_profile_id
        and advertiser_profiles.owner_id = auth.uid()
      )
    )
  )
);

create or replace function public.record_listing_interaction(
  p_listing_id uuid,
  p_event_type text,
  p_visitor_session_id text,
  p_actor_user_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_listing_owner_id uuid;
  v_counted boolean := false;
  v_is_owner boolean := false;
  v_is_admin boolean := false;
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

  v_is_owner := p_actor_user_id is not null and v_listing_owner_id = p_actor_user_id;
  select exists (
    select 1
    from public.profiles
    where profiles.id = p_actor_user_id
    and profiles.role = 'admin'
  )
  into v_is_admin;
  v_is_owner_or_admin := coalesce(v_is_owner, false) or coalesce(v_is_admin, false);

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
    p_actor_user_id,
    v_is_owner_or_admin
  )
  on conflict (listing_id, event_type, visitor_session_id, interaction_day)
  where visitor_session_id is not null and interaction_day is not null
  do nothing
  returning true into v_counted;

  return coalesce(v_counted, false);
end;
$$;

revoke all on function public.record_listing_interaction(uuid, text, text, uuid) from public;
revoke execute on function public.record_listing_interaction(uuid, text, text, uuid) from anon;
revoke execute on function public.record_listing_interaction(uuid, text, text, uuid) from authenticated;
grant execute on function public.record_listing_interaction(uuid, text, text, uuid) to service_role;

select 'OK: tabela e politicas de interacoes de anuncios configuradas.' as resultado;
