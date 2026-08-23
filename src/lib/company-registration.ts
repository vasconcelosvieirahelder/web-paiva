import { z } from "zod";

const phoneRegex = /^\d{8,15}$/;
const socialHandleRegex = /^@?[a-zA-Z0-9._]{2,40}$/;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxCompanyImageSize = 5 * 1024 * 1024;

function isValidWebsiteOrSocial(value: string) {
  if (!value) {
    return true;
  }

  if (socialHandleRegex.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const companyRegistrationSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  categoryId: z.string().uuid(),
  description: z.string().trim().min(20).max(1200),
  whatsapp: z.string().trim().regex(phoneRegex).optional().or(z.literal("")),
  phone: z.string().trim().regex(phoneRegex).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  websiteUrl: z.string().trim().max(250).refine(isValidWebsiteOrSocial).optional().or(z.literal("")),
  referenceName: z.string().trim().max(120).optional().or(z.literal("")),
  referencePhone: z.string().trim().regex(phoneRegex),
  referenceNotes: z.string().trim().max(500).optional().or(z.literal("")),
  listingTitle: z.string().trim().min(4).max(140),
  priceLabel: z.string().trim().max(80).optional().or(z.literal("")),
});

export type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>;

export function parseCompanyRegistration(formData: FormData) {
  return companyRegistrationSchema.safeParse({
    businessName: formData.get("businessName"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    whatsapp: formData.get("whatsapp"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    websiteUrl: formData.get("websiteUrl"),
    referenceName: formData.get("referenceName"),
    referencePhone: formData.get("referencePhone"),
    referenceNotes: formData.get("referenceNotes"),
    listingTitle: formData.get("listingTitle"),
    priceLabel: formData.get("priceLabel"),
  });
}

export function buildStoragePath(ownerId: string, advertiserProfileId: string, file: File, kind: "logo" | "operation") {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(extension) ? extension : "jpg";

  return `${ownerId}/${advertiserProfileId}/${kind}-${crypto.randomUUID()}.${safeExtension}`;
}

export function getCompanyImageValidationError(file: File | null) {
  if (!file) {
    return null;
  }

  if (!allowedImageTypes.has(file.type)) {
    return "unsupported-type";
  }

  if (file.size > maxCompanyImageSize) {
    return "too-large";
  }

  return null;
}
