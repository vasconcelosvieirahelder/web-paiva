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
