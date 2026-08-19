import { describe, expect, it } from "vitest";
import { messages } from "./messages";

describe("messages", () => {
  it("does not contain common mojibake markers from broken UTF-8 decoding", () => {
    const allText = JSON.stringify(messages);

    expect(allText).not.toMatch(/Ã|Â|Ð|Ñ|æ|å/);
  });

  it("explains invalid login credentials clearly in Portuguese", () => {
    expect(messages["pt-BR"].authError).toContain("E-mail ou senha inválidos");
    expect(messages["pt-BR"].authError).toContain("confirmado");
  });
});
