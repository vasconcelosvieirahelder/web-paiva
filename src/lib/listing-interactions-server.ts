import type { ListingInteractionEventType } from "@/lib/listing-interactions";
import { createClient } from "@/lib/supabase/server";

export async function recordListingInteraction(listingId: string, eventType: ListingInteractionEventType) {
  const supabase = await createClient();

  const { error } = await supabase.from("listing_interactions").insert({
    event_type: eventType,
    listing_id: listingId,
  });

  if (error) {
    throw new Error(error.message);
  }
}
