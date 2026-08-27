import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(process.cwd(), "supabase", "migrations", "0010_listing_interaction_integrity.sql");
const applyPath = join(process.cwd(), "supabase", "apply-listing-interactions.sql");
const apiRoutePath = join(process.cwd(), "src", "app", "api", "listing-interactions", "route.ts");

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

  it("removes direct public insert and exposes only the controlled RPC", () => {
    const migration = readSql(migrationPath);

    expect(migration).toContain('drop policy if exists "Anyone can record approved listing interactions"');
    expect(migration).toContain("create or replace function public.record_listing_interaction");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("revoke all on function public.record_listing_interaction(uuid, text, text) from public");
    expect(migration).toContain("grant execute on function public.record_listing_interaction(uuid, text, text) to anon");
    expect(migration).toContain("grant execute on function public.record_listing_interaction(uuid, text, text) to authenticated");
  });

  it("keeps the manual listing interaction SQL aligned with the migration", () => {
    const migration = readSql(migrationPath);
    const applySql = readSql(applyPath);

    for (const source of [migration, applySql]) {
      expect(source).toContain("listing_interactions_daily_session_unique_idx");
      expect(source).toContain("public.record_listing_interaction");
      expect(source).toContain("on conflict (listing_id, event_type, visitor_session_id, interaction_day)");
      expect(source).toContain("returning true into v_counted");
      expect(source).toContain("coalesce(v_is_owner, false) or public.is_admin()");
    }
  });

  it("keeps visitor session ownership inside the API instead of the request body", () => {
    const route = readSql(apiRoutePath);

    expect(route).toContain("cookieStore.get(listingInteractionSessionCookie)");
    expect(route).toContain("hashVisitorSessionId(visitorSessionId)");
    expect(route).toContain("recordListingInteraction(listingId, eventType, visitorSessionHash)");
    expect(route).not.toContain("body?.visitorSessionId");
  });
});
