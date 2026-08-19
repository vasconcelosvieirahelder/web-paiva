do $$
declare
  demo_profile_id uuid;
  demo_advertiser_id uuid := '00000000-0000-0000-0000-000000000201';
  demo_category_id uuid;
  demo_city_id uuid;
begin
  select id into demo_profile_id from public.profiles order by created_at asc limit 1;
  select id into demo_category_id from public.categories where slug = 'servicos' limit 1;
  select id into demo_city_id from public.cities where slug = 'cidade-exemplo' limit 1;

  if demo_profile_id is null then
    raise exception 'Create and confirm at least one auth user before running seed-public-listings.sql';
  end if;

  insert into public.advertiser_profiles (id, owner_id, business_name, description, city_id, phone, email, status)
  values (
    demo_advertiser_id,
    demo_profile_id,
    'Servicos Demo Regional',
    'Perfil comercial de demonstracao para testar a listagem publica.',
    demo_city_id,
    '(00) 0000-0000',
    'demo@example.test',
    'active'
  )
  on conflict (id) do update set business_name = excluded.business_name, status = excluded.status;

  insert into public.listings (
    advertiser_profile_id,
    owner_id,
    category_id,
    city_id,
    title,
    description,
    price_label,
    contact_phone,
    contact_email,
    status,
    approved_at,
    published_at
  )
  values (
    demo_advertiser_id,
    demo_profile_id,
    demo_category_id,
    demo_city_id,
    'Aula particular e consultoria local',
    'Atendimento regional para moradores que precisam de suporte rapido, comunicacao direta e acompanhamento personalizado.',
    'A combinar',
    '(00) 0000-0000',
    'demo@example.test',
    'approved',
    now(),
    now()
  );
end $$;
