import { TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { ProgressBar } from './progress-bar.component'

function fillWidth() {
  return StyleSheet.flatten(screen.getByTestId(TEST_IDS.PROGRESS_BAR_FILL).props.style).width
}

function knobLeft() {
  return StyleSheet.flatten(screen.getByTestId(TEST_IDS.PROGRESS_BAR_KNOB).props.style).left
}

function percentAt(progress: number) {
  return `${progress * 100}%`
}

describe('ProgressBar', () => {
  it('starts empty, with the knob at the start of the track', async () => {
    await render(<ProgressBar progress={0} />)
    expect(fillWidth()).toBe(percentAt(0))
    expect(knobLeft()).toBe(percentAt(0))
  })

  it('fills in proportion to the progress', async () => {
    await render(<ProgressBar progress={0.5} />)
    expect(fillWidth()).toBe(percentAt(0.5))
    expect(knobLeft()).toBe(percentAt(0.5))
  })

  it('is held between 0 and 1', async () => {
    const { rerender } = await render(<ProgressBar progress={-3} />)
    expect(fillWidth()).toBe(percentAt(0))
    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(0)

    await rerender(<ProgressBar progress={7} />)
    expect(fillWidth()).toBe(percentAt(1))
    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(100)
  })

  it('tells assistive technology how far it is', async () => {
    await render(<ProgressBar progress={0.25} />)
    const bar = screen.getByRole('progressbar', { name: 'Progresso da prática' })
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 25 })
  })

  it('has no knob in the card variant and takes the label it is given', async () => {
    await render(
      <ProgressBar progress={0.4} variant="card" accessibilityLabel="Progresso do plano" />,
    )
    expect(fillWidth()).toBe(percentAt(0.4))
    expect(screen.queryByTestId(TEST_IDS.PROGRESS_BAR_KNOB)).toBeNull()
    expect(screen.getByRole('progressbar', { name: 'Progresso do plano' })).toBeTruthy()
  })
})
