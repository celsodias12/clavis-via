import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { DailyKeyCard } from './daily-key-card.component'

describe('DailyKeyCard', () => {
  it('shows the label, the key, the illustration and a button that calls onPress', async () => {
    const onPress = jest.fn()
    await render(
      <DailyKeyCard
        label="SUA CHAVE DE HOJE"
        title="Voz e Limites"
        text="Texto da chave."
        buttonLabel="Ver prática de hoje"
        onButtonPress={onPress}
      />,
    )
    expect(screen.getByText('SUA CHAVE DE HOJE')).toBeTruthy()
    expect(screen.getByText('Voz e Limites')).toBeTruthy()
    expect(screen.getByText('Texto da chave.')).toBeTruthy()
    // The illustration is decorative, so it is hidden from the accessibility tree.
    expect(
      screen.getByTestId(TEST_IDS.DAILY_KEY_ILLUSTRATION, { includeHiddenElements: true }),
    ).toBeTruthy()
    await fireEvent.press(screen.getByText('Ver prática de hoje'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('keeps the title on one line, shrinking it when it is long', async () => {
    await render(
      <DailyKeyCard
        label="L"
        title="Título"
        text="Texto"
        buttonLabel="B"
        onButtonPress={jest.fn()}
      />,
    )
    const title = screen.getByText('Título')
    expect(title.props.numberOfLines).toBe(1)
    expect(title.props.adjustsFontSizeToFit).toBe(true)
  })

  it('limits the text to four lines', async () => {
    await render(
      <DailyKeyCard label="L" title="T" text="Texto" buttonLabel="B" onButtonPress={jest.fn()} />,
    )
    expect(screen.getByText('Texto').props.numberOfLines).toBe(4)
  })
})
