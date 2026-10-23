import { PLAN_ICONS } from '@clavis-via/shared'

// Layout of the Plano screen in design units, measured on the plano reference (a 223 unit wide card:
// left-anchored values keep their distance from the left edge, right-anchored ones from the right edge).
// Text positions are baselines; the screen converts them to line-box tops with the font ascent.
export const PLAN_LAYOUT = Object.freeze({
  // The sheet (white panel with rounded top corners) covers the lower part of the cover photo.
  SHEET_TOP: 169.7,
  SHEET_RADIUS: 9,
  // Width over height of the cover photos (219 x 163 design units for every plan).
  COVER_ASPECT_RATIO: 219 / 163,
  // The photo is shifted up so the head of the first cover lines up with the reference despite the wider card.
  COVER_OFFSET_TOP: -12,
  BACK_CENTER_X: 18.35,
  BACK_CENTER_Y: 45,
  // The three dots are centered on this distance from the card right edge.
  MORE_CENTER_RIGHT: 18.65,
  MORE_CENTER_Y: 44.35,
  CONTENT_LEFT: 11.3,
  CONTENT_RIGHT: 11,
  TITLE_LEFT: 12.3,
  TITLE_FONT_SIZE: 16.5,
  TITLE_BASELINE: 199.2,
  META_BASELINE: 225,
  META_FONT_SIZE: 10.8,
  META_ICON_SIZE: 13.3,
  META_ICON_CENTER_Y: 220.4,
  META_ICON_TEXT_GAP: 4.8,
  META_ITEM_GAP: 15.9,
  META_LEFT: 13.1,
  DESCRIPTION_LEFT: 13.2,
  // The design wraps the description in a 197 unit column (a 223 unit wide card); a fixed width keeps the breaks.
  DESCRIPTION_WIDTH: 197,
  DESCRIPTION_FONT_SIZE: 11.1,
  DESCRIPTION_LINE_HEIGHT: 15,
  DESCRIPTION_FIRST_BASELINE: 249.3,
  // Lines the description takes in the design; a longer or shorter one moves what comes after it.
  DESCRIPTION_DESIGN_LINES: 3,
  SEGMENTS_TOP: 294,
  LIST_TOP: 331.5,
  // Extra space between the last block and the footer that carries the button.
  CONTENT_BOTTOM_GAP: 11,
  FOOTER_BUTTON_BOTTOM: 516.7,
  BUTTON_HEIGHT: 37,
  // Text blocks of the Conteúdo and Reflexões segments.
  ITEM_GAP: 7,
  ITEM_PADDING: 10,
  ITEM_TITLE_FONT_SIZE: 9.7,
  ITEM_BODY_FONT_SIZE: 9.8,
  ITEM_BODY_LINE_HEIGHT: 14,
  ITEM_RADIUS: 9,
  EMPTY_FONT_SIZE: 10.4,
  SKELETON_TITLE_WIDTH: 150,
  SKELETON_TITLE_HEIGHT: 20,
  SKELETON_LINE_HEIGHT: 12,
  SKELETON_ROW_HEIGHT: 45.65,
  SKELETON_ROW_COUNT: 3,
  SKELETON_KEYS: Object.freeze(['first', 'second', 'third']),
})

// The segment row: each segment is as wide as its label plus the padding, and they touch each other.
export const SEGMENTED_CONTROL_LAYOUT = Object.freeze({
  HEIGHT: 28.3,
  HORIZONTAL_PADDING: 13.2,
  FONT_SIZE: 9.5,
  // The selected segment is underlined by a bar that is narrower than its pill.
  UNDERLINE_INSET: 6.3,
  UNDERLINE_HEIGHT: 3.7,
  UNDERLINE_THICKNESS: 1.7,
  UNDERLINE_RADIUS: 5,
  UNDERLINE_OFFSET_BOTTOM: -1,
})

// The outline variant (Dia screen): separate pills of their own width, the selected one white with an outline.
export const SEGMENTED_CONTROL_OUTLINE_LAYOUT = Object.freeze({
  HEIGHT: 25.8,
  HORIZONTAL_PADDING: 9.5,
  GAP: 2.6,
  FONT_SIZE: 9.5,
  BORDER_WIDTH: 1,
})

// The solid variant (Minhas emoções): separate pills of their own width, the selected one filled.
export const SEGMENTED_CONTROL_SOLID_LAYOUT = Object.freeze({
  HEIGHT: 25,
  HORIZONTAL_PADDING: 24,
  GAP: 2.5,
  FONT_SIZE: 9.4,
})

// One row of the day list; coordinates are measured from the panel's top left corner.
export const PLAN_DAY_ROW_LAYOUT = Object.freeze({
  HEIGHT: 45.65,
  CIRCLE_LEFT: 7.7,
  CIRCLE_SIZE: 26.5,
  NUMBER_FONT_SIZE: 13.4,
  CHECK_SIZE: 12,
  CHECK_PATH: PLAN_ICONS.CHECK.PATH,
  CHECK_STROKE_WIDTH: PLAN_ICONS.CHECK.STROKE_WIDTH,
  CHECK_VIEW_BOX_SIZE: 24,
  TEXT_LEFT: 43.4,
  TEXT_OFFSET_TOP: 0.75,
  TITLE_FONT_SIZE: 9.7,
  SUBTITLE_FONT_SIZE: 9.8,
  CHEVRON_CENTER_RIGHT: 12.1,
  PANEL_RADIUS: 9,
  SEPARATOR_RIGHT: 6,
})

// Icons of the meta row (a calendar and a clock) are shared with the web.
export { PLAN_META_ICONS } from '@clavis-via/shared'
