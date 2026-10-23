import { render, screen } from '@testing-library/react-native'
import { AppText } from './app-text.component'

describe('AppText', () => {
  it('applies the brand font family without font padding and locks the font scale', async () => {
    await render(
      <AppText variant="brand" testID="text">
        CLAVIS
      </AppText>,
    )
    const text = screen.getByTestId('text')
    expect(text).toHaveStyle({ fontFamily: 'Jost_300Light', includeFontPadding: false })
    expect(text.props.maxFontSizeMultiplier).toBe(1)
    expect(screen.getByText('CLAVIS')).toBeTruthy()
  })

  it.each([
    ['title', 'Petrona_400Regular'],
    ['titleMedium', 'Petrona_500Medium'],
    ['body', 'SourceSans3_400Regular'],
    ['bodyMedium', 'SourceSans3_500Medium'],
    ['bodySemiBold', 'SourceSans3_600SemiBold'],
  ] as const)('maps the %s variant to %s', async (variant, fontFamily) => {
    await render(
      <AppText variant={variant} testID="text">
        Hello
      </AppText>,
    )
    expect(screen.getByTestId('text')).toHaveStyle({ fontFamily })
  })

  it('lets the caller style override the variant style', async () => {
    await render(
      <AppText variant="body" style={{ color: '#ff0000' }} testID="text">
        Hello
      </AppText>,
    )
    expect(screen.getByTestId('text')).toHaveStyle({
      color: '#ff0000',
      fontFamily: 'SourceSans3_400Regular',
    })
  })
})
