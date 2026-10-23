import { useFormTextFieldProps } from '@clavis-via/shared'
import type { ComponentProps } from 'react'
import type { Control, FieldPathByValue, FieldValues } from 'react-hook-form'
import { TextField } from '../text-field/text-field.component'

type FormTextFieldProps<TFormValues extends FieldValues> = Readonly<
  {
    control: Control<TFormValues, unknown, TFormValues>
    name: FieldPathByValue<TFormValues, string>
  } & Omit<
    ComponentProps<typeof TextField>,
    'value' | 'onChangeText' | 'onBlur' | 'inputRef' | 'errorMessage'
  >
>

// A text input bound to a field of a react-hook-form form; the other props go straight to the text field.
export function FormTextField<TFormValues extends FieldValues>({
  control,
  name,
  ...textFieldProps
}: FormTextFieldProps<TFormValues>) {
  return <TextField {...useFormTextFieldProps(control, name)} {...textFieldProps} />
}
