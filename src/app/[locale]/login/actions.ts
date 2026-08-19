"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getPasswordConfirmationError, getPasswordValidationError, getSafeLoginRedirectPath, isValidEmail } from "@/lib/account";
import {
  AUTH_ATTEMPT_COOKIE,
  AUTH_LOCK_DURATION_MS,
  getAuthAttemptState,
  isAuthAttemptLocked,
  recordFailedAuthAttempt,
  serializeAuthAttemptState,
} from "@/lib/auth-rate-limit";
import { createClient } from "@/lib/supabase/server";

function getLocale(formData: FormData): Locale {
  const locale = String(formData.get("locale") ?? "pt-BR");

  if (!isLocale(locale)) {
    return "pt-BR";
  }

  return locale;
}

function getCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function redirectSignUpWithError(locale: Locale, error: string) {
  redirect(`/${locale}/signup?error=${encodeURIComponent(error)}`);
}

function redirectWithLoginError(locale: Locale, error: string, nextPath: string) {
  const nextQuery = nextPath ? `&next=${encodeURIComponent(nextPath)}` : "";

  redirect(`/${locale}/login?error=${encodeURIComponent(error)}${nextQuery}`);
}

function redirectPasswordPage(locale: Locale, page: "forgot-password" | "reset-password", key: "error" | "status", value: string) {
  redirect(`/${locale}/${page}?${key}=${encodeURIComponent(value)}`);
}

function getAuthErrorCode(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit")) {
    return "email-rate-limit";
  }

  if (normalized.includes("invalid") && normalized.includes("email")) {
    return "invalid-email-domain";
  }

  return message || "auth";
}

export async function signInAction(formData: FormData) {
  const locale = getLocale(formData);
  const { email, password } = getCredentials(formData);
  const nextPath = String(formData.get("next") ?? "");
  const redirectPath = getSafeLoginRedirectPath(nextPath, locale);
  const supabase = await createClient();
  const cookieStore = await cookies();
  const authAttemptState = getAuthAttemptState(cookieStore.get(AUTH_ATTEMPT_COOKIE)?.value);

  if (!isValidEmail(email)) {
    redirectWithLoginError(locale, "invalid-email", nextPath);
  }

  const passwordError = getPasswordValidationError(password);

  if (passwordError) {
    redirectWithLoginError(locale, "short-password", nextPath);
  }

  if (isAuthAttemptLocked(authAttemptState, email)) {
    redirectWithLoginError(locale, "auth-locked", nextPath);
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const nextState = recordFailedAuthAttempt(authAttemptState, email);
    cookieStore.set(AUTH_ATTEMPT_COOKIE, serializeAuthAttemptState(nextState), {
      httpOnly: true,
      maxAge: AUTH_LOCK_DURATION_MS / 1000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    redirectWithLoginError(locale, getAuthErrorCode(error.message), nextPath);
  }

  cookieStore.delete(AUTH_ATTEMPT_COOKIE);
  redirect(redirectPath);
}

export async function signUpAction(formData: FormData) {
  const locale = getLocale(formData);
  const { email, password } = getCredentials(formData);
  const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");
  const supabase = await createClient();

  if (!isValidEmail(email)) {
    redirectSignUpWithError(locale, "invalid-email");
  }

  const passwordError = getPasswordValidationError(password);

  if (passwordError) {
    redirectSignUpWithError(locale, passwordError);
  }

  const passwordConfirmationError = getPasswordConfirmationError(password, passwordConfirmation);

  if (passwordConfirmationError) {
    redirectSignUpWithError(locale, passwordConfirmationError);
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirectSignUpWithError(locale, getAuthErrorCode(error.message));
  }

  if (!data.session) {
    redirect(`/${locale}/login?status=confirm-email`);
  }

  redirect(`/${locale}/dashboard`);
}

export async function signOutAction(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect(`/${locale}`);
}

export async function requestPasswordResetAction(formData: FormData) {
  const locale = getLocale(formData);
  const email = String(formData.get("email") ?? "").trim();

  if (!isValidEmail(email)) {
    redirectPasswordPage(locale, "forgot-password", "error", "invalid-email");
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/${locale}/reset-password`,
  });

  if (error) {
    redirectPasswordPage(locale, "forgot-password", "error", getAuthErrorCode(error.message));
  }

  redirectPasswordPage(locale, "forgot-password", "status", "sent");
}

export async function updatePasswordAction(formData: FormData) {
  const locale = getLocale(formData);
  const password = String(formData.get("password") ?? "");
  const source = String(formData.get("source") ?? "dashboard");
  const page = source === "reset" ? "reset-password" : "dashboard";
  const passwordError = getPasswordValidationError(password);

  if (passwordError) {
    if (page === "reset-password") {
      redirectPasswordPage(locale, page, "error", passwordError);
    }

    redirect(`/${locale}/dashboard?error=${encodeURIComponent(passwordError)}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    if (page === "reset-password") {
      redirectPasswordPage(locale, page, "error", getAuthErrorCode(error.message));
    }

    redirect(`/${locale}/dashboard?error=${encodeURIComponent(getAuthErrorCode(error.message))}`);
  }

  if (page === "reset-password") {
    redirectPasswordPage(locale, page, "status", "updated");
  }

  redirect(`/${locale}/dashboard?status=password-updated`);
}
