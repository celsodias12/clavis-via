import { BUTTON_ARROW_PATH, LIST_ROW_ICONS } from '@clavis-via/shared'

// Component metrics in design units (the 266 x 560 card); every size is scaled with scaleDesignValue.
export const BUTTON_METRICS = Object.freeze({
  WIDTH: 226,
  HEIGHT: 40,
  RADIUS: 20,
  FONT_SIZE: 12.5,
  SHADOW_OFFSET_Y: 4,
  SHADOW_BLUR: 10,
  DISABLED_OPACITY: 0.55,
  ENABLED_OPACITY: 1,
  // The compact pill of the "Sua chave de hoje" card (measured on the Início reference).
  COMPACT_HEIGHT: 30,
  COMPACT_RADIUS: 15,
  COMPACT_FONT_SIZE: 10.95,
  // The compact label sits this much lower than the centered position (font metrics), in design units.
  COMPACT_LABEL_OFFSET_Y: 0.42,
  // The slimmer full width button of the Plano screen (measured on the Plano reference).
  MEDIUM_HEIGHT: 37,
  MEDIUM_RADIUS: 18.5,
  MEDIUM_FONT_SIZE: 11.1,
  // The pill of the Dia footer (measured on the Dia reference).
  SLIM_HEIGHT: 32,
  SLIM_RADIUS: 16,
  SLIM_FONT_SIZE: 11.3,
})

// Height, corner radius and font size (design units) of each button size.
export const BUTTON_SIZE_METRICS = Object.freeze({
  regular: Object.freeze({
    HEIGHT: BUTTON_METRICS.HEIGHT,
    RADIUS: BUTTON_METRICS.RADIUS,
    FONT_SIZE: BUTTON_METRICS.FONT_SIZE,
  }),
  compact: Object.freeze({
    HEIGHT: BUTTON_METRICS.COMPACT_HEIGHT,
    RADIUS: BUTTON_METRICS.COMPACT_RADIUS,
    FONT_SIZE: BUTTON_METRICS.COMPACT_FONT_SIZE,
  }),
  medium: Object.freeze({
    HEIGHT: BUTTON_METRICS.MEDIUM_HEIGHT,
    RADIUS: BUTTON_METRICS.MEDIUM_RADIUS,
    FONT_SIZE: BUTTON_METRICS.MEDIUM_FONT_SIZE,
  }),
  slim: Object.freeze({
    HEIGHT: BUTTON_METRICS.SLIM_HEIGHT,
    RADIUS: BUTTON_METRICS.SLIM_RADIUS,
    FONT_SIZE: BUTTON_METRICS.SLIM_FONT_SIZE,
  }),
})

// Arrow after the label of a button (measured on the Início reference: 13 x 10.3 design units).
export const BUTTON_ARROW_METRICS = Object.freeze({
  VIEW_BOX_SIZE: 24,
  SIZE: 13.5,
  STROKE_WIDTH: 2.3,
  GAP: 10.7,
  OFFSET_Y: 0.35,
  PATH: BUTTON_ARROW_PATH,
})

// The header icon metrics, styles and labels are shared with the web.
export {
  FIELD_METRICS,
  HEADER_ICON_LABEL_KEYS,
  HEADER_ICON_METRICS,
  HEADER_ICON_STYLES,
  WAVE_BACKGROUND_ASPECT,
  WAVE_FADE_GRADIENT_ID,
  WAVE_SEAM_FADE_HEIGHT,
} from '@clavis-via/shared'

export const SKELETON_METRICS = Object.freeze({
  DEFAULT_RADIUS: 8,
  PULSE_DURATION_MS: 800,
  PULSE_MINIMUM_OPACITY: 0.4,
  PULSE_MAXIMUM_OPACITY: 1,
})

export const ERROR_STATE_METRICS = Object.freeze({
  GAP: 16,
  HORIZONTAL_PADDING: 24,
  MESSAGE_SIZE: 13.5,
})

// The row of a menu list (measured on the Perfil reference, a 210 unit wide card): the row is laid out
// between the margins of its divider; offsets are from the row's left and right edges, and the label
// baseline is measured from the row top. The icons are drawn in a 24 unit view box.
export const LIST_ROW_METRICS = Object.freeze({
  HEIGHT: 26.05,
  ICON_VIEW_BOX_SIZE: LIST_ROW_ICONS.VIEW_BOX_SIZE,
  ICON_SIZE: 15.5,
  ICON_LEFT: 3.7,
  ICON_STROKE_WIDTH: LIST_ROW_ICONS.ICON_STROKE_WIDTH,
  LABEL_LEFT: 29.6,
  LABEL_FONT_SIZE: 9.45,
  LABEL_BASELINE: 16.7,
  CHEVRON_SIZE: 11.5,
  CHEVRON_RIGHT: 0.35,
  DIVIDER_LEFT: 0,
  DIVIDER_RIGHT: 0,
  CHEVRON_OFFSET_Y: 0.35,
  CHEVRON_STROKE_WIDTH: LIST_ROW_ICONS.CHEVRON_STROKE_WIDTH,
  CHEVRON_PATH: LIST_ROW_ICONS.CHEVRON_PATH,
  DIVIDER_HEIGHT: 0.8,
  // Extra touch area around the row, in dp, so it meets the accessibility minimum.
  MINIMUM_TOUCH_HEIGHT: 44,
})

// Size of the initial inside the avatar circle: the Início reference has a 14 unit initial in a 34 unit circle.
export const AVATAR_INITIAL_RATIO = 14 / 34
