import type { Control, FieldPathByValue, FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useFormTextFieldProps } from './use-form-text-field-props'

// The props of the email input that do not depend on the platform: the form binding, the error and the texts.
// Shared by the sign in and sign up forms.
export function useEmailFieldProps<TFormValues extends FieldValues>(
  control: Control<TFormValues, unknown, TFormValues>,
  name: FieldPathByValue<TFormValues, string>,
) {
  const { t } = useTranslation()

  return {
    ...useFormTextFieldProps(control, name),
    label: t('screen.authentication.emailLabel'),
    placeholder: t('screen.authentication.emailPlaceholder'),
  }
}
