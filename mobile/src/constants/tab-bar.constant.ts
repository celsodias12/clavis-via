// Tab bar metrics in design units (the 266 x 560 card), measured on the Início reference. The bar is
// pinned to the bottom edge: its height is the navigation inset plus BAR_HEIGHT scaled.
export const TAB_BAR_LAYOUT = Object.freeze({
  // The bar starts at design row 509.7 (a faint shadow line sits just above it).
  BAR_TOP: 509.7,
  BAR_HEIGHT: 50.3,
  // The items spread with space between; the content width of each item is its label.
  PADDING_LEFT: 23.7,
  PADDING_RIGHT: 20.7,
  ICON_TOP: 517.5,
  ICON_SIZE: 20.7,
  LABEL_FONT_SIZE: 8.2,
  LABEL_BASELINE: 546.5,
  // Extra touch area around each item, in dp (the item itself is smaller than 44 dp).
  ITEM_HIT_SLOP: 14,
  SEPARATOR_WIDTH: 1,
})

export const TAB_ICON_METRICS = Object.freeze({
  VIEW_BOX_SIZE: 24,
  STROKE_WIDTH: 1.7,
  // Outline of the filled (active) shapes, so their corners stay rounded.
  FILLED_STROKE_WIDTH: 1.2,
  DETAIL_STROKE_WIDTH: 1.8,
})
