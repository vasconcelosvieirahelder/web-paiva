"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getListingEditValidationError, normalizeListingEditInput } from "@/lib/listing-edit";
import { createClient } from "@/lib/supabase/server";

function getLocale(formData: FormData): Locale {
  const locale = String(formData.get("locale") ?? "pt-BR");

  return isLocale(locale) ? locale : "pt-BR";
}

function getRedirectPath(locale: Locale, listingId: string, status: string) {
  return `/${locale}/listings/${listingId}?status=${encodeURIComponent(status)}`;
}

export async function updateListingDetailsAction(formData: FormData) {
  const locale = getLocale(formData);
  const listingId = String(formData.get("listingId") ?? "");
  const input = normalizeListingEditInput({
    contact_email: String(formData.get("contact_email") ?? ""),
    contact_phone: String(formData.get("contact_phone") ?? ""),
    contact_url: String(formData.get("contact_url") ?? ""),
    contact_whatsapp: String(formData.get("contact_whatsapp") ?? ""),
    description: String(formData.get("description") ?? ""),
    price_label: String(formData.get("price_label") ?? ""),
    title: String(formData.get("title") ?? ""),
  });

  if (!listingId) {
    redirect(`/${locale}`);
  }

  const validationError = getListingEditValidationError(input);

  if (validationError) {
    redirect(getRedirectPath(locale, listingId, validationError));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  const { error } = await supabase
    .from("listings")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId);

  if (error) {
    redirect(getRedirectPath(locale, listingId, "save-error"));
  }

  redirect(getRedirectPath(locale, listingId, "updated"));
}
