import { type SignInFormInput, signInFormSchema, TEST_IDS } from '@clavis-via/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vite-plus/test'
import { EmailField } from './email-field.component'

function Harness() {
  const { control, handleSubmit } = useForm<SignInFormInput>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { emailAddress: '', password: 'x' },
  })

  return (
    <>
      <EmailField control={control} name="emailAddress" testID="email" />
      <button type="button" onClick={handleSubmit(() => {})}>
        validar
      </button>
    </>
  )
}

describe('EmailField', () => {
  it('renders the email input with its copy and keyboard hints', () => {
    render(<Harness />)

    const input = screen.getByLabelText('Email')
    expect(input.getAttribute('placeholder')).toBe('voce@email.com')
    expect(input.getAttribute('type')).toBe('email')
    expect(input.getAttribute('autocapitalize')).toBe('none')
    expect(input.getAttribute('autocomplete')).toBe('email')
  })

  it('shows the translated validation error', async () => {
    render(<Harness />)

    fireEvent.click(screen.getByText('validar'))

    await waitFor(() =>
      expect(screen.getByTestId(`email${TEST_IDS.TEXT_FIELD_ERROR_SUFFIX}`).textContent).toBe(
        'Digite um email válido.',
      ),
    )
  })
})
