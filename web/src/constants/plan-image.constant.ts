// Where the plan images are served from, and the width in px of the 1x and the @3x file of each kind.
export const PLAN_IMAGE_FILES = Object.freeze({
  BASE_PATH: '/images/',
  EXTENSION: '.png',
  HIGH_RESOLUTION_SUFFIX: '@3x',
  THUMBNAIL_WIDTHS: Object.freeze({ STANDARD: 74, HIGH: 296 }),
  COVER_WIDTHS: Object.freeze({ STANDARD: 219, HIGH: 876 }),
})

// Width over height of the cover photos (219 x 163 for every plan).
export const PLAN_COVER_ASPECT_RATIO = 219 / 163
