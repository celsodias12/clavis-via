import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it } from 'vite-plus/test'
import { createI18n } from '../../i18n/config'
import { useEmailFieldProps } from './use-email-field-props'

type EmailForm = { emailAddress: string }

function renderEmailField() {
  const i18n = createI18n('pt-BR')

  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  }

  return {
    i18n,
    ...renderHook(
      () => {
        const form = useForm<EmailForm>({ defaultValues: { emailAddress: '' } })
        return { form, props: useEmailFieldProps(form.control, 'emailAddress') }
      },
      { wrapper: Wrapper },
    ),
  }
}

describe('useEmailFieldProps', () => {
  it('binds the field and carries the translated texts', async () => {
    const { result, i18n } = renderEmailField()

    expect(result.current.props).toMatchObject({
      label: i18n.t('screen.authentication.emailLabel'),
      placeholder: i18n.t('screen.authentication.emailPlaceholder'),
      value: '',
      errorMessage: undefined,
    })

    await act(async () => result.current.props.onChangeText('ana@example.com'))
    expect(result.current.props.value).toBe('ana@example.com')
  })

  it('translates the error of the field', async () => {
    const { result, i18n } = renderEmailField()

    await act(async () => {
      result.current.form.setError('emailAddress', {
        message: 'screen.authentication.errors.emailInUse',
      })
    })

    expect(result.current.props.errorMessage).toBe(
      i18n.t('screen.authentication.errors.emailInUse'),
    )
  })
})
