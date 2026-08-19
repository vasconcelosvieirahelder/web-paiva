import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { createClient } from "@/lib/supabase/server";
import { CompanyForm } from "./company-form";

type CompanyRegistrationPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function CompanyRegistrationPage({ params, searchParams }: CompanyRegistrationPageProps) {
  const { locale } = await params;
  const { error } = await searchParams;

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

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name_pt_br, name_en, name_es, name_ru, name_zh_cn")
    .eq("is_active", true)
    .order("sort_order");
  const errorMessage =
    error === "image"
      ? "Não foi possível enviar as imagens. Use arquivos JPG, PNG ou WEBP com até 5 MB."
      : "Não foi possível enviar o cadastro. Confira os campos obrigatórios e tente novamente.";

  return (
    <div className="min-h-screen bg-[#edf4f1] bg-[linear-gradient(180deg,#e6f0ed_0%,#f3f6f2_46%,#e9f1ef_100%)] text-slate-950">
      <SiteHeader isAuthenticated locale={locale} messages={t} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link className="text-sm font-medium text-teal-700 hover:text-teal-800" href={`/${locale}/dashboard/advertiser`}>
          {t.backToDashboard}
        </Link>
        <div className="mt-6">
          <p className="text-sm font-medium uppercase text-teal-700">Release 2</p>
          <h1 className="mt-3 text-3xl font-semibold">Cadastro da empresa</h1>
          <p className="mt-3 leading-7 text-slate-700">
            Envie os dados do negócio, imagens e uma referência local para avaliação manual antes da publicação.
          </p>
        </div>
        {error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errorMessage}
          </div>
        ) : null}
        <div className="mt-6">
          <CompanyForm categories={categories ?? []} locale={locale} />
        </div>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
