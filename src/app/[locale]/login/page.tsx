import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getSpellCheckLanguage } from "@/i18n/text-input";
import { createClient } from "@/lib/supabase/server";
import { signInAction } from "./actions";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; next?: string; status?: string }>;
};

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { error, next, status } = await searchParams;

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
    auth: t.authError,
    "auth-locked": t.authLockedError,
    signup: t.authError,
    "invalid-email": t.invalidEmailError,
    "short-password": t.shortPasswordError,
    "email-rate-limit": t.emailRateLimitError,
    "invalid-email-domain": t.invalidEmailDomainError,
  };
  const errorMessage = error ? (errorMessages[error] ?? decodeURIComponent(error)) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader isAuthenticated={Boolean(user)} locale={locale} messages={t} />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4">
        <form className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{t.signIn}</h1>
          <p className="mt-2 text-sm text-slate-600">{t.authHelp}</p>
          {status === "confirm-email" ? (
            <p className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
              {t.signupNeedsConfirmation}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}
          <input name="locale" type="hidden" value={locale} />
          <input name="next" type="hidden" value={next ?? ""} />
          <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="email">
            E-mail
          </label>
          <Input className="mt-2 w-full" id="email" lang={spellCheckLanguage} name="email" type="email" autoComplete="email" required />
          <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="password">
            {t.password}
          </label>
          <Input
            className="mt-2 w-full"
            id="password"
            minLength={6}
            name="password"
            required
            type="password"
            autoComplete="current-password"
            lang={spellCheckLanguage}
          />
          <p className="mt-2 text-xs text-slate-500">{t.passwordHint}</p>
          <Button className="mt-6 w-full" formAction={signInAction}>
            {t.signIn}
          </Button>
          <Link
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
            href={`/${locale}/signup`}
          >
            {t.signUp}
          </Link>
          <Link className="mt-4 block text-center text-sm font-medium text-teal-700 hover:text-teal-800" href={`/${locale}/forgot-password`}>
            Esqueci minha senha
          </Link>
        </form>
      </main>
    </div>
  );
}
