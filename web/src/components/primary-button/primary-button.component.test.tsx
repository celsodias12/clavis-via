import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { renderWithProviders } from '../../../tests/utils/render'
import { ROUTES } from '../../constants/route.constant'
import { PrimaryButton } from './primary-button.component'

describe('PrimaryButton', () => {
  it('calls onPress once for two synchronous clicks and releases the lock afterwards', async () => {
    let finish: () => void = () => {}
    const onPress = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    render(<PrimaryButton label="Continuar" tone="navy" onPress={onPress} />)
    const button = screen.getByRole('button', { name: 'Continuar' })

    fireEvent.click(button)
    fireEvent.click(button)
    expect(onPress).toHaveBeenCalledTimes(1)

    finish()
    await waitFor(() => {
      fireEvent.click(button)
      expect(onPress).toHaveBeenCalledTimes(2)
    })
  })

  it('is the submit button of its form: the form gets the submit and the button itself has no press', () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <PrimaryButton label="Entrar" tone="navy" isSubmit />
      </form>,
    )
    const button = screen.getByRole('button', { name: 'Entrar' })

    fireEvent.click(button)

    expect(button.getAttribute('type')).toBe('submit')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('becomes a real link with the look of the button when it only navigates', async () => {
    await renderWithProviders(
      <PrimaryButton
        label="Começar"
        tone="navy"
        hasArrow
        testID="start"
        linkProps={{ to: ROUTES.SIGN_UP }}
      />,
    )

    const link = screen.getByRole('link', { name: 'Começar' })

    expect(link.getAttribute('href')).toBe('/sign-up')
    expect(link.getAttribute('data-testid')).toBe('start')
    expect(screen.getByTestId(`start${TEST_IDS.PRIMARY_BUTTON_ARROW_SUFFIX}`)).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('does nothing on click when there is no onPress', () => {
    render(<PrimaryButton label="Entrar" tone="navy" />)

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByRole('button', { name: 'Entrar' }).getAttribute('type')).toBe('button')
  })

  it('shows the spinner instead of the label and is disabled while loading', () => {
    const onPress = vi.fn()
    render(<PrimaryButton label="Continuar" tone="navy" onPress={onPress} isLoading testID="go" />)

    const button = screen.getByTestId('go')
    fireEvent.click(button)

    expect(screen.getByTestId(`go${TEST_IDS.PRIMARY_BUTTON_SPINNER_SUFFIX}`)).toBeTruthy()
    expect(button.textContent).toBe('')
    expect(button.hasAttribute('disabled')).toBe(true)
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(onPress).not.toHaveBeenCalled()
  })

  it('is disabled and dimmed when disabled, except in the light tone', () => {
    const { rerender } = render(
      <PrimaryButton label="Salvar" tone="navy" onPress={() => {}} isDisabled />,
    )
    const button = screen.getByRole('button', { name: 'Salvar' })
    expect(button.hasAttribute('disabled')).toBe(true)
    expect(button.className).toContain('opacity-55')

    rerender(<PrimaryButton label="Salvar" tone="light" onPress={() => {}} isDisabled />)
    expect(screen.getByRole('button', { name: 'Salvar' }).className).not.toContain('opacity-55')
  })

  it('draws the arrow after the label when asked', () => {
    render(<PrimaryButton label="Seguir" tone="accent" onPress={() => {}} hasArrow testID="next" />)

    expect(screen.getByTestId(`next${TEST_IDS.PRIMARY_BUTTON_ARROW_SUFFIX}`)).toBeTruthy()
  })

  it('draws the arrow without a derived test id when there is no test id', () => {
    const { container } = render(
      <PrimaryButton label="Seguir" tone="accent" onPress={() => {}} hasArrow />,
    )

    expect(container.querySelector('svg')?.hasAttribute('data-testid')).toBe(false)
  })

  it('has no arrow and no derived test ids by default', () => {
    const { container } = render(<PrimaryButton label="Seguir" tone="light" onPress={() => {}} />)

    expect(container.querySelector('svg')).toBeNull()
  })

  it('has no derived spinner test id without a test id', () => {
    const { container } = render(
      <PrimaryButton label="Seguir" tone="light" onPress={() => {}} isLoading hasArrow />,
    )

    expect(container.querySelector('[data-testid]')).toBeNull()
  })

  it('stretches to the parent width and supports every size', () => {
    const { rerender } = render(
      <PrimaryButton label="Largo" tone="navy" onPress={() => {}} isFullWidth size="compact" />,
    )
    expect(screen.getByRole('button').className).toContain('w-full')
    expect(screen.getByRole('button').className).toContain('h-11')

    rerender(<PrimaryButton label="Largo" tone="navy" onPress={() => {}} size="medium" />)
    expect(screen.getByRole('button').className).toContain('h-[54px]')

    rerender(<PrimaryButton label="Largo" tone="navy" onPress={() => {}} size="slim" />)
    expect(screen.getByRole('button').className).toContain('h-12')
  })
})
