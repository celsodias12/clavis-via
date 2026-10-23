import { TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { BrandSplash } from './brand-splash.component'

describe('BrandSplash', () => {
  it('shows the key', () => {
    render(<BrandSplash />)

    expect(screen.getByTestId(TEST_IDS.BRAND_KEY)).toBeTruthy()
  })
})
