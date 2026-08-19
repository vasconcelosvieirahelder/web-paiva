import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { createClient } from "@/lib/supabase/server";
import { updatePasswordAction } from "../login/actions";

type ResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
};

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
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
  const errorMessage = error === "short-password" ? t.shortPasswordError : error ? t.authError : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader isAuthenticated={Boolean(user)} locale={locale} messages={t} />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4">
        <form action={updatePasswordAction} className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Definir nova senha</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Crie uma nova senha com pelo menos 6 caracteres.</p>
          {status === "updated" ? (
            <p className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
              Senha atualizada. Você já pode continuar usando sua conta.
            </p>
          ) : null}
          {errorMessage ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
          ) : null}
          <input name="locale" type="hidden" value={locale} />
          <input name="source" type="hidden" value="reset" />
          <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="password">
            Nova senha
          </label>
          <Input className="mt-2 w-full" id="password" minLength={6} name="password" type="password" autoComplete="new-password" required />
          <Button className="mt-6 w-full" type="submit">
            Salvar nova senha
          </Button>
          <Link className="mt-4 block text-center text-sm font-medium text-teal-700 hover:text-teal-800" href={`/${locale}/dashboard`}>
            Ir para minha área
          </Link>
        </form>
      </main>
    </div>
  );
}
