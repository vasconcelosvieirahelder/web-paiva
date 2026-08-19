import type { Locale } from "@/i18n/config";

export type PublicListing = {
  id: string;
  title: string;
  description: string;
  price_label: string | null;
  category_name: string;
  city_name: string | null;
  image_src: string | null;
  image_alt: string | null;
};

export type ListingContactFields = {
  contact_whatsapp: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_url: string | null;
};

export type ListingContact = {
  displayValue: string;
  label: "WhatsApp" | "Telefone" | "Email" | "Site";
  href: string;
};

export type ListingFilters = {
  query: string;
  category: string;
};

type LocalizableListing = {
  title: string;
  description: string;
  price_label: string | null;
};

const listingTranslations: Record<string, Record<Locale, LocalizableListing>> = {
  "Aula particular e consultoria local": {
    "pt-BR": {
      title: "Aula particular e consultoria local",
      description: "Atendimento regional para moradores que precisam de suporte rápido, comunicação direta e acompanhamento personalizado.",
      price_label: "A combinar",
    },
    en: {
      title: "Private lessons and local consulting",
      description: "Local support for residents who need quick assistance, direct communication, and personalized follow-up.",
      price_label: "By arrangement",
    },
    es: {
      title: "Clases particulares y consultoría local",
      description: "Atención local para residentes que necesitan soporte rápido, comunicación directa y acompañamiento personalizado.",
      price_label: "A convenir",
    },
    ru: {
      title: "Частные уроки и местные консультации",
      description: "Местная поддержка для жителей, которым нужны быстрая помощь, прямое общение и персональное сопровождение.",
      price_label: "По договоренности",
    },
    "zh-CN": {
      title: "私人课程和本地咨询",
      description: "为需要快速支持、直接沟通和个性化跟进的居民提供本地服务。",
      price_label: "价格面议",
    },
  },
  "Beijupirá Paiva": {
    "pt-BR": {
      title: "Beijupirá Paiva",
      description: "Restaurante na Reserva do Paiva com cozinha regional, frutos do mar e pratos autorais. O cardápio público informa localização na galeria Empório Gourmet, contato e horários de funcionamento.",
      price_label: "Consulte o cardápio",
    },
    en: {
      title: "Beijupirá Paiva",
      description: "Restaurant in Reserva do Paiva with regional cuisine, seafood, and signature dishes. The public menu lists its location at Empório Gourmet gallery, contact details, and opening hours.",
      price_label: "See menu",
    },
    es: {
      title: "Beijupirá Paiva",
      description: "Restaurante en Reserva do Paiva con cocina regional, mariscos y platos de autor. El menú público informa ubicación en la galería Empório Gourmet, contacto y horarios.",
      price_label: "Consultar menú",
    },
    ru: {
      title: "Beijupirá Paiva",
      description: "Ресторан в Reserva do Paiva с региональной кухней, морепродуктами и авторскими блюдами. Публичное меню указывает расположение в галерее Empório Gourmet, контакты и часы работы.",
      price_label: "Смотреть меню",
    },
    "zh-CN": {
      title: "Beijupirá Paiva",
      description: "Reserva do Paiva 的餐厅，提供地方菜、海鲜和特色菜。公开菜单列出其在 Empório Gourmet 商区的位置、联系方式和营业时间。",
      price_label: "查看菜单",
    },
  },
  "Empório Paiva": {
    "pt-BR": {
      title: "Empório Paiva",
      description: "Unidade Paiva do Empório, com compras, retirada na loja e conveniência para moradores da região. Fonte pública informa endereço Avenida A, 4616, Paiva, Cabo de Santo Agostinho.",
      price_label: "Compras e retirada",
    },
    en: {
      title: "Empório Paiva",
      description: "Empório's Paiva unit offers shopping, in-store pickup, and convenience for local residents. Public information lists the address as Avenida A, 4616, Paiva, Cabo de Santo Agostinho.",
      price_label: "Shopping and pickup",
    },
    es: {
      title: "Empório Paiva",
      description: "Unidad Paiva de Empório, con compras, retiro en tienda y conveniencia para residentes de la región. La información pública indica Avenida A, 4616, Paiva, Cabo de Santo Agostinho.",
      price_label: "Compras y retiro",
    },
    ru: {
      title: "Empório Paiva",
      description: "Подразделение Empório в Paiva предлагает покупки, самовывоз и удобство для местных жителей. В публичной информации указан адрес: Avenida A, 4616, Paiva, Cabo de Santo Agostinho.",
      price_label: "Покупки и самовывоз",
    },
    "zh-CN": {
      title: "Empório Paiva",
      description: "Empório 的 Paiva 门店为当地居民提供购物、到店取货和便利服务。公开信息显示地址为 Avenida A, 4616, Paiva, Cabo de Santo Agostinho。",
      price_label: "购物和取货",
    },
  },
  "Drogasil Paiva": {
    "pt-BR": {
      title: "Drogasil Paiva",
      description: "Farmácia no Paiva, cadastrada em fonte pública de saúde com endereço na Avenida A, 4616, Loja 01, Paiva, Cabo de Santo Agostinho. Útil para medicamentos, itens de saúde e conveniência.",
      price_label: "Atendimento em loja",
    },
    en: {
      title: "Drogasil Paiva",
      description: "Pharmacy in Paiva, listed in a public health registry at Avenida A, 4616, Store 01, Paiva, Cabo de Santo Agostinho. Useful for medicines, health items, and convenience products.",
      price_label: "In-store service",
    },
    es: {
      title: "Drogasil Paiva",
      description: "Farmacia en Paiva, registrada en una fuente pública de salud con dirección en Avenida A, 4616, Tienda 01, Paiva, Cabo de Santo Agostinho. Útil para medicamentos, artículos de salud y conveniencia.",
      price_label: "Atención en tienda",
    },
    ru: {
      title: "Drogasil Paiva",
      description: "Аптека в Paiva, указанная в публичном реестре здравоохранения по адресу Avenida A, 4616, Loja 01, Paiva, Cabo de Santo Agostinho. Подходит для лекарств, товаров для здоровья и повседневных покупок.",
      price_label: "Обслуживание в магазине",
    },
    "zh-CN": {
      title: "Drogasil Paiva",
      description: "Paiva 的药房，公共健康登记信息显示地址为 Avenida A, 4616, Loja 01, Paiva, Cabo de Santo Agostinho。适合购买药品、健康用品和便利商品。",
      price_label: "到店服务",
    },
  },
  "Colégio Santa Maria Paiva": {
    "pt-BR": {
      title: "Colégio Santa Maria Paiva",
      description: "Serviço educacional listado na página oficial de serviços da Reserva do Paiva, voltado à formação escolar e comunidade local.",
      price_label: "Consultar instituição",
    },
    en: {
      title: "Colégio Santa Maria Paiva",
      description: "Educational service listed on the official Reserva do Paiva services page, focused on school education and the local community.",
      price_label: "Contact institution",
    },
    es: {
      title: "Colégio Santa Maria Paiva",
      description: "Servicio educativo listado en la página oficial de servicios de Reserva do Paiva, enfocado en educación escolar y comunidad local.",
      price_label: "Consultar institución",
    },
    ru: {
      title: "Colégio Santa Maria Paiva",
      description: "Образовательная услуга, указанная на официальной странице сервисов Reserva do Paiva, ориентированная на школьное образование и местное сообщество.",
      price_label: "Связаться с учреждением",
    },
    "zh-CN": {
      title: "Colégio Santa Maria Paiva",
      description: "Reserva do Paiva 官方服务页面列出的教育服务，面向学校教育和本地社区。",
      price_label: "咨询机构",
    },
  },
  "Empório Gourmet Reserva do Paiva": {
    "pt-BR": {
      title: "Empório Gourmet Reserva do Paiva",
      description: "Espaço de conveniência da Reserva do Paiva com mix de lojas e restaurantes. A página oficial cita Drogasil, AmPm SuperStore, Direct, Posto Paiva, Motor Burger, Pizza do Pedaço, Black Japa, Padoca, Mercearia Zymi e Beijupirá.",
      price_label: "Lojas e restaurantes",
    },
    en: {
      title: "Empório Gourmet Reserva do Paiva",
      description: "Convenience area in Reserva do Paiva with a mix of shops and restaurants. The official page mentions Drogasil, AmPm SuperStore, Direct, Posto Paiva, Motor Burger, Pizza do Pedaço, Black Japa, Padoca, Mercearia Zymi, and Beijupirá.",
      price_label: "Shops and restaurants",
    },
    es: {
      title: "Empório Gourmet Reserva do Paiva",
      description: "Espacio de conveniencia en Reserva do Paiva con mezcla de tiendas y restaurantes. La página oficial menciona Drogasil, AmPm SuperStore, Direct, Posto Paiva, Motor Burger, Pizza do Pedaço, Black Japa, Padoca, Mercearia Zymi y Beijupirá.",
      price_label: "Tiendas y restaurantes",
    },
    ru: {
      title: "Empório Gourmet Reserva do Paiva",
      description: "Зона удобства в Reserva do Paiva с магазинами и ресторанами. Официальная страница упоминает Drogasil, AmPm SuperStore, Direct, Posto Paiva, Motor Burger, Pizza do Pedaço, Black Japa, Padoca, Mercearia Zymi и Beijupirá.",
      price_label: "Магазины и рестораны",
    },
    "zh-CN": {
      title: "Empório Gourmet Reserva do Paiva",
      description: "Reserva do Paiva 的便利商业空间，包含多家商店和餐厅。官方页面提到 Drogasil、AmPm SuperStore、Direct、Posto Paiva、Motor Burger、Pizza do Pedaço、Black Japa、Padoca、Mercearia Zymi 和 Beijupirá。",
      price_label: "商店和餐厅",
    },
  },
  "Dra. Eulina Vieira - Acupuntura": {
    "pt-BR": {
      title: "Dra. Eulina Vieira - Acupuntura",
      description: "Atendimento de acupuntura e saúde integrativa para alívio da dor, ansiedade, estresse e apoio ao bem-estar. O material informado apresenta atendimento semanal no Paiva, mais de 18 anos de prática terapêutica, Instagram @acupuntura_aldeia e contato por WhatsApp.",
      price_label: "Agendamento via WhatsApp",
    },
    en: {
      title: "Dr. Eulina Vieira - Acupuncture",
      description: "Acupuncture and integrative health care for pain relief, anxiety, stress, and well-being support. The provided material mentions weekly appointments in Paiva, more than 18 years of therapeutic practice, Instagram @acupuntura_aldeia, and WhatsApp contact.",
      price_label: "Booking via WhatsApp",
    },
    es: {
      title: "Dra. Eulina Vieira - Acupuntura",
      description: "Atención de acupuntura y salud integrativa para aliviar dolor, ansiedad, estrés y apoyar el bienestar. El material informa atención semanal en Paiva, más de 18 años de práctica terapéutica, Instagram @acupuntura_aldeia y contacto por WhatsApp.",
      price_label: "Agenda por WhatsApp",
    },
    ru: {
      title: "Д-р Eulina Vieira - Акупунктура",
      description: "Акупунктура и интегративное здоровье для облегчения боли, тревожности, стресса и поддержки самочувствия. В материалах указаны еженедельные приемы в Paiva, более 18 лет терапевтической практики, Instagram @acupuntura_aldeia и контакт через WhatsApp.",
      price_label: "Запись через WhatsApp",
    },
    "zh-CN": {
      title: "Eulina Vieira 医生 - 针灸",
      description: "针灸和整合健康服务，用于缓解疼痛、焦虑、压力并支持身心健康。材料显示在 Paiva 每周接诊，拥有 18 年以上治疗实践经验，Instagram 为 @acupuntura_aldeia，可通过 WhatsApp 联系。",
      price_label: "通过 WhatsApp 预约",
    },
  },
  "Bicicleta usada em bom estado": {
    "pt-BR": {
      title: "Bicicleta usada em bom estado",
      description: "Exemplo de anúncio para venda direta entre moradores da Reserva do Paiva. Produto usado, conservado, com retirada combinada dentro do Paiva. Esta categoria também pode receber produtos novos ofertados diretamente por moradores ou comerciantes.",
      price_label: "R$ 850",
    },
    en: {
      title: "Used bicycle in good condition",
      description: "Sample listing for direct sales between Reserva do Paiva residents. Used, well-kept item with pickup arranged inside Paiva. This category can also include new products offered directly by residents or local merchants.",
      price_label: "BRL 850",
    },
    es: {
      title: "Bicicleta usada en buen estado",
      description: "Ejemplo de anuncio para venta directa entre residentes de Reserva do Paiva. Producto usado, conservado, con retiro acordado dentro de Paiva. Esta categoría también puede recibir productos nuevos ofrecidos por residentes o comerciantes.",
      price_label: "R$ 850",
    },
    ru: {
      title: "Подержанный велосипед в хорошем состоянии",
      description: "Пример объявления для прямой продажи между жителями Reserva do Paiva. Подержанный товар в хорошем состоянии с самовывозом внутри Paiva. В эту категорию также могут попадать новые товары от жителей или местных продавцов.",
      price_label: "850 BRL",
    },
    "zh-CN": {
      title: "状态良好的二手自行车",
      description: "Reserva do Paiva 居民之间直接交易的示例广告。二手商品，保存良好，可在 Paiva 内约定取货。该类别也可以展示居民或商家直接提供的新商品。",
      price_label: "850 雷亚尔",
    },
  },
  "Seu Doce - Cookies congelados": {
    "pt-BR": {
      title: "Seu Doce - Cookies congelados",
      description: "Cookies congelados para assar em casa no ponto preferido, pensados para quem quer um cookie quentinho na hora. Publicação pública do perfil @seudoce81 informa Aldeia Boulevard e hashtags ligadas a doces artesanais, Aldeia e Reserva do Paiva.",
      price_label: "Consultar disponibilidade",
    },
    en: {
      title: "Seu Doce - Frozen cookies",
      description: "Frozen cookies to bake at home exactly the way you like them, made for anyone who wants a warm cookie on demand. The public post from @seudoce81 mentions Aldeia Boulevard and hashtags related to handmade sweets, Aldeia, and Reserva do Paiva.",
      price_label: "Check availability",
    },
    es: {
      title: "Seu Doce - Cookies congelados",
      description: "Cookies congelados para hornear en casa en el punto preferido, pensados para quien quiere una cookie caliente al momento. La publicación pública de @seudoce81 menciona Aldeia Boulevard y hashtags relacionados con dulces artesanales, Aldeia y Reserva do Paiva.",
      price_label: "Consultar disponibilidad",
    },
    ru: {
      title: "Seu Doce - Замороженное печенье",
      description: "Замороженное печенье, которое можно испечь дома до желаемой степени готовности, для тех, кто хочет теплое печенье в нужный момент. Публичный пост @seudoce81 упоминает Aldeia Boulevard и хэштеги, связанные с авторскими сладостями, Aldeia и Reserva do Paiva.",
      price_label: "Уточнить наличие",
    },
    "zh-CN": {
      title: "Seu Doce - 冷冻曲奇",
      description: "可在家烘烤到自己喜欢口感的冷冻曲奇，适合想随时享用热曲奇的人。@seudoce81 的公开帖子提到 Aldeia Boulevard，以及与手工甜品、Aldeia 和 Reserva do Paiva 相关的标签。",
      price_label: "咨询供应情况",
    },
  },
};

const categoryNameByLocale = {
  "pt-BR": "name_pt_br",
  en: "name_en",
  es: "name_es",
  ru: "name_ru",
  "zh-CN": "name_zh_cn",
} as const satisfies Record<Locale, string>;

const categoryTranslations: Record<string, Record<Locale, string>> = {
  servicos: {
    "pt-BR": "Serviços presenciais ou virtuais",
    en: "In-person or online services",
    es: "Servicios presenciales o virtuales",
    ru: "Услуги очно или онлайн",
    "zh-CN": "线下或线上服务",
  },
  comercio: {
    "pt-BR": "Pontos comerciais",
    en: "Local businesses",
    es: "Locales comerciales",
    ru: "Местные заведения",
    "zh-CN": "实体商家",
  },
  produtos: {
    "pt-BR": "Produtos novos e usados",
    en: "New and used products",
    es: "Productos nuevos y usados",
    ru: "Новые и подержанные товары",
    "zh-CN": "新旧商品",
  },
};

export type LocalizedCategory = Partial<Record<(typeof categoryNameByLocale)[Locale], string | null>> & {
  slug?: string | null;
  name_pt_br: string | null;
};

export function getLocalizedCategoryName(category: LocalizedCategory | null | undefined, locale: Locale, fallback: string) {
  if (!category) {
    return fallback;
  }

  if (category.slug && categoryTranslations[category.slug]) {
    return categoryTranslations[category.slug][locale];
  }

  return category[categoryNameByLocale[locale]] || category.name_pt_br || fallback;
}

export function getLocalizedListingContent(listing: LocalizableListing, locale: Locale): LocalizableListing {
  return listingTranslations[listing.title]?.[locale] ?? listing;
}

export function getLocalizedLocationName(locationName: string | null | undefined, locale: Locale, fallback: string) {
  if (!locationName || locationName === "Cidade Exemplo") {
    return fallback;
  }

  if (locationName === "Reserva do Paiva") {
    return "Reserva do Paiva";
  }

  return locationName;
}

export function getListingSummary(listing: PublicListing, maxLength = 120) {
  const description = listing.description.trim();

  if (description.length <= maxLength) {
    return description;
  }

  const truncated = description.slice(0, Math.max(0, maxLength - 3)).trimEnd();
  const lastSpace = truncated.lastIndexOf(" ");
  const summary = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

  return `${summary}...`;
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function listingMatchesSearch(
  listing: Pick<PublicListing, "title" | "description" | "category_name">,
  query: string,
) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  const normalizedListing = normalizeSearchText(`${listing.title} ${listing.description} ${listing.category_name}`);

  return normalizedQuery.split(" ").every((term) => normalizedListing.includes(term));
}

export function getListingImage(title: string) {
  if (title.toLowerCase().includes("eulina")) {
    return {
      alt: "Material de divulgação da Dra. Eulina Vieira sobre acupuntura",
      src: "/images/eulina-vieira-acupuntura.jpg",
    };
  }

  if (title.toLowerCase().includes("seu doce")) {
    return {
      alt: "Imagem do anúncio de cookies congelados da Seu Doce",
      src: "/images/seu-doce-cookies.webp",
    };
  }

  return null;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function getListingContacts(fields: ListingContactFields): ListingContact[] {
  const contacts: ListingContact[] = [];
  const whatsapp = fields.contact_whatsapp ? digitsOnly(fields.contact_whatsapp) : "";
  const phone = fields.contact_phone ? digitsOnly(fields.contact_phone) : "";
  const email = fields.contact_email?.trim();
  const url = fields.contact_url?.trim();

  if (whatsapp) {
    contacts.push({ displayValue: fields.contact_whatsapp?.trim() ?? whatsapp, label: "WhatsApp", href: `https://wa.me/${whatsapp}` });
  }

  if (phone) {
    contacts.push({ displayValue: fields.contact_phone?.trim() ?? phone, label: "Telefone", href: `tel:${phone}` });
  }

  if (email) {
    contacts.push({ displayValue: email, label: "Email", href: `mailto:${email}` });
  }

  if (url) {
    contacts.push({ displayValue: url, label: "Site", href: url });
  }

  return contacts;
}

function normalizeFilter(value: string | string[] | undefined, maxLength = 80) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return (firstValue ?? "").trim().slice(0, maxLength);
}

export function parseListingFilters(searchParams: {
  q?: string | string[];
  category?: string | string[];
}): ListingFilters {
  return {
    query: normalizeFilter(searchParams.q),
    category: normalizeFilter(searchParams.category),
  };
}

export function hasActiveListingFilters(filters: ListingFilters) {
  return Boolean(filters.query || filters.category);
}
