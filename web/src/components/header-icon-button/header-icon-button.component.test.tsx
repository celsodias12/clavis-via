import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { HeaderIconButton } from './header-icon-button.component'

describe('HeaderIconButton', () => {
  it('is a labelled button with the icon of the design, at least 44 px to touch', () => {
    const onPress = vi.fn()
    const { container } = render(
      <HeaderIconButton icon="bell" onPress={onPress} accessibilityLabel="Notificações" />,
    )

    const button = screen.getByRole('button', { name: 'Notificações' })
    fireEvent.click(button)

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(button.style.minWidth).toBe('44px')
    expect(Number(container.querySelector('svg')?.getAttribute('width'))).toBeCloseTo(27.3)
    expect(container.querySelector('path')?.getAttribute('stroke-width')).toBe('1.6')
  })
})
