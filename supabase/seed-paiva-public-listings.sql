do $$
declare
  demo_owner_id uuid;
  paiva_city_id uuid;
  pontos_comerciais_category_id uuid;
  servicos_category_id uuid;
  produtos_category_id uuid;
begin
  select id into demo_owner_id from public.profiles order by created_at asc limit 1;
  select id into pontos_comerciais_category_id from public.categories where slug = 'comercio' limit 1;
  select id into servicos_category_id from public.categories where slug = 'servicos' limit 1;
  select id into produtos_category_id from public.categories where slug = 'produtos' limit 1;

  if demo_owner_id is null then
    raise exception 'Create and confirm at least one auth user before running seed-paiva-public-listings.sql';
  end if;

  insert into public.cities (slug, name, region, country_code, sort_order)
  values ('reserva-do-paiva', 'Reserva do Paiva', 'Cabo de Santo Agostinho', 'BR', 1)
  on conflict (slug) do update set name = excluded.name, region = excluded.region, sort_order = excluded.sort_order;

  select id into paiva_city_id from public.cities where slug = 'reserva-do-paiva' limit 1;

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
    submitted_at
  )
  values
    (
      '10000000-0000-4000-8000-000000000001',
      demo_owner_id,
      'Beijupirá Paiva',
      'Restaurante de culinária regional e frutos do mar localizado na galeria Empório Gourmet, na Reserva do Paiva.',
      paiva_city_id,
      'https://www.beijupira.com.br/restaurante/beijupir%C3%A1--reserva-do-paiva',
      null,
      '(81) 99220-1979',
      'contato@beijupira.com.br',
      'active',
      now()
    ),
    (
      '10000000-0000-4000-8000-000000000002',
      demo_owner_id,
      'Empório Paiva',
      'Mercado e empório com unidade no Paiva, voltado a conveniência, compras e retirada na loja.',
      paiva_city_id,
      'https://www.emporiomuroalto.com.br/loja-03/nossas-lojas',
      '(81) 98221-1029',
      '(81) 98221-1029',
      'delivery@emporiomuroalto.com.br',
      'active',
      now()
    ),
    (
      '10000000-0000-4000-8000-000000000003',
      demo_owner_id,
      'Drogasil Paiva',
      'Farmácia localizada na Avenida A, no Paiva, com atendimento diário conforme cadastro público de estabelecimento de saúde.',
      paiva_city_id,
      'https://www.drogasil.com.br/',
      null,
      null,
      null,
      'active',
      now()
    ),
    (
      '10000000-0000-4000-8000-000000000004',
      demo_owner_id,
      'Colégio Santa Maria Paiva',
      'Unidade educacional citada entre os serviços da Reserva do Paiva.',
      paiva_city_id,
      'https://www.reservadopaiva.com.br/servicos/',
      null,
      null,
      null,
      'active',
      now()
    ),
    (
      '10000000-0000-4000-8000-000000000005',
      demo_owner_id,
      'Empório Gourmet Reserva do Paiva',
      'Centro de conveniência com mix de lojas, restaurantes e serviços para moradores e visitantes da Reserva do Paiva.',
      paiva_city_id,
      'https://www.reservadopaiva.com.br/servicos/',
      null,
      null,
      null,
      'active',
      now()
    ),
    (
      '10000000-0000-4000-8000-000000000006',
      demo_owner_id,
      'Dra. Eulina Vieira',
      'Atendimento de acupuntura e saúde integrativa com prática terapêutica e atendimento semanal no Paiva.',
      paiva_city_id,
      'https://www.instagram.com/acupuntura_aldeia',
      '81982052252',
      '81982052252',
      null,
      'active',
      now()
    ),
    (
      '10000000-0000-4000-8000-000000000007',
      demo_owner_id,
      'Morador Web Paiva',
      'Perfil demonstrativo para venda direta de produtos novos ou usados dentro da Reserva do Paiva.',
      paiva_city_id,
      null,
      '81999990000',
      '81999990000',
      null,
      'active',
      now()
    ),
    (
      '10000000-0000-4000-8000-000000000008',
      demo_owner_id,
      'Seu Doce',
      'Doces artesanais e cookies congelados para assar em casa, com publicação associada ao Aldeia Boulevard e Reserva do Paiva.',
      paiva_city_id,
      'https://www.instagram.com/seudoce81/',
      null,
      null,
      null,
      'active',
      now()
    )
  on conflict (id) do update set
    business_name = excluded.business_name,
    description = excluded.description,
    city_id = excluded.city_id,
    website_url = excluded.website_url,
    whatsapp = excluded.whatsapp,
    phone = excluded.phone,
    email = excluded.email,
    status = excluded.status,
    submitted_at = excluded.submitted_at;

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
    published_at
  )
  values
    (
      '20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001',
      demo_owner_id,
      pontos_comerciais_category_id,
      paiva_city_id,
      'Beijupirá Paiva',
      'Restaurante na Reserva do Paiva com cozinha regional, frutos do mar e pratos autorais. O cardápio público informa localização na galeria Empório Gourmet, contato e horários de funcionamento.',
      'Consulte o cardápio',
      null,
      '(81) 99220-1979',
      'contato@beijupira.com.br',
      'https://www.menudigital.app.br/beijupaiva/',
      'approved',
      now(),
      now()
    ),
    (
      '20000000-0000-4000-8000-000000000002',
      '10000000-0000-4000-8000-000000000002',
      demo_owner_id,
      pontos_comerciais_category_id,
      paiva_city_id,
      'Empório Paiva',
      'Unidade Paiva do Empório, com compras, retirada na loja e conveniência para moradores da região. Fonte pública informa endereço Avenida A, 4616, Paiva, Cabo de Santo Agostinho.',
      'Compras e retirada',
      '(81) 98221-1029',
      '(81) 98221-1029',
      'delivery@emporiomuroalto.com.br',
      'https://www.emporiomuroalto.com.br/loja-03/nossas-lojas',
      'approved',
      now(),
      now()
    ),
    (
      '20000000-0000-4000-8000-000000000003',
      '10000000-0000-4000-8000-000000000003',
      demo_owner_id,
      pontos_comerciais_category_id,
      paiva_city_id,
      'Drogasil Paiva',
      'Farmácia no Paiva, cadastrada em fonte pública de saúde com endereço na Avenida A, 4616, Loja 01, Paiva, Cabo de Santo Agostinho. Útil para medicamentos, itens de saúde e conveniência.',
      'Atendimento em loja',
      null,
      null,
      null,
      'https://www.drogasil.com.br/',
      'approved',
      now(),
      now()
    ),
    (
      '20000000-0000-4000-8000-000000000004',
      '10000000-0000-4000-8000-000000000004',
      demo_owner_id,
      servicos_category_id,
      paiva_city_id,
      'Colégio Santa Maria Paiva',
      'Serviço educacional listado na página oficial de serviços da Reserva do Paiva, voltado à formação escolar e comunidade local.',
      'Consultar instituição',
      null,
      null,
      null,
      'https://www.reservadopaiva.com.br/servicos/',
      'approved',
      now(),
      now()
    ),
    (
      '20000000-0000-4000-8000-000000000005',
      '10000000-0000-4000-8000-000000000005',
      demo_owner_id,
      pontos_comerciais_category_id,
      paiva_city_id,
      'Empório Gourmet Reserva do Paiva',
      'Espaço de conveniência da Reserva do Paiva com mix de lojas e restaurantes. A página oficial cita Drogasil, AmPm SuperStore, Direct, Posto Paiva, Motor Burger, Pizza do Pedaço, Black Japa, Padoca, Mercearia Zymi e Beijupirá.',
      'Lojas e restaurantes',
      null,
      null,
      null,
      'https://www.reservadopaiva.com.br/servicos/',
      'approved',
      now(),
      now()
    ),
    (
      '20000000-0000-4000-8000-000000000006',
      '10000000-0000-4000-8000-000000000006',
      demo_owner_id,
      servicos_category_id,
      paiva_city_id,
      'Dra. Eulina Vieira - Acupuntura',
      'Atendimento de acupuntura e saúde integrativa para alívio da dor, ansiedade, estresse e apoio ao bem-estar. O material informado apresenta atendimento semanal no Paiva, mais de 18 anos de prática terapêutica, Instagram @acupuntura_aldeia e contato por WhatsApp.',
      'Agendamento via WhatsApp',
      '81982052252',
      '81982052252',
      null,
      'https://www.instagram.com/acupuntura_aldeia',
      'approved',
      now(),
      now()
    ),
    (
      '20000000-0000-4000-8000-000000000007',
      '10000000-0000-4000-8000-000000000007',
      demo_owner_id,
      produtos_category_id,
      paiva_city_id,
      'Bicicleta usada em bom estado',
      'Exemplo de anúncio para venda direta entre moradores da Reserva do Paiva. Produto usado, conservado, com retirada combinada dentro do Paiva. Esta categoria também pode receber produtos novos ofertados diretamente por moradores ou comerciantes.',
      'R$ 850',
      '81999990000',
      '81999990000',
      null,
      null,
      'approved',
      now(),
      now()
    ),
    (
      '20000000-0000-4000-8000-000000000008',
      '10000000-0000-4000-8000-000000000008',
      demo_owner_id,
      produtos_category_id,
      paiva_city_id,
      'Seu Doce - Cookies congelados',
      'Cookies congelados para assar em casa no ponto preferido, pensados para quem quer um cookie quentinho na hora. Publicação pública do perfil @seudoce81 informa Aldeia Boulevard e hashtags ligadas a doces artesanais, Aldeia e Reserva do Paiva.',
      'Consultar disponibilidade',
      null,
      null,
      null,
      'https://www.instagram.com/p/DUrCGdUk2i0/',
      'approved',
      now(),
      now()
    )
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
    published_at = excluded.published_at;
end $$;
