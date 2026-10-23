// Values shared by the Playwright config and the E2E specs (the specs only assert database content).
export const E2E_ENVIRONMENT = Object.freeze({
  EMAIL: 'E2E_EMAIL',
  PASSWORD: 'E2E_PASSWORD',
  SIGN_UP_EMAIL: 'SIGN_UP_EMAIL',
  SIGN_UP_PASSWORD: 'SIGN_UP_PASSWORD',
})

export const E2E_SERVER = Object.freeze({
  PORT: 5173,
  URL: 'http://localhost:5173',
  COMMAND: 'pnpm exec vp dev --port 5173 --strictPort',
  STARTUP_TIMEOUT: 120_000,
})

// The order of the suite, written down: the main flow needs the freshly reset account, the others only sign in.
export const E2E_PROJECTS = Object.freeze({
  MAIN_FLOW: 'main-flow',
  DEEP_LINKS: 'deep-links',
  SIGN_UP: 'sign-up',
})

export const E2E_VIEWPORTS = Object.freeze({
  DESKTOP: Object.freeze({ width: 1440, height: 900 }),
  MOBILE: Object.freeze({ width: 390, height: 844 }),
})

// The content tests read, in the language the browser is set to.
export const E2E_LOCALE = 'pt-BR'
export const E2E_TIMEOUT = 30_000

export const E2E_PATHS = Object.freeze({
  WELCOME: '/',
  SIGN_IN: '/sign-in',
  CHECK_IN: '/check-in',
  CHECK_IN_PATTERN: /\/check-in$/,
  EMOTIONS: '/emotions',
  PLAN_DAY: '/plan/when-discouragement-weighs/day/1',
})

export const E2E_CONTENT = Object.freeze({
  PLAN_ID: 'when-discouragement-weighs',
  CHECK_IN_STATE: 'anxious',
  // Name of the "anxious" state and the title of its daily key, as the database and the shared copy hold them.
  CHECK_IN_LABEL: /Ansiosa/,
  DAILY_KEY_TITLE: 'Voz e Limites',
  FIRST_NAME: 'Teste',
  REFLECTION: 'Reflexao do teste',
  PLAN_PROGRESS_ACHIEVEMENT: 'plan-progress',
  WEEKLY_CHECK_INS_ACHIEVEMENT: 'weekly-check-ins',
  DAY_SEGMENT_ACTION: 'action',
  JOURNEY_SEGMENT_EMOTIONS: 'emotions',
  FIRST_DAY_NUMBER: 1,
  TAB_PLANS: 'plans',
  TAB_JOURNEY: 'journey',
})
