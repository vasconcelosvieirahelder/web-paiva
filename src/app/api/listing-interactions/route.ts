import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  buildInteractionIdentity,
  getInteractionFingerprintSecret,
  getTrustedInfrastructureIp,
} from "@/lib/listing-interaction-session";
import {
  isListingInteractionEventType,
  listingIdPattern,
  listingInteractionSessionCookie,
} from "@/lib/listing-interactions";
import { recordListingInteraction } from "@/lib/listing-interactions-server";
import { createClient } from "@/lib/supabase/server";

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

  try {
    const interactionIdentity = buildInteractionIdentity({
      acceptLanguage: request.headers.get("accept-language"),
      secret: getInteractionFingerprintSecret(),
      trustedIp: getTrustedInfrastructureIp(request.headers),
      userAgent: request.headers.get("user-agent"),
      visitorSessionId,
    });
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const counted = await recordListingInteraction(listingId, eventType, interactionIdentity, user?.id ?? null);
    const response = NextResponse.json({ counted, ok: true });

    // Cookie deletion, browser changes, or trusted network changes can still create a new pseudonymous identity.

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
