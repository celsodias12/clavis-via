import { planImageNames } from '@clavis-via/shared'
import type { PlanImages } from '../@types/plan-image.type'
import { PLAN_FALLBACK_IMAGE, PLAN_IMAGE_SOURCES } from '../constants/plan-image.constant'

// Images of a plan; an id without images gets the neutral fallback instead of breaking the screen.
export function planImages(planId: string): PlanImages {
  const names = planImageNames(planId)
  if (names === null) {
    return { thumbnail: PLAN_FALLBACK_IMAGE, cover: PLAN_FALLBACK_IMAGE }
  }
  return { thumbnail: PLAN_IMAGE_SOURCES[names.thumbnail], cover: PLAN_IMAGE_SOURCES[names.cover] }
}
