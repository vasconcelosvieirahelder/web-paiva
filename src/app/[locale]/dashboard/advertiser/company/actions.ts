"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { buildStoragePath, getCompanyImageValidationError, parseCompanyRegistration } from "@/lib/company-registration";
import { createClient } from "@/lib/supabase/server";

function getLocale(formData: FormData): Locale {
  const locale = String(formData.get("locale") ?? "pt-BR");

  return isLocale(locale) ? locale : "pt-BR";
}

function getImage(formData: FormData, key: string) {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

async function uploadCompanyImage(ownerId: string, file: File | null, kind: "logo" | "operation") {
  if (!file) {
    return null;
  }

  if (getCompanyImageValidationError(file)) {
    throw new Error("Invalid company image.");
  }

  const supabase = await createClient();
  const path = buildStoragePath(ownerId, file, kind);
  const { error } = await supabase.storage.from("company-assets").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function submitCompanyRegistration(formData: FormData) {
  const locale = getLocale(formData);
  const parsed = parseCompanyRegistration(formData);

  if (!parsed.success) {
    redirect(`/${locale}/dashboard/advertiser/company?error=invalid`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const logo = getImage(formData, "logo");
  const operationPhoto = getImage(formData, "operationPhoto");

  if (getCompanyImageValidationError(logo) || getCompanyImageValidationError(operationPhoto)) {
    redirect(`/${locale}/dashboard/advertiser/company?error=image`);
  }

  let logoPath: string | null = null;
  let operationPhotoPath: string | null = null;

  try {
    [logoPath, operationPhotoPath] = await Promise.all([
      uploadCompanyImage(user.id, logo, "logo"),
      uploadCompanyImage(user.id, operationPhoto, "operation"),
    ]);
  } catch {
    redirect(`/${locale}/dashboard/advertiser/company?error=image`);
  }

  const { data: advertiserProfile, error: profileError } = await supabase
    .from("advertiser_profiles")
    .insert({
      owner_id: user.id,
      business_name: parsed.data.businessName,
      description: parsed.data.description,
      website_url: parsed.data.websiteUrl || null,
      whatsapp: parsed.data.whatsapp || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      status: "draft",
      logo_storage_path: logoPath,
      operation_photo_storage_path: operationPhotoPath,
      reference_name: parsed.data.referenceName || null,
      reference_phone: parsed.data.referencePhone,
      reference_notes: parsed.data.referenceNotes || null,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (profileError || !advertiserProfile) {
    redirect(`/${locale}/dashboard/advertiser/company?error=save`);
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      advertiser_profile_id: advertiserProfile.id,
      owner_id: user.id,
      category_id: parsed.data.categoryId,
      title: parsed.data.listingTitle,
      description: parsed.data.description,
      price_label: parsed.data.priceLabel || null,
      contact_whatsapp: parsed.data.whatsapp || null,
      contact_phone: parsed.data.phone || null,
      contact_email: parsed.data.email || null,
      contact_url: parsed.data.websiteUrl || null,
      status: "pending_review",
    })
    .select("id")
    .single();

  if (listingError || !listing) {
    redirect(`/${locale}/dashboard/advertiser/company?error=save`);
  }

  const imageRows = [
    logoPath
      ? {
          listing_id: listing.id,
          owner_id: user.id,
          storage_path: logoPath,
          alt_text: `Logomarca de ${parsed.data.businessName}`,
          image_kind: "logo",
          sort_order: 0,
        }
      : null,
    operationPhotoPath
      ? {
          listing_id: listing.id,
          owner_id: user.id,
          storage_path: operationPhotoPath,
          alt_text: `Foto de operação de ${parsed.data.businessName}`,
          image_kind: "operation",
          sort_order: 1,
        }
      : null,
  ].filter((row) => row !== null);

  if (imageRows.length > 0) {
    const { error: imageError } = await supabase.from("listing_images").insert(imageRows);

    if (imageError) {
      redirect(`/${locale}/dashboard/advertiser/company?error=save`);
    }
  }

  await supabase.from("moderation_events").insert({
    listing_id: listing.id,
    actor_id: user.id,
    action: "submitted",
    reason: "Cadastro enviado para análise.",
  });

  redirect(`/${locale}/dashboard/advertiser?status=submitted`);
}
