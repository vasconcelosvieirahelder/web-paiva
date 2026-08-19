alter table public.advertiser_profiles
  add column if not exists logo_storage_path text,
  add column if not exists operation_photo_storage_path text,
  add column if not exists reference_name text,
  add column if not exists reference_phone text,
  add column if not exists reference_notes text,
  add column if not exists submitted_at timestamptz;

alter table public.listing_images
  add column if not exists image_kind text not null default 'listing';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listing_images_image_kind_check'
  ) then
    alter table public.listing_images
      add constraint listing_images_image_kind_check
      check (image_kind in ('logo', 'operation', 'listing'));
  end if;
end $$;

create index if not exists advertiser_profiles_status_submitted_idx
  on public.advertiser_profiles(status, submitted_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-assets',
  'company-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "company_assets_owner_insert"
on storage.objects for insert
with check (
  bucket_id = 'company-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "company_assets_owner_select"
on storage.objects for select
using (
  bucket_id = 'company-assets'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  )
);

create policy "company_assets_owner_update"
on storage.objects for update
using (
  bucket_id = 'company-assets'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  )
)
with check (
  bucket_id = 'company-assets'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  )
);
