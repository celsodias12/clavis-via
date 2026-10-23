// The key from the approved mockup: a 46 x 80 box with three circles, a shaft and the bit.
export const BRAND_KEY_METRICS = Object.freeze({
  VIEW_BOX_WIDTH: 46,
  VIEW_BOX_HEIGHT: 80,
  GRADIENT_ID: 'key-gradient',
  GRADIENT_START_Y: 5,
  GRADIENT_END_Y: 75,
  CIRCLE_STROKE_WIDTH: 2,
})

// Geometry of the key in view box units; every shape is filled or stroked with the key gradient.
export const BRAND_KEY_SHAPES = Object.freeze({
  CIRCLES: Object.freeze([
    Object.freeze({ cx: 23, cy: 12.3, r: 6 }),
    Object.freeze({ cx: 14.6, cy: 23.7, r: 6.1 }),
    Object.freeze({ cx: 31.3, cy: 23.7, r: 6.1 }),
  ]),
  SHAFT: Object.freeze({ x: 20.7, y: 32, width: 3.2, height: 42.6, rx: 1.6 }),
  BIT_PATH:
    'M23.6 60.4 H28.5 V57.7 Q28.5 57 29.2 57 H33.3 Q34 57 34 57.7 V60.3 Q34 61 33.3 61 H30.6 V65.4 H33.3 Q34 65.4 34 66.1 V68.8 Q34 69.5 33.3 69.5 H29.2 Q28.5 69.5 28.5 68.8 V66 H23.6 Z',
})
