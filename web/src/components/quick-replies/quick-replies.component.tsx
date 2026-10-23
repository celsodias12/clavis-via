import { type QuickReply, TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { QUICK_REPLY_CLASSES } from '../../constants/conversation.constant'

type QuickRepliesProps = Readonly<{
  replies: readonly QuickReply[]
  onSelect: (reply: QuickReply) => void
  // True while a message is being sent: the pills ignore clicks.
  isDisabled: boolean
}>

// The suggested first messages, one pill each; clicking one sends its label with its intent.
export function QuickReplies({ replies, onSelect, isDisabled }: QuickRepliesProps) {
  const { t } = useTranslation()

  return replies.map((reply) => (
    <button
      key={reply.intent}
      type="button"
      data-testid={`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}${reply.intent}`}
      disabled={isDisabled}
      onClick={() => onSelect(reply)}
      className={QUICK_REPLY_CLASSES.PILL}
    >
      {t(reply.labelKey)}
    </button>
  ))
}
