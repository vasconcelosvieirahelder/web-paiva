insert into public.categories (slug, name_pt_br, name_en, name_es, name_ru, name_zh_cn, sort_order)
values
  ('comercio', 'Pontos comerciais', 'Local businesses', 'Locales comerciales', 'Местные заведения', '实体商家', 10),
  ('servicos', 'Serviços presenciais ou virtuais', 'In-person or online services', 'Servicios presenciales o virtuales', 'Услуги очно или онлайн', '线下或线上服务', 20),
  ('produtos', 'Produtos novos e usados', 'New and used products', 'Productos nuevos y usados', 'Новые и подержанные товары', '新旧商品', 30)
on conflict (slug) do update set
  name_pt_br = excluded.name_pt_br,
  name_en = excluded.name_en,
  name_es = excluded.name_es,
  name_ru = excluded.name_ru,
  name_zh_cn = excluded.name_zh_cn,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.cities (slug, name, region, country_code, sort_order)
values
  ('cidade-exemplo', 'Cidade Exemplo', 'Regiao Inicial', 'BR', 10),
  ('regiao-centro', 'Regiao Centro', 'Regiao Inicial', 'BR', 20)
on conflict (slug) do nothing;

insert into public.plans (slug, name, description, price_label, sort_order)
values
  ('manual-basico', 'Plano Basico Manual', 'Plano confirmado manualmente pelo administrador.', 'Cobranca manual', 10)
on conflict (slug) do nothing;
