create schema if not exists private;

create or replace function private.listing_has_submitted_event(target_listing_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.moderation_events
    where moderation_events.listing_id = target_listing_id
    and moderation_events.action = 'submitted'
  );
$$;

revoke all on function private.listing_has_submitted_event(uuid) from public;
revoke execute on function private.listing_has_submitted_event(uuid) from anon;
grant usage on schema private to authenticated;
grant execute on function private.listing_has_submitted_event(uuid) to authenticated;

create or replace function public.prevent_non_admin_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only administrators can change profile roles.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_non_admin_role_change on public.profiles;

create trigger prevent_non_admin_role_change
before update on public.profiles
for each row
execute function public.prevent_non_admin_role_change();

create or replace function public.enforce_listing_moderation_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.owner_id is distinct from auth.uid()
      or new.status not in ('draft', 'pending_review')
      or new.rejection_reason is not null
      or new.approved_at is not null
      or new.published_at is not null then
      raise exception 'Only administrators can publish or moderate listings.';
    end if;

    if not exists (
      select 1
      from public.advertiser_profiles
      where advertiser_profiles.id = new.advertiser_profile_id
      and advertiser_profiles.owner_id = auth.uid()
      and advertiser_profiles.owner_id = new.owner_id
    ) then
      raise exception 'Only administrators can link listings to another advertiser profile.';
    end if;

    return new;
  end if;

  if old.status <> 'draft'
    or new.status <> 'draft' then
    raise exception 'Only draft listings can be edited by their owner.';
  end if;

  if new.owner_id is distinct from old.owner_id
    or new.advertiser_profile_id is distinct from old.advertiser_profile_id
    or new.status is distinct from old.status
    or new.rejection_reason is distinct from old.rejection_reason
    or new.approved_at is distinct from old.approved_at
    or new.published_at is distinct from old.published_at then
    raise exception 'Only administrators can change listing moderation fields.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_listing_moderation_access on public.listings;

create trigger enforce_listing_moderation_access
before insert or update on public.listings
for each row
execute function public.enforce_listing_moderation_access();

create or replace function public.enforce_advertiser_profile_moderation_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'draft' then
      raise exception 'Only administrators can activate advertiser profiles.';
    end if;

    return new;
  end if;

  if old.status <> 'draft'
    or new.status <> 'draft'
    or old.submitted_at is not null then
    raise exception 'Only unsubmitted draft advertiser profiles can be edited by their owner.';
  end if;

  if new.owner_id is distinct from old.owner_id
    or new.status is distinct from old.status then
    raise exception 'Only administrators can change advertiser profile status.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_advertiser_profile_moderation_access on public.advertiser_profiles;

create trigger enforce_advertiser_profile_moderation_access
before insert or update on public.advertiser_profiles
for each row
execute function public.enforce_advertiser_profile_moderation_access();

drop policy if exists "listing_images_read_approved_or_owner" on public.listing_images;
drop policy if exists "listing_images_owner_all" on public.listing_images;
drop policy if exists "listing_images_owner_insert_before_submission" on public.listing_images;
drop policy if exists "listing_images_owner_update_draft" on public.listing_images;
drop policy if exists "listing_images_owner_delete_draft" on public.listing_images;

create policy "listing_images_read_approved_or_owner"
on public.listing_images
for select
using (
  owner_id = auth.uid()
  or public.is_admin()
  or (
    listing_images.image_kind = 'listing'
    and exists (
      select 1
      from public.listings
      where listings.id = listing_images.listing_id
      and listings.status = 'approved'
    )
  )
);

create policy "listing_images_owner_insert_before_submission"
on public.listing_images
for insert
with check (
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

create policy "listing_images_owner_update_draft"
on public.listing_images
for update
using (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.listings
      where listings.id = listing_images.listing_id
      and listings.owner_id = auth.uid()
      and listings.status = 'draft'
    )
    and not private.listing_has_submitted_event(listing_images.listing_id)
  )
)
with check (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.listings
      where listings.id = listing_images.listing_id
      and listings.owner_id = auth.uid()
      and listings.status = 'draft'
    )
    and not private.listing_has_submitted_event(listing_images.listing_id)
  )
);

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

drop policy if exists "company_assets_owner_insert" on storage.objects;
drop policy if exists "company_assets_owner_insert_draft_profile" on storage.objects;
drop policy if exists "company_assets_owner_delete_draft_profile" on storage.objects;
drop policy if exists "company_assets_admin_delete" on storage.objects;
drop policy if exists "company_assets_owner_update" on storage.objects;
drop policy if exists "company_assets_admin_update" on storage.objects;

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

create policy "company_assets_admin_update"
on storage.objects for update
using (
  bucket_id = 'company-assets'
  and public.is_admin()
)
with check (
  bucket_id = 'company-assets'
  and public.is_admin()
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

drop policy if exists "moderation_events_owner_submit" on public.moderation_events;

create policy "moderation_events_owner_submit"
on public.moderation_events
for insert
with check (
  action = 'submitted'
  and actor_id = auth.uid()
  and exists (
    select 1
    from public.listings
    where listings.id = moderation_events.listing_id
    and listings.owner_id = auth.uid()
    and listings.status = 'pending_review'
  )
);

select 'OK: regras de acesso e privacidade reforcadas.' as resultado;
