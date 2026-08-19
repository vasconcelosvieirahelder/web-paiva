import { describe, expect, it } from "vitest";
import { getListingActiveDays, summarizeListingInteractions } from "./listing-interactions";

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

  it("counts active days from the publication date", () => {
    expect(getListingActiveDays("2026-08-14T12:00:00.000Z", new Date("2026-08-16T12:00:00.000Z"))).toBe(3);
  });

  it("keeps a newly published listing at one active day", () => {
    expect(getListingActiveDays("2026-08-16T10:00:00.000Z", new Date("2026-08-16T12:00:00.000Z"))).toBe(1);
  });
});
