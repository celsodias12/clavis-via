import { SIGN_UP_LAYOUT, TEST_IDS, useAuthenticationCopy, useSignUpForm } from '@clavis-via/shared'
import { useSignUp } from '@clerk/react'
import { useTranslation } from 'react-i18next'
import { AuthenticationFields } from '../../components/authentication-fields/authentication-fields.component'
import { AuthenticationLayout } from '../../components/authentication-layout/authentication-layout.component'
import { EmailField } from '../../components/email-field/email-field.component'
import { FormTextField } from '../../components/form-text-field/form-text-field.component'
import { CLERK_CAPTCHA_ELEMENT_ID } from '../../constants/authentication.constant'
import { ROUTES } from '../../constants/route.constant'
import { useStartNavigation } from '../../hooks/navigation/use-start-navigation'

export function SignUpScreen() {
  const { t } = useTranslation()
  const { signUp, errors } = useSignUp()
  const { control, submit, isSubmitting, formErrorKey } = useSignUpForm({
    attempt: signUp,
    errors,
    navigate: useStartNavigation(),
  })

  const copy = useAuthenticationCopy('signUp', formErrorKey)

  return (
    <AuthenticationLayout
      onSubmit={submit}
      isSubmitting={isSubmitting}
      {...copy}
      footerRoute={ROUTES.SIGN_IN}
    >
      <AuthenticationFields firstLabelBaseline={SIGN_UP_LAYOUT.FIRST_LABEL_BASELINE}>
        <FormTextField
          control={control}
          name="firstName"
          testID={TEST_IDS.SIGN_UP_FIRST_NAME}
          label={t('screen.signUp.firstNameLabel')}
          placeholder={t('screen.signUp.firstNamePlaceholder')}
          autoCapitalize="words"
          autoComplete="given-name"
        />
        <EmailField control={control} name="emailAddress" testID={TEST_IDS.SIGN_UP_EMAIL} />
        <FormTextField
          control={control}
          name="password"
          testID={TEST_IDS.SIGN_UP_PASSWORD}
          label={t('screen.authentication.passwordLabel')}
          placeholder={t('screen.signUp.passwordPlaceholder')}
          type="password"
          autoCapitalize="none"
          autoComplete="new-password"
        />
        <div id={CLERK_CAPTCHA_ELEMENT_ID} />
      </AuthenticationFields>
    </AuthenticationLayout>
  )
}
