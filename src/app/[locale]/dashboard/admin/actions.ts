"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import {
  getAdvertiserStatusForModerationAction,
  getListingStatusForModerationAction,
  getModerationEventAction,
  isModerationAction,
} from "@/lib/moderation";
import { createClient } from "@/lib/supabase/server";

function getLocale(formData: FormData): Locale {
  const locale = String(formData.get("locale") ?? "pt-BR");

  return isLocale(locale) ? locale : "pt-BR";
}

function getRedirectPath(locale: Locale, status: string) {
  return `/${locale}/dashboard/admin?status=${encodeURIComponent(status)}`;
}

export async function moderateListing(formData: FormData) {
  const locale = getLocale(formData);
  const listingId = String(formData.get("listingId") ?? "");
  const action = String(formData.get("action") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);

  if (!listingId || !isModerationAction(action)) {
    redirect(getRedirectPath(locale, "invalid"));
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

  const { data: listing } = await supabase
    .from("listings")
    .select("id, advertiser_profile_id")
    .eq("id", listingId)
    .single();

  if (!listing) {
    redirect(getRedirectPath(locale, "not-found"));
  }

  const listingStatus = getListingStatusForModerationAction(action);
  const now = new Date().toISOString();
  const { error: listingError } = await supabase
    .from("listings")
    .update({
      status: listingStatus,
      rejection_reason: action === "reject" ? reason || "Recusado pela moderação." : null,
      approved_at: action === "approve" ? now : null,
      published_at: action === "approve" ? now : null,
      updated_at: now,
    })
    .eq("id", listingId);

  if (listingError) {
    redirect(getRedirectPath(locale, "save-error"));
  }

  const { error: advertiserError } = await supabase
    .from("advertiser_profiles")
    .update({
      status: getAdvertiserStatusForModerationAction(action),
      updated_at: now,
    })
    .eq("id", listing.advertiser_profile_id);

  if (advertiserError) {
    redirect(getRedirectPath(locale, "save-error"));
  }

  const { error: eventError } = await supabase.from("moderation_events").insert({
    listing_id: listingId,
    actor_id: user.id,
    action: getModerationEventAction(action),
    reason: reason || null,
  });

  if (eventError) {
    redirect(getRedirectPath(locale, "save-error"));
  }

  redirect(getRedirectPath(locale, action));
}
