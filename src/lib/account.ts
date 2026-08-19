import type { Locale } from "@/i18n/config";

export type PasswordValidationError = "short-password";
export type PasswordConfirmationError = "password-mismatch";

export function getPasswordValidationError(password: string): PasswordValidationError | null {
  return password.length < 6 ? "short-password" : null;
}

export function getPasswordConfirmationError(password: string, passwordConfirmation: string): PasswordConfirmationError | null {
  return password === passwordConfirmation ? null : "password-mismatch";
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getSafeLoginRedirectPath(nextPath: string | null | undefined, locale: Locale) {
  const fallbackPath = `/${locale}/dashboard`;

  if (!nextPath?.startsWith(`/${locale}/`) || nextPath.startsWith("//")) {
    return fallbackPath;
  }

  return nextPath;
}

export function getSafeAuthCallbackRedirectPath(nextPath: string | null | undefined) {
  if (!nextPath?.startsWith("/") || nextPath.startsWith("//")) {
    return "/pt-BR/dashboard";
  }

  return nextPath;
}
