import { AUTHENTICATION_FONT_METRICS, FIELD_METRICS, TEST_IDS } from '@clavis-via/shared'
import { type CSSProperties, useId } from 'react'
import { cn } from '@/lib/utils'
import type { TextFieldProps } from '../../@types/field.type'
import {
  FIELD_CLASSES,
  PLACEHOLDER_SPACING_CLASS,
  PLACEHOLDER_SPACING_VARIABLE,
} from '../../constants/field.constant'
import { useIsWideScreen } from '../../hooks/layout/use-is-wide-screen'
import { designUnits, lineBox } from '../../utils/design'
import { Input } from '../ui/input'

// A labelled single line field with its error below. Sizes follow the app's field in design units.
export function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  errorMessage,
  testID,
  inputRef,
  placeholder,
  placeholderLetterSpacing,
  type = 'text',
  autoComplete,
  autoCapitalize,
  maxLength,
}: TextFieldProps) {
  const isWide = useIsWideScreen()

  const inputId = useId()
  const errorId = useId()

  // Wide screens use the web type scale (see FIELD_CLASSES); the app's design units are for the phone layout.
  const inputStyle = isWide
    ? undefined
    : ({
        height: designUnits(FIELD_METRICS.BOX_HEIGHT),
        borderRadius: designUnits(FIELD_METRICS.BOX_RADIUS),
        borderWidth: designUnits(FIELD_METRICS.BOX_BORDER_WIDTH),
        paddingInline: designUnits(FIELD_METRICS.TEXT_PADDING),
        paddingBlock: 0,
        fontSize: designUnits(FIELD_METRICS.TEXT_SIZE),
        ...(placeholderLetterSpacing && {
          [PLACEHOLDER_SPACING_VARIABLE]: designUnits(placeholderLetterSpacing),
        }),
      } as CSSProperties)

  return (
    <div
      className={FIELD_CLASSES.CONTAINER}
      style={isWide ? undefined : { marginInline: designUnits(FIELD_METRICS.HORIZONTAL_MARGIN) }}
    >
      <label
        htmlFor={inputId}
        className={cn(FIELD_CLASSES.LABEL, isWide && FIELD_CLASSES.WIDE_LABEL)}
        style={
          isWide
            ? undefined
            : {
                fontSize: designUnits(FIELD_METRICS.LABEL_SIZE),
                lineHeight: lineBox(
                  FIELD_METRICS.LABEL_SIZE,
                  AUTHENTICATION_FONT_METRICS.BODY_ASCENT,
                  AUTHENTICATION_FONT_METRICS.BODY_DESCENT,
                ),
                marginBottom: designUnits(FIELD_METRICS.LABEL_GAP),
              }
        }
      >
        {label}
      </label>
      <Input
        ref={inputRef}
        id={inputId}
        data-testid={testID}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        spellCheck={false}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage ? errorId : undefined}
        onChange={(event) => onChangeText(event.target.value)}
        onBlur={onBlur}
        style={inputStyle}
        className={cn(
          FIELD_CLASSES.INPUT,
          isWide && FIELD_CLASSES.WIDE_INPUT,
          placeholderLetterSpacing && PLACEHOLDER_SPACING_CLASS,
        )}
      />
      {errorMessage ? (
        <p
          id={errorId}
          data-testid={testID ? `${testID}${TEST_IDS.TEXT_FIELD_ERROR_SUFFIX}` : undefined}
          role="alert"
          className={cn(FIELD_CLASSES.ERROR, isWide && FIELD_CLASSES.WIDE_ERROR)}
          style={
            isWide
              ? undefined
              : {
                  fontSize: designUnits(FIELD_METRICS.ERROR_SIZE),
                  marginTop: designUnits(FIELD_METRICS.ERROR_GAP),
                }
          }
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
