import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getApprovedListingsForAdvertiserDashboard } from "@/lib/advertiser-dashboard-listings";
import { getListingActiveDays, summarizeListingInteractions } from "@/lib/listing-interactions";
import { formatProfileRole } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";
import { signOutAction, updatePasswordAction } from "../login/actions";

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
};

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { locale } = await params;
  const { error, status } = await searchParams;

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
  const activeListings = await getApprovedListingsForAdvertiserDashboard(supabase, user.id);

  return (
    <div className="min-h-screen bg-[#edf4f1] bg-[linear-gradient(180deg,#e6f0ed_0%,#f3f6f2_46%,#e9f1ef_100%)] text-slate-950">
      <SiteHeader isAuthenticated locale={locale} messages={t} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-semibold">{t.dashboard}</h1>
        <p className="mt-3 text-slate-700">{t.foundationNotice}</p>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">{t.userEmail}</p>
          <p className="mt-1 text-lg text-slate-950">{user.email}</p>
          <div className="mt-5 rounded-md bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-600">{t.userRole}</p>
            {profile ? (
              <p className="mt-1 text-lg text-slate-950">{formatProfileRole(profile.role)}</p>
            ) : (
              <p className="mt-1 text-sm text-amber-700">{t.profileMissing}</p>
            )}
          </div>
          {status === "password-updated" ? (
            <p className="mt-5 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
              Senha alterada com sucesso.
            </p>
          ) : null}
          {error === "short-password" ? (
            <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              A nova senha precisa ter pelo menos 6 caracteres.
            </p>
          ) : null}
          <form action={updatePasswordAction} className="mt-5 rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold text-slate-950">Alterar senha</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use este campo para trocar a senha da sua conta logada.</p>
            <input name="locale" type="hidden" value={locale} />
            <input name="source" type="hidden" value="dashboard" />
            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="new-password">
              Nova senha
            </label>
            <input
              autoComplete="new-password"
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
              id="new-password"
              minLength={6}
              name="password"
              required
              type="password"
            />
            <Button className="mt-4" type="submit">
              Salvar nova senha
            </Button>
          </form>
          <div className="mt-5 rounded-md border border-teal-100 bg-teal-50 p-4">
            <h2 className="text-base font-semibold text-teal-950">{t.advertiserIntentTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-teal-900">{t.advertiserIntentIntro}</p>
            <Link
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800"
              href={`/${locale}/dashboard/advertiser`}
            >
              {t.advertiserIntentCta}
            </Link>
          </div>
          <section className="mt-5 rounded-md border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Meus anúncios e interações</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Visualize rapidamente quantas pessoas abriram seus anúncios e clicaram nos contatos.
                </p>
              </div>
              <p className="w-fit rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                {activeListings.length} ativo(s)
              </p>
            </div>
            <div className="mt-4 grid gap-3">
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
                          <Link
                            className="mt-2 inline-flex text-sm font-medium text-teal-700 hover:text-teal-800"
                            href={`/${locale}/listings/${listing.id}`}
                          >
                            Ver anúncio publicado
                          </Link>
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
          {profile?.role === "admin" ? (
            <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-base font-semibold text-amber-950">Painel administrativo</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Analise empresas e anúncios enviados para aprovação antes de publicar no Web Paiva.
              </p>
              <Link
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-amber-700 px-4 text-sm font-medium text-white hover:bg-amber-800"
                href={`/${locale}/dashboard/admin`}
              >
                Abrir moderação
              </Link>
            </div>
          ) : null}
          <form action={signOutAction} className="mt-5">
            <input name="locale" type="hidden" value={locale} />
            <Button type="submit" variant="secondary">
              {t.signOut}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
