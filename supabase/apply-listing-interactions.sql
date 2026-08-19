create table if not exists public.listing_interactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'contact_click', 'whatsapp_click')),
  created_at timestamptz not null default now()
);

create index if not exists listing_interactions_listing_created_at_idx
on public.listing_interactions (listing_id, created_at desc);

create index if not exists listing_interactions_listing_event_type_idx
on public.listing_interactions (listing_id, event_type);

alter table public.listing_interactions enable row level security;

drop policy if exists "Anyone can record approved listing interactions" on public.listing_interactions;
drop policy if exists "Listing owners and admins can read interactions" on public.listing_interactions;
drop policy if exists "Listing owners, advertiser profile owners and admins can read interactions" on public.listing_interactions;

create policy "Anyone can record approved listing interactions"
on public.listing_interactions
for insert
with check (
  exists (
    select 1
    from public.listings
    where listings.id = listing_interactions.listing_id
    and listings.status = 'approved'
  )
);

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

select 'OK: tabela e politicas de interacoes de anuncios configuradas.' as resultado;
