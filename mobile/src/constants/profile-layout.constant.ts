// Layout of the Perfil screen in design units, measured on the perfil reference (a 210 unit wide card: left
// anchored values keep their distance from the left edge, right anchored ones from the right edge, centered ones
// sit at the center and full width blocks keep both margins). Text positions are baselines; the screen converts
// them to line box tops with the font ascent. Nothing here is bottom anchored: the screen is a list from the top.
export const PROFILE_HEADER_LAYOUT = Object.freeze({
  LEFT_CENTER_X: 16.7,
  LEFT_CENTER_Y: 43.8,
  RIGHT_CENTER_RIGHT: 20.65,
  RIGHT_CENTER_Y: 43.5,
  TITLE_FONT_SIZE: 12.65,
  TITLE_BASELINE: 47.8,
  END_Y: 56,
})

export const PROFILE_LAYOUT = Object.freeze({
  PHOTO_DIAMETER: 65.5,
  PHOTO_CENTER_Y: 99.6,
  // The pencil badge on the lower right of the photo.
  BADGE_DIAMETER: 18.5,
  BADGE_CENTER_FROM_PHOTO_CENTER_X: 26.8,
  BADGE_CENTER_FROM_PHOTO_CENTER_Y: 21.4,
  BADGE_HIT_SLOP: 8,
  BADGE_ICON_SIZE: 9,
  NAME_FONT_SIZE: 12.7,
  NAME_BASELINE: 152.9,
  SUBTITLE_FONT_SIZE: 9.3,
  SUBTITLE_BASELINE: 167.5,
  PURPOSE_LEFT: 11.7,
  PURPOSE_RIGHT: 12,
  PURPOSE_TOP: 182.7,
  PURPOSE_HEIGHT: 68,
  PURPOSE_RADIUS: 12,
  PURPOSE_SQUARE_LEFT: 19.3,
  PURPOSE_SQUARE_TOP: 195.7,
  PURPOSE_SQUARE_SIZE: 38,
  PURPOSE_SQUARE_RADIUS: 12,
  PURPOSE_ICON_SIZE: 24,
  PURPOSE_TEXT_LEFT: 67.3,
  PURPOSE_TEXT_WIDTH: 118,
  PURPOSE_TITLE_FONT_SIZE: 10.08,
  PURPOSE_TITLE_BASELINE: 201.2,
  PURPOSE_BODY_FONT_SIZE: 9.35,
  PURPOSE_BODY_FIRST_BASELINE: 216.2,
  PURPOSE_BODY_LINE_HEIGHT: 12.45,
  LIST_LEFT: 14,
  LIST_RIGHT: 13,
  LIST_TOP: 258.3,
  // Space below the last row so the list does not end at the screen edge when it scrolls.
  CONTENT_BOTTOM_GAP: 24,
})
