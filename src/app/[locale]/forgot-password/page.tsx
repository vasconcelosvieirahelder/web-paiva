import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getSpellCheckLanguage } from "@/i18n/text-input";
import { createClient } from "@/lib/supabase/server";
import { requestPasswordResetAction } from "../login/actions";

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
};

export default async function ForgotPasswordPage({ params, searchParams }: ForgotPasswordPageProps) {
  const { locale } = await params;
  const { error, status } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);
  const spellCheckLanguage = getSpellCheckLanguage(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const errorMessages: Record<string, string> = {
    "email-rate-limit": t.emailRateLimitError,
    "invalid-email": t.invalidEmailError,
    "invalid-email-domain": t.invalidEmailDomainError,
  };
  const errorMessage = error ? (errorMessages[error] ?? t.authError) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader isAuthenticated={Boolean(user)} locale={locale} messages={t} />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4">
        <form action={requestPasswordResetAction} className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Recuperar senha</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Informe seu e-mail. Se ele estiver cadastrado, enviaremos um link para criar uma nova senha.
          </p>
          {status === "sent" ? (
            <p className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
              Enviamos o link de recuperação. Confira sua caixa de entrada e spam.
            </p>
          ) : null}
          {errorMessage ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
          ) : null}
          <input name="locale" type="hidden" value={locale} />
          <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="email">
            E-mail
          </label>
          <Input className="mt-2 w-full" id="email" lang={spellCheckLanguage} name="email" type="email" autoComplete="email" required />
          <Button className="mt-6 w-full" type="submit">
            Enviar link de recuperação
          </Button>
          <Link className="mt-4 block text-center text-sm font-medium text-teal-700 hover:text-teal-800" href={`/${locale}/login`}>
            Voltar para entrar
          </Link>
        </form>
      </main>
    </div>
  );
}
