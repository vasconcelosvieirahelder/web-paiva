import { describe, expect, it } from "vitest";
import { getLocalizedHref, getLocalizedPathname } from "./navigation";

describe("i18n navigation", () => {
  it("replaces the current locale while preserving the rest of the path", () => {
    expect(getLocalizedPathname("/pt-BR", "en")).toBe("/en");
    expect(getLocalizedPathname("/pt-BR/listings/123", "es")).toBe("/es/listings/123");
    expect(getLocalizedPathname("/en/dashboard", "zh-CN")).toBe("/zh-CN/dashboard");
  });

  it("adds the locale when the current path has no supported locale", () => {
    expect(getLocalizedPathname("/", "pt-BR")).toBe("/pt-BR");
    expect(getLocalizedPathname("/login", "ru")).toBe("/ru/login");
  });

  it("builds a localized href while preserving the query string", () => {
    expect(getLocalizedHref("/pt-BR", "en", "category=produtos")).toBe("/en?category=produtos");
    expect(getLocalizedHref("/pt-BR/listings/123", "es")).toBe("/es/listings/123");
  });
});
