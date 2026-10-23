import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { setViewportWidth } from '../../../tests/utils/viewport'
import { TextField } from './text-field.component'

const noop = () => {}

describe('TextField', () => {
  it('labels the input and reports what is typed', () => {
    const onChangeText = vi.fn()
    render(<TextField label="Nome" value="" onChangeText={onChangeText} testID="field" />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } })

    expect(onChangeText).toHaveBeenCalledWith('Ana')
    expect(screen.getByTestId('field')).toBe(screen.getByLabelText('Nome'))
  })

  it('passes the input attributes through', () => {
    const inputRef = createRef<HTMLInputElement>()
    render(
      <TextField
        label="Senha"
        value=""
        onChangeText={noop}
        inputRef={inputRef}
        type="password"
        placeholder="••••"
        autoComplete="current-password"
        autoCapitalize="none"
        maxLength={12}
      />,
    )

    const input = screen.getByLabelText('Senha')
    expect(inputRef.current).toBe(input)
    expect(input.getAttribute('type')).toBe('password')
    expect(input.getAttribute('placeholder')).toBe('••••')
    expect(input.getAttribute('autocomplete')).toBe('current-password')
    expect(input.getAttribute('autocapitalize')).toBe('none')
    expect(input.getAttribute('maxlength')).toBe('12')
  })

  it('shows the error under the field and marks the input invalid', () => {
    render(
      <TextField label="Email" value="" onChangeText={noop} testID="email" errorMessage="Ruim" />,
    )

    expect(screen.getByTestId(`email${TEST_IDS.TEXT_FIELD_ERROR_SUFFIX}`).textContent).toBe('Ruim')
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true')
  })

  it('describes the input by its error, so a screen reader reads the error with the field', () => {
    render(<TextField label="Email" value="" onChangeText={noop} errorMessage="Ruim" />)

    const describedBy = screen.getByLabelText('Email').getAttribute('aria-describedby')

    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe('Ruim')
  })

  it('has nothing to describe the input by while there is no error', () => {
    render(<TextField label="Email" value="" onChangeText={noop} />)

    expect(screen.getByLabelText('Email').getAttribute('aria-describedby')).toBeNull()
  })

  it('shows an error without a test ID and no error otherwise', () => {
    const { rerender } = render(
      <TextField label="Email" value="" onChangeText={noop} errorMessage="Ruim" />,
    )
    expect(screen.getByRole('alert').getAttribute('data-testid')).toBeNull()

    rerender(<TextField label="Email" value="" onChangeText={noop} />)

    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBeNull()
  })

  it('reports the blur', () => {
    const onBlur = vi.fn()
    render(<TextField label="Nome" value="" onChangeText={noop} onBlur={onBlur} />)

    fireEvent.blur(screen.getByLabelText('Nome'))

    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('spaces the placeholder only when asked', () => {
    setViewportWidth(390)
    const { rerender } = render(
      <TextField label="Senha" value="" onChangeText={noop} placeholderLetterSpacing={2} />,
    )
    expect(screen.getByLabelText('Senha').style.getPropertyValue('--placeholder-spacing')).not.toBe(
      '',
    )

    rerender(<TextField label="Senha" value="" onChangeText={noop} />)
    expect(screen.getByLabelText('Senha').style.getPropertyValue('--placeholder-spacing')).toBe('')
  })

  it('uses the design units on a phone and the web type scale on a wide screen', () => {
    setViewportWidth(390)
    const { unmount } = render(
      <TextField label="Nome" value="" onChangeText={noop} errorMessage="x" />,
    )
    expect(screen.getByLabelText('Nome').style.height).toContain('calc(')
    unmount()

    setViewportWidth(1280)
    render(<TextField label="Nome" value="" onChangeText={noop} errorMessage="x" />)
    expect(screen.getByLabelText('Nome').style.height).toBe('')
    expect(screen.getByLabelText('Nome').className).toContain('h-12')
  })
})
