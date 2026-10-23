import { PLAN_FALLBACK_IMAGE_URI } from '@clavis-via/shared'
import type { ImageSourcePropType } from 'react-native'

// Still cover of the video of every day (the design shows the same one).
export const DAY_VIDEO_COVER = require('../../assets/images/day-video-cover.png')

// Stretched by the screens when a plan has no image of its own.
export const PLAN_FALLBACK_IMAGE = Object.freeze({ uri: PLAN_FALLBACK_IMAGE_URI })

// Metro needs a static require per file, so the asset of each image name (see PLAN_IMAGE_NAMES in the shared)
// is listed here.
export const PLAN_IMAGE_SOURCES: Readonly<Record<string, ImageSourcePropType>> = Object.freeze({
  'plan-thumbnail-when-discouragement-weighs': require('../../assets/images/plan-thumbnail-when-discouragement-weighs.png'),
  'plan-cover-when-discouragement-weighs': require('../../assets/images/plan-cover-when-discouragement-weighs.png'),
  'plan-thumbnail-after-a-rejection': require('../../assets/images/plan-thumbnail-after-a-rejection.png'),
  'plan-cover-after-a-rejection': require('../../assets/images/plan-cover-after-a-rejection.png'),
  'plan-thumbnail-learning-to-set-boundaries': require('../../assets/images/plan-thumbnail-learning-to-set-boundaries.png'),
  'plan-cover-learning-to-set-boundaries': require('../../assets/images/plan-cover-learning-to-set-boundaries.png'),
  'plan-thumbnail-when-your-faith-is-tired': require('../../assets/images/plan-thumbnail-when-your-faith-is-tired.png'),
  'plan-cover-when-your-faith-is-tired': require('../../assets/images/plan-cover-when-your-faith-is-tired.png'),
  'plan-thumbnail-finding-direction-again': require('../../assets/images/plan-thumbnail-finding-direction-again.png'),
  'plan-cover-finding-direction-again': require('../../assets/images/plan-cover-finding-direction-again.png'),
})
