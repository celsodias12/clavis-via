import { CHECK_IN_OPTIONS, TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react-native'
import { EmotionIcon } from './emotion-icon.component'

describe('EmotionIcon', () => {
  it.each(CHECK_IN_OPTIONS)('draws the $state icon at the requested size', async ({ state }) => {
    await render(<EmotionIcon state={state} size={57} />)
    const icon = screen.getByTestId(TEST_IDS.EMOTION_ICON, { includeHiddenElements: true })
    expect(icon.props.width).toBe(57)
    expect(icon.props.height).toBe(57)
  })

  it('is decorative: hidden from accessibility', async () => {
    await render(<EmotionIcon state="heavy" size={57} />)
    expect(
      screen.getByTestId(TEST_IDS.EMOTION_ICON, { includeHiddenElements: true }).props
        .accessibilityElementsHidden,
    ).toBe(true)
  })
})
