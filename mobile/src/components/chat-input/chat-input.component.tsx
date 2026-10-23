import {
  CONVERSATION_TEXT_MAXIMUM_LENGTH,
  type ConversationFormInput,
  type ConversationFormValues,
  TEST_IDS,
} from '@clavis-via/shared'
import { useRef } from 'react'
import { type Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, TextInput, useWindowDimensions, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { StyleSheet } from 'react-native-unistyles'
import { BUTTON_METRICS } from '../../constants/component.constant'
import { CONVERSATION_FOOTER_LAYOUT } from '../../constants/conversation-layout.constant'
import { scaleDesignValue } from '../../utils/design'

type ChatInputProps = Readonly<{
  control: Control<ConversationFormInput, unknown, ConversationFormValues>
  // Sends the text of the field; the button stays locked until the returned promise settles.
  onSubmit: () => unknown
  // False while the field is empty (or blank): the send button is disabled.
  canSend: boolean
  isSending: boolean
}>

// The message field and its round send button. The form state lives in the screen, which also resends and clears it.
export function ChatInput({ control, onSubmit, canSend, isSending }: ChatInputProps) {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()

  const isPendingReference = useRef(false)

  const isDisabled = !canSend || isSending

  // Synchronous lock: closes the window between the tap and the pending state of the mutation.
  const handlePress = () => {
    if (isPendingReference.current) {
      return
    }
    isPendingReference.current = true
    Promise.resolve(onSubmit())
      .finally(() => {
        isPendingReference.current = false
      })
      .catch(() => {})
  }

  return (
    <View style={styles.row(width)}>
      <Controller
        control={control}
        name="text"
        render={({ field }) => (
          <TextInput
            testID={TEST_IDS.CONVERSATION_INPUT}
            accessibilityLabel={t('screen.conversation.inputLabel')}
            placeholder={t('screen.conversation.inputPlaceholder')}
            placeholderTextColor={styles.placeholder.color}
            maxLength={CONVERSATION_TEXT_MAXIMUM_LENGTH}
            maxFontSizeMultiplier={1}
            multiline
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            style={styles.input(width)}
          />
        )}
      />
      <Pressable
        testID={TEST_IDS.CONVERSATION_SEND}
        accessibilityRole="button"
        accessibilityLabel={t('screen.conversation.send')}
        accessibilityState={{ busy: isSending, disabled: isDisabled }}
        disabled={isDisabled}
        onPress={handlePress}
        style={styles.send(width, isDisabled)}
      >
        {isSending ? (
          <ActivityIndicator
            testID={TEST_IDS.CONVERSATION_SEND_SPINNER}
            color={styles.spinner.color}
          />
        ) : (
          <Svg
            width={scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.SEND_ARROW_SIZE, width)}
            height={scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.SEND_ARROW_SIZE, width)}
            viewBox={`0 0 ${CONVERSATION_FOOTER_LAYOUT.SEND_ARROW_VIEW_BOX_SIZE} ${CONVERSATION_FOOTER_LAYOUT.SEND_ARROW_VIEW_BOX_SIZE}`}
          >
            <Path
              d={CONVERSATION_FOOTER_LAYOUT.SEND_ARROW_PATH}
              fill="none"
              stroke={styles.spinner.color}
              strokeWidth={CONVERSATION_FOOTER_LAYOUT.SEND_ARROW_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: (width: number) => ({
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.INPUT_LEFT, width),
    marginRight: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.SEND_RIGHT, width),
    gap: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.SEND_GAP, width),
  }),
  input: (width: number) => ({
    flex: 1,
    minHeight: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.INPUT_HEIGHT, width),
    maxHeight: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.INPUT_HEIGHT * 3, width),
    borderRadius: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.INPUT_RADIUS, width),
    borderWidth: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.INPUT_BORDER_WIDTH, width),
    borderColor: theme.colors.chatInputBorder,
    backgroundColor: theme.colors.chatInputBackground,
    paddingHorizontal: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.INPUT_TEXT_PADDING, width),
    paddingVertical: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.INPUT_TEXT_PADDING / 2, width),
    fontFamily: theme.fonts.body,
    fontSize: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.INPUT_FONT_SIZE, width),
    color: theme.colors.title,
    includeFontPadding: false,
    textAlignVertical: 'center',
  }),
  placeholder: { color: theme.colors.chatInputPlaceholder },
  send: (width: number, isDisabled: boolean) => ({
    alignItems: 'center',
    justifyContent: 'center',
    width: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.SEND_SIZE, width),
    height: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.SEND_SIZE, width),
    borderRadius: scaleDesignValue(CONVERSATION_FOOTER_LAYOUT.SEND_SIZE / 2, width),
    backgroundColor: theme.colors.chatSendBackground,
    opacity: isDisabled ? BUTTON_METRICS.DISABLED_OPACITY : BUTTON_METRICS.ENABLED_OPACITY,
  }),
  spinner: { color: theme.colors.white },
}))
