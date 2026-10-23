import { PLAN_DAY_ICONS } from '@clavis-via/shared'

// Layout of the Dia screen in design units, measured on the dia reference (a 242 unit wide card: left-anchored
// values keep their distance from the left edge, right-anchored ones from the right edge, full width blocks
// keep both margins). Text positions are baselines; the screen converts them to line box tops with the ascent.
export const PLAN_DAY_LAYOUT = Object.freeze({
  CONTENT_LEFT: 14,
  CONTENT_RIGHT: 14,
  TITLE_LEFT: 13.7,
  TITLE_FONT_SIZE: 16.6,
  TITLE_BASELINE: 75.6,
  SEGMENTS_LEFT: 15,
  SEGMENTS_TOP: 94.8,
  VIDEO_TOP: 129.8,
  VIDEO_HEIGHT: 111.4,
  MESSAGE_TITLE_FONT_SIZE: 11.9,
  MESSAGE_TITLE_BASELINE: 266.3,
  BODY_FONT_SIZE: 12.1,
  BODY_LINE_HEIGHT: 16.6,
  BODY_FIRST_BASELINE: 285.9,
  // The design wraps the text in the card content column (242 - 2 x 14 units); a fixed width keeps the breaks.
  BODY_WIDTH: 214,
  // Space between the action text and its button.
  ACTION_BUTTON_GAP: 20,
  // The card bottom edge: the footer is anchored to it like the 560 unit cards are to theirs.
  CARD_BOTTOM: 427.5,
  FOOTER_BUTTON_TOP: 379.8,
  FOOTER_BUTTON_HEIGHT: 32,
  FOOTER_BUTTON_GAP: 9.5,
  PREVIOUS_BUTTON_WIDTH: 100.5,
  // The chevron box sits this far from the button left edge (its ink starts 9.3 units in).
  PREVIOUS_CHEVRON_BOX_LEFT: 2.6,
  PREVIOUS_CHEVRON_SIZE: 20,
  PREVIOUS_CHEVRON_VIEW_BOX_SIZE: PLAN_DAY_ICONS.PREVIOUS_CHEVRON.VIEW_BOX_SIZE,
  // The label is centered in what is left after the chevron: shifted this much from the button center.
  PREVIOUS_LABEL_PADDING_LEFT: 11.2,
  PREVIOUS_CHEVRON_PATH: PLAN_DAY_ICONS.PREVIOUS_CHEVRON.PATH,
  PREVIOUS_CHEVRON_STROKE_WIDTH: PLAN_DAY_ICONS.PREVIOUS_CHEVRON.STROKE_WIDTH,
  FOOTER_FONT_SIZE: 11.3,
  FOOTER_BUTTON_RADIUS: 16,
  // Extra space between the last block and the footer.
  CONTENT_BOTTOM_GAP: 14,
  SKELETON_KEYS: Object.freeze(['first', 'second', 'third']),
  SKELETON_LINE_HEIGHT: 12,
  SKELETON_LINE_GAP: 5,
  SKELETON_LINE_COUNT: 5,
})

// The header shared by the screens that have a back arrow, a centered title and an optional right icon.
export const SCREEN_HEADER_LAYOUT = Object.freeze({
  LEFT_CENTER_X: 18.35,
  LEFT_CENTER_Y: 38.35,
  RIGHT_CENTER_RIGHT: 20.35,
  RIGHT_CENTER_Y: 37.85,
  TITLE_FONT_SIZE: 11.4,
  TITLE_BASELINE: 41.8,
  // Design row where the header ends; what follows is placed relative to it.
  END_Y: 52,
})

// Video block of the Dia screen; offsets are measured from the top left corner of the video.
export const VIDEO_PLACEHOLDER_LAYOUT = Object.freeze({
  RADIUS: 9,
  PLAY_DIAMETER: PLAN_DAY_ICONS.VIDEO.PLAY_DIAMETER,
  PLAY_CENTER_Y: 55.6,
  PLAY_RING_WIDTH: PLAN_DAY_ICONS.VIDEO.PLAY_RING_WIDTH,
  PLAY_TRIANGLE: PLAN_DAY_ICONS.VIDEO.PLAY_TRIANGLE,
  PLAY_TRIANGLE_STROKE_WIDTH: PLAN_DAY_ICONS.VIDEO.PLAY_TRIANGLE_STROKE_WIDTH,
  CLOCK_LEFT: 8.2,
  CLOCK_TOP: 91.6,
  CLOCK_SIZE: 11.6,
  CLOCK_TEXT_GAP: 4.5,
  CLOCK_FONT_SIZE: 10.1,
  CLOCK_VIEW_BOX_SIZE: PLAN_DAY_ICONS.VIDEO.CLOCK_VIEW_BOX_SIZE,
  CLOCK_CIRCLE_RADIUS: PLAN_DAY_ICONS.VIDEO.CLOCK_CIRCLE_RADIUS,
  CLOCK_STROKE_WIDTH: PLAN_DAY_ICONS.VIDEO.CLOCK_STROKE_WIDTH,
  CLOCK_HANDS: PLAN_DAY_ICONS.VIDEO.CLOCK_HANDS,
})
