"use client";

import type { ListingContact } from "@/lib/listings";

type TrackedContactLinkProps = {
  contact: ListingContact;
  listingId: string;
};

export function trackListingInteraction(listingId: string, eventType: "contact_click" | "whatsapp_click") {
  const payload = JSON.stringify({
    eventType,
    listingId,
  });

  return fetch("/api/listing-interactions", {
    body: payload,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => undefined);
}

export function trackListingInteractionBeforeNavigation(listingId: string, eventType: "contact_click" | "whatsapp_click") {
  try {
    const payload = JSON.stringify({
      eventType,
      listingId,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/listing-interactions", blob);
      return;
    }

    trackListingInteraction(listingId, eventType);
  } catch {
    return;
  }
}

export function TrackedContactLink({ contact, listingId }: TrackedContactLinkProps) {
  return (
    <a
      className="grid min-h-16 min-w-0 gap-1 rounded-md bg-white px-4 py-3 text-left text-sm text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-100 sm:min-w-52"
      href={contact.href}
      onClick={() => {
        if (contact.label === "WhatsApp") {
          trackListingInteractionBeforeNavigation(listingId, "whatsapp_click");
        }
      }}
      rel="noopener noreferrer"
      target={contact.label === "Telefone" || contact.label === "Email" ? undefined : "_blank"}
    >
      <span className="font-semibold">{contact.label}</span>
      <span className="break-words text-slate-700">{contact.displayValue}</span>
    </a>
  );
}
