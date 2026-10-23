import { TEST_IDS } from '@clavis-via/shared'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { TextAreaField } from './text-area-field.component'

describe('TextAreaField', () => {
  it('labels the box, shows the placeholder and reports what is typed and the blur', () => {
    const onChangeText = vi.fn()
    const onBlur = vi.fn()
    render(
      <TextAreaField
        label="Como foi para você?"
        value=""
        placeholder="Escreva aqui"
        maxLength={1000}
        testID="reflection"
        onChangeText={onChangeText}
        onBlur={onBlur}
      />,
    )

    const box = screen.getByLabelText('Como foi para você?') as HTMLTextAreaElement
    expect(box).toBe(screen.getByTestId('reflection'))
    expect(box.placeholder).toBe('Escreva aqui')
    expect(box.maxLength).toBe(1000)
    expect(box.readOnly).toBe(false)
    fireEvent.change(box, { target: { value: 'Respirei.' } })
    fireEvent.blur(box)
    expect(onChangeText).toHaveBeenCalledWith('Respirei.')
    expect(onBlur).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('shows the error under the box and marks it invalid', () => {
    render(
      <TextAreaField label="Reflexão" value="" testID="reflection" errorMessage="Muito longo" />,
    )

    expect(screen.getByRole('alert').textContent).toBe('Muito longo')
    expect(screen.getByTestId(`reflection${TEST_IDS.TEXT_FIELD_ERROR_SUFFIX}`)).toBeTruthy()
    expect(screen.getByTestId('reflection').getAttribute('aria-invalid')).toBe('true')
  })

  it('describes the box by its error', () => {
    render(<TextAreaField label="Reflexão" value="" errorMessage="Muito longo" />)

    const describedBy = screen.getByLabelText('Reflexão').getAttribute('aria-describedby')

    expect(document.getElementById(describedBy ?? '')?.textContent).toBe('Muito longo')
  })

  it('has nothing to describe the box by while there is no error', () => {
    render(<TextAreaField label="Reflexão" value="" />)

    expect(screen.getByLabelText('Reflexão').getAttribute('aria-describedby')).toBeNull()
  })

  it('shows a read only box that ignores typing', () => {
    render(<TextAreaField label="Reflexão" value="Respirei." isReadOnly />)

    const box = screen.getByLabelText('Reflexão') as HTMLTextAreaElement
    expect(box.readOnly).toBe(true)
    expect(box.value).toBe('Respirei.')
    fireEvent.change(box, { target: { value: 'Outra' } })
  })

  it('draws an error without a test id when the field has none', () => {
    render(<TextAreaField label="Reflexão" value="" errorMessage="Erro" />)

    expect(screen.getByRole('alert').getAttribute('data-testid')).toBeNull()
  })
})
