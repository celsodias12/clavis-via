import { fireEvent, render, screen } from '@testing-library/react-native'
import { type ComponentRef, createRef } from 'react'
import { Dimensions, StyleSheet, type TextInput } from 'react-native'
import { FIELD_METRICS } from '../../constants/component.constant'
import { TextField } from './text-field.component'

describe('TextField', () => {
  it('renders the label, value and placeholder', async () => {
    await render(
      <TextField
        label="Email"
        value="a@b.c"
        onChangeText={jest.fn()}
        placeholder="voce@email.com"
        testID="field"
      />,
    )
    expect(screen.getByText('Email')).toBeTruthy()
    const input = screen.getByTestId('field')
    expect(input.props.value).toBe('a@b.c')
    expect(input.props.placeholder).toBe('voce@email.com')
    expect(input.props.accessibilityLabel).toBe('Email')
  })

  it('spaces the placeholder letters only while the field is empty', async () => {
    const { rerender } = await render(
      <TextField
        label="Senha"
        value=""
        onChangeText={jest.fn()}
        placeholderLetterSpacing={2}
        testID="field"
      />,
    )
    expect(
      StyleSheet.flatten(screen.getByTestId('field').props.style).letterSpacing,
    ).toBeGreaterThan(0)
    await rerender(
      <TextField
        label="Senha"
        value="abc"
        onChangeText={jest.fn()}
        placeholderLetterSpacing={2}
        testID="field"
      />,
    )
    expect(
      StyleSheet.flatten(screen.getByTestId('field').props.style).letterSpacing,
    ).toBeUndefined()
  })

  it('calls onChangeText when typing and onBlur when leaving', async () => {
    const onChangeText = jest.fn()
    const onBlur = jest.fn()
    await render(
      <TextField
        label="Email"
        value=""
        onChangeText={onChangeText}
        onBlur={onBlur}
        testID="field"
      />,
    )
    await fireEvent.changeText(screen.getByTestId('field'), 'novo')
    expect(onChangeText).toHaveBeenCalledWith('novo')
    await fireEvent(screen.getByTestId('field'), 'blur')
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('forwards the input behavior props', async () => {
    const onSubmitEditing = jest.fn()
    await render(
      <TextField
        label="Senha"
        value=""
        onChangeText={jest.fn()}
        secureTextEntry
        keyboardType="email-address"
        autoComplete="password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={onSubmitEditing}
        maxLength={20}
        testID="field"
      />,
    )
    const input = screen.getByTestId('field')
    expect(input.props.secureTextEntry).toBe(true)
    expect(input.props.keyboardType).toBe('email-address')
    expect(input.props.autoComplete).toBe('password')
    expect(input.props.maxLength).toBe(20)
    await fireEvent(input, 'submitEditing')
    expect(onSubmitEditing).toHaveBeenCalledTimes(1)
  })

  it('exposes the input through inputRef and forwards the capitalization and submit props', async () => {
    const inputRef = createRef<ComponentRef<typeof TextInput>>()
    await render(
      <TextField
        label="Email"
        value=""
        onChangeText={jest.fn()}
        inputRef={inputRef}
        autoCapitalize="none"
        autoCorrect={false}
        submitBehavior="submit"
        testID="field"
      />,
    )
    expect(inputRef.current).toBeTruthy()
    const input = screen.getByTestId('field')
    expect(input.props.autoCapitalize).toBe('none')
    expect(input.props.autoCorrect).toBe(false)
    expect(input.props.submitBehavior).toBe('submit')
  })

  it('shows the error below the box as a polite live region', async () => {
    await render(
      <TextField
        label="Email"
        value=""
        onChangeText={jest.fn()}
        errorMessage="Email inválido"
        testID="field"
      />,
    )
    const error = screen.getByTestId('field-error')
    expect(error.props.accessibilityLiveRegion).toBe('polite')
    expect(error).toHaveStyle({ color: '#b3261e' })
    expect(screen.getByText('Email inválido')).toBeTruthy()
  })

  it('shows no error when there is none', async () => {
    await render(<TextField label="Email" value="" onChangeText={jest.fn()} testID="field" />)
    expect(screen.queryByTestId('field-error')).toBeNull()
  })

  it('shows the error even when the field has no test id', async () => {
    await render(
      <TextField label="Email" value="" onChangeText={jest.fn()} errorMessage="Email inválido" />,
    )
    expect(screen.getByText('Email inválido')).toBeTruthy()
  })

  it('draws a tall multiline box that starts its text at the top, with the soft look', async () => {
    await render(
      <TextField label="Como foi?" value="" onChangeText={jest.fn()} isMultiline testID="field" />,
    )
    const input = screen.getByTestId('field')
    expect(input.props.multiline).toBe(true)
    const style = StyleSheet.flatten(input.props.style)
    expect(style.textAlignVertical).toBe('top')
    expect(style.paddingTop).toBeGreaterThan(0)
    expect(style.borderColor).toBe('#eeeef0')
    expect(style.backgroundColor).toBe('transparent')
  })

  it('keeps the single line look unless asked for a multiline box', async () => {
    await render(<TextField label="Email" value="" onChangeText={jest.fn()} testID="field" />)
    const input = screen.getByTestId('field')
    expect(input.props.multiline).toBe(false)
    const style = StyleSheet.flatten(input.props.style)
    expect(style.textAlignVertical).toBeUndefined()
    expect(style.borderColor).toBe('#e1e3ef')
  })

  it('uses the given metrics for the box and can be read only', async () => {
    await render(
      <TextField
        label="Como foi?"
        value="Respirei."
        editable={false}
        isMultiline
        metrics={{ ...FIELD_METRICS, BOX_HEIGHT: 100 }}
        testID="field"
      />,
    )
    const input = screen.getByTestId('field')
    expect(input.props.editable).toBe(false)
    const { height } = StyleSheet.flatten(input.props.style)
    expect(height).toBeCloseTo(100 * (Dimensions.get('window').width / 266))
  })
})
