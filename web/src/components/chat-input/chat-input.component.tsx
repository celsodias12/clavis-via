import {
  CONVERSATION_ICONS,
  CONVERSATION_TEXT_MAXIMUM_LENGTH,
  type ConversationFormInput,
  type ConversationFormValues,
  runWithPressLock,
  TEST_IDS,
} from '@clavis-via/shared'
import { LoaderCircle } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { useRef } from 'react'
import { type Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ICON_METRICS } from '../../constants/component.constant'
import { CHAT_INPUT_CLASSES } from '../../constants/conversation.constant'
import { KEYBOARD_KEYS } from '../../constants/field.constant'
import { AppIcon } from '../app-icon/app-icon.component'
import { Textarea } from '../ui/textarea'

type ChatInputProps = Readonly<{
  control: Control<ConversationFormInput, unknown, ConversationFormValues>
  // Sends the text of the field; the send button stays locked until the returned promise settles.
  onSubmit: () => unknown
  // False while the field is empty (or blank): sending is disabled.
  canSend: boolean
  isSending: boolean
}>

const ARROW = CONVERSATION_ICONS.SEND_ARROW

// The message field and its round send button. Enter sends and Shift+Enter starts a new line. The form state
// lives in the screen, which also resends and clears it.
export function ChatInput({ control, onSubmit, canSend, isSending }: ChatInputProps) {
  const { t } = useTranslation()

  const isPendingReference = useRef(false)

  const isDisabled = !canSend || isSending

  // Synchronous lock: closes the window between the click and the pending state of the mutation.
  const send = () => runWithPressLock(isPendingReference, onSubmit)

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter while an input method is composing a character only confirms it.
    if (event.key !== KEYBOARD_KEYS.ENTER || event.shiftKey || event.nativeEvent.isComposing) {
      return
    }
    event.preventDefault()
    if (!isDisabled) {
      send()
    }
  }

  return (
    <div className={CHAT_INPUT_CLASSES.ROW}>
      <Controller
        control={control}
        name="text"
        render={({ field }) => (
          <Textarea
            data-testid={TEST_IDS.CONVERSATION_INPUT}
            aria-label={t('screen.conversation.inputLabel')}
            placeholder={t('screen.conversation.inputPlaceholder')}
            maxLength={CONVERSATION_TEXT_MAXIMUM_LENGTH}
            rows={1}
            value={field.value}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
            onKeyDown={handleKeyDown}
            className={CHAT_INPUT_CLASSES.FIELD}
          />
        )}
      />
      <button
        type="button"
        data-testid={TEST_IDS.CONVERSATION_SEND}
        aria-label={t('screen.conversation.send')}
        aria-busy={isSending}
        disabled={isDisabled}
        onClick={send}
        className={CHAT_INPUT_CLASSES.SEND}
      >
        {isSending ? (
          <LoaderCircle
            role="status"
            aria-label={t('common.loading')}
            data-testid={TEST_IDS.CONVERSATION_SEND_SPINNER}
            className={CHAT_INPUT_CLASSES.SPINNER}
          />
        ) : (
          <AppIcon
            size={CHAT_INPUT_CLASSES.ARROW_SIZE}
            paths={[
              {
                d: ARROW.PATH,
                stroke: ICON_METRICS.CURRENT_COLOR,
                strokeWidth: ARROW.STROKE_WIDTH,
              },
            ]}
          />
        )}
      </button>
    </div>
  )
}
