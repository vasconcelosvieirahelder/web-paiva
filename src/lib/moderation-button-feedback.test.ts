import { describe, expect, it } from "vitest";
import {
  getModerationButtonClassName,
  getModerationButtonLabel,
  shouldHighlightModerationAction,
} from "./moderation-button-feedback";

describe("moderation button feedback", () => {
  it("uses action-specific loading labels for reject and suspend", () => {
    expect(getModerationButtonLabel("reject", "Recusar", true)).toBe("Recusando...");
    expect(getModerationButtonLabel("suspend", "Suspender", true)).toBe("Suspendendo...");
  });

  it("keeps the idle labels unchanged", () => {
    expect(getModerationButtonLabel("reject", "Recusar", false)).toBe("Recusar");
    expect(getModerationButtonLabel("suspend", "Suspender", false)).toBe("Suspender");
  });

  it("highlights only the destructive moderation actions", () => {
    expect(shouldHighlightModerationAction("approve")).toBe(false);
    expect(shouldHighlightModerationAction("reject")).toBe(true);
    expect(shouldHighlightModerationAction("suspend")).toBe(true);
  });

  it("adds visible hover, pressed, focus and disabled feedback to reject and suspend", () => {
    const rejectClassName = getModerationButtonClassName("reject");
    const suspendClassName = getModerationButtonClassName("suspend");

    for (const className of [rejectClassName, suspendClassName]) {
      expect(className).toContain("hover:");
      expect(className).toContain("active:");
      expect(className).toContain("focus-visible:");
      expect(className).toContain("disabled:");
      expect(className).toContain("dark:");
    }
  });
});
