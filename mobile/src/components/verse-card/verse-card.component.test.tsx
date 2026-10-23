import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { VerseCard } from './verse-card.component'

describe('VerseCard', () => {
  it('shows the title, the quoted verse in at most two lines and the reference with the translation', async () => {
    await render(
      <VerseCard
        text="Porque eu bem sei os planos que tenho para vocês"
        reference="Jeremias 29:11"
        onPlayPress={jest.fn()}
      />,
    )
    expect(screen.getByText('Um minuto com Deus')).toBeTruthy()
    const quote = screen.getByText('“Porque eu bem sei os planos que tenho para vocês”')
    expect(quote.props.numberOfLines).toBe(2)
    expect(screen.getByText('Jeremias 29:11 (NVI)')).toBeTruthy()
  })

  it('calls onPlayPress when the play button is pressed', async () => {
    const onPlayPress = jest.fn()
    await render(<VerseCard text="x" reference="Salmos 23:1" onPlayPress={onPlayPress} />)
    await fireEvent.press(screen.getByTestId(TEST_IDS.HOME_VERSE_PLAY))
    expect(onPlayPress).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Ouvir o versículo' })).toBeTruthy()
  })
})
