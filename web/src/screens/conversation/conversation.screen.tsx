import {
  CONVERSATION_ICONS,
  type ConversationFormInput,
  type ConversationFormValues,
  colors,
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
import { useUser } from '@clerk/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ChatBubble } from '../../components/chat-bubble/chat-bubble.component'
import { ChatInput } from '../../components/chat-input/chat-input.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { LoadingSkeleton } from '../../components/loading-skeleton/loading-skeleton.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { QuickReplies } from '../../components/quick-replies/quick-replies.component'
import { TypingIndicator } from '../../components/typing-indicator/typing-indicator.component'
import { CONVERSATION_CLASSES } from '../../constants/conversation.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'

const ASSISTANT_ICON = CONVERSATION_ICONS.ASSISTANT
const ICON_CENTER = ASSISTANT_ICON.VIEW_BOX_SIZE / 2

// Conversa: the greeting of the assistant, the quick replies (until there is a stored message), the messages
// and the field to write. The replies are simulated for now. A chat page: the message column (720 px at most)
// scrolls on its own and follows the newest message, and the composer sits at the bottom of that column with
// the notices right under it.
export function ConversationScreen() {
  const { t } = useTranslation()
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

  const listReference = useRef<HTMLDivElement>(null)

  const firstName = user?.firstName?.trim()
  const storedMessages = messages.data ?? []

  const { send, submitPayload, submitText, selectQuickReply } = useConversationSender({
    localDate: toLocalDate(now),
    getFieldText: () => getValues('text'),
    clearField: reset,
    getQuickReplyText: (reply) => t(reply.labelKey),
  })

  const handleSubmitText = handleSubmit((values) => submitText(values.text))

  // Follows the newest message (or the typing indicator); the greeting alone stays at the top.
  const followedItems = storedMessages.length + (send.isPending ? 1 : 0)
  useEffect(() => {
    const list = listReference.current
    if (list !== null && followedItems > 0) {
      list.scrollTop = list.scrollHeight
    }
  }, [followedItems])

  const renderMessages = () => {
    if (messages.isPending) {
      return (
        <div data-testid={TEST_IDS.CONVERSATION_SKELETON}>
          <LoadingSkeleton className={CONVERSATION_CLASSES.SKELETON} />
        </div>
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
      // A log region: a new reply is announced politely, without moving the focus away from the field.
      <div
        role="log"
        aria-label={t('screen.conversation.title')}
        className={CONVERSATION_CLASSES.MESSAGES}
      >
        {storedMessages.map((message) => (
          <ChatBubble
            key={message.id}
            author={message.role}
            text={message.text}
            testID={`${TEST_IDS.CONVERSATION_MESSAGE_PREFIX}${message.role}`}
          />
        ))}
        {send.isPending ? <TypingIndicator /> : null}
      </div>
    )
  }

  const renderFeedback = () => {
    if (!send.isError) {
      return null
    }
    if (getTrpcErrorCode(send.error) === TRPC_ERROR_CODES.TOO_MANY_REQUESTS) {
      return (
        <div className={CONVERSATION_CLASSES.FEEDBACK}>
          <output
            data-testid={TEST_IDS.CONVERSATION_LIMIT}
            className={CONVERSATION_CLASSES.FEEDBACK_TEXT}
          >
            {t('screen.conversation.dailyLimit')}
          </output>
        </div>
      )
    }
    return (
      <div className={CONVERSATION_CLASSES.FEEDBACK}>
        <output
          data-testid={TEST_IDS.CONVERSATION_SEND_ERROR}
          className={CONVERSATION_CLASSES.FEEDBACK_TEXT}
        >
          {t('screen.conversation.sendError')}
        </output>
        <PrimaryButton
          testID={TEST_IDS.CONVERSATION_RETRY}
          label={t('common.tryAgain')}
          tone="light"
          size="slim"
          isLoading={send.isPending}
          onPress={() => submitPayload(send.variables)}
        />
      </div>
    )
  }

  // The quick replies are an invitation to start: they go away as soon as there is a message.
  const showQuickReplies = !messages.isPending && !messages.isError && storedMessages.length === 0

  const greetingTime = format(
    storedMessages.length > 0 ? new Date(storedMessages[0].createdAt) : now,
    DATE_FORMATS.CLOCK_TIME,
  )

  return (
    <div data-testid={TEST_IDS.CONVERSATION_SCREEN} className={CONVERSATION_CLASSES.SCREEN}>
      <header className={CONVERSATION_CLASSES.HEADER}>
        <h1 className={CONVERSATION_CLASSES.TITLE}>{t('screen.conversation.title')}</h1>
        <button
          type="button"
          data-testid={TEST_IDS.CONVERSATION_HISTORY}
          onClick={showComingSoon}
          className={CONVERSATION_CLASSES.HISTORY}
        >
          {t('screen.conversation.history')}
        </button>
      </header>
      <div ref={listReference} className={CONVERSATION_CLASSES.LIST}>
        <div className={CONVERSATION_CLASSES.LIST_CONTENT}>
          <div className={CONVERSATION_CLASSES.PANEL}>
            <div className={CONVERSATION_CLASSES.PANEL_ROW}>
              <svg
                role="img"
                aria-label={t('screen.conversation.assistantIcon')}
                className={CONVERSATION_CLASSES.ICON}
                viewBox={`0 0 ${ASSISTANT_ICON.VIEW_BOX_SIZE} ${ASSISTANT_ICON.VIEW_BOX_SIZE}`}
                focusable="false"
              >
                <circle cx={ICON_CENTER} cy={ICON_CENTER} r={ICON_CENTER} fill={colors.chatIcon} />
                <circle
                  cx={ICON_CENTER}
                  cy={ASSISTANT_ICON.HEAD_CENTER_Y}
                  r={ASSISTANT_ICON.HEAD_RADIUS}
                  fill="none"
                  stroke={colors.chatIconInk}
                  strokeWidth={ASSISTANT_ICON.STROKE_WIDTH}
                />
                <path
                  d={ASSISTANT_ICON.BODY_PATH}
                  fill="none"
                  stroke={colors.chatIconInk}
                  strokeWidth={ASSISTANT_ICON.STROKE_WIDTH}
                  strokeLinecap="round"
                />
              </svg>
              <div className={CONVERSATION_CLASSES.GREETING}>
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
              </div>
            </div>
            <p data-testid={TEST_IDS.CONVERSATION_TIME} className={CONVERSATION_CLASSES.TIME}>
              {greetingTime}
            </p>
          </div>
          {renderMessages()}
          {showQuickReplies ? (
            <div className={CONVERSATION_CLASSES.QUICK_REPLIES}>
              <QuickReplies
                replies={QUICK_REPLIES}
                onSelect={selectQuickReply}
                isDisabled={send.isPending}
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className={CONVERSATION_CLASSES.FOOTER}>
        {renderFeedback()}
        <ChatInput
          control={control}
          onSubmit={handleSubmitText}
          canSend={formState.isValid}
          isSending={send.isPending}
        />
        <div className={CONVERSATION_CLASSES.NOTICE}>
          <p
            data-testid={TEST_IDS.CONVERSATION_SIMULATED_NOTICE}
            className={CONVERSATION_CLASSES.NOTICE_TEXT}
          >
            {t('screen.conversation.simulatedNotice')}
          </p>
          <p
            data-testid={TEST_IDS.CONVERSATION_DISCLAIMER}
            className={CONVERSATION_CLASSES.NOTICE_TEXT}
          >
            {t('screen.conversation.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  )
}
