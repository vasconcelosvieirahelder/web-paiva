import { describe, expect, it } from "vitest";
import { defaultLocale, isLocale, locales } from "./config";
import { messages } from "./messages";

describe("i18n config", () => {
  it("supports the five MVP locales", () => {
    expect(locales).toEqual(["pt-BR", "en", "es", "ru", "zh-CN"]);
    expect(defaultLocale).toBe("pt-BR");
  });

  it("has messages for every locale", () => {
    for (const locale of locales) {
      expect(messages[locale].appName.length).toBeGreaterThan(0);
      expect(messages[locale].signIn.length).toBeGreaterThan(0);
    }
  });

  it("rejects unsupported locales", () => {
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("pt-BR")).toBe(true);
  });
});

