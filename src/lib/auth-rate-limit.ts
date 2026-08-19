export const AUTH_ATTEMPT_COOKIE = "web_paiva_auth_attempt";
export const AUTH_MAX_FAILED_ATTEMPTS = 5;
export const AUTH_LOCK_DURATION_MS = 15 * 60 * 1000;

export type AuthAttemptState = {
  email: string;
  failedAttempts: number;
  lockedUntil: number | null;
};

export function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAuthAttemptState(value: string | null | undefined): AuthAttemptState {
  if (!value) {
    return { email: "", failedAttempts: 0, lockedUntil: null };
  }

  try {
    const parsed = JSON.parse(value) as Partial<AuthAttemptState>;

    return {
      email: typeof parsed.email === "string" ? normalizeAuthEmail(parsed.email) : "",
      failedAttempts: typeof parsed.failedAttempts === "number" ? Math.max(0, parsed.failedAttempts) : 0,
      lockedUntil: typeof parsed.lockedUntil === "number" ? parsed.lockedUntil : null,
    };
  } catch {
    return { email: "", failedAttempts: 0, lockedUntil: null };
  }
}

export function serializeAuthAttemptState(state: AuthAttemptState) {
  return JSON.stringify(state);
}

export function isAuthAttemptLocked(state: AuthAttemptState, email: string, now = Date.now()) {
  const normalizedEmail = normalizeAuthEmail(email);

  return state.email === normalizedEmail && typeof state.lockedUntil === "number" && state.lockedUntil > now;
}

export function recordFailedAuthAttempt(state: AuthAttemptState, email: string, now = Date.now()): AuthAttemptState {
  const normalizedEmail = normalizeAuthEmail(email);
  const failedAttempts = state.email === normalizedEmail ? state.failedAttempts + 1 : 1;

  return {
    email: normalizedEmail,
    failedAttempts,
    lockedUntil: failedAttempts >= AUTH_MAX_FAILED_ATTEMPTS ? now + AUTH_LOCK_DURATION_MS : null,
  };
}
