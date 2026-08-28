import { createHash, createHmac } from "node:crypto";
import { env } from "./env";

type InteractionIdentityInput = {
  acceptLanguage: string | null;
  secret: string;
  trustedIp: string | null;
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

export function getTrustedInfrastructureIp(headers: Headers) {
  // In production on Vercel, this platform-managed header is the trusted source.
  // Generic x-forwarded-for is intentionally ignored because clients can spoof it.
  return getFirstForwardedAddress(headers.get("x-vercel-forwarded-for"));
}

export function buildInteractionIdentity({
  acceptLanguage,
  secret,
  trustedIp,
  userAgent,
  visitorSessionId,
}: InteractionIdentityInput) {
  const requestContext = ["ua", normalizeHeader(userAgent), "lang", normalizeHeader(acceptLanguage)].join(":");
  const identitySource = trustedIp
    ? `ip:${normalizeHeader(trustedIp)}`
    : `cookie:${visitorSessionId ? hashVisitorSessionId(visitorSessionId) : "none"}`;
  const identityMaterial = `${identitySource}:${requestContext}`;

  return createHmac("sha256", secret).update(identityMaterial).digest("hex");
}

export function getInteractionFingerprintSecret() {
  const secret = process.env.INTERACTION_FINGERPRINT_SECRET || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("Interaction fingerprint secret is not configured.");
  }

  return secret;
}
