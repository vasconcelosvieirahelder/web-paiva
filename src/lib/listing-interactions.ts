export const listingInteractionEventTypes = ["view", "contact_click", "whatsapp_click"] as const;

export type ListingInteractionEventType = (typeof listingInteractionEventTypes)[number];

export const listingIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ListingInteractionRow = {
  event_type: string;
};

export type ListingInteractionSummary = {
  contactClicks: number;
  views: number;
  whatsappClicks: number;
};

export function isListingInteractionEventType(value: string): value is ListingInteractionEventType {
  return listingInteractionEventTypes.includes(value as ListingInteractionEventType);
}

export function summarizeListingInteractions(rows: ListingInteractionRow[]): ListingInteractionSummary {
  return rows.reduce<ListingInteractionSummary>(
    (summary, row) => {
      if (row.event_type === "view") {
        summary.views += 1;
      }

      if (row.event_type === "contact_click") {
        summary.contactClicks += 1;
      }

      if (row.event_type === "whatsapp_click") {
        summary.whatsappClicks += 1;
      }

      return summary;
    },
    { contactClicks: 0, views: 0, whatsappClicks: 0 },
  );
}

export function getListingActiveDays(activeSince: string | null | undefined, now = new Date()) {
  if (!activeSince) {
    return 0;
  }

  const activeSinceDate = new Date(activeSince);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const elapsedDays = Math.floor((now.getTime() - activeSinceDate.getTime()) / millisecondsPerDay);

  return Math.max(1, elapsedDays + 1);
}
