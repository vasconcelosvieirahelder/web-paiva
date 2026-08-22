drop policy if exists "company_assets_owner_insert" on storage.objects;
drop policy if exists "company_assets_owner_insert_draft_profile" on storage.objects;
drop policy if exists "company_assets_owner_delete_draft_profile" on storage.objects;
drop policy if exists "company_assets_admin_delete" on storage.objects;

create policy "company_assets_owner_insert_draft_profile"
on storage.objects for insert
with check (
  bucket_id = 'company-assets'
  and array_length(storage.foldername(name), 1) = 2
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
  and array_length(storage.foldername(name), 1) = 2
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

drop policy if exists "listings_owner_delete_before_submission" on public.listings;

create policy "listings_owner_delete_before_submission"
on public.listings
for delete
using (
  owner_id = auth.uid()
  and status in ('draft', 'pending_review')
  and not private.listing_has_submitted_event(listings.id)
  and exists (
    select 1
    from public.advertiser_profiles
    where advertiser_profiles.id = listings.advertiser_profile_id
    and advertiser_profiles.owner_id = auth.uid()
    and advertiser_profiles.status = 'draft'
    and advertiser_profiles.submitted_at is null
  )
);

create or replace function public.submit_company_registration(
  p_advertiser_profile_id uuid,
  p_listing_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected_rows integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to submit company registration.';
  end if;

  update public.advertiser_profiles
  set submitted_at = now()
  where id = p_advertiser_profile_id
  and owner_id = auth.uid()
  and status = 'draft'
  and submitted_at is null;

  get diagnostics affected_rows = row_count;

  if affected_rows <> 1 then
    raise exception 'Company registration profile is not available for submission.';
  end if;

  insert into public.moderation_events (listing_id, actor_id, action, reason)
  select p_listing_id, auth.uid(), 'submitted', 'Cadastro enviado para análise.'
  where exists (
    select 1
    from public.listings
    where listings.id = p_listing_id
    and listings.owner_id = auth.uid()
    and listings.advertiser_profile_id = p_advertiser_profile_id
    and listings.status = 'pending_review'
  );

  get diagnostics affected_rows = row_count;

  if affected_rows <> 1 then
    raise exception 'Company registration listing is not available for submission.';
  end if;
end;
$$;

revoke all on function public.submit_company_registration(uuid, uuid) from public;
revoke execute on function public.submit_company_registration(uuid, uuid) from anon;
grant execute on function public.submit_company_registration(uuid, uuid) to authenticated;
