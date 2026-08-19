export type ListingEditInput = {
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_url?: string | null;
  contact_whatsapp?: string | null;
  description: string;
  price_label?: string | null;
  title: string;
};

export type ListingEditValidationError = "missing-title" | "missing-description";

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

export function normalizeListingEditInput(input: ListingEditInput) {
  return {
    contact_email: normalizeOptionalText(input.contact_email),
    contact_phone: normalizeOptionalText(input.contact_phone),
    contact_url: normalizeOptionalText(input.contact_url),
    contact_whatsapp: normalizeOptionalText(input.contact_whatsapp),
    description: input.description.trim(),
    price_label: normalizeOptionalText(input.price_label),
    title: input.title.trim(),
  };
}

export function getListingEditValidationError(input: Pick<ListingEditInput, "description" | "title">): ListingEditValidationError | null {
  if (!input.title.trim()) {
    return "missing-title";
  }

  if (!input.description.trim()) {
    return "missing-description";
  }

  return null;
}
