import { PLAN_ICONS } from '@clavis-via/shared'

// Layout of the Planos screen in design units, measured on the planos reference (a 246 unit wide card:
// left-anchored values keep their distance from the left edge, right-anchored ones from the right edge).
// Text positions are baselines; the screen converts them to line-box tops with the font ascent.
export const PLANS_LAYOUT = Object.freeze({
  TITLE_LEFT: 13.3,
  TITLE_FONT_SIZE: 18.8,
  TITLE_BASELINE: 60,
  // The magnifier is centered on this point (its right distance is measured from the card right edge).
  SEARCH_CENTER_RIGHT: 21.85,
  SEARCH_CENTER_Y: 51.85,
  CHIPS_TOP: 76.2,
  // The list scrolls under the chips; the first card starts FIRST_CARD_TOP from the card top.
  LIST_TOP: 110,
  FIRST_CARD_TOP: 116.5,
  CARD_LEFT: 9.5,
  CARD_RIGHT: 10,
  CARD_GAP: 6.5,
  // Space between the last card and the demonstration note, and the note's own text.
  NOTE_TOP_GAP: 14,
  NOTE_FONT_SIZE: 9.5,
  // Extra space under the content, above the tab bar.
  CONTENT_BOTTOM_GAP: 12,
  // One placeholder per demo plan; the keys never change, so they are stable.
  SKELETON_KEYS: Object.freeze(['first', 'second', 'third', 'fourth', 'fifth']),
  SKELETON_HEIGHT: 71,
})

export const FILTER_CHIPS_LAYOUT = Object.freeze({
  SIDE_PADDING: 9,
  GAP: 4,
  HEIGHT: 28.5,
  FONT_SIZE: 8.6,
  PADDING: 11.4,
  // The selected chip of the design ("Todos") is wider than its text asks for.
  SELECTED_PADDING: 14.5,
})

// Inner layout of a plan card; coordinates are measured from the card's top left corner.
export const PLAN_LIST_ITEM_LAYOUT = Object.freeze({
  RADIUS: 9,
  // The photo sits 1 unit inside the card, so the card is 2 units taller than the photo.
  PHOTO_LEFT: 1.5,
  PHOTO_INSET_TOP: 1,
  PHOTO_RADIUS: 7.5,
  // Used when the thumbnail has no known height (the neutral fallback image).
  FALLBACK_PHOTO_WIDTH: 74,
  FALLBACK_PHOTO_HEIGHT: 71,
  // The photo melts into the card over this width, ending at the photo's right edge.
  PHOTO_FADE_WIDTH: 12,
  TEXT_LEFT: 101.5,
  // The design wraps the title in a 120 unit column (a 246 unit wide card); keeping the width fixed keeps the line breaks.
  TEXT_WIDTH: 120,
  TEXT_OFFSET_TOP: 1.3,
  TITLE_FONT_SIZE: 11.1,
  TITLE_LINE_HEIGHT: 16.3,
  DURATION_FONT_SIZE: 10.4,
  DURATION_TOP_GAP: 1.6,
  TITLE_MAXIMUM_LINES: 2,
  // The arrow is centered at this fraction of the card height, CHEVRON_CENTER_RIGHT from the card right edge.
  CHEVRON_CENTER_RATIO: 0.66,
  CHEVRON_CENTER_RIGHT: 12.35,
  CHEVRON_SIZE: 12.5,
  CHEVRON_STROKE_WIDTH: PLAN_ICONS.CHEVRON.STROKE_WIDTH,
  CHEVRON_VIEW_BOX_SIZE: 24,
  CHEVRON_PATH: PLAN_ICONS.CHEVRON.PATH,
})
