import { describe, expect, it } from "vitest";
import { getListingEditValidationError, normalizeListingEditInput } from "./listing-edit";

describe("listing edit", () => {
  it("rejects an empty title", () => {
    expect(getListingEditValidationError({ title: " ", description: "Descricao valida" })).toBe("missing-title");
  });

  it("rejects an empty description", () => {
    expect(getListingEditValidationError({ title: "Titulo valido", description: " " })).toBe("missing-description");
  });

  it("accepts title and description", () => {
    expect(getListingEditValidationError({ title: "Titulo valido", description: "Descricao valida" })).toBeNull();
  });

  it("normalizes optional contact fields", () => {
    expect(
      normalizeListingEditInput({
        contact_email: " contato@example.com ",
        contact_phone: " ",
        contact_url: " https://example.com ",
        contact_whatsapp: " 81999990000 ",
        description: " Texto ",
        price_label: " A combinar ",
        title: " Titulo ",
      }),
    ).toEqual({
      contact_email: "contato@example.com",
      contact_phone: null,
      contact_url: "https://example.com",
      contact_whatsapp: "81999990000",
      description: "Texto",
      price_label: "A combinar",
      title: "Titulo",
    });
  });
});
