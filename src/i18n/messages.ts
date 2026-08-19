import type { Locale } from "./config";

export type Messages = {
  appName: string;
  tagline: string;
  intro: string;
  searchPlaceholder: string;
  city: string;
  category: string;
  search: string;
  weather: string;
  signIn: string;
  signUp: string;
  signOut: string;
  advertise: string;
  dashboard: string;
  foundationNotice: string;
  publicExperienceNotice: string;
  password: string;
  confirmPassword: string;
  passwordHint: string;
  passwordMismatchError: string;
  authHelp: string;
  authError: string;
  authLockedError: string;
  invalidEmailError: string;
  shortPasswordError: string;
  signupNeedsConfirmation: string;
  emailRateLimitError: string;
  invalidEmailDomainError: string;
  userEmail: string;
  userRole: string;
  profileMissing: string;
  advertiserIntentTitle: string;
  advertiserIntentIntro: string;
  advertiserIntentCta: string;
  advertiserIntentPendingTitle: string;
  advertiserIntentPendingBody: string;
  advertiserIntentReadyTitle: string;
  advertiserIntentReadyBody: string;
  backToDashboard: string;
  latestListings: string;
  emptyListingsTitle: string;
  emptyListingsBody: string;
  noFilteredListingsTitle: string;
  noFilteredListingsBody: string;
  clearFilters: string;
  listingLocationFallback: string;
  listingPriceFallback: string;
  viewListing: string;
  listingDetails: string;
  contactAdvertiser: string;
  showContacts: string;
  noPublicContacts: string;
  backToListings: string;
};

export const messages: Record<Locale, Messages> = {
  "pt-BR": {
    appName: "Web Paiva",
    tagline: "Tudo o que você procura ou quer mostrar na Reserva do Paiva.",
    intro: "Encontre serviços, produtos e comércios dentro da Reserva do Paiva.",
    searchPlaceholder: "O que você procura?",
    city: "Cidade",
    category: "Categoria",
    search: "Buscar",
    weather: "Previsão do tempo",
    signIn: "Entrar",
    signUp: "Criar conta",
    signOut: "Sair",
    advertise: "Cadastrar anúncio",
    dashboard: "Meu painel",
    foundationNotice: "Release 0: fundação técnica em construção.",
    publicExperienceNotice: "Anúncios locais aprovados por moderação humana.",
    password: "Senha",
    confirmPassword: "Confirmar senha",
    passwordHint: "Use pelo menos 6 caracteres.",
    passwordMismatchError: "A confirmação de senha precisa ser igual à senha.",
    authHelp: "Use e-mail e senha para entrar ou criar uma conta de anunciante.",
    authError: "E-mail ou senha inválidos. Verifique também se o e-mail foi confirmado.",
    authLockedError: "Muitas tentativas de senha foram feitas. Aguarde 15 minutos antes de tentar novamente.",
    invalidEmailError: "Informe um e-mail válido.",
    shortPasswordError: "A senha precisa ter pelo menos 6 caracteres.",
    signupNeedsConfirmation: "Conta criada. Se o Supabase pedir confirmação, verifique seu e-mail antes de entrar.",
    emailRateLimitError:
      "O Supabase atingiu o limite temporário de envio de e-mails. Aguarde alguns minutos ou desative a confirmação de e-mail durante os testes.",
    invalidEmailDomainError: "O Supabase recusou esse domínio de e-mail. Use um e-mail de teste com domínio real.",
    userEmail: "E-mail autenticado",
    userRole: "Perfil atual",
    profileMissing: "Perfil ainda não encontrado. Se você acabou de confirmar o e-mail, saia e entre novamente.",
    advertiserIntentTitle: "Quero ser anunciante",
    advertiserIntentIntro: "Este espaço prepara sua conta para a área do anunciante nas próximas releases.",
    advertiserIntentCta: "Quero ser anunciante",
    advertiserIntentPendingTitle: "Solicitação ainda manual",
    advertiserIntentPendingBody:
      "Nesta fase, a mudança para anunciante será feita manualmente pelo administrador. Ainda não criamos anúncios nem perfis comerciais por aqui.",
    advertiserIntentReadyTitle: "Conta preparada para anunciante",
    advertiserIntentReadyBody:
      "Seu perfil já tem permissão para a futura área do anunciante. O cadastro e a gestão de anúncios entram somente na Release 2.",
    backToDashboard: "Voltar ao painel",
    latestListings: "Anúncios aprovados",
    emptyListingsTitle: "Ainda não há anúncios aprovados",
    emptyListingsBody: "Assim que a moderação publicar os primeiros anúncios, eles aparecerão aqui.",
    noFilteredListingsTitle: "Nenhum resultado para estes filtros",
    noFilteredListingsBody: "Tente remover algum filtro ou buscar por outro termo.",
    clearFilters: "Limpar filtros",
    listingLocationFallback: "Região não informada",
    listingPriceFallback: "Valor não informado",
    viewListing: "Ver detalhes",
    listingDetails: "Detalhes do anúncio",
    contactAdvertiser: "Contatar anunciante",
    showContacts: "Mostrar contatos",
    noPublicContacts: "Este anunciante ainda não informou contatos públicos.",
    backToListings: "Voltar aos anúncios",
  },
  en: {
    appName: "Web Paiva",
    tagline: "Everything you are looking for or want to showcase in Reserva do Paiva.",
    intro: "Find services, products, and local businesses inside Reserva do Paiva.",
    searchPlaceholder: "What are you looking for?",
    city: "City",
    category: "Category",
    search: "Search",
    weather: "Weather",
    signIn: "Sign in",
    signUp: "Create account",
    signOut: "Sign out",
    advertise: "Create listing",
    dashboard: "My dashboard",
    foundationNotice: "Release 0: technical foundation in progress.",
    publicExperienceNotice: "Local listings approved by human moderation.",
    password: "Password",
    confirmPassword: "Confirm password",
    passwordHint: "Use at least 6 characters.",
    passwordMismatchError: "Password confirmation must match the password.",
    authHelp: "Use email and password to sign in or create an advertiser account.",
    authError: "Invalid email or password. Also check whether the email has been confirmed.",
    authLockedError: "Too many password attempts were made. Wait 15 minutes before trying again.",
    invalidEmailError: "Enter a valid email address.",
    shortPasswordError: "Password must have at least 6 characters.",
    signupNeedsConfirmation: "Account created. If Supabase requires confirmation, check your email before signing in.",
    emailRateLimitError:
      "Supabase reached the temporary email sending limit. Wait a few minutes or disable email confirmation during tests.",
    invalidEmailDomainError: "Supabase rejected this email domain. Use a test email with a real domain.",
    userEmail: "Authenticated email",
    userRole: "Current profile",
    profileMissing: "Profile not found yet. If you just confirmed your email, sign out and sign in again.",
    advertiserIntentTitle: "I want to advertise",
    advertiserIntentIntro: "This area prepares your account for the advertiser workspace in future releases.",
    advertiserIntentCta: "I want to advertise",
    advertiserIntentPendingTitle: "Manual request for now",
    advertiserIntentPendingBody:
      "At this stage, changing to advertiser is handled manually by an administrator. Listings and business profiles are not created here yet.",
    advertiserIntentReadyTitle: "Account ready for advertiser access",
    advertiserIntentReadyBody:
      "Your profile already has access to the future advertiser area. Listing creation and management start only in Release 2.",
    backToDashboard: "Back to dashboard",
    latestListings: "Approved listings",
    emptyListingsTitle: "No approved listings yet",
    emptyListingsBody: "Once moderation publishes the first listings, they will appear here.",
    noFilteredListingsTitle: "No results for these filters",
    noFilteredListingsBody: "Try removing a filter or searching for another term.",
    clearFilters: "Clear filters",
    listingLocationFallback: "Region not provided",
    listingPriceFallback: "Price not provided",
    viewListing: "View details",
    listingDetails: "Listing details",
    contactAdvertiser: "Contact advertiser",
    showContacts: "Show contacts",
    noPublicContacts: "This advertiser has not provided public contacts yet.",
    backToListings: "Back to listings",
  },
  es: {
    appName: "Web Paiva",
    tagline: "Todo lo que buscas o quieres mostrar en Reserva do Paiva.",
    intro: "Encuentra servicios, productos y comercios dentro de Reserva do Paiva.",
    searchPlaceholder: "¿Qué estás buscando?",
    city: "Ciudad",
    category: "Categoría",
    search: "Buscar",
    weather: "Clima",
    signIn: "Entrar",
    signUp: "Crear cuenta",
    signOut: "Salir",
    advertise: "Crear anuncio",
    dashboard: "Mi panel",
    foundationNotice: "Release 0: base técnica en construcción.",
    publicExperienceNotice: "Anuncios locales aprobados por moderación humana.",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    passwordHint: "Usa al menos 6 caracteres.",
    passwordMismatchError: "La confirmación debe ser igual a la contraseña.",
    authHelp: "Usa email y contraseña para entrar o crear una cuenta de anunciante.",
    authError: "Email o contraseña inválidos. Verifica también si el email fue confirmado.",
    authLockedError: "Se hicieron demasiados intentos de contraseña. Espera 15 minutos antes de intentarlo de nuevo.",
    invalidEmailError: "Ingresa un email válido.",
    shortPasswordError: "La contraseña debe tener al menos 6 caracteres.",
    signupNeedsConfirmation: "Cuenta creada. Si Supabase solicita confirmación, revisa tu email antes de entrar.",
    emailRateLimitError:
      "Supabase alcanzó el límite temporal de envío de emails. Espera unos minutos o desactiva la confirmación por email durante las pruebas.",
    invalidEmailDomainError: "Supabase rechazó este dominio de email. Usa un email de prueba con un dominio real.",
    userEmail: "Email autenticado",
    userRole: "Perfil actual",
    profileMissing: "Perfil aún no encontrado. Si acabas de confirmar el email, sal y vuelve a entrar.",
    advertiserIntentTitle: "Quiero ser anunciante",
    advertiserIntentIntro: "Este espacio prepara tu cuenta para el área de anunciante en próximas releases.",
    advertiserIntentCta: "Quiero ser anunciante",
    advertiserIntentPendingTitle: "Solicitud aún manual",
    advertiserIntentPendingBody:
      "En esta fase, el cambio a anunciante será realizado manualmente por el administrador. Aquí aún no creamos anuncios ni perfiles comerciales.",
    advertiserIntentReadyTitle: "Cuenta preparada para anunciante",
    advertiserIntentReadyBody:
      "Tu perfil ya tiene permiso para la futura área de anunciante. La creación y gestión de anuncios empieza solo en la Release 2.",
    backToDashboard: "Volver al panel",
    latestListings: "Anuncios aprobados",
    emptyListingsTitle: "Aún no hay anuncios aprobados",
    emptyListingsBody: "Cuando la moderación publique los primeros anuncios, aparecerán aquí.",
    noFilteredListingsTitle: "Ningún resultado para estos filtros",
    noFilteredListingsBody: "Intenta quitar algún filtro o buscar otro término.",
    clearFilters: "Limpiar filtros",
    listingLocationFallback: "Región no informada",
    listingPriceFallback: "Precio no informado",
    viewListing: "Ver detalles",
    listingDetails: "Detalles del anuncio",
    contactAdvertiser: "Contactar anunciante",
    showContacts: "Mostrar contactos",
    noPublicContacts: "Este anunciante aún no informó contactos públicos.",
    backToListings: "Volver a los anuncios",
  },
  ru: {
    appName: "Web Paiva",
    tagline: "Все, что вы ищете или хотите показать в Reserva do Paiva.",
    intro: "Находите услуги, товары и местные компании внутри Reserva do Paiva.",
    searchPlaceholder: "Что вы ищете?",
    city: "Город",
    category: "Категория",
    search: "Искать",
    weather: "Погода",
    signIn: "Войти",
    signUp: "Создать аккаунт",
    signOut: "Выйти",
    advertise: "Создать объявление",
    dashboard: "Мой кабинет",
    foundationNotice: "Release 0: техническая основа в разработке.",
    publicExperienceNotice: "Местные объявления проходят ручную модерацию.",
    password: "Пароль",
    confirmPassword: "Подтвердите пароль",
    passwordHint: "Используйте не менее 6 символов.",
    passwordMismatchError: "Подтверждение пароля должно совпадать с паролем.",
    authHelp: "Используйте email и пароль, чтобы войти или создать аккаунт рекламодателя.",
    authError: "Неверный email или пароль. Также проверьте, подтвержден ли email.",
    authLockedError: "Слишком много попыток ввода пароля. Подождите 15 минут перед новой попыткой.",
    invalidEmailError: "Введите корректный email.",
    shortPasswordError: "Пароль должен содержать не менее 6 символов.",
    signupNeedsConfirmation: "Аккаунт создан. Если Supabase требует подтверждение, проверьте email перед входом.",
    emailRateLimitError:
      "Supabase временно ограничил отправку писем. Подождите несколько минут или отключите подтверждение email на время тестов.",
    invalidEmailDomainError: "Supabase отклонил этот домен email. Используйте тестовый email с реальным доменом.",
    userEmail: "Email пользователя",
    userRole: "Текущий профиль",
    profileMissing: "Профиль пока не найден. Если вы только что подтвердили email, выйдите и войдите снова.",
    advertiserIntentTitle: "Хочу стать рекламодателем",
    advertiserIntentIntro: "Этот раздел готовит ваш аккаунт к будущей зоне рекламодателя.",
    advertiserIntentCta: "Хочу стать рекламодателем",
    advertiserIntentPendingTitle: "Заявка пока обрабатывается вручную",
    advertiserIntentPendingBody:
      "На этом этапе перевод в рекламодатели выполняет администратор. Объявления и бизнес-профили здесь пока не создаются.",
    advertiserIntentReadyTitle: "Аккаунт готов для рекламодателя",
    advertiserIntentReadyBody:
      "У вас уже есть доступ к будущей зоне рекламодателя. Создание и управление объявлениями начнется только в Release 2.",
    backToDashboard: "Вернуться в кабинет",
    latestListings: "Одобренные объявления",
    emptyListingsTitle: "Пока нет одобренных объявлений",
    emptyListingsBody: "Когда модерация опубликует первые объявления, они появятся здесь.",
    noFilteredListingsTitle: "По этим фильтрам ничего не найдено",
    noFilteredListingsBody: "Попробуйте убрать фильтр или изменить запрос.",
    clearFilters: "Очистить фильтры",
    listingLocationFallback: "Регион не указан",
    listingPriceFallback: "Цена не указана",
    viewListing: "Подробнее",
    listingDetails: "Детали объявления",
    contactAdvertiser: "Связаться с рекламодателем",
    showContacts: "Показать контакты",
    noPublicContacts: "Этот рекламодатель пока не указал публичные контакты.",
    backToListings: "Вернуться к объявлениям",
  },
  "zh-CN": {
    appName: "Web Paiva",
    tagline: "您在 Reserva do Paiva 寻找或想展示的一切。",
    intro: "在 Reserva do Paiva 寻找服务、商品和本地商家。",
    searchPlaceholder: "您在找什么？",
    city: "城市",
    category: "类别",
    search: "搜索",
    weather: "天气",
    signIn: "登录",
    signUp: "创建账号",
    signOut: "退出",
    advertise: "发布广告",
    dashboard: "我的面板",
    foundationNotice: "Release 0：技术基础建设中。",
    publicExperienceNotice: "本地广告经过人工审核。",
    password: "密码",
    confirmPassword: "确认密码",
    passwordHint: "请至少使用 6 个字符。",
    passwordMismatchError: "确认密码必须与密码一致。",
    authHelp: "使用 email 和密码登录，或创建广告主账号。",
    authError: "邮箱或密码无效。也请检查邮箱是否已确认。",
    authLockedError: "密码尝试次数过多。请等待 15 分钟后再试。",
    invalidEmailError: "请输入有效的 email。",
    shortPasswordError: "密码至少需要 6 个字符。",
    signupNeedsConfirmation: "账号已创建。如果 Supabase 要求确认，请先查看 email 再登录。",
    emailRateLimitError: "Supabase 已达到临时邮件发送限制。请等待几分钟，或在测试期间关闭 email 确认。",
    invalidEmailDomainError: "Supabase 拒绝了此 email 域名。请使用真实域名的测试 email。",
    userEmail: "已登录 email",
    userRole: "当前资料",
    profileMissing: "暂未找到资料。如果您刚确认 email，请退出后重新登录。",
    advertiserIntentTitle: "我想成为广告主",
    advertiserIntentIntro: "此区域用于为未来的广告主管理区做准备。",
    advertiserIntentCta: "我想成为广告主",
    advertiserIntentPendingTitle: "目前需要人工处理",
    advertiserIntentPendingBody: "现阶段，成为广告主需要管理员手动处理。这里暂时还不能创建广告或商家资料。",
    advertiserIntentReadyTitle: "账号已准备好",
    advertiserIntentReadyBody: "您的资料已可用于未来的广告主管理区。广告创建和管理功能只会在 Release 2 开始。",
    backToDashboard: "返回面板",
    latestListings: "已审核广告",
    emptyListingsTitle: "暂无已审核广告",
    emptyListingsBody: "管理员发布第一批广告后，它们会显示在这里。",
    noFilteredListingsTitle: "没有符合这些筛选条件的结果",
    noFilteredListingsBody: "请尝试移除筛选条件或更换搜索词。",
    clearFilters: "清除筛选",
    listingLocationFallback: "未提供区域",
    listingPriceFallback: "未提供价格",
    viewListing: "查看详情",
    listingDetails: "广告详情",
    contactAdvertiser: "联系广告主",
    showContacts: "显示联系方式",
    noPublicContacts: "此广告主尚未提供公开联系方式。",
    backToListings: "返回广告列表",
  },
};

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
