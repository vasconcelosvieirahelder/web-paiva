"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { getLocalizedHref } from "@/i18n/navigation";
import { signOutAction } from "@/app/[locale]/login/actions";
import { ThemeToggle } from "./theme-toggle";

const localeLabels: Record<Locale, string> = {
  "pt-BR": "PT",
  en: "EN",
  es: "ES",
  ru: "RU",
  "zh-CN": "中文",
};

const localeFlags: Record<Locale, { alt: string; src: string }> = {
  "pt-BR": { alt: "Brasil", src: "/flags/br.svg" },
  en: { alt: "Estados Unidos", src: "/flags/us.svg" },
  es: { alt: "Espanha", src: "/flags/es.svg" },
  ru: { alt: "Rússia", src: "/flags/ru.svg" },
  "zh-CN": { alt: "China", src: "/flags/cn.svg" },
};

type SiteHeaderProps = {
  isAuthenticated?: boolean;
  locale: Locale;
  messages: Pick<Messages, "appName" | "signIn" | "signOut" | "advertise" | "weather" | "dashboard">;
};

function AccountIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.2 0-7 2.1-7 4.2 0 .7.6 1.3 1.3 1.3h11.4c.7 0 1.3-.6 1.3-1.3 0-2.1-2.8-4.2-7-4.2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function SiteHeader({ isAuthenticated = false, locale, messages }: SiteHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  return (
    <header className="border-b border-teal-900/10 bg-white/92 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href={`/${locale}`} className="group flex items-center gap-3">
          <Image
            alt=""
            aria-hidden="true"
            className="h-12 w-12 rounded-md object-cover shadow-sm ring-1 ring-teal-900/15"
            height={48}
            src="/images/web-paiva-mark.png"
            width={48}
          />
          <span className="leading-none">
            <span className="block text-[1.45rem] font-extrabold tracking-normal text-teal-950 sm:text-[1.65rem]">
              {messages.appName}
            </span>
            <span className="mt-1 block h-0.5 w-10 rounded-full bg-amber-400 transition-all group-hover:w-full" aria-hidden="true" />
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <ThemeToggle />
          <div className="flex items-center gap-1 rounded-md border border-teal-900/15 bg-white p-1 shadow-sm">
            <span className="flex h-8 items-center gap-1.5 px-1.5 text-sm font-semibold text-slate-900">
              <Image
                alt={localeFlags[locale].alt}
                className="shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/10"
                height={18}
                src={localeFlags[locale].src}
                width={24}
              />
              <span>{localeLabels[locale]}</span>
            </span>
            {locales
              .filter((item) => item !== locale)
              .map((item) => (
                <a
                  aria-label={`Trocar idioma para ${localeFlags[item].alt}`}
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-teal-50"
                  href={getLocalizedHref(pathname, item, queryString)}
                  key={item}
                  title={localeFlags[item].alt}
                >
                  <Image
                    alt={localeFlags[item].alt}
                    className="rounded-[2px] shadow-sm ring-1 ring-black/10"
                    height={18}
                    src={localeFlags[item].src}
                    width={24}
                  />
                </a>
              ))}
          </div>
          {isAuthenticated ? (
            <>
              <Link
                aria-label={messages.dashboard}
                className="flex h-10 w-10 items-center justify-center rounded-md text-teal-800 hover:bg-teal-50"
                href={`/${locale}/dashboard`}
                title={messages.dashboard}
              >
                <AccountIcon />
              </Link>
              <form action={signOutAction}>
                <input name="locale" type="hidden" value={locale} />
                <button className="rounded-md px-3 py-2 text-slate-700 hover:bg-teal-50" type="submit">
                  {messages.signOut}
                </button>
              </form>
            </>
          ) : (
            <Link className="rounded-md px-3 py-2 text-slate-700 hover:bg-teal-50" href={`/${locale}/login`}>
              {messages.signIn}
            </Link>
          )}
          <a
            className="rounded-md px-3 py-2 font-medium text-teal-800 hover:bg-teal-50"
            href="https://www.climaeradar.com.br/radarclima/recife/11055411?center=-8.16,-35.12&zoom=7.69&loop=true&period=periodPrognose24h"
            rel="noopener noreferrer"
            target="_blank"
          >
            {messages.weather}
          </a>
          <Link
            className="rounded-md bg-teal-800 px-3 py-2 font-medium text-white hover:bg-teal-900"
            href={isAuthenticated ? `/${locale}/dashboard/advertiser` : `/${locale}/login`}
          >
            {messages.advertise}
          </Link>
        </nav>
      </div>
    </header>
  );
}
