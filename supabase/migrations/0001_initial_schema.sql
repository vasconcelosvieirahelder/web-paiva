create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'visitor' check (role in ('visitor', 'advertiser', 'admin')),
  full_name text,
  phone text,
  locale text not null default 'pt-BR' check (locale in ('pt-BR', 'en', 'es', 'ru', 'zh-CN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_pt_br text not null,
  name_en text not null,
  name_es text not null,
  name_ru text not null,
  name_zh_cn text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  region text,
  country_code text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_label text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.advertiser_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  description text,
  city_id uuid references public.cities(id),
  website_url text,
  whatsapp text,
  phone text,
  email text,
  status text not null default 'draft' check (status in ('draft', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  advertiser_profile_id uuid not null references public.advertiser_profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  city_id uuid references public.cities(id),
  title text not null,
  description text not null,
  price_label text,
  contact_whatsapp text,
  contact_phone text,
  contact_email text,
  contact_url text,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'approved', 'rejected', 'suspended', 'archived')),
  rejection_reason text,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.advertiser_plan_assignments (
  id uuid primary key default gen_random_uuid(),
  advertiser_profile_id uuid not null references public.advertiser_profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'cancelled')),
  starts_at date,
  ends_at date,
  notes text,
  confirmed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  actor_id uuid not null references public.profiles(id),
  action text not null check (action in ('submitted', 'approved', 'rejected', 'suspended', 'archived', 'restored')),
  reason text,
  created_at timestamptz not null default now()
);

create index listings_status_published_at_idx on public.listings(status, published_at desc);
create index listings_category_status_idx on public.listings(category_id, status);
create index listings_city_status_idx on public.listings(city_id, status);
create index listings_owner_idx on public.listings(owner_id);
create index listings_advertiser_profile_idx on public.listings(advertiser_profile_id);
create index listing_images_listing_sort_idx on public.listing_images(listing_id, sort_order);
create index advertiser_profiles_owner_idx on public.advertiser_profiles(owner_id);
create index advertiser_plan_assignments_profile_status_idx on public.advertiser_plan_assignments(advertiser_profile_id, status);
create index moderation_events_listing_created_idx on public.moderation_events(listing_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.cities enable row level security;
alter table public.plans enable row level security;
alter table public.advertiser_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.advertiser_plan_assignments enable row level security;
alter table public.moderation_events enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy "categories_select_active" on public.categories for select using (is_active = true or public.is_admin());
create policy "categories_admin_all" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "cities_select_active" on public.cities for select using (is_active = true or public.is_admin());
create policy "cities_admin_all" on public.cities for all using (public.is_admin()) with check (public.is_admin());

create policy "plans_select_active" on public.plans for select using (is_active = true or public.is_admin());
create policy "plans_admin_all" on public.plans for all using (public.is_admin()) with check (public.is_admin());

create policy "advertiser_profiles_owner_or_admin" on public.advertiser_profiles for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

create policy "listings_public_approved" on public.listings for select using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy "listings_owner_insert" on public.listings for insert with check (owner_id = auth.uid() or public.is_admin());
create policy "listings_owner_update" on public.listings for update using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

create policy "listing_images_read_approved_or_owner" on public.listing_images for select using (
  owner_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
    and listings.status = 'approved'
  )
);
create policy "listing_images_owner_all" on public.listing_images for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

create policy "plan_assignments_owner_or_admin" on public.advertiser_plan_assignments for select using (
  public.is_admin()
  or exists (
    select 1 from public.advertiser_profiles
    where advertiser_profiles.id = advertiser_plan_assignments.advertiser_profile_id
    and advertiser_profiles.owner_id = auth.uid()
  )
);
create policy "plan_assignments_admin_all" on public.advertiser_plan_assignments for all using (public.is_admin()) with check (public.is_admin());

create policy "moderation_events_owner_or_admin" on public.moderation_events for select using (
  public.is_admin()
  or exists (
    select 1 from public.listings
    where listings.id = moderation_events.listing_id
    and listings.owner_id = auth.uid()
  )
);
create policy "moderation_events_admin_insert" on public.moderation_events for insert with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

