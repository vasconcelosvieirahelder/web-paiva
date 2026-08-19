drop table if exists temp_nessa_seed_user;

create temporary table temp_nessa_seed_user as
select id
from auth.users
where lower(email) = lower('nessa22mc@gmail.com')
limit 1;

insert into public.profiles (id, role, full_name, locale)
select id, 'advertiser', 'Nessa MC', 'pt-BR'
from temp_nessa_seed_user
on conflict (id) do update set
  role = case
    when public.profiles.role = 'admin' then public.profiles.role
    else 'advertiser'
  end,
  full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
  updated_at = now();

insert into public.cities (slug, name, region, country_code, sort_order)
values ('reserva-do-paiva', 'Reserva do Paiva', 'Cabo de Santo Agostinho', 'BR', 1)
on conflict (slug) do update set
  name = excluded.name,
  region = excluded.region,
  country_code = excluded.country_code,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

insert into public.categories (slug, name_pt_br, name_en, name_es, name_ru, name_zh_cn, sort_order)
values
  (
    'servicos',
    'Serviços presenciais ou virtuais',
    'In-person or online services',
    'Servicios presenciales o virtuales',
    'Услуги очно или онлайн',
    '线下或线上服务',
    20
  )
on conflict (slug) do update set
  name_pt_br = excluded.name_pt_br,
  name_en = excluded.name_en,
  name_es = excluded.name_es,
  name_ru = excluded.name_ru,
  name_zh_cn = excluded.name_zh_cn,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

insert into public.advertiser_profiles (
  id,
  owner_id,
  business_name,
  description,
  city_id,
  website_url,
  whatsapp,
  phone,
  email,
  status,
  submitted_at,
  created_at,
  updated_at
)
select
  '10000000-0000-4000-8000-000000000022',
  temp_nessa_seed_user.id,
  'Nessa MC - Serviço demonstrativo',
  'Perfil demonstrativo vinculado à conta nessa22mc@gmail.com para testar o acompanhamento de visualizações e cliques no painel do anunciante.',
  cities.id,
  'https://www.instagram.com/',
  '81999992222',
  '81999992222',
  'nessa22mc@gmail.com',
  'active',
  now(),
  now(),
  now()
from temp_nessa_seed_user
cross join public.cities
where cities.slug = 'reserva-do-paiva'
on conflict (id) do update set
  owner_id = excluded.owner_id,
  business_name = excluded.business_name,
  description = excluded.description,
  city_id = excluded.city_id,
  website_url = excluded.website_url,
  whatsapp = excluded.whatsapp,
  phone = excluded.phone,
  email = excluded.email,
  status = excluded.status,
  submitted_at = excluded.submitted_at,
  updated_at = now();

insert into public.listings (
  id,
  advertiser_profile_id,
  owner_id,
  category_id,
  city_id,
  title,
  description,
  price_label,
  contact_whatsapp,
  contact_phone,
  contact_email,
  contact_url,
  status,
  approved_at,
  published_at,
  created_at,
  updated_at
)
select
  '20000000-0000-4000-8000-000000000022',
  '10000000-0000-4000-8000-000000000022',
  temp_nessa_seed_user.id,
  categories.id,
  cities.id,
  'Nessa MC - Anúncio demonstrativo',
  'Anúncio aprovado criado para validar o painel da anunciante Nessa. Ao abrir este anúncio, clicar em Mostrar contatos ou acessar o WhatsApp, os contadores de interação devem aparecer no dashboard da conta nessa22mc@gmail.com.',
  'Teste de interações',
  '81999992222',
  '81999992222',
  'nessa22mc@gmail.com',
  'https://www.instagram.com/',
  'approved',
  now(),
  now(),
  now(),
  now()
from temp_nessa_seed_user
cross join public.categories
cross join public.cities
where categories.slug = 'servicos'
  and cities.slug = 'reserva-do-paiva'
on conflict (id) do update set
  advertiser_profile_id = excluded.advertiser_profile_id,
  owner_id = excluded.owner_id,
  category_id = excluded.category_id,
  city_id = excluded.city_id,
  title = excluded.title,
  description = excluded.description,
  price_label = excluded.price_label,
  contact_whatsapp = excluded.contact_whatsapp,
  contact_phone = excluded.contact_phone,
  contact_email = excluded.contact_email,
  contact_url = excluded.contact_url,
  status = excluded.status,
  approved_at = excluded.approved_at,
  published_at = excluded.published_at,
  updated_at = now();

select
  case
    when exists (select 1 from temp_nessa_seed_user) then 'OK: anúncio demonstrativo criado/atualizado para nessa22mc@gmail.com'
    else 'ATENÇÃO: usuário nessa22mc@gmail.com não encontrado em Authentication > Users'
  end as resultado;

select
  users.email as email_da_conta,
  profiles.role as perfil,
  listings.id as anuncio_id,
  listings.title as anuncio,
  listings.status as status,
  listings.owner_id as dono_do_anuncio
from public.listings
join auth.users as users on users.id = listings.owner_id
left join public.profiles as profiles on profiles.id = users.id
where listings.id = '20000000-0000-4000-8000-000000000022';
