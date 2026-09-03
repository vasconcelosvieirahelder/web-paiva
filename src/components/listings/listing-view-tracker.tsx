"use client";

import { useEffect, useRef } from "react";
import { trackListingInteraction } from "./tracked-contact-link";

type ListingViewTrackerProps = {
  listingId: string;
};

export function ListingViewTracker({ listingId }: ListingViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) {
      return;
    }

    hasTracked.current = true;
    trackListingInteraction(listingId, "view");
  }, [listingId]);

  return null;
}
