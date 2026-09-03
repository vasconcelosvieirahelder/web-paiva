import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(process.cwd(), "supabase", "migrations", "0010_listing_interaction_integrity.sql");
const applyPath = join(process.cwd(), "supabase", "apply-listing-interactions.sql");
const apiRoutePath = join(process.cwd(), "src", "app", "api", "listing-interactions", "route.ts");
const interactionSessionPath = join(process.cwd(), "src", "lib", "listing-interaction-session.ts");
const serviceClientPath = join(process.cwd(), "src", "lib", "supabase", "service.ts");

function readSql(path: string) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

describe("listing interaction integrity migration", () => {
  it("adds nullable deduplication fields without requiring a destructive backfill", () => {
    const migration = readSql(migrationPath);

    expect(migration).toContain("alter table public.listing_interactions");
    expect(migration).toContain("add column if not exists visitor_session_id text");
    expect(migration).toContain("add column if not exists interaction_day date");
    expect(migration).toContain("add column if not exists actor_user_id uuid");
    expect(migration).toContain("add column if not exists is_owner_or_admin boolean not null default false");
  });

  it("deduplicates only new session-aware interactions", () => {
    const migration = readSql(migrationPath);

    expect(migration).toContain("create unique index if not exists listing_interactions_daily_session_unique_idx");
    expect(migration).toContain("(listing_id, event_type, visitor_session_id, interaction_day)");
    expect(migration).toContain("where visitor_session_id is not null");
  });

  it("removes direct public insert and keeps the write RPC server-only", () => {
    const migration = readSql(migrationPath);

    expect(migration).toContain('drop policy if exists "Anyone can record approved listing interactions"');
    expect(migration).toContain("create or replace function public.record_listing_interaction");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("p_actor_user_id uuid default null");
    expect(migration).toContain("revoke all on function public.record_listing_interaction(uuid, text, text, uuid) from public");
    expect(migration).toContain("revoke execute on function public.record_listing_interaction(uuid, text, text, uuid) from anon");
    expect(migration).toContain("revoke execute on function public.record_listing_interaction(uuid, text, text, uuid) from authenticated");
    expect(migration).toContain("grant execute on function public.record_listing_interaction(uuid, text, text, uuid) to service_role");
    expect(migration).not.toContain("grant execute on function public.record_listing_interaction(uuid, text, text, uuid) to anon");
    expect(migration).not.toContain("grant execute on function public.record_listing_interaction(uuid, text, text, uuid) to authenticated");
  });

  it("keeps the manual listing interaction SQL aligned with the migration", () => {
    const migration = readSql(migrationPath);
    const applySql = readSql(applyPath);

    for (const source of [migration, applySql]) {
      expect(source).toContain("listing_interactions_daily_session_unique_idx");
      expect(source).toContain("public.record_listing_interaction");
      expect(source).toContain("on conflict (listing_id, event_type, visitor_session_id, interaction_day)");
      expect(source).toContain("returning true into v_counted");
      expect(source).toContain("p_actor_user_id is not null and v_listing_owner_id = p_actor_user_id");
      expect(source).toContain("profiles.role = 'admin'");
    }
  });

  it("keeps visitor session ownership inside the API instead of the request body", () => {
    const route = readSql(apiRoutePath);

    expect(route).toContain("cookieStore.get(listingInteractionSessionCookie)");
    expect(route).toContain("buildInteractionIdentity");
    expect(route).toContain("getTrustedInfrastructureIp(request.headers)");
    expect(route).toContain("getInteractionFingerprintSecret()");
    expect(route).toContain("recordListingInteraction(listingId, eventType, interactionIdentity, user?.id ?? null)");
    expect(route).not.toContain("body?.visitorSessionId");
    expect(route).not.toContain('request.headers.get("x-forwarded-for")');
  });

  it("documents the residual behavior when a visitor deliberately changes identity", () => {
    const route = readSql(apiRoutePath);

    expect(route).toContain(
      "Cookie deletion, browser changes, or trusted network changes can still create a new pseudonymous identity.",
    );
  });

  it("keeps the service role Supabase client server-only", () => {
    const serviceClient = readSql(serviceClientPath);

    expect(serviceClient).toContain('import "server-only";');
    expect(serviceClient).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("does not use the service role key as the interaction fingerprint secret", () => {
    const interactionSession = readSql(interactionSessionPath);

    expect(interactionSession).toContain("process.env.INTERACTION_FINGERPRINT_SECRET");
    expect(interactionSession).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
