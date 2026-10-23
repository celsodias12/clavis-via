import type { TranslationKeys } from '@clavis-via/shared'
import { fireEvent, screen } from '@testing-library/react-native'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { renderWithProviders } from '../../../tests/utils/render'
import { EmailField } from './email-field.component'

const EMAIL_TEST_ID = 'email-field'

type FormValues = { email: string }

function Harness({
  errorKey,
  onSubmitEditing,
  onValue,
}: Readonly<{
  errorKey?: TranslationKeys
  onSubmitEditing: () => void
  onValue?: (value: string) => void
}>) {
  const { control, setError } = useForm<FormValues>({ defaultValues: { email: '' } })
  const email = useWatch({ control, name: 'email' })

  useEffect(() => {
    onValue?.(email)
  }, [email, onValue])

  useEffect(() => {
    if (errorKey) {
      // Same shape as a zod resolver error: the message is a translation key.
      setError('email', { message: errorKey })
    }
  }, [errorKey, setError])

  return (
    <EmailField
      control={control}
      name="email"
      testID={EMAIL_TEST_ID}
      onSubmitEditing={onSubmitEditing}
    />
  )
}

describe('EmailField', () => {
  it('renders the translated label and placeholder', async () => {
    await renderWithProviders(<Harness onSubmitEditing={jest.fn()} />)

    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByPlaceholderText('voce@email.com')).toBeTruthy()
  })

  it('asks the keyboard for an email address without capitalizing or correcting it', async () => {
    await renderWithProviders(<Harness onSubmitEditing={jest.fn()} />)

    expect(screen.getByTestId(EMAIL_TEST_ID).props).toEqual(
      expect.objectContaining({
        keyboardType: 'email-address',
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: 'email',
        textContentType: 'emailAddress',
        returnKeyType: 'next',
        submitBehavior: 'submit',
      }),
    )
  })

  it('writes what the user types into the form', async () => {
    let value = ''
    await renderWithProviders(
      <Harness onSubmitEditing={jest.fn()} onValue={(current) => (value = current)} />,
    )

    await fireEvent.changeText(screen.getByTestId(EMAIL_TEST_ID), 'ana@email.com')

    expect(value).toBe('ana@email.com')
    expect(screen.getByTestId(EMAIL_TEST_ID).props.value).toBe('ana@email.com')
  })

  it('shows the field error translated from its key', async () => {
    await renderWithProviders(
      <Harness errorKey="screen.authentication.errors.generic" onSubmitEditing={jest.fn()} />,
    )

    expect(screen.getByText('Algo deu errado. Tente de novo.')).toBeTruthy()
  })

  it('shows no error text while the field is valid', async () => {
    await renderWithProviders(<Harness onSubmitEditing={jest.fn()} />)

    expect(screen.queryByTestId(`${EMAIL_TEST_ID}-error`)).toBeNull()
  })

  it('moves on when the keyboard submits', async () => {
    const onSubmitEditing = jest.fn()
    await renderWithProviders(<Harness onSubmitEditing={onSubmitEditing} />)

    await fireEvent(screen.getByTestId(EMAIL_TEST_ID), 'submitEditing')

    expect(onSubmitEditing).toHaveBeenCalledTimes(1)
  })
})
