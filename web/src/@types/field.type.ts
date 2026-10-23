import type { Ref } from 'react'

export type TextFieldProps = Readonly<{
  label: string
  value: string
  onChangeText: (text: string) => void
  onBlur?: () => void
  errorMessage?: string
  testID?: string
  // Lets a form move the focus to the next field.
  inputRef?: Ref<HTMLInputElement>
  placeholder?: string
  // Letter spacing in design units, applied only while the placeholder is shown.
  placeholderLetterSpacing?: number
  type?: 'text' | 'email' | 'password'
  autoComplete?: string
  autoCapitalize?: 'none' | 'words'
  maxLength?: number
}>
