import { EMOTION_INSIGHT_KINDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react-native'
import { InsightRow } from './insight-row.component'

describe('InsightRow', () => {
  it.each(Object.values(EMOTION_INSIGHT_KINDS))(
    'renders the title and the text of the %s insight',
    async (kind) => {
      await render(<InsightRow kind={kind} title="Um título" text="Um texto longo." />)
      expect(screen.getByTestId(`insight-row-${kind}`)).toBeTruthy()
      expect(screen.getByText('Um título')).toBeTruthy()
      expect(screen.getByText('Um texto longo.')).toBeTruthy()
    },
  )

  it('hides the decorative icon from accessibility', async () => {
    await render(<InsightRow kind="balanced-days" title="Título" text="Texto" />)
    expect(
      screen.getByTestId('insight-row-balanced-days-icon', { includeHiddenElements: true }).props
        .accessibilityElementsHidden,
    ).toBe(true)
  })

  it('draws the divider only when asked to', async () => {
    const { rerender } = await render(
      <InsightRow kind="routine-helps" title="Título" text="Texto" />,
    )
    expect(screen.queryByTestId('insight-row-routine-helps-divider')).toBeNull()
    await rerender(<InsightRow kind="routine-helps" title="Título" text="Texto" hasDivider />)
    expect(screen.getByTestId('insight-row-routine-helps-divider')).toBeTruthy()
  })
})
