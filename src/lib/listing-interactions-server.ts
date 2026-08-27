import type { ListingInteractionEventType } from "@/lib/listing-interactions";
import { createClient } from "@/lib/supabase/server";

export async function recordListingInteraction(
  listingId: string,
  eventType: ListingInteractionEventType,
  visitorSessionId: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("record_listing_interaction", {
    p_event_type: eventType,
    p_listing_id: listingId,
    p_visitor_session_id: visitorSessionId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
