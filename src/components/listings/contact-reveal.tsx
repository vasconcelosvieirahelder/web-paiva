"use client";

import { useRef, useState, type ToggleEvent } from "react";
import type { ListingContact } from "@/lib/listings";
import { TrackedContactLink, trackListingInteraction } from "./tracked-contact-link";

type ContactRevealProps = {
  contacts: ListingContact[];
  listingId: string;
  showContactsLabel: string;
};

export function ContactReveal({ contacts, listingId, showContactsLabel }: ContactRevealProps) {
  const hasTrackedReveal = useRef(false);
  const [hasSentInteraction, setHasSentInteraction] = useState(false);

  function trackRevealOnce(isOpen: boolean) {
    if (!isOpen) {
      return;
    }

    if (hasTrackedReveal.current) {
      return;
    }

    hasTrackedReveal.current = true;
    trackListingInteraction(listingId, "contact_click");
    setHasSentInteraction(true);
  }

  function handleToggle(event: ToggleEvent<HTMLDetailsElement>) {
    trackRevealOnce(event.currentTarget.open);
  }

  return (
    <details className="group mt-4" onToggle={handleToggle}>
      <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 marker:hidden">
        <span className="group-open:hidden">{showContactsLabel}</span>
        <span className="hidden group-open:inline">Ocultar contatos</span>
      </summary>
      <div className="mt-4">
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {contacts.map((contact) => (
            <TrackedContactLink contact={contact} key={contact.label} listingId={listingId} />
          ))}
        </div>
        {hasSentInteraction ? <p className="mt-3 text-xs font-medium text-teal-800">Interação registrada.</p> : null}
      </div>
    </details>
  );
}
