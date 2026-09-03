import type { ListingInteractionEventType } from "@/lib/listing-interactions";
import { createServiceClient } from "@/lib/supabase/service";

export async function recordListingInteraction(
  listingId: string,
  eventType: ListingInteractionEventType,
  visitorSessionId: string,
  actorUserId: string | null,
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("record_listing_interaction", {
    p_actor_user_id: actorUserId,
    p_event_type: eventType,
    p_listing_id: listingId,
    p_visitor_session_id: visitorSessionId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
