// Every navigable path of the web app, in the TanStack Router form (`$param` for dynamic segments).
export const ROUTES = Object.freeze({
  WELCOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  START: '/start',
  CHECK_IN: '/check-in',
  HOME: '/home',
  PLANS: '/plans',
  CONVERSATION: '/conversation',
  JOURNEY: '/journey',
  PLAN: '/plan/$planId',
  PLAN_DAY: '/plan/$planId/day/$dayNumber',
  PLAN_DAY_ACTION: '/plan/$planId/day/$dayNumber/action',
  PRACTICE: '/practice/$practiceId',
  EMOTIONS: '/emotions',
  PROFILE: '/profile',
})

// The tab routes, keyed by the tab route name shared with the app.
export const TAB_ROUTES = Object.freeze({
  home: ROUTES.HOME,
  plans: ROUTES.PLANS,
  conversation: ROUTES.CONVERSATION,
  journey: ROUTES.JOURNEY,
})
