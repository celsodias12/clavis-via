import { CONVERSATION_ROLES, type ConversationRole } from '@clavis-via/shared'
import { useWindowDimensions } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { CONVERSATION_BUBBLE_LAYOUT } from '../../constants/conversation-layout.constant'
import { scaleDesignValue } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'

type ChatBubbleProps = Readonly<{
  author: ConversationRole
  text: string
  // Stretches the bubble to the width its parent gives it (the greeting) instead of hugging the text.
  isFullWidth?: boolean
  testID?: string
}>

// One message: the assistant's sit on the left in the soft bubble of the design, the person's on the right.
export function ChatBubble({ author, text, isFullWidth = false, testID }: ChatBubbleProps) {
  const { width } = useWindowDimensions()

  const isUser = author === CONVERSATION_ROLES.USER

  return (
    <AppText
      variant="body"
      testID={testID}
      selectable
      style={[styles.bubble(width, isUser, isFullWidth), isUser ? styles.user : styles.assistant]}
    >
      {text}
    </AppText>
  )
}

function alignmentOf(isUser: boolean, isFullWidth: boolean) {
  if (isFullWidth) {
    return 'stretch'
  }
  return isUser ? 'flex-end' : 'flex-start'
}

const styles = StyleSheet.create((theme) => ({
  bubble: (width: number, isUser: boolean, isFullWidth: boolean) => ({
    alignSelf: alignmentOf(isUser, isFullWidth),
    maxWidth: isFullWidth ? '100%' : CONVERSATION_BUBBLE_LAYOUT.MAXIMUM_WIDTH_PERCENT,
    overflow: 'hidden',
    borderRadius: scaleDesignValue(CONVERSATION_BUBBLE_LAYOUT.RADIUS, width),
    paddingHorizontal: scaleDesignValue(CONVERSATION_BUBBLE_LAYOUT.PADDING_HORIZONTAL, width),
    paddingVertical: scaleDesignValue(CONVERSATION_BUBBLE_LAYOUT.PADDING_VERTICAL, width),
    fontSize: scaleDesignValue(CONVERSATION_BUBBLE_LAYOUT.FONT_SIZE, width),
    lineHeight: scaleDesignValue(CONVERSATION_BUBBLE_LAYOUT.LINE_HEIGHT, width),
  }),
  assistant: {
    backgroundColor: theme.colors.chatBubbleAssistant,
    color: theme.colors.chatBubbleAssistantText,
  },
  user: {
    backgroundColor: theme.colors.primaryAccent,
    color: theme.colors.white,
  },
}))
