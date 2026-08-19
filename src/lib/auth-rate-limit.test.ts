import { describe, expect, it } from "vitest";
import {
  AUTH_MAX_FAILED_ATTEMPTS,
  AUTH_LOCK_DURATION_MS,
  getAuthAttemptState,
  isAuthAttemptLocked,
  recordFailedAuthAttempt,
} from "./auth-rate-limit";

describe("auth rate limit", () => {
  it("locks sign-in attempts after repeated password failures for the same email", () => {
    const now = new Date("2026-08-09T12:00:00.000Z").getTime();
    let state = getAuthAttemptState(null);

    for (let attempt = 0; attempt < AUTH_MAX_FAILED_ATTEMPTS; attempt += 1) {
      state = recordFailedAuthAttempt(state, "USER@example.com", now);
    }

    expect(state.email).toBe("user@example.com");
    expect(state.failedAttempts).toBe(AUTH_MAX_FAILED_ATTEMPTS);
    expect(state.lockedUntil).toBe(now + AUTH_LOCK_DURATION_MS);
    expect(isAuthAttemptLocked(state, "user@example.com", now)).toBe(true);
  });

  it("does not lock a different email or an expired lock", () => {
    const now = new Date("2026-08-09T12:00:00.000Z").getTime();
    const state = {
      email: "blocked@example.com",
      failedAttempts: AUTH_MAX_FAILED_ATTEMPTS,
      lockedUntil: now + AUTH_LOCK_DURATION_MS,
    };

    expect(isAuthAttemptLocked(state, "other@example.com", now)).toBe(false);
    expect(isAuthAttemptLocked(state, "blocked@example.com", now + AUTH_LOCK_DURATION_MS + 1)).toBe(false);
  });

  it("starts a fresh counter when the submitted email changes", () => {
    const now = new Date("2026-08-09T12:00:00.000Z").getTime();
    const previous = {
      email: "first@example.com",
      failedAttempts: 4,
      lockedUntil: null,
    };

    const state = recordFailedAuthAttempt(previous, "second@example.com", now);

    expect(state).toEqual({
      email: "second@example.com",
      failedAttempts: 1,
      lockedUntil: null,
    });
  });
});
