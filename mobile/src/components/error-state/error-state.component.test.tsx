import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { ErrorState } from './error-state.component'

describe('ErrorState', () => {
  it('shows the message and retries on press', async () => {
    const onRetry = jest.fn()
    await render(<ErrorState message="Algo deu errado" onRetry={onRetry} isRetrying={false} />)
    expect(screen.getByText('Algo deu errado')).toBeTruthy()
    await fireEvent.press(screen.getByText('Tentar de novo'))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows a spinner and ignores presses while retrying', async () => {
    const onRetry = jest.fn()
    await render(<ErrorState message="Algo deu errado" onRetry={onRetry} isRetrying />)

    const retry = screen.getByTestId(TEST_IDS.ERROR_STATE_RETRY)
    expect(retry.props.accessibilityState).toEqual(
      expect.objectContaining({ busy: true, disabled: true }),
    )
    expect(
      screen.getByTestId(`${TEST_IDS.ERROR_STATE_RETRY}${TEST_IDS.PRIMARY_BUTTON_SPINNER_SUFFIX}`),
    ).toBeTruthy()
    await fireEvent.press(retry)
    expect(onRetry).not.toHaveBeenCalled()
  })
})
