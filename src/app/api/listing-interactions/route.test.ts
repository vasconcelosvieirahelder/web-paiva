import { describe, expect, it } from "vitest";
import { listingIdPattern } from "../../../lib/listing-interactions";

const listingId = "3ebdad8c-044f-4f84-967f-32f1fe6eca9f";

describe("listing interactions API", () => {
  it("accepts standard listing UUIDs", () => {
    expect(listingIdPattern.test(listingId)).toBe(true);
  });
});
