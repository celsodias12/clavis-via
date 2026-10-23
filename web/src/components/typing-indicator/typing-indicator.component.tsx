import { CONVERSATION_ROLES, TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { ChatBubble } from '../chat-bubble/chat-bubble.component'

// The assistant "typing" while the reply is on its way.
export function TypingIndicator() {
  const { t } = useTranslation()

  return (
    <ChatBubble
      author={CONVERSATION_ROLES.ASSISTANT}
      text={t('screen.conversation.typing')}
      testID={TEST_IDS.CONVERSATION_TYPING}
    />
  )
}
