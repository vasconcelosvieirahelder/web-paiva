import { describe, expect, it } from "vitest";
import { getCompanyImageValidationError, parseCompanyRegistration } from "./company-registration";

function validFormData() {
  const formData = new FormData();
  formData.set("businessName", "Servicos Paiva");
  formData.set("categoryId", "11111111-1111-4111-8111-111111111111");
  formData.set("description", "Atendimento local dentro da Reserva do Paiva com suporte personalizado.");
  formData.set("whatsapp", "81999990000");
  formData.set("phone", "");
  formData.set("email", "contato@example.test");
  formData.set("websiteUrl", "");
  formData.set("referenceName", "Cliente Paiva");
  formData.set("referencePhone", "81988880000");
  formData.set("referenceNotes", "Atendimento residencial realizado na Reserva do Paiva.");
  formData.set("listingTitle", "Servicos residenciais no Paiva");
  formData.set("priceLabel", "A combinar");

  return formData;
}

describe("company registration", () => {
  it("accepts a complete company registration", () => {
    const result = parseCompanyRegistration(validFormData());

    expect(result.success).toBe(true);
  });

  it("requires a private reference phone", () => {
    const formData = validFormData();
    formData.set("referencePhone", "");
    const result = parseCompanyRegistration(formData);

    expect(result.success).toBe(false);
  });

  it("requires a useful business description", () => {
    const formData = validFormData();
    formData.set("description", "Curto");
    const result = parseCompanyRegistration(formData);

    expect(result.success).toBe(false);
  });

  it("accepts website links and Instagram handles with underscores", () => {
    const instagramHandle = validFormData();
    instagramHandle.set("websiteUrl", "@nessa_mc_");

    const websiteUrl = validFormData();
    websiteUrl.set("websiteUrl", "https://www.instagram.com/nessa_mc_/");

    expect(parseCompanyRegistration(instagramHandle).success).toBe(true);
    expect(parseCompanyRegistration(websiteUrl).success).toBe(true);
  });

  it("accepts only supported company image files up to 5 MB", () => {
    const validImage = new File(["image"], "logo.png", { type: "image/png" });
    const invalidType = new File(["file"], "logo.pdf", { type: "application/pdf" });
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "foto.jpg", { type: "image/jpeg" });

    expect(getCompanyImageValidationError(validImage)).toBeNull();
    expect(getCompanyImageValidationError(invalidType)).toBe("unsupported-type");
    expect(getCompanyImageValidationError(oversized)).toBe("too-large");
  });
});
