import { describe, expect, it } from "vitest";
import { buildStoragePath, getCompanyImageValidationError, parseCompanyRegistration } from "./company-registration";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

  it("builds company asset paths under the owner and advertiser profile folders", () => {
    const file = new File(["image"], "Minha Logo.PNG", { type: "image/png" });
    const path = buildStoragePath(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      file,
      "logo",
    );

    expect(path).toMatch(
      /^aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa\/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb\/logo-[0-9a-f-]+\.png$/,
    );
  });

  it("tracks uploads one at a time so partial failures can be cleaned up", () => {
    const actionSource = readFileSync(
      join(process.cwd(), "src", "app", "[locale]", "dashboard", "advertiser", "company", "actions.ts"),
      "utf8",
    );

    expect(actionSource).not.toContain("Promise.all");
    expect(actionSource).toContain("uploadedImages.push({ kind: \"logo\", path: logoPath })");
    expect(actionSource).toContain("uploadedImages.push({ kind: \"operation\", path: operationPhotoPath })");
  });

  it("cleans up listing rows created during a failed registration attempt", () => {
    const actionSource = readFileSync(
      join(process.cwd(), "src", "app", "[locale]", "dashboard", "advertiser", "company", "actions.ts"),
      "utf8",
    );

    expect(actionSource).toContain('supabase.from("listing_images").delete().eq("listing_id", listingId)');
    expect(actionSource).toContain('supabase.from("listings").delete().eq("id", listingId)');
  });

  it("uses one database call for the final submitted event and submitted_at state", () => {
    const actionSource = readFileSync(
      join(process.cwd(), "src", "app", "[locale]", "dashboard", "advertiser", "company", "actions.ts"),
      "utf8",
    );

    expect(actionSource).toContain('supabase.rpc("submit_company_registration"');
    expect(actionSource).not.toContain('supabase.from("moderation_events").insert');
    expect(actionSource).not.toContain("submitted_at: new Date().toISOString()");
  });
});
