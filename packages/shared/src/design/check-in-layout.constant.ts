// Layout of the Check-in screen in design units (the 266 x 560 card), measured on the 252 x 560 reference card.
// Elements keep their distance to the edge they are pinned to; the page is wider than the reference card, so
// the tile columns keep their size and the gaps between them absorb the extra width.
export const CHECK_IN_LAYOUT = Object.freeze({
  CLOSE_CENTER_X: 22,
  CLOSE_CENTER_Y: 45.5,
  TITLE_LEFT: 15,
  TITLE_FONT_SIZE: 21.2,
  TITLE_FIRST_BASELINE: 83.5,
  TITLE_LINE_PITCH: 26.3,
  SUBTITLE_LEFT: 15.2,
  SUBTITLE_FONT_SIZE: 13.3,
  SUBTITLE_FIRST_BASELINE: 134.5,
  SUBTITLE_LINE_PITCH: 17,
  GRID_LEFT: 14.7,
  GRID_RIGHT: 13.5,
  COLUMNS: 3,
  ROW_TOPS: [169, 260, 351.2],
  // Rows of two tiles are centered on the page and have this gap.
  WIDE_ROW_GAP: 9.2,
  BUTTON_LEFT: 15.2,
  BUTTON_RIGHT: 14.2,
  BUTTON_BOTTOM: 533,
  BUTTON_HEIGHT: 40,
  // The text field of "Outro" sits right below the grid (choice of the implementer: the design does not show it).
  OTHER_FIELD_TOP: 442,
  ERROR_FONT_SIZE: 11.5,
  ERROR_GAP: 8,
  ERROR_MARGIN: 24,
})

export const CHECK_IN_TILE_METRICS = Object.freeze({
  WIDTH: 69,
  WIDE_WIDTH: 75.7,
  HEIGHT: 82,
  RADIUS: 24,
  ICON_TOP: 12.5,
  LABEL_BASELINE: 67.4,
  LABEL_FONT_SIZE: 11.2,
  SELECTED_BORDER_WIDTH: 1.5,
})
