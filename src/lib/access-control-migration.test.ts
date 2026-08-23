import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(process.cwd(), "supabase", "migrations", "0007_access_control_privacy.sql");
const listingProfileOwnershipMigrationPath = join(
  process.cwd(),
  "supabase",
  "migrations",
  "0008_listing_profile_ownership_security.sql",
);
const companyAssetsStorageHardeningMigrationPath = join(
  process.cwd(),
  "supabase",
  "migrations",
  "0009_company_assets_storage_hardening.sql",
);
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

  it("requires owner listings to use advertiser profiles owned by the same user", () => {
    const migration = readFileSync(listingProfileOwnershipMigrationPath, "utf8");
    const sql = readFileSync(applyPath, "utf8");

    for (const source of [migration, sql]) {
      expect(source).toContain("new.owner_id is distinct from auth.uid()");
      expect(source).toContain("Only administrators can link listings to another advertiser profile.");
      expect(source).toContain("advertiser_profiles.id = new.advertiser_profile_id");
      expect(source).toContain("advertiser_profiles.owner_id = auth.uid()");
      expect(source).toContain("advertiser_profiles.owner_id = new.owner_id");
    }
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

  it("restricts new company asset uploads to draft advertiser profile folders", () => {
    const migration = readFileSync(companyAssetsStorageHardeningMigrationPath, "utf8");
    const sql = readFileSync(applyPath, "utf8");

    for (const source of [migration, sql]) {
      expect(source).toContain('drop policy if exists "company_assets_owner_insert" on storage.objects');
      expect(source).toContain('create policy "company_assets_owner_insert_draft_profile"');
      expect(source).toContain("storage.foldername(name))[1]");
      expect(source).toContain("storage.foldername(name))[2]");
      expect(source).toContain("advertiser_profiles.id::text = (storage.foldername(name))[2]");
      expect(source).toContain("advertiser_profiles.owner_id = auth.uid()");
      expect(source).toContain("advertiser_profiles.status = 'draft'");
      expect(source).toContain("advertiser_profiles.submitted_at is null");
      expect(source).toContain("storage.filename(name) ~ '^(logo|operation)-");
      expect(source).toContain("array_length(storage.foldername(name), 1) = 2");
    }
  });

  it("rejects legacy and nested company asset paths for new owner uploads", () => {
    const migration = readFileSync(companyAssetsStorageHardeningMigrationPath, "utf8");
    const sql = readFileSync(applyPath, "utf8");

    for (const source of [migration, sql]) {
      expect(source).toContain("array_length(storage.foldername(name), 1) = 2");
      expect(source).toContain("auth.uid()::text = (storage.foldername(name))[1]");
      expect(source).toContain("advertiser_profiles.id::text = (storage.foldername(name))[2]");
      expect(source).not.toContain("auth.uid()::text = (storage.foldername(name))[1]\n);");
    }
  });

  it("allows owner cleanup only before advertiser profile submission", () => {
    const migration = readFileSync(companyAssetsStorageHardeningMigrationPath, "utf8");
    const sql = readFileSync(applyPath, "utf8");

    for (const source of [migration, sql]) {
      expect(source).toContain('create policy "company_assets_owner_delete_draft_profile"');
      expect(source).toContain('create policy "company_assets_admin_delete"');
      expect(source).toContain("for delete");
      expect(source).toContain("advertiser_profiles.submitted_at is null");
    }
  });

  it("allows cleanup of a newly created listing only before final submission", () => {
    const migration = readFileSync(companyAssetsStorageHardeningMigrationPath, "utf8");
    const sql = readFileSync(applyPath, "utf8");

    for (const source of [migration, sql]) {
      expect(source).toContain('create policy "listings_owner_delete_before_submission"');
      expect(source).toContain("not private.listing_has_submitted_event(listings.id)");
      expect(source).toContain("advertiser_profiles.submitted_at is null");
    }
  });

  it("finalizes company registration submission atomically", () => {
    const migration = readFileSync(companyAssetsStorageHardeningMigrationPath, "utf8");
    const sql = readFileSync(applyPath, "utf8");

    for (const source of [migration, sql]) {
      expect(source).toContain("create or replace function public.submit_company_registration");
      expect(source).toContain("update public.advertiser_profiles");
      expect(source).toContain("insert into public.moderation_events");
      expect(source).toContain("set search_path = ''");
      expect(source).toContain("grant execute on function public.submit_company_registration(uuid, uuid) to authenticated");
    }
  });
});
