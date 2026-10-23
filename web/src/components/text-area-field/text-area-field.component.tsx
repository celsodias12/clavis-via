import { TEST_IDS } from '@clavis-via/shared'
import { useId } from 'react'
import { cn } from '@/lib/utils'
import { FIELD_CLASSES, TEXT_AREA_CLASSES } from '../../constants/field.constant'
import { Textarea } from '../ui/textarea'

type TextAreaFieldProps = Readonly<{
  label: string
  value: string
  onChangeText?: (text: string) => void
  onBlur?: () => void
  errorMessage?: string
  testID?: string
  placeholder?: string
  maxLength?: number
  // Shows the text without letting the person change it.
  isReadOnly?: boolean
}>

// A labelled multi line field with its error below.
export function TextAreaField({
  label,
  value,
  onChangeText,
  onBlur,
  errorMessage,
  testID,
  placeholder,
  maxLength,
  isReadOnly = false,
}: TextAreaFieldProps) {
  const inputId = useId()
  const errorId = useId()

  return (
    <div className={FIELD_CLASSES.CONTAINER}>
      <label htmlFor={inputId} className={cn(FIELD_CLASSES.LABEL, FIELD_CLASSES.WIDE_LABEL)}>
        {label}
      </label>
      <Textarea
        id={inputId}
        data-testid={testID}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        readOnly={isReadOnly}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage ? errorId : undefined}
        onChange={(event) => onChangeText?.(event.target.value)}
        onBlur={onBlur}
        className={cn(
          FIELD_CLASSES.INPUT,
          TEXT_AREA_CLASSES.INPUT,
          isReadOnly && TEXT_AREA_CLASSES.READ_ONLY,
        )}
      />
      {errorMessage ? (
        <p
          id={errorId}
          data-testid={testID ? `${testID}${TEST_IDS.TEXT_FIELD_ERROR_SUFFIX}` : undefined}
          role="alert"
          className={cn(FIELD_CLASSES.ERROR, FIELD_CLASSES.WIDE_ERROR)}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
