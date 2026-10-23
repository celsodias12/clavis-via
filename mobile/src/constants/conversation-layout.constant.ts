import { CONVERSATION_ICONS } from '@clavis-via/shared'

// Layout of the Conversa screen in design units, measured on the conversa reference. That card is only 189 units
// wide (and 560 tall): left anchored values keep their distance from the left edge of the card, right anchored ones
// from its right edge, and full width containers keep both margins and stretch. Text positions are baselines (or
// line centers where noted); the screen converts them to line box tops with the font ascent.
export const CONVERSATION_LAYOUT = Object.freeze({
  TITLE_LEFT: 13,
  TITLE_FONT_SIZE: 16.5,
  TITLE_BASELINE: 50.7,
  // The "Histórico" pill on the right.
  HISTORY_RIGHT: 12.3,
  HISTORY_TOP: 35,
  HISTORY_WIDTH: 56.7,
  HISTORY_HEIGHT: 20,
  HISTORY_RADIUS: 10,
  HISTORY_FONT_SIZE: 11,
  HISTORY_BASELINE: 49,
})

// The greeting group: a white panel holding the round icon, the bubble and the time.
export const CONVERSATION_PANEL_LAYOUT = Object.freeze({
  LEFT: 6,
  RIGHT: 5,
  TOP: 97,
  RADIUS: 12,
  PADDING_TOP: 10.5,
  PADDING_BOTTOM: 7.5,
  SHADOW_OFFSET_Y: 1,
  SHADOW_BLUR: 6,
  ICON_SIZE: 25,
  ICON_LEFT: 6.7,
  ICON_BUBBLE_GAP: 7.5,
  // Inside the panel: the bubble keeps these margins from the panel edges.
  BUBBLE_LEFT: 6.7,
  BUBBLE_RIGHT: 5,
  // The time under the bubble: its left edge and the gap from the bubble.
  TIME_LEFT: 12.7,
  TIME_GAP: 8.5,
  TIME_FONT_SIZE: 8.4,
  // Drawing of the round icon (a person inside a ring) in a 24 unit view box.
  ICON_VIEW_BOX_SIZE: CONVERSATION_ICONS.ASSISTANT.VIEW_BOX_SIZE,
  ICON_HEAD_CENTER_Y: CONVERSATION_ICONS.ASSISTANT.HEAD_CENTER_Y,
  ICON_HEAD_RADIUS: CONVERSATION_ICONS.ASSISTANT.HEAD_RADIUS,
  ICON_BODY_PATH: CONVERSATION_ICONS.ASSISTANT.BODY_PATH,
  ICON_STROKE_WIDTH: CONVERSATION_ICONS.ASSISTANT.STROKE_WIDTH,
})

// A message bubble, in the panel and in the list.
export const CONVERSATION_BUBBLE_LAYOUT = Object.freeze({
  RADIUS: 12,
  PADDING_HORIZONTAL: 8.3,
  PADDING_VERTICAL: 8.65,
  FONT_SIZE: 10.5,
  LINE_HEIGHT: 14.7,
  // Bubbles of the list (outside the panel): margins from the card edges, and the gap between bubbles.
  LIST_LEFT: 12.7,
  LIST_RIGHT: 10,
  LIST_GAP: 8,
  // Longest share of the width a bubble takes, so the two sides stay apart.
  MAXIMUM_WIDTH_PERCENT: '88%',
})

// The placeholder of the list while it loads, in the size of one assistant bubble.
export const CONVERSATION_SKELETON_LAYOUT = Object.freeze({
  WIDTH: 120,
  HEIGHT: 34,
})

export const CONVERSATION_QUICK_REPLY_LAYOUT = Object.freeze({
  // Gap between the bottom of the panel and the first pill.
  TOP_GAP: 19.5,
  LEFT: 13.7,
  HEIGHT: 28.5,
  RADIUS: 14.25,
  GAP: 8.5,
  PADDING_LEFT: 15.5,
  PADDING_RIGHT: 14,
  FONT_SIZE: 10.2,
})

// The footer: the input row, then the notice of three centered lines, anchored above the tab bar.
export const CONVERSATION_FOOTER_LAYOUT = Object.freeze({
  INPUT_LEFT: 6.7,
  INPUT_HEIGHT: 33.3,
  INPUT_RADIUS: 16.65,
  INPUT_BORDER_WIDTH: 0.8,
  INPUT_TEXT_PADDING: 9.3,
  INPUT_FONT_SIZE: 7.6,
  SEND_SIZE: 24.4,
  SEND_RIGHT: 7.8,
  SEND_GAP: 6,
  SEND_ARROW_VIEW_BOX_SIZE: CONVERSATION_ICONS.SEND_ARROW.VIEW_BOX_SIZE,
  SEND_ARROW_PATH: CONVERSATION_ICONS.SEND_ARROW.PATH,
  SEND_ARROW_STROKE_WIDTH: CONVERSATION_ICONS.SEND_ARROW.STROKE_WIDTH,
  SEND_ARROW_SIZE: 12,
  // The notice lines (the simulated replies line, then the two lines of the design disclaimer).
  NOTICE_FONT_SIZE: 6.5,
  NOTICE_LINE_HEIGHT: 9.3,
  // Gap between the input and the notice.
  NOTICE_TOP_GAP: 2.2,
  // The reference tab bar is shorter than the app one, so the footer is anchored to the bar instead of the
  // card bottom: this is the gap between the last notice line and the top of the bar.
  NOTICE_BAR_GAP: 2.5,
  // Gap between the status messages (send error, daily limit) and the input.
  FEEDBACK_GAP: 6,
  FEEDBACK_FONT_SIZE: 8.6,
  FEEDBACK_HORIZONTAL_MARGIN: 12,
  // Space under the last item of the list, above the footer.
  LIST_BOTTOM_GAP: 10,
})
