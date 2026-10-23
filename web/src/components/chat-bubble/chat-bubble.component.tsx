import { CONVERSATION_ROLES, type ConversationRole } from '@clavis-via/shared'
import { cn } from '@/lib/utils'
import { CHAT_BUBBLE_CLASSES } from '../../constants/conversation.constant'

type ChatBubbleProps = Readonly<{
  author: ConversationRole
  text: string
  // Stretches the bubble to the width its parent gives it (the greeting) instead of hugging the text.
  isFullWidth?: boolean
  testID?: string
}>

// One message: the assistant's sit on the left in the soft bubble of the design, the person's on the right.
export function ChatBubble({ author, text, isFullWidth = false, testID }: ChatBubbleProps) {
  const isUser = author === CONVERSATION_ROLES.USER

  return (
    <p
      data-testid={testID}
      className={cn(
        CHAT_BUBBLE_CLASSES.BASE,
        isUser ? CHAT_BUBBLE_CLASSES.USER : CHAT_BUBBLE_CLASSES.ASSISTANT,
        isFullWidth && CHAT_BUBBLE_CLASSES.FULL_WIDTH,
      )}
    >
      {text}
    </p>
  )
}
