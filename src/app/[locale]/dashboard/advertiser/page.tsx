import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getApprovedListingsForAdvertiserDashboard } from "@/lib/advertiser-dashboard-listings";
import { getListingActiveDays, summarizeListingInteractions } from "@/lib/listing-interactions";
import { canAccessAdvertiserSetup, formatProfileRole } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";
import { ClearCompanyDraft } from "./clear-company-draft";

type AdvertiserIntentPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function AdvertiserIntentPage({ params, searchParams }: AdvertiserIntentPageProps) {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role ?? "visitor";
  const ready = canAccessAdvertiserSetup(role);
  const activeListings = await getApprovedListingsForAdvertiserDashboard(supabase, user.id);

  return (
    <div className="min-h-screen bg-[#edf4f1] bg-[linear-gradient(180deg,#e6f0ed_0%,#f3f6f2_46%,#e9f1ef_100%)] text-slate-950">
      {status === "submitted" ? <ClearCompanyDraft locale={locale} /> : null}
      <SiteHeader isAuthenticated locale={locale} messages={t} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link className="text-sm font-medium text-teal-700 hover:text-teal-800" href={`/${locale}/dashboard`}>
          {t.backToDashboard}
        </Link>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase text-teal-700">{formatProfileRole(role)}</p>
          <h1 className="mt-3 text-3xl font-semibold">{t.advertiserIntentTitle}</h1>
          <p className="mt-3 leading-7 text-slate-700">{t.advertiserIntentIntro}</p>
          <div className="mt-6 rounded-md bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              {ready ? t.advertiserIntentReadyTitle : t.advertiserIntentPendingTitle}
            </h2>
            <p className="mt-2 leading-7 text-slate-700">
              {ready ? t.advertiserIntentReadyBody : t.advertiserIntentPendingBody}
            </p>
          </div>
          {status === "submitted" ? (
            <div className="mt-5 rounded-md border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-900">
              Cadastro enviado para aprovação. A moderação vai revisar os dados, imagens e referência antes da publicação.
            </div>
          ) : null}
          <Link
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-teal-800 px-5 text-sm font-medium text-white hover:bg-teal-900"
            href={`/${locale}/dashboard/advertiser/company`}
          >
            Cadastrar empresa
          </Link>
        </div>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Anúncios ativos</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Acompanhe visualizações e cliques recebidos nos seus anúncios publicados.
              </p>
            </div>
            <p className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              {activeListings.length} ativo(s)
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {activeListings.length > 0 ? (
              activeListings.map((listing) => {
                const summary = summarizeListingInteractions(listing.listing_interactions ?? []);
                const activeSince = listing.published_at ?? listing.approved_at ?? listing.created_at;
                const activeDays = getListingActiveDays(activeSince);

                return (
                  <article className="rounded-md border border-slate-200 bg-slate-50 p-4" key={listing.id}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">{listing.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{activeDays} dia(s) ativo</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm sm:min-w-[360px]">
                        <div className="rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
                          <p className="text-lg font-semibold text-slate-950">{summary.views}</p>
                          <p className="text-xs text-slate-600">Visualizações</p>
                        </div>
                        <div className="rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
                          <p className="text-lg font-semibold text-slate-950">{summary.contactClicks}</p>
                          <p className="text-xs text-slate-600">Ver contatos</p>
                        </div>
                        <div className="rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
                          <p className="text-lg font-semibold text-slate-950">{summary.whatsappClicks}</p>
                          <p className="text-xs text-slate-600">WhatsApp</p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Nenhum anúncio ativo encontrado para sua conta no momento.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
