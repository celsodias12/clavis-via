import { PLAN_FALLBACK_IMAGE_URI } from '@clavis-via/shared'
import { describe, expect, it } from 'vite-plus/test'
import { planImageSources } from './plan-images'

describe('planImageSources', () => {
  it('points at the 1x and @3x files of the thumbnail and the cover', () => {
    const images = planImageSources('after-a-rejection')

    expect(images.thumbnail).toEqual({
      src: '/images/plan-thumbnail-after-a-rejection.png',
      srcSet:
        '/images/plan-thumbnail-after-a-rejection.png 74w, /images/plan-thumbnail-after-a-rejection@3x.png 296w',
    })
    expect(images.cover).toEqual({
      src: '/images/plan-cover-after-a-rejection.png',
      srcSet:
        '/images/plan-cover-after-a-rejection.png 219w, /images/plan-cover-after-a-rejection@3x.png 876w',
    })
  })

  it('falls back to the neutral image for an unknown id', () => {
    expect(planImageSources('unknown-plan')).toEqual({
      thumbnail: { src: PLAN_FALLBACK_IMAGE_URI },
      cover: { src: PLAN_FALLBACK_IMAGE_URI },
    })
  })
})
