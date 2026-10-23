import {
  type Control,
  type FieldPathByValue,
  type FieldValues,
  useController,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { translateFormError } from '../../utils/form-errors'

// The props of a text input bound to a form field that do not depend on the platform: the binding and the
// translated error of the field.
export function useFormTextFieldProps<TFormValues extends FieldValues>(
  control: Control<TFormValues, unknown, TFormValues>,
  name: FieldPathByValue<TFormValues, string>,
) {
  const { t } = useTranslation()
  const { field, fieldState } = useController({ control, name })

  return {
    inputRef: field.ref,
    value: field.value,
    onChangeText: field.onChange,
    onBlur: field.onBlur,
    errorMessage: translateFormError(t, fieldState.error?.message),
  }
}
