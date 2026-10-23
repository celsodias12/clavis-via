import { INSIGHT_ICON_METRICS } from '@clavis-via/shared'

// Layout of the Minhas emoções screen in design units, measured on the emocoes reference (a 242 unit wide card:
// left anchored values keep their distance from the left edge, right anchored ones from the right edge, and full
// width blocks keep both margins). Text positions are baselines; the screen converts them to line box tops with
// the font ascent. Nothing here is bottom anchored: the screen is a list from the top.
export const EMOTIONS_HEADER_LAYOUT = Object.freeze({
  LEFT_CENTER_X: 14.9,
  LEFT_CENTER_Y: 46.4,
  // The screen has no icon on the right; these only complete the header layout.
  RIGHT_CENTER_RIGHT: 20.65,
  RIGHT_CENTER_Y: 46.4,
  TITLE_FONT_SIZE: 11.9,
  TITLE_BASELINE: 46.4,
  END_Y: 56,
})

export const EMOTIONS_LAYOUT = Object.freeze({
  SEGMENTS_TOP: 65,
  SEGMENTS_LEFT: 13.7,
  CARD_TOP: 104.5,
  CARD_HEIGHT: 122,
  CARD_LEFT: 11.7,
  CARD_RIGHT: 13.3,
  CARD_RADIUS: 12,
  // The plotted area: the canvas starts below the top of the card and the extreme scores keep a margin from
  // the canvas edges so the points are not cut.
  CHART_TOP: 3.5,
  CHART_HEIGHT: 58.5,
  CHART_PADDING_TOP: 15,
  CHART_PADDING_BOTTOM: 13.8,
  LINE_WIDTH: 1.3,
  POINT_RADIUS: 4,
  // The month view has up to 31 points: smaller dots keep them apart.
  MONTH_POINT_RADIUS: 2.2,
  // Icon of a day (the week view) and the labels under the chart, measured from the top of the card.
  DAY_ICON_SIZE: 20.5,
  DAY_ICON_TOP: 72.2,
  DAY_LABEL_FONT_SIZE: 9,
  DAY_LABEL_BASELINE: 111.3,
  // Widest label (a day name) that is centered in a column even when the column is narrower.
  DAY_LABEL_WIDTH: 28,
  HEADING_LEFT: 18,
  HEADING_FONT_SIZE: 10.4,
  HEADING_BASELINE: 243.3,
  // Where the first insight row starts.
  INSIGHTS_TOP: 248.2,
  CONTENT_BOTTOM_GAP: 24,
})

// One insight row: the circle with its icon, the title and the text (first baselines from the row top).
export const INSIGHT_ROW_LAYOUT = Object.freeze({
  LEFT: 16.5,
  RIGHT: 13.3,
  PADDING_VERTICAL: 7.7,
  CIRCLE_SIZE: 30,
  TEXT_LEFT: 55,
  TITLE_FONT_SIZE: 9.2,
  TEXT_FONT_SIZE: 8.6,
  TEXT_LINE_HEIGHT: 12,
  TITLE_TEXT_GAP: 2.2,
  DIVIDER_LEFT: 55,
  DIVIDER_RIGHT: 14,
  DIVIDER_HEIGHT: 0.8,
  ICON_SIZE: 18,
  ICON_VIEW_BOX_SIZE: INSIGHT_ICON_METRICS.VIEW_BOX_SIZE,
  ICON_STROKE_WIDTH: INSIGHT_ICON_METRICS.STROKE_WIDTH,
})

// The drawn parts of the insight icons (sprout and faces) are shared with the web.
export { INSIGHT_FACE, INSIGHT_SPROUT_PATHS } from '@clavis-via/shared'

// Heights (design units) of the placeholders shown while the summary loads.
export const EMOTIONS_SKELETON_LAYOUT = Object.freeze({
  ROW_HEIGHT: 43.5,
  // One placeholder per insight row the design shows.
  ROW_KEYS: ['first', 'second', 'third'],
  ROW_RADIUS: 12,
  ROW_GAP: 8,
})
