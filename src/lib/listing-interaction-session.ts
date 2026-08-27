import { createHash, createHmac } from "node:crypto";
import { env } from "./env";

type InteractionIdentityInput = {
  acceptLanguage: string | null;
  forwardedFor: string | null;
  secret: string;
  userAgent: string | null;
  visitorSessionId: string | null;
};

export function hashVisitorSessionId(visitorSessionId: string) {
  return createHash("sha256").update(visitorSessionId).digest("hex");
}

function normalizeHeader(value: string | null) {
  return value?.trim().toLowerCase() || "unknown";
}

function getFirstForwardedAddress(forwardedFor: string | null) {
  return forwardedFor?.split(",")[0]?.trim() || null;
}

export function buildInteractionIdentity({
  acceptLanguage,
  forwardedFor,
  secret,
  userAgent,
  visitorSessionId,
}: InteractionIdentityInput) {
  const serverObservedIdentity = [
    "ip",
    normalizeHeader(getFirstForwardedAddress(forwardedFor)),
    "ua",
    normalizeHeader(userAgent),
    "lang",
    normalizeHeader(acceptLanguage),
  ].join(":");

  const fallbackIdentity = visitorSessionId ? `cookie:${hashVisitorSessionId(visitorSessionId)}` : "cookie:none";
  const identityMaterial = serverObservedIdentity.includes("unknown:ua:unknown")
    ? `${serverObservedIdentity}:${fallbackIdentity}`
    : serverObservedIdentity;

  return createHmac("sha256", secret).update(identityMaterial).digest("hex");
}

export function getInteractionFingerprintSecret() {
  const secret = process.env.INTERACTION_FINGERPRINT_SECRET || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("Interaction fingerprint secret is not configured.");
  }

  return secret;
}
