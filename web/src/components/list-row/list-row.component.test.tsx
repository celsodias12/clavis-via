import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { ListRow } from './list-row.component'

describe('ListRow', () => {
  it('shows the label, calls the handler and draws the divider by default', () => {
    const onPress = vi.fn()
    render(<ListRow icon="settings" label="Configurações" onPress={onPress} testID="row" />)

    fireEvent.click(screen.getByRole('button', { name: 'Configurações' }))

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId(`row${TEST_IDS.LIST_ROW_DIVIDER_SUFFIX}`)).toBeTruthy()
  })

  it('omits the divider when asked to', () => {
    render(
      <ListRow
        icon="bell"
        label="Notificações"
        onPress={vi.fn()}
        testID="row"
        hasDivider={false}
      />,
    )

    expect(screen.queryByTestId(`row${TEST_IDS.LIST_ROW_DIVIDER_SUFFIX}`)).toBeNull()
  })

  it('works without a test ID', () => {
    const { container } = render(<ListRow icon="lock" label="Privacidade" onPress={vi.fn()} />)

    expect(container.querySelector('[data-testid]')).toBeNull()
  })

  it('takes the inks of the achievement tone', () => {
    render(<ListRow icon="heart" label="Conquista" onPress={vi.fn()} tone="achievement" />)

    expect(screen.getByText('Conquista').className).toContain('text-journey-achievement-label')
    expect(screen.getByRole('button').querySelector('path')?.getAttribute('stroke')).toBe('#6f86d6')
  })

  it('does not call the handler when disabled', () => {
    const onPress = vi.fn()
    render(<ListRow icon="help" label="Ajuda" onPress={onPress} isDisabled />)

    fireEvent.click(screen.getByRole('button', { name: 'Ajuda' }))

    expect(onPress).not.toHaveBeenCalled()
  })
})
