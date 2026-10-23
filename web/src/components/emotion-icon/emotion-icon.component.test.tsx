import { CHECK_IN_OPTIONS, TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { EmotionIcon } from './emotion-icon.component'

describe('EmotionIcon', () => {
  it.each(CHECK_IN_OPTIONS)('draws the $state icon at the requested size', ({ state }) => {
    render(<EmotionIcon state={state} size="57px" />)

    const icon = screen.getByTestId(TEST_IDS.EMOTION_ICON)

    expect(icon.getAttribute('width')).toBe('57px')
    expect(icon.getAttribute('height')).toBe('57px')
    expect(icon.querySelectorAll('circle, ellipse, path').length).toBeGreaterThan(0)
  })

  it('is decorative: hidden from assistive technology', () => {
    render(<EmotionIcon state="heavy" size="57px" />)

    expect(screen.getByTestId(TEST_IDS.EMOTION_ICON).getAttribute('aria-hidden')).toBe('true')
  })
})
