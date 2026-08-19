import { NextResponse } from "next/server";
import { isListingInteractionEventType, listingIdPattern } from "@/lib/listing-interactions";
import { recordListingInteraction } from "@/lib/listing-interactions-server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    eventType?: string;
    listingId?: string;
  } | null;
  const listingId = body?.listingId ?? "";
  const eventType = body?.eventType ?? "";

  if (!listingIdPattern.test(listingId) || !isListingInteractionEventType(eventType)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await recordListingInteraction(listingId, eventType);
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
