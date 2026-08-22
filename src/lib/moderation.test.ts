import { describe, expect, it } from "vitest";
import {
  getAdvertiserStatusForModerationAction,
  getListingStatusForModerationAction,
  getModerationEventAction,
  isModerationAction,
  isListingAdvertiserProfileOwnershipConsistent,
} from "./moderation";

describe("moderation helpers", () => {
  it("maps admin actions to listing statuses", () => {
    expect(getListingStatusForModerationAction("approve")).toBe("approved");
    expect(getListingStatusForModerationAction("reject")).toBe("rejected");
    expect(getListingStatusForModerationAction("suspend")).toBe("suspended");
  });

  it("maps admin actions to advertiser profile statuses", () => {
    expect(getAdvertiserStatusForModerationAction("approve")).toBe("active");
    expect(getAdvertiserStatusForModerationAction("reject")).toBe("draft");
    expect(getAdvertiserStatusForModerationAction("suspend")).toBe("suspended");
  });

  it("maps admin actions to moderation event actions", () => {
    expect(getModerationEventAction("approve")).toBe("approved");
    expect(getModerationEventAction("reject")).toBe("rejected");
    expect(getModerationEventAction("suspend")).toBe("suspended");
  });

  it("recognizes only supported moderation actions", () => {
    expect(isModerationAction("approve")).toBe(true);
    expect(isModerationAction("reject")).toBe(true);
    expect(isModerationAction("suspend")).toBe(true);
    expect(isModerationAction("archive")).toBe(false);
  });

  it("allows moderation only when listing and advertiser profile have the same owner", () => {
    expect(
      isListingAdvertiserProfileOwnershipConsistent({
        listingOwnerId: "owner-1",
        advertiserProfileOwnerId: "owner-1",
      }),
    ).toBe(true);

    expect(
      isListingAdvertiserProfileOwnershipConsistent({
        listingOwnerId: "owner-1",
        advertiserProfileOwnerId: "owner-2",
      }),
    ).toBe(false);
  });

  it("rejects moderation when the advertiser profile owner is missing", () => {
    expect(
      isListingAdvertiserProfileOwnershipConsistent({
        listingOwnerId: "owner-1",
        advertiserProfileOwnerId: null,
      }),
    ).toBe(false);
  });
});
