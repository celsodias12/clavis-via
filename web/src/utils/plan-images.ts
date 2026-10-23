import { PLAN_FALLBACK_IMAGE_URI, planImageNames } from '@clavis-via/shared'
import type { PlanImageSources, WebImageSource } from '../@types/plan-image.type'
import { PLAN_IMAGE_FILES } from '../constants/plan-image.constant'

function buildSource(
  name: string,
  widths: Readonly<{ STANDARD: number; HIGH: number }>,
): WebImageSource {
  const standard = `${PLAN_IMAGE_FILES.BASE_PATH}${name}${PLAN_IMAGE_FILES.EXTENSION}`
  const high = `${PLAN_IMAGE_FILES.BASE_PATH}${name}${PLAN_IMAGE_FILES.HIGH_RESOLUTION_SUFFIX}${PLAN_IMAGE_FILES.EXTENSION}`
  return { src: standard, srcSet: `${standard} ${widths.STANDARD}w, ${high} ${widths.HIGH}w` }
}

// Images of a plan; an id without images gets the neutral fallback instead of breaking the screen.
export function planImageSources(planId: string): PlanImageSources {
  const names = planImageNames(planId)
  if (names === null) {
    return { thumbnail: { src: PLAN_FALLBACK_IMAGE_URI }, cover: { src: PLAN_FALLBACK_IMAGE_URI } }
  }
  return {
    thumbnail: buildSource(names.thumbnail, PLAN_IMAGE_FILES.THUMBNAIL_WIDTHS),
    cover: buildSource(names.cover, PLAN_IMAGE_FILES.COVER_WIDTHS),
  }
}
