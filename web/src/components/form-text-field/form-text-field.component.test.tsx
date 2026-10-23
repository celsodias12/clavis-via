import { type SignInFormInput, signInFormSchema } from '@clavis-via/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useForm, useWatch } from 'react-hook-form'
import { describe, expect, it } from 'vite-plus/test'
import { FormTextField } from './form-text-field.component'

function Harness() {
  const { control, handleSubmit } = useForm<SignInFormInput>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { emailAddress: '', password: '' },
  })
  const password = useWatch({ control, name: 'password' })

  return (
    <>
      <FormTextField
        control={control}
        name="password"
        testID="password"
        label="Senha"
        type="password"
      />
      <output data-testid="value">{password}</output>
      <button type="button" onClick={handleSubmit(() => {})}>
        validar
      </button>
    </>
  )
}

describe('FormTextField', () => {
  it('binds the input to the field of the form and passes the other props to the text field', () => {
    render(<Harness />)

    const input = screen.getByLabelText('Senha')
    fireEvent.change(input, { target: { value: 'segredo' } })

    expect(screen.getByTestId('value').textContent).toBe('segredo')
    expect(input.getAttribute('type')).toBe('password')
    expect((input as HTMLInputElement).value).toBe('segredo')
  })

  it('shows the translated error of the field once the form is validated', async () => {
    render(<Harness />)

    fireEvent.click(screen.getByText('validar'))

    await waitFor(() => expect(screen.getByRole('alert').textContent).not.toBe(''))
    expect(screen.getByLabelText('Senha').getAttribute('aria-invalid')).toBe('true')
  })
})
