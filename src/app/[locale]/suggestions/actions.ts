"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getSuggestionValidationError, normalizeSuggestionMessage } from "@/lib/suggestions";
import { createClient } from "@/lib/supabase/server";

function getActionLocale(formData: FormData): Locale {
  const locale = String(formData.get("locale") ?? "pt-BR");

  return isLocale(locale) ? locale : "pt-BR";
}

export async function submitSuggestionAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const message = String(formData.get("message") ?? "");
  const validationError = getSuggestionValidationError(message);

  if (validationError) {
    redirect(`/${locale}/suggestions?error=${validationError}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { error } = await supabase.from("suggestions").insert({
    message: normalizeSuggestionMessage(message),
    user_id: user.id,
  });

  if (error) {
    redirect(`/${locale}/suggestions?error=save`);
  }

  redirect(`/${locale}/suggestions?status=sent`);
}
