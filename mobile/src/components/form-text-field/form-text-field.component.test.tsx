import type { TranslationKeys } from '@clavis-via/shared'
import { fireEvent, screen } from '@testing-library/react-native'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { renderWithProviders } from '../../../tests/utils/render'
import { FormTextField } from './form-text-field.component'

const FIELD_TEST_ID = 'name-field'

type FormValues = { name: string }

function Harness({
  errorKey,
  onValue,
}: Readonly<{ errorKey?: TranslationKeys; onValue?: (value: string) => void }>) {
  const { control, setError } = useForm<FormValues>({ defaultValues: { name: '' } })
  const name = useWatch({ control, name: 'name' })

  useEffect(() => {
    onValue?.(name)
  }, [name, onValue])

  useEffect(() => {
    if (errorKey) {
      // Same shape as a zod resolver error: the message is a translation key.
      setError('name', { message: errorKey })
    }
  }, [errorKey, setError])

  return <FormTextField control={control} name="name" testID={FIELD_TEST_ID} label="Nome" />
}

describe('FormTextField', () => {
  it('binds the input to the field of the form and passes the other props to the text field', async () => {
    let value = ''
    await renderWithProviders(<Harness onValue={(current) => (value = current)} />)

    await fireEvent.changeText(screen.getByTestId(FIELD_TEST_ID), 'Ana')

    expect(value).toBe('Ana')
    expect(screen.getByTestId(FIELD_TEST_ID).props.value).toBe('Ana')
    expect(screen.getByText('Nome')).toBeTruthy()
  })

  it('shows the error of the field translated from its key', async () => {
    await renderWithProviders(<Harness errorKey="screen.authentication.errors.firstNameRequired" />)

    expect(screen.getByText('Digite seu nome.')).toBeTruthy()
  })
})
