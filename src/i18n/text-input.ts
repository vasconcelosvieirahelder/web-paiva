import type { Locale } from "./config";

const spellCheckLanguages: Record<Locale, string> = {
  "pt-BR": "pt-BR",
  en: "en-US",
  es: "es-ES",
  ru: "ru-RU",
  "zh-CN": "zh-CN",
};

const nonTextTypes = new Set(["email", "number", "password", "tel", "url"]);

export function getSpellCheckLanguage(locale: Locale) {
  return spellCheckLanguages[locale];
}

export function shouldUseNativeSpellCheck(type: string = "text") {
  return !nonTextTypes.has(type);
}
