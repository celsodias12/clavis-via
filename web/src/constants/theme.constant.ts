export const THEME_VARIABLES = Object.freeze({
  ROOT_SELECTOR: ':root',
  COLOR_PREFIX: '--color',
  SEPARATOR: '-',
})

// The palette variables written on :root, for SVG attributes that cannot use Tailwind utilities.
export const COLOR_VARIABLES = Object.freeze({
  WHITE: 'var(--color-white)',
  TAB_BAR_ACTIVE: 'var(--color-tab-bar-active)',
  TAB_BAR_INACTIVE_ICON: 'var(--color-tab-bar-inactive-icon)',
})
