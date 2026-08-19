import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getSpellCheckLanguage } from "@/i18n/text-input";
import { createClient } from "@/lib/supabase/server";
import { signUpAction } from "../login/actions";

type SignUpPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function SignUpPage({ params, searchParams }: SignUpPageProps) {
  const { locale } = await params;
  const { error } = await searchParams;

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
    "email-rate-limit": t.emailRateLimitError,
    "invalid-email": t.invalidEmailError,
    "invalid-email-domain": t.invalidEmailDomainError,
    "password-mismatch": t.passwordMismatchError,
    "short-password": t.shortPasswordError,
    signup: t.authError,
  };
  const errorMessage = error ? (errorMessages[error] ?? decodeURIComponent(error)) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader isAuthenticated={Boolean(user)} locale={locale} messages={t} />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4">
        <form action={signUpAction} className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{t.signUp}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Preencha seus dados para criar uma conta. Depois, confirme o e-mail se o Supabase solicitar.
          </p>
          {errorMessage ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}
          <input name="locale" type="hidden" value={locale} />
          <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="signup-email">
            E-mail
          </label>
          <Input
            autoComplete="email"
            className="mt-2 w-full"
            id="signup-email"
            lang={spellCheckLanguage}
            name="email"
            required
            type="email"
          />
          <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="signup-password">
            {t.password}
          </label>
          <Input
            autoComplete="new-password"
            className="mt-2 w-full"
            id="signup-password"
            lang={spellCheckLanguage}
            minLength={6}
            name="password"
            required
            type="password"
          />
          <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="password-confirmation">
            {t.confirmPassword}
          </label>
          <Input
            autoComplete="new-password"
            className="mt-2 w-full"
            id="password-confirmation"
            lang={spellCheckLanguage}
            minLength={6}
            name="passwordConfirmation"
            required
            type="password"
          />
          <p className="mt-2 text-xs text-slate-500">{t.passwordHint}</p>
          <Button className="mt-6 w-full" type="submit">
            {t.signUp}
          </Button>
          <Link className="mt-4 block text-center text-sm font-medium text-teal-700 hover:text-teal-800" href={`/${locale}/login`}>
            {t.signIn}
          </Link>
        </form>
      </main>
    </div>
  );
}
