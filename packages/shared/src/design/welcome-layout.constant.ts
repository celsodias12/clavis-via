import type { TranslationKeys } from '../i18n/types'

// Welcome screen layout in design units (the 266 x 560 card). Text positions are baselines from the
// approved mockup; the screen converts them to line-box tops with the font ascent.
export const WELCOME_FONT_METRICS = Object.freeze({
  // hhea ascent / descent as a fraction of the font size (Android, includeFontPadding false).
  BRAND_ASCENT: 1.07,
  BODY_ASCENT: 1.024,
  BODY_DESCENT: 0.4,
})

export const WELCOME_BRAND_LAYOUT = Object.freeze({
  KEY_WIDTH: 46,
  KEY_LEFT: 105,
  KEY_TOP: 90,
  // Width of the box each letter is centered in.
  LETTER_BOX_WIDTH: 40,
  CLAVIS_FONT_SIZE: 29.5,
  CLAVIS_BASELINE: 203.5,
  VIA_FONT_SIZE: 24,
  VIA_BASELINE: 237,
  // Last design row covered by the brand block (used as the bottom of the accessible element).
  BOTTOM: 245,
})

export const WELCOME_CLAVIS_LETTERS = Object.freeze([
  Object.freeze({ character: 'C', centerX: 74.8 }),
  Object.freeze({ character: 'L', centerX: 98.9 }),
  Object.freeze({ character: 'A', centerX: 124 }),
  Object.freeze({ character: 'V', centerX: 149.5 }),
  Object.freeze({ character: 'I', centerX: 170.8 }),
  Object.freeze({ character: 'S', centerX: 191.2 }),
])

export const WELCOME_VIA_LETTERS = Object.freeze([
  Object.freeze({ character: 'V', centerX: 104 }),
  Object.freeze({ character: 'I', centerX: 131.8 }),
  Object.freeze({ character: 'A', centerX: 160.5 }),
])

export const WELCOME_TAGLINE_LAYOUT = Object.freeze({
  FONT_SIZE: 15.25,
  BOX_WIDTH: 200,
  // Measured on the overlay: the reference lines are about this much wider per character than RN renders them.
  LETTER_SPACING: 0.18,
  // Translation keys and design centers/baselines of the three lines.
  LINES: Object.freeze([
    Object.freeze({ key: 'welcome.taglineFirst', centerX: 133, baseline: 278 }),
    Object.freeze({ key: 'welcome.taglineSecond', centerX: 133.4, baseline: 298 }),
    Object.freeze({ key: 'welcome.taglineThird', centerX: 133.6, baseline: 318 }),
  ] satisfies readonly Readonly<{ key: TranslationKeys; centerX: number; baseline: number }>[]),
})

export const WELCOME_FOOTER_LAYOUT = Object.freeze({
  BUTTON_TOP: 452,
  BUTTON_HEIGHT: 40,
  LINK_FONT_SIZE: 11.75,
  LINK_BASELINE: 521,
  UNDERLINE_Y: 522,
  UNDERLINE_HEIGHT: 0.9,
  // Extra touch area around the link, in dp.
  LINK_HIT_SLOP: 12,
})
