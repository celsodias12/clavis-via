import { type QuickReply, TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { CONVERSATION_QUICK_REPLY_LAYOUT } from '../../constants/conversation-layout.constant'
import { scaleDesignValue } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'

type QuickRepliesProps = Readonly<{
  replies: readonly QuickReply[]
  onSelect: (reply: QuickReply) => void
  // True while a message is being sent: the pills ignore presses.
  isDisabled: boolean
}>

// The suggested first messages, one pill each; pressing one sends its label with its intent.
export function QuickReplies({ replies, onSelect, isDisabled }: QuickRepliesProps) {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()

  return (
    <View style={styles.list(width)}>
      {replies.map((reply) => {
        const label = t(reply.labelKey)
        return (
          <Pressable
            key={reply.intent}
            testID={`${TEST_IDS.CONVERSATION_QUICK_REPLY_PREFIX}${reply.intent}`}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled: isDisabled }}
            disabled={isDisabled}
            onPress={() => onSelect(reply)}
            style={styles.pill(width)}
          >
            <AppText variant="body" style={styles.label(width)}>
              {label}
            </AppText>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  list: (width: number) => ({
    marginLeft: scaleDesignValue(CONVERSATION_QUICK_REPLY_LAYOUT.LEFT, width),
    gap: scaleDesignValue(CONVERSATION_QUICK_REPLY_LAYOUT.GAP, width),
    alignItems: 'flex-start',
  }),
  pill: (width: number) => ({
    justifyContent: 'center',
    height: scaleDesignValue(CONVERSATION_QUICK_REPLY_LAYOUT.HEIGHT, width),
    borderRadius: scaleDesignValue(CONVERSATION_QUICK_REPLY_LAYOUT.RADIUS, width),
    paddingLeft: scaleDesignValue(CONVERSATION_QUICK_REPLY_LAYOUT.PADDING_LEFT, width),
    paddingRight: scaleDesignValue(CONVERSATION_QUICK_REPLY_LAYOUT.PADDING_RIGHT, width),
    backgroundColor: theme.colors.pillBackground,
  }),
  label: (width: number) => ({
    fontSize: scaleDesignValue(CONVERSATION_QUICK_REPLY_LAYOUT.FONT_SIZE, width),
    color: theme.colors.chatQuickReplyText,
  }),
}))
