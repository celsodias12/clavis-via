import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it } from 'vite-plus/test'
import { createI18n } from '../../i18n/config'
import { useAuthenticationCopy } from './use-authentication-copy'

const i18n = createI18n('pt-BR')

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

describe('useAuthenticationCopy', () => {
  it.each(['signIn', 'signUp'] as const)('translates the texts of the %s screen', (screen) => {
    const { result } = renderHook(() => useAuthenticationCopy(screen, undefined), {
      wrapper: Wrapper,
    })

    expect(result.current).toEqual({
      title: i18n.t(`screen.${screen}.title`),
      subtitle: i18n.t(`screen.${screen}.subtitle`),
      submitLabel: i18n.t(`screen.${screen}.submit`),
      footerQuestion: i18n.t(`screen.${screen}.footerQuestion`),
      footerActionLabel: i18n.t(`screen.${screen}.footerAction`),
      formErrorMessage: undefined,
    })
  })

  it('translates the form error key', () => {
    const { result } = renderHook(
      () => useAuthenticationCopy('signIn', 'screen.authentication.errors.invalidCredentials'),
      { wrapper: Wrapper },
    )

    expect(result.current.formErrorMessage).toBe(
      i18n.t('screen.authentication.errors.invalidCredentials'),
    )
  })
})
