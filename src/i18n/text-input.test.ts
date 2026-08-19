import { describe, expect, it } from "vitest";
import { getSpellCheckLanguage, shouldUseNativeSpellCheck } from "./text-input";

describe("text input language helpers", () => {
  it("maps supported locales to browser spellcheck language tags", () => {
    expect(getSpellCheckLanguage("pt-BR")).toBe("pt-BR");
    expect(getSpellCheckLanguage("en")).toBe("en-US");
    expect(getSpellCheckLanguage("es")).toBe("es-ES");
    expect(getSpellCheckLanguage("ru")).toBe("ru-RU");
    expect(getSpellCheckLanguage("zh-CN")).toBe("zh-CN");
  });

  it("enables native spellcheck only for human-written text fields", () => {
    expect(shouldUseNativeSpellCheck()).toBe(true);
    expect(shouldUseNativeSpellCheck("text")).toBe(true);
    expect(shouldUseNativeSpellCheck("search")).toBe(true);
    expect(shouldUseNativeSpellCheck("email")).toBe(false);
    expect(shouldUseNativeSpellCheck("url")).toBe(false);
    expect(shouldUseNativeSpellCheck("tel")).toBe(false);
    expect(shouldUseNativeSpellCheck("password")).toBe(false);
  });
});
