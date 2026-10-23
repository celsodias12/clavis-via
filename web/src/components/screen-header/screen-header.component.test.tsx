import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { ScreenHeader } from './screen-header.component'

describe('ScreenHeader', () => {
  it('shows the title and reports the presses of both icons', () => {
    const onLeftPress = vi.fn()
    const onRightPress = vi.fn()
    render(
      <ScreenHeader
        title="Dia 1 de 3"
        leftIcon="back"
        onLeftPress={onLeftPress}
        rightIcon="more"
        onRightPress={onRightPress}
      />,
    )

    expect(screen.getByText('Dia 1 de 3')).toBeTruthy()
    expect(screen.getByTestId(TEST_IDS.SCREEN_HEADER)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mais opções' }))
    expect(onLeftPress).toHaveBeenCalledTimes(1)
    expect(onRightPress).toHaveBeenCalledTimes(1)
  })

  it('uses the close icon when asked', () => {
    render(<ScreenHeader title="Ação" leftIcon="close" onLeftPress={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Fechar' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Mais opções' })).toBeNull()
  })

  it('draws no button for an icon without a handler', () => {
    render(<ScreenHeader title="Ação" leftIcon="back" rightIcon="more" />)

    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('draws no icon when none is given', () => {
    render(<ScreenHeader title="Ação" />)

    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('is the page heading only when asked', () => {
    const { rerender } = render(<ScreenHeader title="Ação do dia" />)
    expect(screen.queryByRole('heading')).toBeNull()

    rerender(<ScreenHeader title="Ação do dia" isHeading />)
    expect(screen.getByRole('heading', { name: 'Ação do dia' })).toBeTruthy()
  })
})
