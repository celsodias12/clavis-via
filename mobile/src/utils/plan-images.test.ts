import { PLAN_FALLBACK_IMAGE } from '../constants/plan-image.constant'
import { planImages } from './plan-images'

const PLAN_IDS = [
  'when-discouragement-weighs',
  'after-a-rejection',
  'learning-to-set-boundaries',
  'when-your-faith-is-tired',
  'finding-direction-again',
]

describe('planImages', () => {
  it.each(PLAN_IDS)('has a thumbnail and a cover for %s', (planId) => {
    const images = planImages(planId)
    expect(images.thumbnail).toBeTruthy()
    expect(images.cover).toBeTruthy()
    expect(images.thumbnail).not.toBe(PLAN_FALLBACK_IMAGE)
    expect(images.cover).not.toBe(PLAN_FALLBACK_IMAGE)
  })

  it('gives every plan its own images', () => {
    const thumbnails = new Set(PLAN_IDS.map((planId) => planImages(planId).thumbnail))
    expect(thumbnails.size).toBe(PLAN_IDS.length)
  })

  it('falls back to the neutral image for an unknown id', () => {
    expect(planImages('unknown-plan')).toEqual({
      thumbnail: PLAN_FALLBACK_IMAGE,
      cover: PLAN_FALLBACK_IMAGE,
    })
  })

  it('does not read inherited object keys as plans', () => {
    expect(planImages('constructor').thumbnail).toBe(PLAN_FALLBACK_IMAGE)
  })
})
