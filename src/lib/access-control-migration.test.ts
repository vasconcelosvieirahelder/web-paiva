import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(process.cwd(), "supabase", "migrations", "0007_access_control_privacy.sql");
const applyPath = join(process.cwd(), "supabase", "apply-access-control-privacy.sql");

describe("access control privacy migration", () => {
  it("prevents non-admin users from changing their own role", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("prevent_non_admin_role_change");
    expect(migration).toContain("new.role is distinct from old.role");
    expect(migration).toContain("not public.is_admin()");
  });

  it("keeps moderation evidence images private after listings are approved", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("listing_images_read_approved_or_owner");
    expect(migration).toContain("listing_images.image_kind = 'listing'");
  });

  it("prevents non-admin users from approving or publishing their own listings", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("enforce_listing_moderation_access");
    expect(migration).toContain("Only administrators can change listing moderation fields.");
    expect(migration).toContain("new.status not in ('draft', 'pending_review')");
  });

  it("prevents owners from editing moderated listing content after submission", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("Only draft listings can be edited by their owner.");
    expect(migration).toContain("old.status <> 'draft'");
    expect(migration).toContain("new.status <> 'draft'");
  });

  it("prevents non-admin users from activating advertiser profiles directly", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("enforce_advertiser_profile_moderation_access");
    expect(migration).toContain("Only administrators can change advertiser profile status.");
  });

  it("prevents owners from changing advertiser profile evidence after submission", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("Only unsubmitted draft advertiser profiles can be edited by their owner.");
    expect(migration).toContain("old.submitted_at is not null");
  });

  it("prevents owners from changing listing images after moderation submission", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("create schema if not exists private");
    expect(migration).toContain("private.listing_has_submitted_event");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("revoke all on function private.listing_has_submitted_event(uuid) from public");
    expect(migration).toContain("revoke execute on function private.listing_has_submitted_event(uuid) from anon");
    expect(migration).toContain("grant usage on schema private to authenticated");
    expect(migration).toContain("grant execute on function private.listing_has_submitted_event(uuid) to authenticated");
    expect(migration).toContain("listing_images_owner_insert_before_submission");
    expect(migration).toContain("not private.listing_has_submitted_event(listing_images.listing_id)");
    expect(migration).toContain("listing_images_owner_update_draft");
    expect(migration).toContain("listing_images_owner_delete_draft");
  });

  it("keeps the standalone P0 SQL compatible with advertiser moderation submissions", () => {
    const sql = readFileSync(applyPath, "utf8");

    expect(sql).toContain("moderation_events_owner_submit");
    expect(sql).toContain("action = 'submitted'");
    expect(sql).toContain("listings.status = 'pending_review'");
  });

  it("keeps the standalone P0 SQL aligned with moderated content protections", () => {
    const sql = readFileSync(applyPath, "utf8");

    expect(sql).toContain("Only draft listings can be edited by their owner.");
    expect(sql).toContain("Only unsubmitted draft advertiser profiles can be edited by their owner.");
    expect(sql).toContain("private.listing_has_submitted_event");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("listing_images_owner_insert_before_submission");
    expect(sql).toContain("listing_images_owner_update_draft");
    expect(sql).toContain("company_assets_admin_update");
  });
});
