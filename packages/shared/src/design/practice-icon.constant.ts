// Drawn parts of the Prática de hoje screen, shared by the app and the web (each in its own view box).
export const PRACTICE_ICONS = Object.freeze({
  // The wind icon of the practice.
  WIND: Object.freeze({
    VIEW_BOX_WIDTH: 29,
    VIEW_BOX_HEIGHT: 24,
    STROKE_WIDTH: 1.25,
    // Three strokes: the upper and lower hooks and the middle line with its ring.
    PATH: 'M3.2 7.2 H16.4 A3.1 3.1 0 1 0 13.7 2.65 M0.3 12 H20.6 M24.6 12 A3.5 3.5 0 1 1 24.6 11.99 M3.2 16.8 H16.4 A3.1 3.1 0 1 1 13.7 21.35',
  }),
  // The play button: a disc with a white ring, centered on the origin of a square view box.
  PLAY_BUTTON: Object.freeze({
    DISC_DIAMETER: 51.5,
    RING_WIDTH: 2.2,
    VIEW_BOX_SIZE: 56,
    PLAY_PATH: 'M-6.6 -8.5 L9.8 0.1 L-6.6 8.7 Z',
    PLAY_STROKE_WIDTH: 2,
    PAUSE_BAR_WIDTH: 4.2,
    PAUSE_BAR_HEIGHT: 16.5,
    PAUSE_BAR_OFFSET: 5,
    PAUSE_BAR_RADIUS: 1.4,
    REPLAY_ARC_PATH: 'M4 -6.93 A8 8 0 1 1 -4 -6.93',
    REPLAY_ARROW_PATH: 'M-4 -6.93 L-1.4 -8.43 L-2.7 -4.68 Z',
    REPLAY_STROKE_WIDTH: 2,
  }),
  // The waves behind the practice (a 238 unit wide view box).
  WAVES: Object.freeze({
    VIEW_BOX_WIDTH: 238,
    BLUE_PATH:
      'M0 22 C12 5 24 0 40 1 C62 2 70 8 84 22 C96 36 104 46 118 50 L238 50 L238 110 L0 110 Z',
    PINK_PATH:
      'M108 52 C135 50 160 46 175 28 C188 12 198 6 210 3 C225 1 232 6 238 10 L238 110 L60 110 C80 90 100 70 108 52 Z',
  }),
})
