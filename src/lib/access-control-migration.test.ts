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

  it("prevents non-admin users from activating advertiser profiles directly", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("enforce_advertiser_profile_moderation_access");
    expect(migration).toContain("Only administrators can change advertiser profile status.");
  });

  it("keeps the standalone P0 SQL compatible with advertiser moderation submissions", () => {
    const sql = readFileSync(applyPath, "utf8");

    expect(sql).toContain("moderation_events_owner_submit");
    expect(sql).toContain("action = 'submitted'");
    expect(sql).toContain("listings.status = 'pending_review'");
  });
});
