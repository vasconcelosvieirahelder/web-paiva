import { isLocale, type Locale } from "./config";

export function getLocalizedPathname(pathname: string, nextLocale: Locale) {
  const pathParts = pathname.split("/");

  if (isLocale(pathParts[1] ?? "")) {
    pathParts[1] = nextLocale;
    return pathParts.join("/") || `/${nextLocale}`;
  }

  const normalizedPathname = pathname === "/" ? "" : pathname;

  return `/${nextLocale}${normalizedPathname}`;
}

export function getLocalizedHref(pathname: string, nextLocale: Locale, queryString = "") {
  const nextPathname = getLocalizedPathname(pathname, nextLocale);

  return `${nextPathname}${queryString ? `?${queryString}` : ""}`;
}
