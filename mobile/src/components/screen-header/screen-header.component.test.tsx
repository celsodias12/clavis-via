import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { SCREEN_HEADER_LAYOUT } from '../../constants/plan-day-layout.constant'
import { ScreenHeader } from './screen-header.component'

describe('ScreenHeader', () => {
  it('shows the title and reports the presses of both icons', async () => {
    const onLeftPress = jest.fn()
    const onRightPress = jest.fn()
    await render(
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
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Mais opções' }))
    expect(onLeftPress).toHaveBeenCalledTimes(1)
    expect(onRightPress).toHaveBeenCalledTimes(1)
  })

  it('uses the close icon when asked', async () => {
    await render(<ScreenHeader title="Ação" leftIcon="close" onLeftPress={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Mais opções' })).toBeNull()
  })

  it('draws no button for an icon without a handler', async () => {
    await render(<ScreenHeader title="Ação" leftIcon="back" rightIcon="more" />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('draws no icon when none is given', async () => {
    await render(<ScreenHeader title="Ação" />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('draws the parts from the layout it is given', async () => {
    const layout = { ...SCREEN_HEADER_LAYOUT, TITLE_FONT_SIZE: 20, END_Y: 100 }
    await render(
      <ScreenHeader
        title="Ação do dia"
        leftIcon="back"
        onLeftPress={jest.fn()}
        rightIcon="more"
        onRightPress={jest.fn()}
        layout={layout}
      />,
    )
    expect(screen.getByText('Ação do dia')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Mais opções' })).toBeTruthy()
  })
})
