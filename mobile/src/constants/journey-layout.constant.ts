import type { ListRowMetrics } from '../@types/component.type'

// Layout of the Minha jornada screen in design units (the 266 x 560 card), measured on the jornada reference
// (which the sheet cuts at row ~439: the tab bar is not in it). Left anchored values keep their distance from the
// left edge, right anchored ones from the right edge. Text positions are baselines; the components convert them to
// line box tops with the font ascent. Everything is placed from the top, so the screen scrolls.
export const JOURNEY_LAYOUT = Object.freeze({
  TITLE_LEFT: 16.3,
  TITLE_FONT_SIZE: 18.9,
  TITLE_BASELINE: 48.7,
  // Space left under the last row, above the tab bar.
  CONTENT_BOTTOM_GAP: 16,
})

// The three segments are wider than the ones of Minhas emoções: less padding, a smaller gap.
export const JOURNEY_SEGMENTS_LAYOUT = Object.freeze({
  TOP: 62.8,
  LEFT: 14.4,
  HEIGHT: 24.6,
  HORIZONTAL_PADDING: 11.5,
  GAP: 2.5,
  FONT_SIZE: 9,
})

// The streak card: its box on the page, then the parts measured from its top left corner.
export const JOURNEY_STREAK_LAYOUT = Object.freeze({
  LEFT: 15,
  RIGHT: 17,
  TOP: 100,
  HEIGHT: 96.7,
  RADIUS: 12,
  GRADIENT_ANGLE: '45deg',
  SHADOW_OFFSET_Y: 2,
  SHADOW_BLUR: 8,
  CONTENT_LEFT: 13.3,
  NUMBER_FONT_SIZE: 31,
  NUMBER_BASELINE: 35.4,
  // Gap between the number and the text beside it.
  NUMBER_LABEL_GAP: 8.3,
  LABEL_FONT_SIZE: 10.5,
  // The label sits above the baseline of the number.
  LABEL_RAISE: 4.3,
  CALENDAR_SIZE: 18,
  CALENDAR_RIGHT: 12.3,
  CALENDAR_TOP: 15.9,
  CALENDAR_VIEW_BOX_SIZE: 24,
  CALENDAR_STROKE_WIDTH: 1.6,
  CALENDAR_HIT_SLOP: 14,
  DAYS_LEFT: 6.8,
  DAYS_WIDTH: 218.9,
  DAY_DIAMETER: 18.9,
  DAY_TOP: 50.05,
  DAY_RING_WIDTH: 0.8,
  DAY_CHECK_SIZE: 9,
  DAY_CHECK_VIEW_BOX_SIZE: 24,
  DAY_CHECK_STROKE_WIDTH: 2.4,
  DAY_LABEL_FONT_SIZE: 9,
  DAY_LABEL_BASELINE: 82.8,
})

// The phrase card: a tile with the leaf on the left and the text on the right.
export const JOURNEY_PHRASE_LAYOUT = Object.freeze({
  LEFT: 16,
  RIGHT: 17,
  TOP: 208,
  HEIGHT: 49,
  RADIUS: 12,
  TILE_WIDTH: 50.5,
  TILE_RADIUS: 12,
  ILLUSTRATION_WIDTH: 36,
  ILLUSTRATION_HEIGHT: 34,
  ILLUSTRATION_LEFT: 10,
  ILLUSTRATION_TOP: 9.3,
  TEXT_LEFT: 61.1,
  TEXT_WIDTH: 158,
  TEXT_FONT_SIZE: 11.4,
  TEXT_FIRST_BASELINE: 19.7,
  TEXT_LINE_PITCH: 15.1,
})

// "Minhas conquistas" and its list. The rows span the whole width; the row measures are from the row's edges.
export const JOURNEY_ACHIEVEMENTS_LAYOUT = Object.freeze({
  HEADING_LEFT: 16.2,
  HEADING_RIGHT: 16.3,
  HEADING_FONT_SIZE: 12.2,
  HEADING_BASELINE: 284,
  VIEW_ALL_FONT_SIZE: 11.2,
  VIEW_ALL_BASELINE: 283.5,
  VIEW_ALL_HIT_SLOP: 12,
  LIST_TOP: 291.7,
  EMPTY_FONT_SIZE: 10,
  EMPTY_LEFT: 16.2,
  EMPTY_RIGHT: 17.3,
  EMPTY_TOP: 300,
  EMPTY_HEIGHT: 30,
})

export const JOURNEY_ROW_METRICS: ListRowMetrics = Object.freeze({
  HEIGHT: 27.8,
  ICON_SIZE: 19,
  ICON_LEFT: 19.1,
  LABEL_LEFT: 49.5,
  LABEL_FONT_SIZE: 11.4,
  LABEL_BASELINE: 17.8,
  CHEVRON_SIZE: 12.5,
  CHEVRON_RIGHT: 19.2,
  DIVIDER_LEFT: 48,
  DIVIDER_RIGHT: 25,
})

// Placeholders shown while the overview loads: one per part of the screen, then one per achievement row.
export const JOURNEY_SKELETON_LAYOUT = Object.freeze({
  ROW_KEYS: ['first', 'second', 'third'],
  ROW_HEIGHT: 20,
  ROW_RADIUS: 10,
  ROW_LEFT: 21.5,
  ROW_RIGHT: 25,
})
