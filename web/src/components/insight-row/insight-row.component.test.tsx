import { EMOTION_INSIGHT_KINDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { InsightRow } from './insight-row.component'

describe('InsightRow', () => {
  it.each(Object.values(EMOTION_INSIGHT_KINDS))(
    'renders the title and the text of the %s insight',
    (kind) => {
      render(<InsightRow kind={kind} title="Um título" text="Um texto longo." />)

      expect(screen.getByTestId(`insight-row-${kind}`)).toBeTruthy()
      expect(screen.getByText('Um título')).toBeTruthy()
      expect(screen.getByText('Um texto longo.')).toBeTruthy()
    },
  )

  it('hides the decorative icon from accessibility', () => {
    render(<InsightRow kind="balanced-days" title="Título" text="Texto" />)

    expect(screen.getByTestId('insight-row-balanced-days-icon').getAttribute('aria-hidden')).toBe(
      'true',
    )
  })

  it('draws the divider only when asked to', () => {
    const { rerender } = render(<InsightRow kind="routine-helps" title="Título" text="Texto" />)
    expect(screen.queryByTestId('insight-row-routine-helps-divider')).toBeNull()

    rerender(<InsightRow kind="routine-helps" title="Título" text="Texto" hasDivider />)

    expect(screen.getByTestId('insight-row-routine-helps-divider')).toBeTruthy()
  })
})
