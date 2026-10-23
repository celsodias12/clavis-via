import { TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { ProgressBar } from './progress-bar.component'

describe('ProgressBar', () => {
  it('fills the track by the progress and reports it to assistive technology', () => {
    render(<ProgressBar progress={1 / 3} accessibilityLabel="Progresso do plano" />)

    const bar = screen.getByRole('progressbar', { name: 'Progresso do plano' })
    expect(bar.getAttribute('aria-valuenow')).toBe('33')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
    expect(screen.getByTestId(TEST_IDS.PROGRESS_BAR_FILL).style.width).toBe(`${(1 / 3) * 100}%`)
  })

  it.each([
    [-0.5, '0%'],
    [2, '100%'],
  ])('holds a progress of %s to the nearest end', (progress, width) => {
    render(<ProgressBar progress={progress} accessibilityLabel="Progresso" />)

    expect(screen.getByTestId(TEST_IDS.PROGRESS_BAR_FILL).style.width).toBe(width)
  })

  it('draws a knob at the end of the fill in the practice variant only', () => {
    const { rerender } = render(
      <ProgressBar progress={0.25} accessibilityLabel="Progresso" variant="practice" />,
    )

    expect(screen.getByTestId(TEST_IDS.PROGRESS_BAR_KNOB).style.left).toBe('25%')
    expect(screen.getByTestId(TEST_IDS.PROGRESS_BAR_FILL).style.width).toBe('25%')

    rerender(<ProgressBar progress={0.25} accessibilityLabel="Progresso" />)
    expect(screen.queryByTestId(TEST_IDS.PROGRESS_BAR_KNOB)).toBeNull()
  })
})
