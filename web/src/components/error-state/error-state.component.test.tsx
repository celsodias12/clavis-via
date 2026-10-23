import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { ErrorState } from './error-state.component'

describe('ErrorState', () => {
  it('shows the message and retries on click', () => {
    const onRetry = vi.fn()
    render(
      <ErrorState
        message="Não foi possível carregar agora."
        onRetry={onRetry}
        isRetrying={false}
      />,
    )

    expect(screen.getByTestId(TEST_IDS.ERROR_STATE_MESSAGE).textContent).toBe(
      'Não foi possível carregar agora.',
    )
    fireEvent.click(screen.getByText('Tentar de novo'))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows the spinner and ignores clicks while retrying', () => {
    const onRetry = vi.fn()
    render(<ErrorState message="Erro" onRetry={onRetry} isRetrying />)

    fireEvent.click(screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY))

    expect(
      screen.getByTestId(`${TEST_IDS.ERROR_STATE_RETRY}${TEST_IDS.PRIMARY_BUTTON_SPINNER_SUFFIX}`),
    ).toBeTruthy()
    expect(onRetry).not.toHaveBeenCalled()
  })
})
