import type { SupabaseClient } from "@supabase/supabase-js";

export type AdvertiserDashboardListing = {
  approved_at: string | null;
  created_at: string;
  id: string;
  listing_interactions: Array<{
    event_type: string;
  }> | null;
  published_at: string | null;
  title: string;
};

function buildApprovedListingsFilter(userId: string, advertiserProfileIds: string[]) {
  if (advertiserProfileIds.length === 0) {
    return `owner_id.eq.${userId}`;
  }

  return `owner_id.eq.${userId},advertiser_profile_id.in.(${advertiserProfileIds.join(",")})`;
}

export async function getApprovedListingsForAdvertiserDashboard(supabase: SupabaseClient, userId: string) {
  const { data: advertiserProfiles } = await supabase
    .from("advertiser_profiles")
    .select("id")
    .eq("owner_id", userId);
  const advertiserProfileIds = advertiserProfiles?.map((profile) => profile.id).filter(Boolean) ?? [];
  const { data } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        approved_at,
        created_at,
        published_at,
        listing_interactions (
          event_type
        )
      `,
    )
    .or(buildApprovedListingsFilter(userId, advertiserProfileIds))
    .eq("status", "approved")
    .order("published_at", { ascending: false });

  return (data ?? []) as AdvertiserDashboardListing[];
}
