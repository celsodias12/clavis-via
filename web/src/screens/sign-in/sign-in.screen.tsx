import {
  FIELD_METRICS,
  SIGN_IN_LAYOUT,
  TEST_IDS,
  useAuthenticationCopy,
  useSignInForm,
} from '@clavis-via/shared'
import { useSignIn } from '@clerk/react'
import { useTranslation } from 'react-i18next'
import { AuthenticationFields } from '../../components/authentication-fields/authentication-fields.component'
import { AuthenticationLayout } from '../../components/authentication-layout/authentication-layout.component'
import { EmailField } from '../../components/email-field/email-field.component'
import { FormTextField } from '../../components/form-text-field/form-text-field.component'
import { ROUTES } from '../../constants/route.constant'
import { useStartNavigation } from '../../hooks/navigation/use-start-navigation'

export function SignInScreen() {
  const { t } = useTranslation()
  const { signIn, errors } = useSignIn()
  const { control, submit, isSubmitting, formErrorKey } = useSignInForm({
    attempt: signIn,
    errors,
    navigate: useStartNavigation(),
  })

  const copy = useAuthenticationCopy('signIn', formErrorKey)

  return (
    <AuthenticationLayout
      onSubmit={submit}
      isSubmitting={isSubmitting}
      {...copy}
      footerRoute={ROUTES.SIGN_UP}
    >
      <AuthenticationFields firstLabelBaseline={SIGN_IN_LAYOUT.FIRST_LABEL_BASELINE}>
        <EmailField control={control} name="emailAddress" testID={TEST_IDS.SIGN_IN_EMAIL} />
        <FormTextField
          control={control}
          name="password"
          testID={TEST_IDS.SIGN_IN_PASSWORD}
          label={t('screen.authentication.passwordLabel')}
          placeholder={t('screen.signIn.passwordPlaceholder')}
          placeholderLetterSpacing={FIELD_METRICS.PASSWORD_PLACEHOLDER_LETTER_SPACING}
          type="password"
          autoCapitalize="none"
          autoComplete="current-password"
        />
      </AuthenticationFields>
    </AuthenticationLayout>
  )
}
