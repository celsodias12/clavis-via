import { useEmailFieldProps } from '@clavis-via/shared'
import type { Control, FieldPathByValue, FieldValues } from 'react-hook-form'
import { TextField } from '../text-field/text-field.component'

type EmailFieldProps<TFormValues extends FieldValues> = Readonly<{
  control: Control<TFormValues, unknown, TFormValues>
  name: FieldPathByValue<TFormValues, string>
  testID: string
  onSubmitEditing: () => void
}>

// Email input shared by the sign in and sign up forms.
export function EmailField<TFormValues extends FieldValues>({
  control,
  name,
  testID,
  onSubmitEditing,
}: EmailFieldProps<TFormValues>) {
  const fieldProps = useEmailFieldProps(control, name)

  return (
    <TextField
      {...fieldProps}
      testID={testID}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="email"
      textContentType="emailAddress"
      returnKeyType="next"
      submitBehavior="submit"
      onSubmitEditing={onSubmitEditing}
    />
  )
}
