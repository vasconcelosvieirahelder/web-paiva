drop policy if exists "Listing owners and admins can read interactions" on public.listing_interactions;

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
