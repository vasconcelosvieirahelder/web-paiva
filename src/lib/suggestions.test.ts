import { describe, expect, it } from "vitest";
import { getSuggestionValidationError, normalizeSuggestionMessage } from "./suggestions";

describe("suggestions", () => {
  it("rejects empty messages", () => {
    expect(getSuggestionValidationError("   ")).toBe("empty");
  });

  it("accepts messages with up to 200 characters", () => {
    expect(getSuggestionValidationError("a".repeat(200))).toBeNull();
  });

  it("rejects messages with more than 200 characters", () => {
    expect(getSuggestionValidationError("a".repeat(201))).toBe("too-long");
  });

  it("trims surrounding spaces before saving", () => {
    expect(normalizeSuggestionMessage("  Melhorar a busca.  ")).toBe("Melhorar a busca.");
  });
});
