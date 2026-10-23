import { PLAN_DAY_ICONS } from '@clavis-via/shared'
import type { FieldMetrics, ScreenHeaderLayout } from '../@types/component.type'

// Layout of the Ação do dia screen in design units, measured on the acao reference (a 240 unit wide card cut at
// 425.5 where the phone frame ends): left-anchored values keep their distance from the left edge, right-anchored
// ones from the right edge, full width blocks keep both margins. Text positions are baselines; the screen
// converts them to line box tops with the font metrics. Everything above the button is anchored to the top, the
// reflection field is anchored to the bottom (the card bottom plays the role of the 560 row).
export const DAY_ACTION_LAYOUT = Object.freeze({
  CARD_MARGIN: 15,
  CARD_RADIUS: 16,
  // Space between the header and the action card.
  CARDS_TOP_GAP: 8,
  ACTION_CARD_PADDING_TOP: 17,
  ACTION_CARD_PADDING_BOTTOM: 11,
  ACTION_TEXT_LEFT: 49.5,
  ACTION_TEXT_RIGHT: 12,
  ACTION_TEXT_FONT_SIZE: 10.6,
  ACTION_TEXT_LINE_HEIGHT: 15.35,
  CHECK_SIZE: 24.6,
  CHECK_LEFT: 13.3,
  CHECK_TOP: 14.7,
  CHECK_VIEW_BOX_SIZE: PLAN_DAY_ICONS.ACTION_CHECK.VIEW_BOX_SIZE,
  CHECK_PATH: PLAN_DAY_ICONS.ACTION_CHECK.PATH,
  CHECK_STROKE_WIDTH: PLAN_DAY_ICONS.ACTION_CHECK.STROKE_WIDTH,
  TIP_CARD_GAP: 10.5,
  TIP_CARD_PADDING_TOP: 12.5,
  TIP_CARD_PADDING_BOTTOM: 17.7,
  TIP_ICON_LEFT: 14.5,
  TIP_ICON_TOP: 12.1,
  TIP_ICON_WIDTH: 13.7,
  TIP_ICON_HEIGHT: 19,
  TIP_ICON_VIEW_BOX_WIDTH: PLAN_DAY_ICONS.TIP.VIEW_BOX_WIDTH,
  TIP_ICON_VIEW_BOX_HEIGHT: PLAN_DAY_ICONS.TIP.VIEW_BOX_HEIGHT,
  TIP_ICON_STROKE_WIDTH: PLAN_DAY_ICONS.TIP.STROKE_WIDTH,
  TIP_ICON_PATH: PLAN_DAY_ICONS.TIP.PATH,
  TIP_TEXT_LEFT: 37.6,
  TIP_TEXT_RIGHT: 10,
  TIP_TITLE_FONT_SIZE: 11,
  TIP_TEXT_FONT_SIZE: 10.45,
  TIP_LINE_HEIGHT: 14.65,
  // Space between the line box of the tip title and the one of the tip.
  TIP_TEXT_GAP: 4.2,
  BUTTON_GAP: 12.5,
  // Space between the button and the message that tells the save failed.
  ERROR_GAP: 6,
  ERROR_FONT_SIZE: 10.35,
  // The reflection area never gets closer than this to the button, even on a short screen.
  BOTTOM_MINIMUM_GAP: 14,
  // The distance from the field bottom edge to the card bottom edge.
  BOTTOM_MARGIN: 15.8,
  SKELETON_ACTION_CARD_HEIGHT: 74,
  SKELETON_TIP_CARD_HEIGHT: 93,
  SKELETON_LABEL_HEIGHT: 10,
  SKELETON_LABEL_WIDTH: 90,
  SKELETON_FIELD_GAP: 6,
})

// Header of this screen: lower than the Dia one in the design, with a bigger title.
export const DAY_ACTION_HEADER_LAYOUT: ScreenHeaderLayout = Object.freeze({
  LEFT_CENTER_X: 15.85,
  LEFT_CENTER_Y: 44.7,
  RIGHT_CENTER_RIGHT: 20.35,
  RIGHT_CENTER_Y: 43.85,
  TITLE_FONT_SIZE: 11.95,
  TITLE_BASELINE: 46.5,
  END_Y: 63,
})

// The "Como foi para você?" label and its multiline box.
export const DAY_ACTION_FIELD_METRICS: FieldMetrics = Object.freeze({
  HORIZONTAL_MARGIN: 14.5,
  BOX_HEIGHT: 78.8,
  BOX_RADIUS: 14.5,
  BOX_BORDER_WIDTH: 1,
  TEXT_PADDING: 8.7,
  TEXT_SIZE: 10.2,
  LABEL_SIZE: 10.35,
  LABEL_GAP: 3.96,
  ERROR_SIZE: 10.35,
  ERROR_GAP: 4,
})
