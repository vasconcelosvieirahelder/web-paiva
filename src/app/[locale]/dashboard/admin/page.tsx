import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getLocalizedCategoryName } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { moderateListing } from "./actions";

type AdminPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

type Relation<T> = T | T[] | null;

type AdminListing = {
  id: string;
  title: string;
  description: string;
  price_label: string | null;
  status: string;
  rejection_reason: string | null;
  contact_whatsapp: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_url: string | null;
  created_at: string;
  advertiser_profiles: Relation<{
    id: string;
    business_name: string;
    status: string;
    logo_storage_path: string | null;
    operation_photo_storage_path: string | null;
    reference_name: string | null;
    reference_phone: string | null;
    reference_notes: string | null;
  }>;
  categories: Relation<{
    slug: string | null;
    name_pt_br: string | null;
    name_en: string | null;
    name_es: string | null;
    name_ru: string | null;
    name_zh_cn: string | null;
  }>;
  listing_images: Array<{
    id: string;
    storage_path: string;
    alt_text: string | null;
    image_kind: string;
    sort_order: number;
  }> | null;
};

type AdminSuggestion = {
  id: string;
  message: string;
  created_at: string;
  profiles: Relation<{
    full_name: string | null;
  }>;
};

const statusLabels: Record<string, string> = {
  pending_review: "Aguardando análise",
  approved: "Aprovado",
  rejected: "Recusado",
  suspended: "Suspenso",
  draft: "Rascunho",
};

function firstRelation<T>(relation: Relation<T>) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function getStatusLabel(status: string) {
  return statusLabels[status] ?? status;
}

function getAdminStatusMessage(status: string | undefined) {
  if (status === "approve") {
    return "Anúncio aprovado e publicado.";
  }

  if (status === "reject") {
    return "Anúncio recusado.";
  }

  if (status === "suspend") {
    return "Anúncio suspenso.";
  }

  if (status === "invalid" || status === "save-error" || status === "not-found") {
    return "Não foi possível concluir a ação. Revise os dados e tente novamente.";
  }

  return null;
}

function formatDateTime(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

async function getSignedImageUrl(storagePath: string) {
  const supabase = await createClient();
  const { data } = await supabase.storage.from("company-assets").createSignedUrl(storagePath, 60 * 60);

  return data?.signedUrl ?? null;
}

async function getEvidenceImages(listing: AdminListing) {
  const images = listing.listing_images ?? [];

  return Promise.all(
    images
      .sort((first, second) => first.sort_order - second.sort_order)
      .map(async (image) => ({
        ...image,
        signedUrl: await getSignedImageUrl(image.storage_path),
      })),
  );
}

function ModerationForm({
  action,
  label,
  locale,
  listingId,
  variant = "secondary",
}: {
  action: "approve" | "reject" | "suspend";
  label: string;
  locale: Locale;
  listingId: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <form action={moderateListing} className="grid gap-2">
      <input name="locale" type="hidden" value={locale} />
      <input name="listingId" type="hidden" value={listingId} />
      <input name="action" type="hidden" value={action} />
      {action === "reject" ? (
        <textarea
          className="min-h-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
          maxLength={500}
          name="reason"
          placeholder="Motivo da recusa, opcional"
        />
      ) : null}
      <Button type="submit" variant={variant === "primary" ? undefined : "secondary"}>
        {label}
      </Button>
    </form>
  );
}

export default async function AdminDashboardPage({ params, searchParams }: AdminPageProps) {
  const { locale } = await params;
  const { status } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  const [{ data }, { data: suggestionsData }] = await Promise.all([
    supabase
      .from("listings")
      .select(
        `
        id,
        title,
        description,
        price_label,
        status,
        rejection_reason,
        contact_whatsapp,
        contact_phone,
        contact_email,
        contact_url,
        created_at,
        advertiser_profiles (
          id,
          business_name,
          status,
          logo_storage_path,
          operation_photo_storage_path,
          reference_name,
          reference_phone,
          reference_notes
        ),
        categories (
          slug,
          name_pt_br,
          name_en,
          name_es,
          name_ru,
          name_zh_cn
        ),
        listing_images (
          id,
          storage_path,
          alt_text,
          image_kind,
          sort_order
        )
      `,
      )
      .in("status", ["pending_review", "approved", "rejected", "suspended"])
      .order("created_at", { ascending: false }),
    supabase
      .from("suggestions")
      .select(
        `
        id,
        message,
        created_at,
        profiles (
          full_name
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const listings = (data ?? []) as AdminListing[];
  const suggestions = (suggestionsData ?? []) as AdminSuggestion[];
  const statusMessage = getAdminStatusMessage(status);

  return (
    <div className="min-h-screen bg-[#edf4f1] bg-[linear-gradient(180deg,#e6f0ed_0%,#f3f6f2_46%,#e9f1ef_100%)] text-slate-950">
      <SiteHeader isAuthenticated locale={locale} messages={t} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link className="text-sm font-medium text-teal-700 hover:text-teal-800" href={`/${locale}/dashboard`}>
          Voltar ao painel
        </Link>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Moderação de anúncios</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
              Analise os cadastros enviados, confira as evidências privadas e decida se o anúncio pode aparecer publicamente.
            </p>
          </div>
          <p className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
            {listings.length} envio(s)
          </p>
        </div>

        {statusMessage ? (
          <div className="mt-6 rounded-md border border-teal-100 bg-teal-50 p-4 text-sm font-medium text-teal-900">
            {statusMessage}
          </div>
        ) : null}

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Caixa de sugestões</h2>
              <p className="mt-1 text-sm text-slate-600">
                Mensagens privadas enviadas por usuários logados para a administração.
              </p>
            </div>
            <p className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              {suggestions.length} mensagem(ns)
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => {
                const author = firstRelation(suggestion.profiles);

                return (
                  <article className="rounded-md border border-slate-200 bg-slate-50 p-4" key={suggestion.id}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-950">{author?.full_name || "Usuário logado"}</p>
                      <time className="text-xs font-medium text-slate-500" dateTime={suggestion.created_at}>
                        {formatDateTime(suggestion.created_at, locale)}
                      </time>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{suggestion.message}</p>
                  </article>
                );
              })
            ) : (
              <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">Nenhuma sugestão recebida ainda.</p>
            )}
          </div>
        </section>

        <div className="mt-8 grid gap-6">
          {listings.length > 0 ? (
            await Promise.all(
              listings.map(async (listing) => {
                const advertiser = firstRelation(listing.advertiser_profiles);
                const category = firstRelation(listing.categories);
                const evidenceImages = await getEvidenceImages(listing);

                return (
                  <article className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={listing.id}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-teal-700">{getStatusLabel(listing.status)}</p>
                        <h2 className="mt-1 text-xl font-semibold text-slate-950">{listing.title}</h2>
                        <p className="mt-1 text-sm text-slate-600">{advertiser?.business_name ?? "Empresa sem nome"}</p>
                      </div>
                      <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
                        {getLocalizedCategoryName(category, locale, "Categoria")}
                      </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
                      <section className="grid gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-950">Descrição</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{listing.description}</p>
                        </div>
                        <div className="grid gap-2 rounded-md bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
                          <p>
                            <span className="font-medium text-slate-950">Valor: </span>
                            {listing.price_label || "Não informado"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-950">WhatsApp: </span>
                            {listing.contact_whatsapp || "Não informado"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-950">Telefone: </span>
                            {listing.contact_phone || "Não informado"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-950">E-mail: </span>
                            {listing.contact_email || "Não informado"}
                          </p>
                          <p className="sm:col-span-2">
                            <span className="font-medium text-slate-950">Site/Instagram: </span>
                            {listing.contact_url || "Não informado"}
                          </p>
                        </div>
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                          <h3 className="font-semibold">Referência privada</h3>
                          <p className="mt-2">Nome: {advertiser?.reference_name || "Não informado"}</p>
                          <p>Telefone: {advertiser?.reference_phone || "Não informado"}</p>
                          <p>Observação: {advertiser?.reference_notes || "Sem observação"}</p>
                        </div>
                      </section>

                      <aside className="grid gap-4">
                        <div className="grid gap-3">
                          <h3 className="text-sm font-semibold text-slate-950">Evidências enviadas</h3>
                          {evidenceImages.length > 0 ? (
                            evidenceImages.map((image) =>
                              image.signedUrl ? (
                                <figure className="rounded-md border border-slate-200 bg-slate-50 p-2" key={image.id}>
                                  <Image
                                    alt={image.alt_text ?? "Evidência enviada para moderação"}
                                    className="h-auto w-full rounded object-contain"
                                    height={180}
                                    src={image.signedUrl}
                                    unoptimized
                                    width={260}
                                  />
                                  <figcaption className="mt-2 text-xs font-medium uppercase text-slate-500">{image.image_kind}</figcaption>
                                </figure>
                              ) : null,
                            )
                          ) : (
                            <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">Nenhuma imagem encontrada.</p>
                          )}
                        </div>
                        <div className="grid gap-3 rounded-md border border-slate-200 p-3">
                          <ModerationForm action="approve" label="Aprovar e publicar" listingId={listing.id} locale={locale} variant="primary" />
                          <ModerationForm action="reject" label="Recusar" listingId={listing.id} locale={locale} />
                          <ModerationForm action="suspend" label="Suspender" listingId={listing.id} locale={locale} />
                        </div>
                      </aside>
                    </div>
                  </article>
                );
              }),
            )
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-700 shadow-sm">
              Nenhum anúncio para moderação no momento.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
