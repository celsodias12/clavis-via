import { fireEvent, render, screen } from '@testing-library/react-native'
import { HeaderIconButton } from './header-icon-button.component'

describe('HeaderIconButton', () => {
  it.each(['back', 'close', 'bell', 'search', 'chevronBack', 'more', 'settings'] as const)(
    'renders the %s icon as an accessible button',
    async (icon) => {
      const onPress = jest.fn()
      await render(<HeaderIconButton icon={icon} onPress={onPress} accessibilityLabel="Voltar" />)
      const button = screen.getByRole('button', { name: 'Voltar' })
      expect(button).toBeTruthy()
      expect(button).toHaveStyle({ minWidth: 44, minHeight: 44 })
      await fireEvent.press(button)
      expect(onPress).toHaveBeenCalledTimes(1)
    },
  )
})
