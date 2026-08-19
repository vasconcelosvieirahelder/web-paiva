import { describe, expect, it } from "vitest";
import { canAccessAdvertiserSetup, formatProfileRole } from "./profiles";

describe("profile helpers", () => {
  it("formats known profile roles", () => {
    expect(formatProfileRole("visitor")).toBe("Visitante");
    expect(formatProfileRole("advertiser")).toBe("Anunciante");
    expect(formatProfileRole("admin")).toBe("Administrador");
  });

  it("falls back to visitor for missing or unexpected roles", () => {
    expect(formatProfileRole(null)).toBe("Visitante");
    expect(formatProfileRole("unknown")).toBe("Visitante");
  });

  it("allows advertiser setup only for advertiser and admin roles", () => {
    expect(canAccessAdvertiserSetup("visitor")).toBe(false);
    expect(canAccessAdvertiserSetup("advertiser")).toBe(true);
    expect(canAccessAdvertiserSetup("admin")).toBe(true);
    expect(canAccessAdvertiserSetup(undefined)).toBe(false);
  });
});
