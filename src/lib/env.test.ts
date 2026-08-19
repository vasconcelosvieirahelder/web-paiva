import { describe, expect, it } from "vitest";
import { hasPublicSupabaseEnv } from "./env";

describe("environment helpers", () => {
  it("reports whether public Supabase configuration is available", () => {
    expect(typeof hasPublicSupabaseEnv()).toBe("boolean");
  });
});

