import { TEST_IDS, useAuthenticationCopy, useSignInForm } from '@clavis-via/shared'
import { useSignIn } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { AuthenticationFields } from '../../components/authentication-fields/authentication-fields.component'
import { AuthenticationLayout } from '../../components/authentication-layout/authentication-layout.component'
import { EmailField } from '../../components/email-field/email-field.component'
import { FormTextField } from '../../components/form-text-field/form-text-field.component'
import { SIGN_IN_LAYOUT } from '../../constants/authentication-layout.constant'
import { FIELD_METRICS } from '../../constants/component.constant'
import { ROUTES } from '../../constants/route.constant'

export function SignInScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { signIn, errors } = useSignIn()
  const { control, setFocus, submit, isSubmitting, formErrorKey } = useSignInForm({
    attempt: signIn,
    errors,
    navigate: () => router.replace(ROUTES.START),
    // The keyboard is dismissed on every failure so the error below the field is not hidden behind it.
    onFailure: () => Keyboard.dismiss(),
  })

  const copy = useAuthenticationCopy('signIn', formErrorKey)

  return (
    <AuthenticationLayout
      onBack={() => router.back()}
      onSubmit={submit}
      isSubmitting={isSubmitting}
      {...copy}
      onFooterAction={() => router.replace(ROUTES.SIGN_UP)}
    >
      <AuthenticationFields firstLabelBaseline={SIGN_IN_LAYOUT.FIRST_LABEL_BASELINE}>
        <EmailField
          control={control}
          name="emailAddress"
          testID={TEST_IDS.SIGN_IN_EMAIL}
          onSubmitEditing={() => setFocus('password')}
        />
        <FormTextField
          control={control}
          name="password"
          testID={TEST_IDS.SIGN_IN_PASSWORD}
          label={t('screen.authentication.passwordLabel')}
          placeholder={t('screen.signIn.passwordPlaceholder')}
          placeholderLetterSpacing={FIELD_METRICS.PASSWORD_PLACEHOLDER_LETTER_SPACING}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={() => submit()}
        />
      </AuthenticationFields>
    </AuthenticationLayout>
  )
}
