import { afterEach, describe, expect, it } from "vitest";
import {
  getInteractionDayUTC,
  getListingActiveDays,
  summarizeListingInteractions,
} from "./listing-interactions";
import {
  buildInteractionIdentity,
  getInteractionFingerprintSecret,
  getTrustedInfrastructureIp,
  hashVisitorSessionId,
} from "./listing-interaction-session";

const originalInteractionSecret = process.env.INTERACTION_FINGERPRINT_SECRET;
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe("listing interactions", () => {
  afterEach(() => {
    process.env.INTERACTION_FINGERPRINT_SECRET = originalInteractionSecret;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
  });

  it("summarizes views, contact clicks, and WhatsApp clicks", () => {
    expect(
      summarizeListingInteractions([
        { event_type: "view" },
        { event_type: "view" },
        { event_type: "contact_click" },
        { event_type: "whatsapp_click" },
      ]),
    ).toEqual({
      contactClicks: 1,
      views: 2,
      whatsappClicks: 1,
    });
  });

  it("excludes owner and admin interactions from dashboard summaries", () => {
    expect(
      summarizeListingInteractions([
        { event_type: "view", is_owner_or_admin: true },
        { event_type: "contact_click", is_owner_or_admin: true },
        { event_type: "whatsapp_click", is_owner_or_admin: true },
        { event_type: "view", is_owner_or_admin: false },
      ]),
    ).toEqual({
      contactClicks: 0,
      views: 1,
      whatsappClicks: 0,
    });
  });

  it("keeps legacy interaction rows in dashboard summaries", () => {
    expect(
      summarizeListingInteractions([
        { event_type: "view" },
        { event_type: "contact_click", is_owner_or_admin: null },
      ]),
    ).toEqual({
      contactClicks: 1,
      views: 1,
      whatsappClicks: 0,
    });
  });

  it("counts active days from the publication date", () => {
    expect(getListingActiveDays("2026-08-14T12:00:00.000Z", new Date("2026-08-16T12:00:00.000Z"))).toBe(3);
  });

  it("keeps a newly published listing at one active day", () => {
    expect(getListingActiveDays("2026-08-16T10:00:00.000Z", new Date("2026-08-16T12:00:00.000Z"))).toBe(1);
  });

  it("calculates the interaction day in UTC", () => {
    expect(getInteractionDayUTC(new Date("2026-08-27T23:59:59.999Z"))).toBe("2026-08-27");
    expect(getInteractionDayUTC(new Date("2026-08-28T00:00:00.000Z"))).toBe("2026-08-28");
  });

  it("hashes visitor sessions without exposing the raw cookie value", () => {
    const rawSession = "opaque-session-token";
    const hash = hashVisitorSessionId(rawSession);

    expect(hash).not.toBe(rawSession);
    expect(hash).toHaveLength(64);
    expect(hashVisitorSessionId(rawSession)).toBe(hash);
  });

  it("uses trusted infrastructure IP when the browser does not keep a cookie", () => {
    const identityA = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: "203.0.113.10",
      userAgent: "Mozilla/5.0",
      visitorSessionId: null,
    });
    const identityB = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: "203.0.113.10",
      userAgent: "Mozilla/5.0",
      visitorSessionId: null,
    });

    expect(identityA).toBe(identityB);
    expect(identityA).toHaveLength(64);
  });

  it("uses different cookies to avoid undercounting when there is no trusted IP", () => {
    const identityA = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: null,
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-a",
    });
    const identityB = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: null,
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-b",
    });

    expect(identityA).not.toBe(identityB);
  });

  it("keeps the same cookie and context on the same interaction identity", () => {
    const input = {
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: null,
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-a",
    };

    expect(buildInteractionIdentity(input)).toBe(buildInteractionIdentity(input));
  });

  it("uses trusted infrastructure IP when it is available", () => {
    const identityA = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: "203.0.113.10",
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-a",
    });
    const identityB = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: "203.0.113.10",
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-b",
    });

    expect(identityA).toBe(identityB);
  });

  it("keeps the same trusted IP identity when user-agent changes", () => {
    const identityA = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: "203.0.113.10",
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-a",
    });
    const identityB = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: "203.0.113.10",
      userAgent: "CustomBot/1.0",
      visitorSessionId: "session-a",
    });

    expect(identityA).toBe(identityB);
  });

  it("keeps the same trusted IP identity when accept-language changes", () => {
    const identityA = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: "203.0.113.10",
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-a",
    });
    const identityB = buildInteractionIdentity({
      acceptLanguage: "ru",
      secret: "server-only-secret",
      trustedIp: "203.0.113.10",
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-a",
    });

    expect(identityA).toBe(identityB);
  });

  it("keeps the same cookie identity when user-agent changes without trusted IP", () => {
    const identityA = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: null,
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-a",
    });
    const identityB = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: null,
      userAgent: "CustomBot/1.0",
      visitorSessionId: "session-a",
    });

    expect(identityA).toBe(identityB);
  });

  it("keeps the same cookie identity when accept-language changes without trusted IP", () => {
    const identityA = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: null,
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-a",
    });
    const identityB = buildInteractionIdentity({
      acceptLanguage: "zh-CN",
      secret: "server-only-secret",
      trustedIp: null,
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-a",
    });

    expect(identityA).toBe(identityB);
  });

  it("uses different identities for different trusted IPs", () => {
    const identityA = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: "203.0.113.10",
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-a",
    });
    const identityB = buildInteractionIdentity({
      acceptLanguage: "pt-BR",
      secret: "server-only-secret",
      trustedIp: "203.0.113.20",
      userAgent: "Mozilla/5.0",
      visitorSessionId: "session-a",
    });

    expect(identityA).not.toBe(identityB);
  });

  it("requires a dedicated interaction fingerprint secret", () => {
    process.env.INTERACTION_FINGERPRINT_SECRET = "";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key-must-not-be-used";

    expect(() => getInteractionFingerprintSecret()).toThrow("Interaction fingerprint secret is not configured.");
  });

  it("does not trust generic forwarded headers for the interaction identity", () => {
    const headers = new Headers({
      "x-forwarded-for": "198.51.100.99",
    });

    expect(getTrustedInfrastructureIp(headers)).toBeNull();
  });

  it("uses the Vercel forwarded IP header as the trusted production source", () => {
    const headers = new Headers({
      "x-forwarded-for": "198.51.100.99",
      "x-vercel-forwarded-for": "203.0.113.10",
    });

    expect(getTrustedInfrastructureIp(headers)).toBe("203.0.113.10");
  });
});
