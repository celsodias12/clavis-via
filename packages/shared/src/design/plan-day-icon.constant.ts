// Drawn parts of the Dia and Ação do dia screens, shared by the app and the web (each in its own view box).
export const PLAN_DAY_ICONS = Object.freeze({
  // The video block: the play button (design units) and the clock of the length (24 unit view box).
  VIDEO: Object.freeze({
    PLAY_DIAMETER: 45,
    PLAY_RING_WIDTH: 1.2,
    PLAY_TRIANGLE: 'M16.8 14.1 L16.8 31.3 L31.2 22.7 Z',
    PLAY_TRIANGLE_STROKE_WIDTH: 2,
    CLOCK_VIEW_BOX_SIZE: 24,
    CLOCK_CIRCLE_RADIUS: 10,
    CLOCK_STROKE_WIDTH: 2.2,
    CLOCK_HANDS: 'M12 7 V12 L15.5 14',
  }),
  // The chevron of the Anterior button.
  PREVIOUS_CHEVRON: Object.freeze({
    VIEW_BOX_SIZE: 24,
    PATH: 'M15.5 5 L8 12 L15.5 19',
    STROKE_WIDTH: 1.8,
  }),
  // The check of the action card.
  ACTION_CHECK: Object.freeze({
    VIEW_BOX_SIZE: 24,
    PATH: 'M8 12.4 L10.9 15 L16.3 9.9',
    STROKE_WIDTH: 1.5,
  }),
  // The light bulb of the tip card.
  TIP: Object.freeze({
    VIEW_BOX_WIDTH: 24,
    VIEW_BOX_HEIGHT: 33,
    STROKE_WIDTH: 1.9,
    PATH: 'M12 2.2 A8.6 8.6 0 0 0 6.6 17.4 C7.6 18.4 8 19.4 8 20.8 L16 20.8 C16 19.4 16.4 18.4 17.4 17.4 A8.6 8.6 0 0 0 12 2.2 Z M9 25.2 L15 25.2 M10.2 29.4 L13.8 29.4',
  }),
})
