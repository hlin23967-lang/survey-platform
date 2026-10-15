export const SESSION_COOKIE = "survey_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Must stay identical in Route Handlers and Middleware */
export function getSessionSecret(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "survey-platform-session-secret-9f3a7c2e";
  return new TextEncoder().encode(secret);
}
