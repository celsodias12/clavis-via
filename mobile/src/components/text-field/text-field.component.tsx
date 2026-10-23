import { TEST_IDS } from '@clavis-via/shared'
import type { ComponentProps } from 'react'
import { TextInput, type TextInputProps, useWindowDimensions, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import type { FieldMetrics } from '../../@types/component.type'
import { FIELD_METRICS } from '../../constants/component.constant'
import { scaleDesignValue } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'

type TextFieldProps = Readonly<
  {
    label: string
    value: string
    // Left out by a read-only field.
    onChangeText?: (text: string) => void
    errorMessage?: string
    testID?: string
    // Lets a form move the focus to the next field.
    inputRef?: NonNullable<ComponentProps<typeof TextInput>['ref']>
    // Letter spacing in design units, applied only while the placeholder is shown (typed text is untouched).
    placeholderLetterSpacing?: number
    // A tall box that wraps the text and starts it at the top, with the soft look of the reflection fields.
    isMultiline?: boolean
    // Measures of the box and its label; the single line field of the forms is the default.
    metrics?: FieldMetrics
  } & Pick<
    TextInputProps,
    | 'onBlur'
    | 'placeholder'
    | 'secureTextEntry'
    | 'keyboardType'
    | 'autoComplete'
    | 'textContentType'
    | 'returnKeyType'
    | 'onSubmitEditing'
    | 'maxLength'
    | 'autoCapitalize'
    | 'autoCorrect'
    | 'submitBehavior'
    | 'editable'
  >
>

export function TextField({
  label,
  value,
  onChangeText,
  errorMessage,
  testID,
  inputRef,
  placeholderLetterSpacing,
  isMultiline = false,
  metrics = FIELD_METRICS,
  ...inputProps
}: TextFieldProps) {
  const { width } = useWindowDimensions()

  return (
    <View style={styles.container(width, metrics)}>
      <AppText variant="bodyMedium" style={styles.label(width, metrics)}>
        {label}
      </AppText>
      <TextInput
        {...inputProps}
        multiline={isMultiline}
        ref={inputRef}
        testID={testID}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        maxFontSizeMultiplier={1}
        placeholderTextColor={styles.placeholder.color}
        style={[
          styles.input(width, metrics, isMultiline),
          value === '' && placeholderLetterSpacing
            ? { letterSpacing: scaleDesignValue(placeholderLetterSpacing, width) }
            : null,
        ]}
      />
      {errorMessage ? (
        <AppText
          variant="body"
          testID={testID ? `${testID}${TEST_IDS.TEXT_FIELD_ERROR_SUFFIX}` : undefined}
          accessibilityLiveRegion="polite"
          style={styles.error(width, metrics)}
        >
          {errorMessage}
        </AppText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: (width: number, metrics: FieldMetrics) => ({
    marginHorizontal: scaleDesignValue(metrics.HORIZONTAL_MARGIN, width),
  }),
  label: (width: number, metrics: FieldMetrics) => ({
    fontSize: scaleDesignValue(metrics.LABEL_SIZE, width),
    color: theme.colors.body,
    marginBottom: scaleDesignValue(metrics.LABEL_GAP, width),
  }),
  input: (width: number, metrics: FieldMetrics, isMultiline: boolean) => ({
    height: scaleDesignValue(metrics.BOX_HEIGHT, width),
    borderRadius: scaleDesignValue(metrics.BOX_RADIUS, width),
    borderWidth: scaleDesignValue(metrics.BOX_BORDER_WIDTH, width),
    borderColor: isMultiline ? theme.colors.reflectionFieldBorder : theme.colors.fieldBorder,
    backgroundColor: isMultiline
      ? theme.colors.reflectionFieldBackground
      : theme.colors.fieldBackground,
    paddingHorizontal: scaleDesignValue(metrics.TEXT_PADDING, width),
    paddingVertical: 0,
    // A tall box starts its text at the top, as far from the border as from the sides.
    ...(isMultiline && {
      paddingTop: scaleDesignValue(metrics.TEXT_PADDING, width),
      textAlignVertical: 'top',
    }),
    fontFamily: theme.fonts.body,
    fontSize: scaleDesignValue(metrics.TEXT_SIZE, width),
    color: theme.colors.title,
    includeFontPadding: false,
  }),
  placeholder: {
    color: theme.colors.placeholder,
  },
  error: (width: number, metrics: FieldMetrics) => ({
    fontSize: scaleDesignValue(metrics.ERROR_SIZE, width),
    color: theme.colors.error,
    marginTop: scaleDesignValue(metrics.ERROR_GAP, width),
  }),
}))
