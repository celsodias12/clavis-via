import type { PrimaryButtonSize, PrimaryButtonTone } from '@clavis-via/shared'

// The app lays its design out on a 266 unit wide card scaled to the screen width; the web draws the design
// units at this factor (a 390 px wide phone: 390 / 266), so icons keep the proportions of the app.
export const DESIGN_UNIT_SCALE = 1.5

export const ICON_METRICS = Object.freeze({
  VIEW_BOX_SIZE: 24,
  // Minimum touch target in px (accessibility guideline).
  MINIMUM_TOUCH_SIZE: 44,
  DEFAULT_FILL: 'none',
  DEFAULT_STROKE: 'none',
  CURRENT_COLOR: 'currentColor',
})

export const BUTTON_ARROW_METRICS = Object.freeze({
  SIZE: 20,
  STROKE_WIDTH: 2.3,
})

export const PRIMARY_BUTTON_CLASSES = Object.freeze({
  BASE: 'cursor-pointer font-body text-white disabled:opacity-100',
  DIMMED: 'opacity-55',
  FIXED_WIDTH: 'w-[332px] max-w-full self-center',
  FULL_WIDTH: 'w-full',
  SPINNER: 'size-5 animate-spin',
})

export const PRIMARY_BUTTON_TONE_CLASSES = Object.freeze({
  navy: 'bg-navy shadow-[0_4px_10px_var(--color-button-shadow)] hover:bg-navy/90',
  light: 'bg-primary-light hover:bg-primary-light/90',
  accent: 'bg-primary-accent hover:bg-primary-accent/90',
} satisfies Record<PrimaryButtonTone, string>)

export const PRIMARY_BUTTON_SIZE_CLASSES = Object.freeze({
  regular: 'h-14 gap-3 rounded-full px-6 text-lg',
  compact: 'h-11 gap-2 rounded-full px-5 text-base font-semibold',
  medium: 'h-[54px] gap-2 rounded-full px-5 text-base',
  slim: 'h-12 gap-2 rounded-full px-5 text-base',
} satisfies Record<PrimaryButtonSize, string>)

export const AVATAR_INITIAL_RATIO = 14 / 34
