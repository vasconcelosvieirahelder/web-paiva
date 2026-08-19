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
    if new.status not in ('draft', 'pending_review')
      or new.rejection_reason is not null
      or new.approved_at is not null
      or new.published_at is not null then
      raise exception 'Only administrators can publish or moderate listings.';
    end if;

    return new;
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
