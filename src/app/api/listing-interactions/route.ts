import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hashVisitorSessionId } from "@/lib/listing-interaction-session";
import {
  isListingInteractionEventType,
  listingIdPattern,
  listingInteractionSessionCookie,
} from "@/lib/listing-interactions";
import { recordListingInteraction } from "@/lib/listing-interactions-server";

const sessionCookieMaxAge = 60 * 60 * 24 * 180;

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

  const cookieStore = await cookies();
  const existingSessionId = cookieStore.get(listingInteractionSessionCookie)?.value;
  const visitorSessionId = existingSessionId || randomUUID();
  const visitorSessionHash = hashVisitorSessionId(visitorSessionId);

  try {
    const counted = await recordListingInteraction(listingId, eventType, visitorSessionHash);
    const response = NextResponse.json({ counted, ok: true });

    if (!existingSessionId) {
      response.cookies.set({
        httpOnly: true,
        maxAge: sessionCookieMaxAge,
        name: listingInteractionSessionCookie,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        value: visitorSessionId,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
