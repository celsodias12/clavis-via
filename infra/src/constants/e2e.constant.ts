export const E2E = Object.freeze({
  USER_ID_PATTERN: /^user_[A-Za-z0-9]+$/,
  SIGN_UP_EMAIL_PATTERN: /^e2e-signup-\d+\+clerk_test@example\.com$/,
  SIGN_UP_EMAIL_PREFIX: 'e2e-signup-',
  SIGN_UP_EMAIL_SUFFIX: '+clerk_test@example.com',
  // Tables holding the per-user progress that a run creates.
  RESET_TABLES: Object.freeze([
    'check_ins',
    'plan_enrollments',
    'day_completions',
    'practice_completions',
    'conversation_messages',
  ]),
  // Random bytes behind each one-time password, plus a suffix that satisfies Clerk's complexity rules.
  PASSWORD_BYTES: 24,
  PASSWORD_COMPLEXITY_SUFFIX: 'aZ9!',
  MAIN_USER_FIRST_NAME: 'Teste',
  API_HEALTH_URL: 'http://localhost:8787/health',
  METRO_STATUS_URL: 'http://localhost:8081/status',
  // The origin the web dev server runs on; the API must allow it through CORS_ALLOWED_ORIGINS.
  WEB_ORIGIN: 'http://localhost:5173',
  WEB_PUBLISHABLE_KEY_NAME: 'VITE_CLERK_PUBLISHABLE_KEY',
  WEB_ENVIRONMENT_FILE: 'web/.env.local',
  WEB_PACKAGE_NAME: '@clavis-via/web',
  API_PACKAGE_NAME: '@clavis-via/api',
  // What the browser sends before a tRPC call, and the header the API must answer with.
  CORS_PREFLIGHT_METHOD: 'POST',
  CORS_PREFLIGHT_HEADERS: 'authorization,content-type',
  CORS_ALLOW_ORIGIN_HEADER: 'access-control-allow-origin',
  FLOWS_DIRECTORY: 'mobile/tests/e2e/flows',
})
