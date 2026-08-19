import { describe, expect, it } from "vitest";
import {
  getPasswordConfirmationError,
  getPasswordValidationError,
  getSafeAuthCallbackRedirectPath,
  getSafeLoginRedirectPath,
  isValidEmail,
} from "./account";

describe("account helpers", () => {
  it("accepts passwords with at least six characters", () => {
    expect(getPasswordValidationError("122906")).toBeNull();
  });

  it("rejects short passwords", () => {
    expect(getPasswordValidationError("12345")).toBe("short-password");
  });

  it("rejects password confirmation mismatches", () => {
    expect(getPasswordConfirmationError("122906", "122907")).toBe("password-mismatch");
  });

  it("accepts matching password confirmation", () => {
    expect(getPasswordConfirmationError("122906", "122906")).toBeNull();
  });

  it("validates basic email format", () => {
    expect(isValidEmail("vasconcelosvieira.helder@gmail.com")).toBe(true);
    expect(isValidEmail("email-invalido")).toBe(false);
  });

  it("keeps safe internal login return paths", () => {
    expect(getSafeLoginRedirectPath("/pt-BR/suggestions", "pt-BR")).toBe("/pt-BR/suggestions");
  });

  it("falls back to dashboard for unsafe login return paths", () => {
    expect(getSafeLoginRedirectPath("https://example.com", "pt-BR")).toBe("/pt-BR/dashboard");
    expect(getSafeLoginRedirectPath("//example.com", "pt-BR")).toBe("/pt-BR/dashboard");
    expect(getSafeLoginRedirectPath("/en/dashboard", "pt-BR")).toBe("/pt-BR/dashboard");
  });

  it("falls back to dashboard for unsafe auth callback return paths", () => {
    expect(getSafeAuthCallbackRedirectPath("/pt-BR/reset-password")).toBe("/pt-BR/reset-password");
    expect(getSafeAuthCallbackRedirectPath("https://example.com")).toBe("/pt-BR/dashboard");
    expect(getSafeAuthCallbackRedirectPath("//example.com")).toBe("/pt-BR/dashboard");
    expect(getSafeAuthCallbackRedirectPath(null)).toBe("/pt-BR/dashboard");
  });
});
