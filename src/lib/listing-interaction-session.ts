import { createHash } from "node:crypto";

export function hashVisitorSessionId(visitorSessionId: string) {
  return createHash("sha256").update(visitorSessionId).digest("hex");
}
