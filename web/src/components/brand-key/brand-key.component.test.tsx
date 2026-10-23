import { colors, TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { BrandKey } from './brand-key.component'

describe('BrandKey', () => {
  it('scales the 46 x 80 key to the given width', () => {
    render(<BrandKey width={46} />)

    const key = screen.getByTestId(TEST_IDS.BRAND_KEY)

    expect(key.getAttribute('width')).toBe('46')
    expect(key.getAttribute('height')).toBe('80')
  })

  it('paints the three circles, the shaft and the bit with the key gradient', () => {
    const { container } = render(<BrandKey width={92} />)

    expect(container.querySelectorAll('circle')).toHaveLength(3)
    expect(container.querySelectorAll('rect')).toHaveLength(1)
    expect(container.querySelectorAll('path')).toHaveLength(1)
    expect(
      [...container.querySelectorAll('stop')].map((stop) => stop.getAttribute('stop-color')),
    ).toEqual(colors.keyGradient.map((stop) => stop.color))
    expect(container.querySelector('rect')?.getAttribute('fill')).toBe('url(#key-gradient)')
  })
})
