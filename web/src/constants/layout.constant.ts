import { ROUTES } from './route.constant'

// From this viewport width (px) up the app shows the side navigation; below it, the bottom tabs.
export const WIDE_SCREEN_MINIMUM_WIDTH = 768

export const WINDOW_EVENTS = Object.freeze({
  RESIZE: 'resize',
})

// Routes that render without the shell: the Check-in is a full screen and /start is a transient splash.
export const SHELL_HIDDEN_ROUTES: readonly string[] = Object.freeze([ROUTES.CHECK_IN, ROUTES.START])

// Metrics (px) of the shell pieces.
export const SHELL_METRICS = Object.freeze({
  SIDE_NAVIGATION_WIDTH: 256,
  SIDE_NAVIGATION_KEY_WIDTH: 28,
  NAVIGATION_ICON_SIZE: 24,
  AVATAR_SIZE: 36,
  BOTTOM_TABS_ICON_SIZE: 24,
  SPLASH_KEY_WIDTH: 62,
})

export const NAVIGATION_ICON_METRICS = Object.freeze({
  STROKE_WIDTH: 1.7,
  FILLED_STROKE_WIDTH: 1.2,
  DETAIL_STROKE_WIDTH: 1.8,
})

// Classes of the shell in each layout.
export const SHELL_CLASSES = Object.freeze({
  WIDE: 'flex min-h-svh bg-home-background',
  WIDE_MAIN: 'flex min-w-0 flex-1 justify-center',
  WIDE_CONTENT: 'w-full max-w-[1100px]',
  NARROW: 'min-h-svh bg-home-background',
  NARROW_WITH_TABS: 'min-h-svh bg-home-background pb-24',
})
