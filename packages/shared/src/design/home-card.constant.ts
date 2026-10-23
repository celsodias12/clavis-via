// Geometry of the Início cards that app and web draw the same way, in design units (the 266 unit wide card).

// The open book on the verse tile, drawn in a box of this size: the two pages with the spine, and the cover that
// shows below and beside them.
export const VERSE_BOOK_ICON = Object.freeze({
  VIEW_BOX_WIDTH: 28.7,
  VIEW_BOX_HEIGHT: 23.7,
  STROKE_WIDTH: 1.2,
  PAGES_PATH:
    'M14.35 3.5 C12.55 1.5 9.75 1.1 3.05 1.2 V18.6 C9.15 18.5 12.35 19.1 14.35 20.9 C16.35 19.1 19.55 18.5 25.65 18.6 V1.2 C18.95 1.1 16.15 1.5 14.35 3.5 Z M14.35 3.5 V20.9',
  COVER_PATH:
    'M0.6 3.3 V20.5 C0.6 21.2 1.1 21.5 1.7 21.5 C7.6 21.4 11.7 21.8 14.35 22.8 C17 21.8 21.1 21.4 27 21.5 C27.6 21.5 28.1 21.2 28.1 20.5 V3.3',
})

// The round play button of the verse card and the outlined triangle inside it, from the button's top left corner.
export const VERSE_PLAY_ICON = Object.freeze({
  DIAMETER: 22.5,
  TRIANGLE_LEFT: 8.3,
  TRIANGLE_TOP: 7.1,
  TRIANGLE_WIDTH: 7.2,
  TRIANGLE_HEIGHT: 9.3,
  TRIANGLE_STROKE_WIDTH: 1.2,
})

// The arrow at the end of the "Continue sua jornada" card.
export const CURRENT_PLAN_CHEVRON = Object.freeze({
  WIDTH: 6,
  HEIGHT: 11,
  STROKE_WIDTH: 1.3,
  PATH: 'M0.65 0.65 L5.2 5.5 L0.65 10.35',
})

// Background of the "Sua chave de hoje" card: the gradient angle and the patches of color over it, each an
// ellipse around its center, measured from the card's top left corner on a card of this size.
export const DAILY_KEY_CARD_BACKGROUND = Object.freeze({
  GRADIENT_ANGLE: '45deg',
  CARD_WIDTH: 238.4,
  CARD_HEIGHT: 165.2,
  BLOBS: Object.freeze([
    Object.freeze({ CENTER_X: 181, CENTER_Y: 38, RADIUS_X: 55, RADIUS_Y: 48 }),
    Object.freeze({ CENTER_X: 100, CENTER_Y: 140, RADIUS_X: 40, RADIUS_Y: 28 }),
  ]),
})
