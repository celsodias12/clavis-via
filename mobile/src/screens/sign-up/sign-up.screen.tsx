import { TEST_IDS, useAuthenticationCopy, useSignUpForm } from '@clavis-via/shared'
import { useSignUp } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { AuthenticationFields } from '../../components/authentication-fields/authentication-fields.component'
import { AuthenticationLayout } from '../../components/authentication-layout/authentication-layout.component'
import { EmailField } from '../../components/email-field/email-field.component'
import { FormTextField } from '../../components/form-text-field/form-text-field.component'
import { SIGN_UP_LAYOUT } from '../../constants/authentication-layout.constant'
import { ROUTES } from '../../constants/route.constant'

export function SignUpScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { signUp, errors } = useSignUp()
  const { control, setFocus, submit, isSubmitting, formErrorKey } = useSignUpForm({
    attempt: signUp,
    errors,
    navigate: () => router.replace(ROUTES.START),
    // The keyboard is dismissed on every failure so the error below the field is not hidden behind it.
    onFailure: () => Keyboard.dismiss(),
  })

  const copy = useAuthenticationCopy('signUp', formErrorKey)

  return (
    <AuthenticationLayout
      onBack={() => router.back()}
      onSubmit={submit}
      isSubmitting={isSubmitting}
      {...copy}
      onFooterAction={() => router.replace(ROUTES.SIGN_IN)}
    >
      <AuthenticationFields firstLabelBaseline={SIGN_UP_LAYOUT.FIRST_LABEL_BASELINE}>
        <FormTextField
          control={control}
          name="firstName"
          testID={TEST_IDS.SIGN_UP_FIRST_NAME}
          label={t('screen.signUp.firstNameLabel')}
          placeholder={t('screen.signUp.firstNamePlaceholder')}
          autoCapitalize="words"
          autoComplete="name-given"
          textContentType="givenName"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => setFocus('emailAddress')}
        />
        <EmailField
          control={control}
          name="emailAddress"
          testID={TEST_IDS.SIGN_UP_EMAIL}
          onSubmitEditing={() => setFocus('password')}
        />
        <FormTextField
          control={control}
          name="password"
          testID={TEST_IDS.SIGN_UP_PASSWORD}
          label={t('screen.authentication.passwordLabel')}
          placeholder={t('screen.signUp.passwordPlaceholder')}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => submit()}
        />
      </AuthenticationFields>
    </AuthenticationLayout>
  )
}
