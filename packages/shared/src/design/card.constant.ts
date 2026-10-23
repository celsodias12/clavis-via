// Dimensions (in design points) of the card used by the reference mockups.
export const DESIGN = Object.freeze({
  CARD_WIDTH: 266,
  CARD_HEIGHT: 560,
  STATUS_BAR_HEIGHT: 30,
})

export const WAVE_BACKGROUND_ASPECT = Object.freeze({
  WIDTH: 266,
  HEIGHT: 560,
})

// Height (design units) of the fade that hides the edge between the flat top color and the image.
export const WAVE_SEAM_FADE_HEIGHT = 24
export const WAVE_FADE_GRADIENT_ID = 'wave-fade'

export const FIELD_METRICS = Object.freeze({
  HORIZONTAL_MARGIN: 24,
  BOX_HEIGHT: 42,
  BOX_RADIUS: 14,
  BOX_BORDER_WIDTH: 1,
  // Inside the 1 unit border, so the text starts 14 units from the box edge like the mockup.
  TEXT_PADDING: 13,
  TEXT_SIZE: 13,
  LABEL_SIZE: 11.5,
  // The label baseline sits 6 design units above the box; the gap below the label line box is
  // those 6 minus the Source Sans descent (0.4 * LABEL_SIZE).
  LABEL_GAP: 1.4,
  ERROR_SIZE: 11.5,
  ERROR_GAP: 4,
  // The mockup spaces the password placeholder bullets by 2 design units.
  PASSWORD_PLACEHOLDER_LETTER_SPACING: 2,
})
