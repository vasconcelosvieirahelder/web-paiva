drop policy if exists "company_assets_owner_insert" on storage.objects;
drop policy if exists "company_assets_owner_insert_draft_profile" on storage.objects;
drop policy if exists "company_assets_owner_delete_draft_profile" on storage.objects;
drop policy if exists "company_assets_admin_delete" on storage.objects;

create policy "company_assets_owner_insert_draft_profile"
on storage.objects for insert
with check (
  bucket_id = 'company-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
  and storage.filename(name) ~ '^(logo|operation)-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
  and exists (
    select 1
    from public.advertiser_profiles
    where advertiser_profiles.id::text = (storage.foldername(name))[2]
    and advertiser_profiles.owner_id = auth.uid()
    and advertiser_profiles.status = 'draft'
    and advertiser_profiles.submitted_at is null
  )
);

create policy "company_assets_owner_delete_draft_profile"
on storage.objects for delete
using (
  bucket_id = 'company-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
  and exists (
    select 1
    from public.advertiser_profiles
    where advertiser_profiles.id::text = (storage.foldername(name))[2]
    and advertiser_profiles.owner_id = auth.uid()
    and advertiser_profiles.status = 'draft'
    and advertiser_profiles.submitted_at is null
  )
);

create policy "company_assets_admin_delete"
on storage.objects for delete
using (
  bucket_id = 'company-assets'
  and public.is_admin()
);

drop policy if exists "listing_images_owner_delete_draft" on public.listing_images;

create policy "listing_images_owner_delete_draft"
on public.listing_images
for delete
using (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.listings
      where listings.id = listing_images.listing_id
      and listings.owner_id = auth.uid()
      and listings.status in ('draft', 'pending_review')
    )
    and not private.listing_has_submitted_event(listing_images.listing_id)
  )
);
