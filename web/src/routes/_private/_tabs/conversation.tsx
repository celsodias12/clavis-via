import { createFileRoute } from '@tanstack/react-router'
import { ConversationScreen } from '@/screens/conversation/conversation.screen'

export const Route = createFileRoute('/_private/_tabs/conversation')({
  component: ConversationScreen,
})
