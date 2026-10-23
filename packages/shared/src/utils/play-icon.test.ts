import { describe, expect, it } from 'vite-plus/test'
import { buildPlayTrianglePath } from './play-icon'

describe('buildPlayTrianglePath', () => {
  it('draws the triangle inside its box, inset by half the stroke', () => {
    const path = buildPlayTrianglePath()

    expect(path).toMatch(/^M[\d. ]+ L[\d. ]+ L[\d. ]+ Z$/)
    const [left, top, right, middle, bottomLeft, bottom] = path.match(/[\d.]+/g)?.map(Number) ?? []
    expect(left).toBeCloseTo(8.9)
    expect(top).toBeCloseTo(7.7)
    expect(right).toBeCloseTo(14.9)
    expect(middle).toBeCloseTo(11.75)
    expect(bottomLeft).toBeCloseTo(8.9)
    expect(bottom).toBeCloseTo(15.8)
  })
})
