import {
  type ConversationFormInput,
  type ConversationFormValues,
  conversationFormSchema,
  DATE_FORMATS,
  getTrpcErrorCode,
  QUICK_REPLIES,
  TEST_IDS,
  TRPC_ERROR_CODES,
  toLocalDate,
  useConversationMessages,
  useConversationSender,
  useNow,
} from '@clavis-via/shared'
import { useUser } from '@clerk/expo'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import type { ScrollViewHandle } from '../../@types/component.type'
import { AppText } from '../../components/app-text/app-text.component'
import { ChatBubble } from '../../components/chat-bubble/chat-bubble.component'
import { ChatInput } from '../../components/chat-input/chat-input.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { QuickReplies } from '../../components/quick-replies/quick-replies.component'
import { Skeleton } from '../../components/skeleton/skeleton.component'
import { TypingIndicator } from '../../components/typing-indicator/typing-indicator.component'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import {
  CONVERSATION_BUBBLE_LAYOUT,
  CONVERSATION_FOOTER_LAYOUT,
  CONVERSATION_LAYOUT,
  CONVERSATION_PANEL_LAYOUT,
  CONVERSATION_QUICK_REPLY_LAYOUT,
  CONVERSATION_SKELETON_LAYOUT,
} from '../../constants/conversation-layout.constant'
import { DESIGN } from '../../constants/design.constant'
import { TAB_BAR_LAYOUT } from '../../constants/tab-bar.constant'
import { WELCOME_FONT_METRICS } from '../../constants/welcome.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'

// Conversa: the greeting of the assistant, the quick replies (until there is a stored message), the messages
// and the field to write. The replies are simulated for now. The tab bar is drawn over the screen, so the footer
// reserves its height; the list scrolls and follows the newest message.
export function ConversationScreen() {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const { user } = useUser()
  const showComingSoon = useComingSoon()
  const now = useNow()
  const messages = useConversationMessages()
  const { control, handleSubmit, getValues, reset, formState } = useForm<
    ConversationFormInput,
    unknown,
    ConversationFormValues
  >({
    resolver: zodResolver(conversationFormSchema),
    mode: 'onChange',
    defaultValues: { text: '' },
  })

  const scrollReference = useRef<ScrollViewHandle>(null)

  const localDate = toLocalDate(now)
  const firstName = user?.firstName?.trim()
  const storedMessages = messages.data ?? []

  const { send, submitPayload, submitText, selectQuickReply } = useConversationSender({
    localDate,
    getFieldText: () => getValues('text'),
    clearField: reset,
    getQuickReplyText: (reply) => t(reply.labelKey),
  })

  const handleSubmitText = handleSubmit((values) => submitText(values.text))

  const renderMessages = () => {
    if (messages.isPending) {
      return (
        <View testID={TEST_IDS.CONVERSATION_SKELETON} style={styles.messages}>
          <Skeleton
            width={CONVERSATION_SKELETON_LAYOUT.WIDTH}
            height={CONVERSATION_SKELETON_LAYOUT.HEIGHT}
            radius={CONVERSATION_BUBBLE_LAYOUT.RADIUS}
          />
        </View>
      )
    }
    if (messages.isError) {
      return (
        <ErrorState
          message={t('common.loadError')}
          onRetry={() => messages.refetch()}
          isRetrying={messages.isFetching}
        />
      )
    }
    return (
      <View style={styles.messages}>
        {storedMessages.map((message) => (
          <ChatBubble
            key={message.id}
            author={message.role}
            text={message.text}
            testID={`${TEST_IDS.CONVERSATION_MESSAGE_PREFIX}${message.role}`}
          />
        ))}
        {send.isPending ? <TypingIndicator /> : null}
      </View>
    )
  }

  const renderFeedback = () => {
    if (!send.isError) {
      return null
    }
    if (getTrpcErrorCode(send.error) === TRPC_ERROR_CODES.TOO_MANY_REQUESTS) {
      return (
        <View style={styles.feedback}>
          <AppText
            variant="body"
            testID={TEST_IDS.CONVERSATION_LIMIT}
            accessibilityLiveRegion="polite"
            style={styles.feedbackText}
          >
            {t('screen.conversation.dailyLimit')}
          </AppText>
        </View>
      )
    }
    return (
      <View style={styles.feedback}>
        <AppText
          variant="body"
          testID={TEST_IDS.CONVERSATION_SEND_ERROR}
          accessibilityLiveRegion="polite"
          style={styles.feedbackText}
        >
          {t('screen.conversation.sendError')}
        </AppText>
        <PrimaryButton
          testID={TEST_IDS.CONVERSATION_RETRY}
          label={t('common.tryAgain')}
          tone="light"
          size="slim"
          isLoading={send.isPending}
          onPress={() => submitPayload(send.variables)}
        />
      </View>
    )
  }

  // The quick replies are an invitation to start: they go away as soon as there is a message.
  const showQuickReplies = !messages.isPending && !messages.isError && storedMessages.length === 0

  const greetingTime = format(
    storedMessages.length > 0 ? new Date(storedMessages[0].createdAt) : now,
    DATE_FORMATS.CLOCK_TIME,
  )

  return (
    <KeyboardAvoidingView
      testID={TEST_IDS.CONVERSATION_SCREEN}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <AppText variant="title" accessibilityRole="header" style={styles.title}>
        {t('screen.conversation.title')}
      </AppText>
      <Pressable
        testID={TEST_IDS.CONVERSATION_HISTORY}
        accessibilityRole="button"
        onPress={showComingSoon}
        style={styles.history}
      >
        <AppText variant="bodyMedium" style={styles.historyLabel}>
          {t('screen.conversation.history')}
        </AppText>
      </Pressable>
      <ScrollView
        ref={scrollReference}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollReference.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.panel}>
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel={t('screen.conversation.assistantIcon')}
            style={styles.icon}
          >
            <Svg
              width={styles.iconSize.width}
              height={styles.iconSize.height}
              viewBox={`0 0 ${CONVERSATION_PANEL_LAYOUT.ICON_VIEW_BOX_SIZE} ${CONVERSATION_PANEL_LAYOUT.ICON_VIEW_BOX_SIZE}`}
            >
              <Circle cx={12} cy={12} r={12} fill={theme.colors.chatIcon} />
              <Circle
                cx={12}
                cy={CONVERSATION_PANEL_LAYOUT.ICON_HEAD_CENTER_Y}
                r={CONVERSATION_PANEL_LAYOUT.ICON_HEAD_RADIUS}
                fill="none"
                stroke={theme.colors.chatIconInk}
                strokeWidth={CONVERSATION_PANEL_LAYOUT.ICON_STROKE_WIDTH}
              />
              <Path
                d={CONVERSATION_PANEL_LAYOUT.ICON_BODY_PATH}
                fill="none"
                stroke={theme.colors.chatIconInk}
                strokeWidth={CONVERSATION_PANEL_LAYOUT.ICON_STROKE_WIDTH}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={styles.greeting}>
            <ChatBubble
              author="assistant"
              isFullWidth
              testID={TEST_IDS.CONVERSATION_GREETING}
              text={t(
                firstName
                  ? 'screen.conversation.greeting'
                  : 'screen.conversation.greetingAnonymous',
                { name: firstName },
              )}
            />
          </View>
          <AppText variant="body" testID={TEST_IDS.CONVERSATION_TIME} style={styles.time}>
            {greetingTime}
          </AppText>
        </View>
        {renderMessages()}
        {showQuickReplies ? (
          <View style={styles.quickReplies}>
            <QuickReplies
              replies={QUICK_REPLIES}
              onSelect={selectQuickReply}
              isDisabled={send.isPending}
            />
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        {renderFeedback()}
        <ChatInput
          control={control}
          onSubmit={handleSubmitText}
          canSend={formState.isValid}
          isSending={send.isPending}
        />
        <View style={styles.notice}>
          <AppText
            variant="body"
            testID={TEST_IDS.CONVERSATION_SIMULATED_NOTICE}
            style={styles.noticeText}
          >
            {t('screen.conversation.simulatedNotice')}
          </AppText>
          <AppText
            variant="body"
            testID={TEST_IDS.CONVERSATION_DISCLAIMER}
            style={styles.noticeText}
          >
            {t('screen.conversation.disclaimer')}
          </AppText>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const topOf = (designY: number) =>
    runtime.insets.top + (designY - DESIGN.STATUS_BAR_HEIGHT) * scale
  const historySize = CONVERSATION_LAYOUT.HISTORY_FONT_SIZE
  const historyLineTop =
    CONVERSATION_LAYOUT.HISTORY_BASELINE - WELCOME_FONT_METRICS.BODY_ASCENT * historySize
  const panel = CONVERSATION_PANEL_LAYOUT
  const bubble = CONVERSATION_BUBBLE_LAYOUT
  const footer = CONVERSATION_FOOTER_LAYOUT

  return {
    screen: { flex: 1, backgroundColor: theme.colors.homeBackground },
    title: {
      position: 'absolute',
      left: CONVERSATION_LAYOUT.TITLE_LEFT * scale,
      top: topOf(
        CONVERSATION_LAYOUT.TITLE_BASELINE -
          AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * CONVERSATION_LAYOUT.TITLE_FONT_SIZE,
      ),
      fontSize: CONVERSATION_LAYOUT.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    history: {
      position: 'absolute',
      right: CONVERSATION_LAYOUT.HISTORY_RIGHT * scale,
      top: topOf(CONVERSATION_LAYOUT.HISTORY_TOP),
      width: CONVERSATION_LAYOUT.HISTORY_WIDTH * scale,
      height: CONVERSATION_LAYOUT.HISTORY_HEIGHT * scale,
      borderRadius: CONVERSATION_LAYOUT.HISTORY_RADIUS * scale,
      backgroundColor: theme.colors.pillBackground,
    },
    historyLabel: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: (historyLineTop - CONVERSATION_LAYOUT.HISTORY_TOP) * scale,
      textAlign: 'center',
      fontSize: historySize * scale,
      color: theme.colors.homeBrandText,
    },
    // The list starts at the top of the greeting panel and ends where the footer begins.
    list: { flex: 1, marginTop: topOf(panel.TOP) },
    listContent: { paddingBottom: footer.LIST_BOTTOM_GAP * scale },
    panel: {
      marginLeft: panel.LEFT * scale,
      marginRight: panel.RIGHT * scale,
      paddingTop: panel.PADDING_TOP * scale,
      paddingBottom: panel.PADDING_BOTTOM * scale,
      borderRadius: panel.RADIUS * scale,
      backgroundColor: theme.colors.chatPanel,
      boxShadow: `0 ${panel.SHADOW_OFFSET_Y * scale}px ${panel.SHADOW_BLUR * scale}px ${theme.colors.planCardShadow}`,
    },
    icon: { marginLeft: panel.ICON_LEFT * scale },
    iconSize: { width: panel.ICON_SIZE * scale, height: panel.ICON_SIZE * scale },
    greeting: {
      marginTop: panel.ICON_BUBBLE_GAP * scale,
      marginLeft: panel.BUBBLE_LEFT * scale,
      marginRight: panel.BUBBLE_RIGHT * scale,
    },
    time: {
      marginTop: panel.TIME_GAP * scale,
      marginLeft: panel.TIME_LEFT * scale,
      fontSize: panel.TIME_FONT_SIZE * scale,
      color: theme.colors.chatTime,
    },
    messages: {
      marginTop: bubble.LIST_GAP * scale,
      marginLeft: bubble.LIST_LEFT * scale,
      marginRight: bubble.LIST_RIGHT * scale,
      gap: bubble.LIST_GAP * scale,
    },
    quickReplies: { marginTop: CONVERSATION_QUICK_REPLY_LAYOUT.TOP_GAP * scale },
    // The footer sits right above the tab bar, which is drawn over the bottom of the screen.
    footer: {
      paddingBottom:
        runtime.insets.bottom + (TAB_BAR_LAYOUT.BAR_HEIGHT + footer.NOTICE_BAR_GAP) * scale,
    },
    feedback: {
      alignItems: 'center',
      gap: footer.FEEDBACK_GAP * scale,
      marginBottom: footer.FEEDBACK_GAP * scale,
      marginHorizontal: footer.FEEDBACK_HORIZONTAL_MARGIN * scale,
    },
    feedbackText: {
      textAlign: 'center',
      fontSize: footer.FEEDBACK_FONT_SIZE * scale,
      color: theme.colors.error,
    },
    notice: { marginTop: footer.NOTICE_TOP_GAP * scale },
    noticeText: {
      textAlign: 'center',
      fontSize: footer.NOTICE_FONT_SIZE * scale,
      lineHeight: footer.NOTICE_LINE_HEIGHT * scale,
      color: theme.colors.chatNotice,
    },
  }
})
