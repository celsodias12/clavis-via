// Fonts metrics as a fraction of the font size (hhea ascent / descent, Android with includeFontPadding false).
export const AUTHENTICATION_FONT_METRICS = Object.freeze({
  TITLE_ASCENT: 0.858,
  TITLE_DESCENT: 0.27,
  BODY_ASCENT: 1.024,
  BODY_DESCENT: 0.4,
})

// Layout of the authentication screens in design units (the 266 x 560 card).
export const AUTHENTICATION_LAYOUT = Object.freeze({
  BACK_CENTER_X: 32,
  BACK_CENTER_Y: 65,
  TITLE_LEFT: 23,
  TITLE_FONT_SIZE: 27,
  TITLE_FIRST_BASELINE: 112,
  TITLE_LINE_PITCH: 30,
  SUBTITLE_LEFT: 24,
  SUBTITLE_FONT_SIZE: 13.5,
  // Distance from the last title baseline to the first subtitle baseline.
  SUBTITLE_AFTER_TITLE: 25,
  SUBTITLE_LINE_PITCH: 18,
  BUTTON_TOP: 452,
  BUTTON_HEIGHT: 40,
  FORM_ERROR_FONT_SIZE: 11.5,
  FORM_ERROR_GAP: 8,
  FORM_ERROR_MARGIN: 24,
  FOOTER_BASELINE: 520.6,
  FOOTER_FONT_SIZE: 11.75,
  // Extra touch area around the footer, in dp.
  FOOTER_HIT_SLOP: 12,
  // Distance between two consecutive field label baselines.
  FIELD_PITCH: 70,
})

// Where the form fields start on each screen, as the baseline of the first label.
export const SIGN_UP_LAYOUT = Object.freeze({
  FIRST_LABEL_BASELINE: 172,
})

export const SIGN_IN_LAYOUT = Object.freeze({
  FIRST_LABEL_BASELINE: 218,
})
