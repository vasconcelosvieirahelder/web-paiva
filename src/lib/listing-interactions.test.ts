import { describe, expect, it } from "vitest";
import {
  getInteractionDayUTC,
  getListingActiveDays,
  summarizeListingInteractions,
} from "./listing-interactions";
import { hashVisitorSessionId } from "./listing-interaction-session";

describe("listing interactions", () => {
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
});
