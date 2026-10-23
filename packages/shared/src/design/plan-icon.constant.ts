// Drawn parts of the Planos and Plano screens, shared by the app and the web (24 unit view box).
export const PLAN_ICONS = Object.freeze({
  VIEW_BOX_SIZE: 24,
  // The arrow that ends a plan card and a day row.
  CHEVRON: Object.freeze({ PATH: 'M8.5 4 L16 12 L8.5 20', STROKE_WIDTH: 1.9 }),
  // The mark of a finished day.
  CHECK: Object.freeze({ PATH: 'M4.5 12.5 L10 18 L19.5 6.5', STROKE_WIDTH: 2.4 }),
})

// Icons of the meta row (24 unit view box): a calendar and a clock.
export const PLAN_META_ICONS = Object.freeze({
  VIEW_BOX_SIZE: 24,
  STROKE_WIDTH: 2,
  CALENDAR_BODY: Object.freeze({ x: 2.5, y: 4.5, width: 19, height: 18, radius: 3 }),
  CALENDAR_LINES: 'M7.5 2 V6.5 M16.5 2 V6.5 M3 10.5 H21',
  CALENDAR_DOT: Object.freeze({ cx: 12, cy: 16.5, r: 1.3 }),
  CLOCK_CIRCLE: Object.freeze({ cx: 12, cy: 12, r: 10.9 }),
  CLOCK_HANDS: 'M10.6 6.8 L11.6 12 L15 14.6',
})
