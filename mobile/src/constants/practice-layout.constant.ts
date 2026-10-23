import { PRACTICE_ICONS } from '@clavis-via/shared'
import type { ScreenHeaderLayout } from '../@types/component.type'

// Layout of the Prática de hoje screen in design units, measured on the pratica reference (a 238 unit wide card
// cut at 427.7 where the phone frame ends; the 266 scale is applied to every value). Everything centered stays
// centered, the progress row keeps its side margins, the header X keeps its distance from the left edge. Text
// positions are baselines; the screen converts them to line box tops with the font metrics. The content above
// the play button is anchored to the top, the play button, the progress row and the waves to the bottom (the
// card bottom plays the role of the 560 row).
export const PRACTICE_LAYOUT = Object.freeze({
  // Space between the end of the header and the icon circle.
  ICON_TOP_GAP: 12.7,
  ICON_CIRCLE_DIAMETER: 54,
  ICON_VIEW_BOX_WIDTH: PRACTICE_ICONS.WIND.VIEW_BOX_WIDTH,
  ICON_VIEW_BOX_HEIGHT: PRACTICE_ICONS.WIND.VIEW_BOX_HEIGHT,
  ICON_WIDTH: 32,
  ICON_HEIGHT: 24,
  ICON_STROKE_WIDTH: PRACTICE_ICONS.WIND.STROKE_WIDTH,
  // Three strokes of the wind icon: the upper and lower hooks and the middle line with its ring.
  ICON_PATH: PRACTICE_ICONS.WIND.PATH,
  TITLE_FONT_SIZE: 17,
  // Space between the icon circle and the title line box.
  TITLE_TOP_GAP: 10.2,
  SUBTITLE_FONT_SIZE: 12.4,
  SUBTITLE_TOP_GAP: 3.7,
  DESCRIPTION_FONT_SIZE: 11.8,
  DESCRIPTION_LINE_HEIGHT: 17.1,
  DESCRIPTION_TOP_GAP: 8.6,
  // Width of the description column: it breaks the lines where the design does.
  DESCRIPTION_WIDTH: 182,
  // The play button: the disc and the white ring around it.
  PLAY_DISC_DIAMETER: PRACTICE_ICONS.PLAY_BUTTON.DISC_DIAMETER,
  PLAY_RING_WIDTH: PRACTICE_ICONS.PLAY_BUTTON.RING_WIDTH,
  PLAY_VIEW_BOX_SIZE: PRACTICE_ICONS.PLAY_BUTTON.VIEW_BOX_SIZE,
  PLAY_ICON_PATH: PRACTICE_ICONS.PLAY_BUTTON.PLAY_PATH,
  PLAY_ICON_STROKE_WIDTH: PRACTICE_ICONS.PLAY_BUTTON.PLAY_STROKE_WIDTH,
  PAUSE_BAR_WIDTH: PRACTICE_ICONS.PLAY_BUTTON.PAUSE_BAR_WIDTH,
  PAUSE_BAR_HEIGHT: PRACTICE_ICONS.PLAY_BUTTON.PAUSE_BAR_HEIGHT,
  PAUSE_BAR_OFFSET: PRACTICE_ICONS.PLAY_BUTTON.PAUSE_BAR_OFFSET,
  PAUSE_BAR_RADIUS: PRACTICE_ICONS.PLAY_BUTTON.PAUSE_BAR_RADIUS,
  REPLAY_ARC_PATH: PRACTICE_ICONS.PLAY_BUTTON.REPLAY_ARC_PATH,
  REPLAY_ARROW_PATH: PRACTICE_ICONS.PLAY_BUTTON.REPLAY_ARROW_PATH,
  REPLAY_STROKE_WIDTH: PRACTICE_ICONS.PLAY_BUTTON.REPLAY_STROKE_WIDTH,
  // Space between the play button and the progress row, and from the row to the bottom of the card.
  PLAY_BOTTOM_GAP: 14.4,
  BOTTOM_MARGIN: 84.15,
  // Space between the message of the finished practice and the play button.
  MESSAGE_BOTTOM_GAP: 8,
  MESSAGE_FONT_SIZE: 11.3,
  // The play button never gets closer than this to the description, even on a short screen.
  BOTTOM_MINIMUM_GAP: 14,
  PROGRESS_SIDE_MARGIN: 16,
  PROGRESS_LABEL_FONT_SIZE: 9.9,
  PROGRESS_LABEL_GAP: 7.5,
  // The clock labels keep at least the width of "0:00", so the bar does not shift while the digits change.
  PROGRESS_LABEL_MINIMUM_WIDTH: 17.4,
  WAVE_TOP: 350,
  WAVE_BOTTOM: 427.7,
  WAVE_VIEW_BOX_WIDTH: PRACTICE_ICONS.WAVES.VIEW_BOX_WIDTH,
  // The waves run this far below the card bottom, so they also fill the navigation bar area.
  WAVE_EXTRA_BOTTOM: 24,
  WAVE_BLUE_PATH: PRACTICE_ICONS.WAVES.BLUE_PATH,
  WAVE_PINK_PATH: PRACTICE_ICONS.WAVES.PINK_PATH,
  SKELETON_TITLE_WIDTH: 134,
  SKELETON_TITLE_HEIGHT: 20,
  SKELETON_LINE_WIDTH: 165,
  SKELETON_LINE_HEIGHT: 12,
  SKELETON_LINE_GAP: 5,
})

// The "X" and the title of the header; the card is 238 wide, so the X keeps its distance from the left edge.
export const PRACTICE_HEADER_LAYOUT: ScreenHeaderLayout = Object.freeze({
  LEFT_CENTER_X: 21.7,
  LEFT_CENTER_Y: 47.7,
  RIGHT_CENTER_RIGHT: 21.7,
  RIGHT_CENTER_Y: 47.7,
  TITLE_FONT_SIZE: 12,
  TITLE_BASELINE: 51.4,
  END_Y: 66,
})

// The progress bar of the player: track, fill and the knob at the end of the fill.
export const PROGRESS_BAR_METRICS = Object.freeze({
  TRACK_HEIGHT: 5.8,
  KNOB_DIAMETER: 6.6,
  FULL_PERCENT: 100,
})
