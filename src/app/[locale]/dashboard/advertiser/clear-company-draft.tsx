"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/config";

type ClearCompanyDraftProps = {
  locale: Locale;
};

export function ClearCompanyDraft({ locale }: ClearCompanyDraftProps) {
  useEffect(() => {
    window.localStorage.removeItem(`web-paiva-company-form-${locale}`);
  }, [locale]);

  return null;
}
