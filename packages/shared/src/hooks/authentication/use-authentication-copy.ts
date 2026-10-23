import { useTranslation } from 'react-i18next'
import type { TranslationKeys } from '../../i18n/types'

type AuthenticationScreen = 'signIn' | 'signUp'

// The texts the sign in and sign up screens hand to their layout, in the current language: title, subtitle,
// submit button, footer link and the form error (given as a translation key).
export function useAuthenticationCopy(
  screen: AuthenticationScreen,
  formErrorKey: TranslationKeys | undefined,
) {
  const { t } = useTranslation()

  return {
    title: t(`screen.${screen}.title`),
    subtitle: t(`screen.${screen}.subtitle`),
    submitLabel: t(`screen.${screen}.submit`),
    footerQuestion: t(`screen.${screen}.footerQuestion`),
    footerActionLabel: t(`screen.${screen}.footerAction`),
    formErrorMessage: formErrorKey ? t(formErrorKey) : undefined,
  }
}
