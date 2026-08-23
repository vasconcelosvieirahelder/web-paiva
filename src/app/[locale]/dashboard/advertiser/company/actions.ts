"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { buildStoragePath, getCompanyImageValidationError, parseCompanyRegistration } from "@/lib/company-registration";
import { createClient } from "@/lib/supabase/server";

function getLocale(formData: FormData): Locale {
  const locale = String(formData.get("locale") ?? "pt-BR");

  return isLocale(locale) ? locale : "pt-BR";
}

type UploadedCompanyImage = {
  kind: "logo" | "operation";
  path: string;
};

function getImage(formData: FormData, key: string) {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

async function uploadCompanyImage(ownerId: string, advertiserProfileId: string, file: File | null, kind: "logo" | "operation") {
  if (!file) {
    return null;
  }

  if (getCompanyImageValidationError(file)) {
    throw new Error("Invalid company image.");
  }

  const supabase = await createClient();
  const path = buildStoragePath(ownerId, advertiserProfileId, file, kind);
  const { error } = await supabase.storage.from("company-assets").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

async function cleanupBestEffort(options: {
  advertiserProfileId: string | null;
  listingId: string | null;
  uploadedImages: UploadedCompanyImage[];
}) {
  try {
    await cleanupCompanyRegistrationAttempt(options);
  } catch (error) {
    console.error("Company registration cleanup failed.", error);
  }
}

async function cleanupCompanyRegistrationAttempt({
  advertiserProfileId,
  listingId,
  uploadedImages,
}: {
  advertiserProfileId: string | null;
  listingId: string | null;
  uploadedImages: UploadedCompanyImage[];
}) {
  if (uploadedImages.length === 0 && !advertiserProfileId && !listingId) {
    return;
  }

  const supabase = await createClient();

  if (listingId) {
    await supabase.from("listing_images").delete().eq("listing_id", listingId);
    await supabase.from("listings").delete().eq("id", listingId);
  }

  if (advertiserProfileId) {
    await supabase
      .from("advertiser_profiles")
      .update({
        logo_storage_path: null,
        operation_photo_storage_path: null,
      })
      .eq("id", advertiserProfileId);
  }

  if (uploadedImages.length > 0) {
    await supabase.storage.from("company-assets").remove(uploadedImages.map((image) => image.path));
  }
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
      logo_storage_path: null,
      operation_photo_storage_path: null,
      reference_name: parsed.data.referenceName || null,
      reference_phone: parsed.data.referencePhone,
      reference_notes: parsed.data.referenceNotes || null,
      submitted_at: null,
    })
    .select("id")
    .single();

  if (profileError || !advertiserProfile) {
    redirect(`/${locale}/dashboard/advertiser/company?error=save`);
  }

  let logoPath: string | null = null;
  let operationPhotoPath: string | null = null;
  const uploadedImages: UploadedCompanyImage[] = [];
  let listingId: string | null = null;

  try {
    logoPath = await uploadCompanyImage(user.id, advertiserProfile.id, logo, "logo");

    if (logoPath) {
      uploadedImages.push({ kind: "logo", path: logoPath });
    }

    operationPhotoPath = await uploadCompanyImage(user.id, advertiserProfile.id, operationPhoto, "operation");

    if (operationPhotoPath) {
      uploadedImages.push({ kind: "operation", path: operationPhotoPath });
    }
  } catch {
    await cleanupBestEffort({
      advertiserProfileId: advertiserProfile.id,
      listingId,
      uploadedImages,
    });
    redirect(`/${locale}/dashboard/advertiser/company?error=image`);
  }

  const { error: profileAssetsError } = await supabase
    .from("advertiser_profiles")
    .update({
      logo_storage_path: logoPath,
      operation_photo_storage_path: operationPhotoPath,
    })
    .eq("id", advertiserProfile.id);

  if (profileAssetsError) {
    await cleanupBestEffort({
      advertiserProfileId: advertiserProfile.id,
      listingId,
      uploadedImages,
    });
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
    await cleanupBestEffort({
      advertiserProfileId: advertiserProfile.id,
      listingId,
      uploadedImages,
    });
    redirect(`/${locale}/dashboard/advertiser/company?error=save`);
  }

  listingId = listing.id;

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
      await cleanupBestEffort({
        advertiserProfileId: advertiserProfile.id,
        listingId,
        uploadedImages,
      });
      redirect(`/${locale}/dashboard/advertiser/company?error=save`);
    }
  }

  const { error: submissionError } = await supabase.rpc("submit_company_registration", {
    p_advertiser_profile_id: advertiserProfile.id,
    p_listing_id: listing.id,
  });

  if (submissionError) {
    await cleanupBestEffort({
      advertiserProfileId: advertiserProfile.id,
      listingId,
      uploadedImages,
    });
    redirect(`/${locale}/dashboard/advertiser/company?error=save`);
  }

  redirect(`/${locale}/dashboard/advertiser?status=submitted`);
}
