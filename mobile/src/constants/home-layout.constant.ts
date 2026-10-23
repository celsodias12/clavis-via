import {
  CURRENT_PLAN_CHEVRON,
  DAILY_KEY_CARD_BACKGROUND,
  VERSE_PLAY_ICON,
} from '@clavis-via/shared'

// Layout of the Início screen (top part) in design units (the 266 x 560 card), measured on the reference.
// Text positions are baselines; the screens convert them to line-box tops with the font ascent.
export const HOME_HEADER_LAYOUT = Object.freeze({
  // The small key is centered on this point; its width is the width of the BrandKey box.
  KEY_WIDTH: 21.6,
  KEY_CENTER_X: 24.65,
  KEY_CENTER_Y: 48.5,
  BRAND_BASELINE: 52.7,
  BRAND_FONT_SIZE: 12.5,
  // The two words of the brand name, each with its own left edge and letter spacing (they differ in the reference).
  BRAND_WORDS: Object.freeze([
    Object.freeze({ left: 41.4, letterSpacing: 4.3 }),
    Object.freeze({ left: 111.5, letterSpacing: 4.9 }),
  ]),
  BELL_CENTER_X: 195.15,
  BELL_CENTER_Y: 46.85,
  AVATAR_CENTER_X: 235.85,
  AVATAR_CENTER_Y: 47.7,
  AVATAR_DIAMETER: 34,
  // Extra touch area around the avatar, in dp.
  AVATAR_HIT_SLOP: 12,
})

export const HOME_GREETING_LAYOUT = Object.freeze({
  GREETING_LEFT: 15,
  GREETING_RIGHT: 14,
  GREETING_FONT_SIZE: 19.1,
  GREETING_BASELINE: 98.2,
  SUBTITLE_LEFT: 14.5,
  SUBTITLE_FONT_SIZE: 13.45,
  SUBTITLE_BASELINE: 118.1,
})

// The "Sua chave de hoje" card: position on the page and the elements inside it, with the inner
// coordinates measured from the card's top left corner.
export const DAILY_KEY_CARD_LAYOUT = Object.freeze({
  LEFT: 14,
  RIGHT: 13.6,
  TOP: 136.6,
  HEIGHT: 165.2,
  RADIUS: 14,
  GRADIENT_ANGLE: DAILY_KEY_CARD_BACKGROUND.GRADIENT_ANGLE,
  ILLUSTRATION_LEFT: 16,
  ILLUSTRATION_TOP: 15.4,
  ILLUSTRATION_WIDTH: 56,
  ILLUSTRATION_HEIGHT: 118,
  TEXT_LEFT: 90.4,
  // Space between the text column and the card's right edge (the button ends 7.7 units before it).
  TEXT_RIGHT: 7.7,
  // A long title (the invite) shrinks to fit the column, down to this fraction of its size.
  TITLE_MINIMUM_FONT_SCALE: 0.75,
  LABEL_FONT_SIZE: 10.5,
  LABEL_BASELINE: 24.6,
  TITLE_FONT_SIZE: 16.2,
  TITLE_BASELINE: 48,
  BODY_FONT_SIZE: 11.05,
  BODY_FIRST_BASELINE: 71.9,
  BODY_LINE_PITCH: 13.6,
  BODY_MAXIMUM_LINES: 4,
  BODY_WIDTH: 139.8,
  BUTTON_LEFT: 90.9,
  BUTTON_TOP: 126.3,
  BUTTON_WIDTH: 139.8,
  // Soft shadow around the card (offset and blur in design units).
  SHADOW_OFFSET_Y: 2,
  SHADOW_BLUR: 12,
  // Soft patches of color over the gradient (the shared geometry).
  BLOBS: DAILY_KEY_CARD_BACKGROUND.BLOBS,
})

// What the tab screens leave free below the last card: the card ends this far above the tab bar.
export const HOME_CONTENT_LAYOUT = Object.freeze({
  BOTTOM_GAP: 11.7,
})

// The "Um minuto com Deus" card, with the inner coordinates measured from the card's top left corner
// (right-pinned elements from its right edge).
export const VERSE_CARD_LAYOUT = Object.freeze({
  LEFT: 14,
  RIGHT: 13.6,
  TOP: 312.5,
  HEIGHT: 95.5,
  RADIUS: 14,
  TILE_LEFT: 12.7,
  TILE_TOP: 10.7,
  TILE_WIDTH: 45,
  TILE_HEIGHT: 43.5,
  TILE_RADIUS: 11,
  // The open book drawn on the tile: its box, from the card's top left corner.
  BOOK_LEFT: 21,
  BOOK_TOP: 21.2,
  BOOK_WIDTH: 28.7,
  BOOK_HEIGHT: 23.7,
  TEXT_LEFT: 74.3,
  TITLE_FONT_SIZE: 12.8,
  TITLE_BASELINE: 26.2,
  // The quote wraps before it reaches the play button's column.
  QUOTE_WIDTH: 148,
  QUOTE_FONT_SIZE: 11.4,
  QUOTE_FIRST_BASELINE: 46.5,
  QUOTE_LINE_PITCH: 15,
  QUOTE_MAXIMUM_LINES: 2,
  REFERENCE_FONT_SIZE: 10.1,
  REFERENCE_BASELINE: 82.2,
  PLAY_DIAMETER: VERSE_PLAY_ICON.DIAMETER,
  PLAY_RIGHT: 9.4,
  PLAY_TOP: 64.2,
  // Extra touch area around the play button, in dp (it is smaller than 44 dp).
  PLAY_HIT_SLOP: 10,
})

// The "Continue sua jornada" card, with the inner coordinates measured like the verse card's.
export const CURRENT_PLAN_CARD_LAYOUT = Object.freeze({
  LEFT: 14,
  RIGHT: 13.6,
  TOP: 418,
  HEIGHT: 80,
  RADIUS: 14,
  TITLE_LEFT: 14,
  TITLE_FONT_SIZE: 11.45,
  TITLE_BASELINE: 19,
  NAME_LEFT: 14.2,
  NAME_FONT_SIZE: 11.6,
  NAME_BASELINE: 38,
  DAY_FONT_SIZE: 12.6,
  DAY_BASELINE: 54,
  // The arrow on the right: its box, right-pinned.
  CHEVRON_RIGHT: 14.7,
  CHEVRON_TOP: 30.3,
  CHEVRON_WIDTH: CURRENT_PLAN_CHEVRON.WIDTH,
  CHEVRON_HEIGHT: CURRENT_PLAN_CHEVRON.HEIGHT,
  CHEVRON_STROKE_WIDTH: CURRENT_PLAN_CHEVRON.STROKE_WIDTH,
  // Space kept between the plan name and the arrow.
  NAME_CHEVRON_GAP: 6,
  CHEVRON_PATH: CURRENT_PLAN_CHEVRON.PATH,
  // The progress bar stretches between these margins.
  BAR_LEFT: 14,
  BAR_RIGHT: 14,
  BAR_TOP: 60.5,
  BAR_HEIGHT: 9,
})
