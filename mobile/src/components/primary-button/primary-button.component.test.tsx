import { TEST_IDS } from '@clavis-via/shared'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { PrimaryButton } from './primary-button.component'

describe('PrimaryButton', () => {
  it('renders the label and calls onPress', async () => {
    const onPress = jest.fn()
    await render(<PrimaryButton label="Entrar" tone="navy" onPress={onPress} testID="button" />)
    expect(screen.getByText('Entrar')).toBeTruthy()
    expect(screen.getByRole('button')).toBeTruthy()
    await fireEvent.press(screen.getByTestId('button'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('uses the navy color and shadow for the navy tone', async () => {
    await render(<PrimaryButton label="Entrar" tone="navy" onPress={jest.fn()} testID="button" />)
    const button = screen.getByTestId('button')
    expect(button).toHaveStyle({ backgroundColor: '#264c94' })
    expect(button.props.style).toEqual(expect.objectContaining({ boxShadow: expect.any(Array) }))
  })

  it('uses the measured light color without shadow for the light tone', async () => {
    await render(
      <PrimaryButton label="Continuar" tone="light" onPress={jest.fn()} testID="button" />,
    )
    const button = screen.getByTestId('button')
    expect(button).toHaveStyle({ backgroundColor: '#6aa2f6' })
    expect(button.props.style.boxShadow).toBeUndefined()
  })

  it('ignores a second press while the first onPress promise is pending', async () => {
    const onPress = jest.fn(() => new Promise<void>(() => {})) // never settles
    await render(<PrimaryButton label="Entrar" tone="navy" onPress={onPress} testID="button" />)
    await fireEvent.press(screen.getByTestId('button'))
    await fireEvent.press(screen.getByTestId('button'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('accepts a new press after the onPress promise resolves', async () => {
    let resolvePress: () => void = () => {}
    const onPress = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePress = resolve
        }),
    )
    await render(<PrimaryButton label="Entrar" tone="navy" onPress={onPress} testID="button" />)
    await fireEvent.press(screen.getByTestId('button'))
    await act(async () => {
      resolvePress()
    })
    await fireEvent.press(screen.getByTestId('button'))
    expect(onPress).toHaveBeenCalledTimes(2)
  })

  it('releases the lock when onPress rejects, without an unhandled rejection', async () => {
    const unhandledRejection = jest.fn()
    process.on('unhandledRejection', unhandledRejection)
    const onPress = jest.fn(() => Promise.reject(new Error('boom')))
    await render(<PrimaryButton label="Entrar" tone="navy" onPress={onPress} testID="button" />)

    await fireEvent.press(screen.getByTestId('button'))
    // Unhandled rejections are reported once the microtask queue has drained.
    await new Promise<void>((resolve) => setImmediate(resolve))
    await fireEvent.press(screen.getByTestId('button'))
    await new Promise<void>((resolve) => setImmediate(resolve))

    process.off('unhandledRejection', unhandledRejection)
    expect(onPress).toHaveBeenCalledTimes(2)
    expect(unhandledRejection).not.toHaveBeenCalled()
  })

  it('releases the lock when onPress throws synchronously', async () => {
    const onPress = jest.fn(() => {
      throw new Error('boom')
    })
    await render(<PrimaryButton label="Entrar" tone="navy" onPress={onPress} testID="button" />)
    await expect(fireEvent.press(screen.getByTestId('button'))).rejects.toThrow('boom')
    await expect(fireEvent.press(screen.getByTestId('button'))).rejects.toThrow('boom')
    expect(onPress).toHaveBeenCalledTimes(2)
  })

  it('shows a spinner instead of the label and ignores presses while loading', async () => {
    const onPress = jest.fn()
    await render(
      <PrimaryButton label="Entrar" tone="navy" onPress={onPress} isLoading testID="button" />,
    )
    expect(screen.queryByText('Entrar')).toBeNull()
    expect(screen.getByTestId('button-spinner')).toBeTruthy()
    expect(screen.getByTestId('button').props.accessibilityState).toEqual(
      expect.objectContaining({ busy: true, disabled: true }),
    )
    await fireEvent.press(screen.getByTestId('button'))
    expect(onPress).not.toHaveBeenCalled()
  })

  it('is disabled, dimmed and ignores presses when isDisabled', async () => {
    const onPress = jest.fn()
    await render(
      <PrimaryButton label="Entrar" tone="navy" onPress={onPress} isDisabled testID="button" />,
    )
    const button = screen.getByTestId('button')
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ busy: false, disabled: true }),
    )
    expect(button).toHaveStyle({ opacity: 0.55 })
    await fireEvent.press(button)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('keeps the light tone at full opacity while disabled (it is already the muted look)', async () => {
    const onPress = jest.fn()
    await render(
      <PrimaryButton label="Continuar" tone="light" onPress={onPress} isDisabled testID="button" />,
    )
    const button = screen.getByTestId('button')
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }))
    expect(button).toHaveStyle({ opacity: 1 })
    await fireEvent.press(button)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('dims a disabled accent button like the navy one', async () => {
    await render(
      <PrimaryButton
        label="Plano concluído"
        tone="accent"
        onPress={jest.fn()}
        isDisabled
        testID="button"
      />,
    )
    expect(screen.getByTestId('button')).toHaveStyle({ opacity: 0.55 })
  })

  it('is slimmer than the regular size and fully rounded in the medium size', async () => {
    await render(
      <>
        <PrimaryButton label="Regular" tone="accent" onPress={jest.fn()} testID="regular" />
        <PrimaryButton
          label="Medium"
          tone="accent"
          size="medium"
          onPress={jest.fn()}
          testID="medium"
        />
      </>,
    )
    const regularStyle = StyleSheet.flatten(screen.getByTestId('regular').props.style)
    const mediumStyle = StyleSheet.flatten(screen.getByTestId('medium').props.style)
    expect(mediumStyle.height).toBeLessThan(regularStyle.height as number)
    expect(mediumStyle.borderRadius).toBe((mediumStyle.height as number) / 2)
  })

  it('is the slimmest and fully rounded in the slim size', async () => {
    await render(
      <>
        <PrimaryButton
          label="Medium"
          tone="accent"
          size="medium"
          onPress={jest.fn()}
          testID="medium"
        />
        <PrimaryButton label="Slim" tone="accent" size="slim" onPress={jest.fn()} testID="slim" />
      </>,
    )
    const mediumStyle = StyleSheet.flatten(screen.getByTestId('medium').props.style)
    const slimStyle = StyleSheet.flatten(screen.getByTestId('slim').props.style)
    expect(slimStyle.height).toBeLessThan(mediumStyle.height as number)
    expect(slimStyle.borderRadius).toBe((slimStyle.height as number) / 2)
  })

  it('stretches to the width of its parent when isFullWidth', async () => {
    await render(
      <PrimaryButton
        label="Continuar"
        tone="light"
        onPress={jest.fn()}
        isFullWidth
        testID="button"
      />,
    )
    const style = StyleSheet.flatten(screen.getByTestId('button').props.style)
    expect(style.alignSelf).toBe('stretch')
    expect(style.width).toBeUndefined()
  })

  it('is enabled and fully opaque by default', async () => {
    await render(<PrimaryButton label="Entrar" tone="navy" onPress={jest.fn()} testID="button" />)
    const button = screen.getByTestId('button')
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ busy: false, disabled: false }),
    )
    expect(button).toHaveStyle({ opacity: 1 })
  })

  it('shows the spinner without a test id when the button has none', async () => {
    await render(<PrimaryButton label="Entrar" tone="navy" onPress={jest.fn()} isLoading />)
    expect(screen.queryByText('Entrar')).toBeNull()
    expect(screen.getByRole('button').props.accessibilityState).toEqual(
      expect.objectContaining({ busy: true }),
    )
  })
  it('uses the accent color for the accent tone', async () => {
    await render(<PrimaryButton label="Ver" tone="accent" onPress={jest.fn()} testID="button" />)
    const button = screen.getByTestId('button')
    expect(button).toHaveStyle({ backgroundColor: '#6894f3' })
    expect(button.props.style.boxShadow).toBeUndefined()
  })

  it('is shorter, pill shaped and without an arrow in the compact size by default', async () => {
    await render(
      <>
        <PrimaryButton
          label="Ver"
          tone="accent"
          size="compact"
          onPress={jest.fn()}
          testID="compact"
        />
        <PrimaryButton label="Ver" tone="accent" onPress={jest.fn()} testID="regular" />
      </>,
    )
    const compactStyle = StyleSheet.flatten(screen.getByTestId('compact').props.style)
    const regularStyle = StyleSheet.flatten(screen.getByTestId('regular').props.style)
    expect(compactStyle.height).toBeLessThan(regularStyle.height as number)
    expect(compactStyle.borderRadius).toBe((compactStyle.height as number) / 2)
    expect(screen.queryByTestId(`compact${TEST_IDS.PRIMARY_BUTTON_ARROW_SUFFIX}`)).toBeNull()
  })

  it('draws an arrow after the label when hasArrow', async () => {
    await render(
      <PrimaryButton label="Ver" tone="accent" hasArrow onPress={jest.fn()} testID="button" />,
    )
    expect(screen.getByText('Ver')).toBeTruthy()
    expect(screen.getByTestId(`button${TEST_IDS.PRIMARY_BUTTON_ARROW_SUFFIX}`)).toBeTruthy()
  })
})
