// Drawn parts of the insight rows of Minhas emoções, shared by the app and the web (24 unit view box).
export const INSIGHT_ICON_METRICS = Object.freeze({
  VIEW_BOX_SIZE: 24,
  STROKE_WIDTH: 1.6,
})

// Stroke paths of the sprout icon: three petals and the base.
export const INSIGHT_SPROUT_PATHS = Object.freeze([
  'M12 3.5 C9.2 6.3 9.2 11.2 12 15 C14.8 11.2 14.8 6.3 12 3.5 Z',
  'M7.4 8.2 C5 10 4.3 13 5.3 15.4 C8.2 15.6 10.6 14.2 11.6 12',
  'M16.6 8.2 C19 10 19.7 13 18.7 15.4 C15.8 15.6 13.4 14.2 12.4 12',
  'M5 18.6 C9 20.6 15 20.6 19 18.6',
])

// The round faces of the other two insights.
export const INSIGHT_FACE = Object.freeze({
  CENTER: 12,
  RADIUS: 8,
  EYE_RADIUS: 1,
  EYE_LEFT_X: 9.2,
  EYE_RIGHT_X: 14.8,
  EYE_Y: 10.6,
  FROWN_PATH: 'M9.3 15.8 Q12 13.1 14.7 15.8',
  MOUTH_DOT_Y: 14.7,
  MOUTH_DOT_RADIUS: 0.7,
})
