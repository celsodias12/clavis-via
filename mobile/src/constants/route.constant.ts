// Every navigable path of the app; screens and guards reference these instead of string literals.
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
  // Dynamic routes are used as { pathname: ROUTES.PLAN, params: { planId } }; each route file is created
  // by the task that builds its screen.
  PLAN: '/plan/[planId]',
  PLAN_DAY: '/plan/[planId]/day/[dayNumber]',
  PLAN_DAY_ACTION: '/plan/[planId]/day/[dayNumber]/action',
  PRACTICE: '/practice/[practiceId]',
  EMOTIONS: '/emotions',
  PROFILE: '/profile',
})

// Route group names (the parenthesized folders under src/app) used by the root navigator.
export const ROUTE_GROUPS = Object.freeze({
  PUBLIC: '(public)',
  PRIVATE: '(private)',
})
