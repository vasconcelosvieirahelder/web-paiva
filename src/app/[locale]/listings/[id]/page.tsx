import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ContactReveal } from "@/components/listings/contact-reveal";
import { Button } from "@/components/ui/button";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { recordListingInteraction } from "@/lib/listing-interactions-server";
import { getListingContacts, getListingImage, getLocalizedCategoryName, getLocalizedListingContent, getLocalizedLocationName } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { updateListingDetailsAction } from "./actions";

type ListingDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ status?: string }>;
};

function firstRelation<T>(relation: T | T[] | null) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function getAdminEditStatusMessage(status: string | undefined) {
  if (status === "updated") {
    return "Anúncio atualizado com sucesso.";
  }

  if (status === "missing-title") {
    return "Informe o título do anúncio.";
  }

  if (status === "missing-description") {
    return "Informe a descrição do anúncio.";
  }

  if (status === "save-error") {
    return "Não foi possível salvar as alterações. Tente novamente.";
  }

  return null;
}

export default async function ListingDetailPage({ params, searchParams }: ListingDetailPageProps) {
  const { locale, id } = await params;
  const { status } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  const { data: listing } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        description,
        price_label,
        contact_whatsapp,
        contact_phone,
        contact_email,
        contact_url,
        categories(slug, name_pt_br, name_en, name_es, name_ru, name_zh_cn),
        cities(name)
      `,
    )
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (!listing) {
    notFound();
  }

  const category = firstRelation(listing.categories);
  const city = firstRelation(listing.cities);
  const content = getLocalizedListingContent(listing, locale);
  const image = getListingImage(content.title);
  const locationName = getLocalizedLocationName(city?.name, locale, t.listingLocationFallback);
  const contacts = getListingContacts({
    contact_whatsapp: listing.contact_whatsapp,
    contact_phone: listing.contact_phone,
    contact_email: listing.contact_email,
    contact_url: listing.contact_url,
  });
  const isAdmin = profile?.role === "admin";
  const adminStatusMessage = getAdminEditStatusMessage(status);

  await recordListingInteraction(listing.id, "view");

  return (
    <div className="paiva-page min-h-screen text-slate-950">
      <SiteHeader isAuthenticated={Boolean(user)} locale={locale} messages={t} />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Link className="text-sm font-medium text-teal-700 hover:text-teal-800" href={`/${locale}`}>
          {t.backToListings}
        </Link>
        <article className="mt-6 rounded-lg border border-white/10 bg-[#f8f5eb] p-6 shadow-sm shadow-black/10">
          {image ? (
            <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 sm:aspect-[16/10]">
              <Image
                alt={image.alt}
                className="object-contain"
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                src={image.src}
              />
            </div>
          ) : null}
          <p className="text-sm font-medium uppercase text-teal-700">{getLocalizedCategoryName(category, locale, t.category)}</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">{content.title}</h1>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium">
            <span className="rounded-md bg-slate-100 px-3 py-1.5 text-slate-700">
              {locationName}
            </span>
            <span className="rounded-md bg-amber-50 px-3 py-1.5 text-amber-900">
              {content.price_label ?? t.listingPriceFallback}
            </span>
          </div>
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-slate-950">{t.listingDetails}</h2>
            <p className="mt-3 whitespace-pre-line leading-8 text-slate-700">{content.description}</p>
          </section>
          <section className="mt-8 rounded-lg border border-teal-900/10 bg-teal-50 p-5">
            <h2 className="text-xl font-semibold text-slate-950">{t.contactAdvertiser}</h2>
            {contacts.length > 0 ? (
              <ContactReveal contacts={contacts} listingId={listing.id} showContactsLabel={t.showContacts} />
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-700">{t.noPublicContacts}</p>
            )}
          </section>
          {isAdmin ? (
            <details className="group mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5" open={Boolean(adminStatusMessage)}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xl font-semibold text-amber-950 marker:hidden">
                <span>Editar anúncio</span>
                <span className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white transition group-open:bg-amber-800">
                  Editar
                </span>
              </summary>
              {adminStatusMessage ? (
                <p className="mt-4 rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-900">
                  {adminStatusMessage}
                </p>
              ) : null}
              <p className="mt-4 text-sm leading-6 text-amber-900">
                Área visível apenas para administradores. As alterações afetam a página pública do anúncio.
              </p>
              <form action={updateListingDetailsAction} className="mt-5 grid gap-4">
                <input name="locale" type="hidden" value={locale} />
                <input name="listingId" type="hidden" value={listing.id} />
                <label className="grid gap-2 text-sm font-medium text-slate-800">
                  Título
                  <input
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                    defaultValue={listing.title}
                    maxLength={120}
                    name="title"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-800">
                  Descrição
                  <textarea
                    className="min-h-36 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                    defaultValue={listing.description}
                    maxLength={3000}
                    name="description"
                    required
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-slate-800">
                    Valor
                    <input
                      className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                      defaultValue={listing.price_label ?? ""}
                      maxLength={80}
                      name="price_label"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-800">
                    WhatsApp
                    <input
                      className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                      defaultValue={listing.contact_whatsapp ?? ""}
                      maxLength={40}
                      name="contact_whatsapp"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-800">
                    Telefone
                    <input
                      className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                      defaultValue={listing.contact_phone ?? ""}
                      maxLength={40}
                      name="contact_phone"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-800">
                    E-mail
                    <input
                      className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                      defaultValue={listing.contact_email ?? ""}
                      maxLength={120}
                      name="contact_email"
                      type="email"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-800 sm:col-span-2">
                    Site ou Instagram
                    <input
                      className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                      defaultValue={listing.contact_url ?? ""}
                      maxLength={250}
                      name="contact_url"
                      type="url"
                    />
                  </label>
                </div>
                <Button className="w-fit" type="submit">
                  Salvar alterações
                </Button>
              </form>
            </details>
          ) : null}
        </article>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
