import { describe, expect, it } from "vitest";
import { getInitialTheme, getNextTheme, getSafeTheme, themes } from "./theme";

describe("theme", () => {
  it("accepts only supported theme names", () => {
    expect(themes).toEqual(["light", "dark"]);
    expect(getSafeTheme("dark")).toBe("dark");
    expect(getSafeTheme("light")).toBe("light");
    expect(getSafeTheme("unexpected")).toBe("light");
  });

  it("toggles between light and dark", () => {
    expect(getNextTheme("light")).toBe("dark");
    expect(getNextTheme("dark")).toBe("light");
  });

  it("uses saved theme before browser preference", () => {
    expect(getInitialTheme("light", true)).toBe("light");
    expect(getInitialTheme("dark", false)).toBe("dark");
  });

  it("uses browser preference when no theme is saved", () => {
    expect(getInitialTheme(null, true)).toBe("dark");
    expect(getInitialTheme(null, false)).toBe("light");
  });
});
