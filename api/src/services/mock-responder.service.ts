import type {
  ConversationContext,
  ConversationResponder,
  QuickReplyIntent,
} from '../@types/conversation.type'
import {
  CRISIS_DEATH_PATTERN,
  CRISIS_TERMS,
  DEFAULT_REPLIES,
  KEYWORD_PATTERNS,
  MOCK_REPLIES,
  QUICK_REPLY_INTENTS,
  REPLY_CONTENT_NAMES,
  REPLY_DURATION_UNITS,
  REPLY_PLACEHOLDERS,
} from '../constants/conversation.constant'
import { conversationCopy } from '../i18n/content'
import type { ContentLanguage } from '../i18n/language'
import { fillTemplate, normalizeText } from '../utils/text'

type ReplyCopy = ReturnType<typeof conversationCopy>

function formatDuration(durationSeconds: number, copy: ReplyCopy): string {
  const minutes = Math.floor(durationSeconds / REPLY_DURATION_UNITS.SECONDS_PER_MINUTE)
  const seconds = durationSeconds % REPLY_DURATION_UNITS.SECONDS_PER_MINUTE
  if (seconds > 0) {
    return fillTemplate(
      copy?.duration.minutesAndSeconds ?? REPLY_DURATION_UNITS.MINUTES_AND_SECONDS,
      {
        minutes,
        seconds,
      },
    )
  }
  return fillTemplate(
    minutes === 1
      ? (copy?.duration.oneMinute ?? REPLY_DURATION_UNITS.MINUTE_ONE)
      : (copy?.duration.minutes ?? REPLY_DURATION_UNITS.MINUTE_OTHER),
    { minutes },
  )
}

function verseValues(context: ConversationContext) {
  return {
    [REPLY_PLACEHOLDERS.VERSE_TEXT]: context.verse.text,
    [REPLY_PLACEHOLDERS.VERSE_REFERENCE]: context.verse.reference,
  }
}

function replyForDirection(context: ConversationContext, copy: ReplyCopy): string {
  if (context.currentPlan === null) {
    return fillTemplate(copy?.replies.directionWithoutPlan ?? MOCK_REPLIES.DIRECTION_WITHOUT_PLAN, {
      [REPLY_PLACEHOLDERS.PLAN_TITLE]:
        copy?.names.directionPlan ?? REPLY_CONTENT_NAMES.DIRECTION_PLAN,
    })
  }
  return fillTemplate(copy?.replies.directionWithPlan ?? MOCK_REPLIES.DIRECTION_WITH_PLAN, {
    [REPLY_PLACEHOLDERS.PLAN_TITLE]: context.currentPlan.title,
    [REPLY_PLACEHOLDERS.NEXT_DAY]: context.currentPlan.nextDayNumber,
  })
}

function replyForPractice(context: ConversationContext, copy: ReplyCopy): string {
  if (context.todayCheckIn === null) {
    return copy?.replies.practiceWithoutCheckIn ?? MOCK_REPLIES.PRACTICE_WITHOUT_CHECK_IN
  }
  const { practice } = context.todayCheckIn.dailyKey
  return fillTemplate(copy?.replies.practiceWithCheckIn ?? MOCK_REPLIES.PRACTICE_WITH_CHECK_IN, {
    [REPLY_PLACEHOLDERS.PRACTICE_TITLE]: practice.title,
    [REPLY_PLACEHOLDERS.PRACTICE_DURATION]: formatDuration(practice.durationSeconds, copy),
  })
}

function replyForIntent(
  intent: QuickReplyIntent,
  context: ConversationContext,
  copy: ReplyCopy,
): string {
  switch (intent) {
    case QUICK_REPLY_INTENTS.TALK:
      return copy?.replies.talk ?? MOCK_REPLIES.TALK
    case QUICK_REPLY_INTENTS.DIRECTION:
      return replyForDirection(context, copy)
    case QUICK_REPLY_INTENTS.PRACTICE:
      return replyForPractice(context, copy)
    case QUICK_REPLY_INTENTS.PRAYER:
      return fillTemplate(copy?.replies.prayer ?? MOCK_REPLIES.PRAYER, verseValues(context))
  }
}

function replyForFreeText(
  normalizedText: string,
  context: ConversationContext,
  copy: ReplyCopy,
): string {
  if (KEYWORD_PATTERNS.BREATHING.test(normalizedText)) {
    return `${copy?.replies.breathingIntro ?? MOCK_REPLIES.BREATHING_INTRO} ${replyForPractice(context, copy)}`
  }
  if (KEYWORD_PATTERNS.DISCOURAGEMENT.test(normalizedText)) {
    return fillTemplate(copy?.replies.discouragement ?? MOCK_REPLIES.DISCOURAGEMENT, {
      [REPLY_PLACEHOLDERS.PLAN_TITLE]:
        copy?.names.discouragementPlan ?? REPLY_CONTENT_NAMES.DISCOURAGEMENT_PLAN,
    })
  }
  if (KEYWORD_PATTERNS.FAITH.test(normalizedText)) {
    return fillTemplate(copy?.replies.faith ?? MOCK_REPLIES.FAITH, verseValues(context))
  }
  const defaults = copy?.defaults ?? DEFAULT_REPLIES
  return defaults[context.assistantMessageCount % defaults.length]
}

// Rule-based stand-in for the AI: no external call. The crisis rule runs first and wins over any intent.
// The wait makes the "typing" state show as it would with a real model.
export function createMockResponder({
  delayMilliseconds,
  language = 'pt-BR',
}: {
  delayMilliseconds: number
  language?: ContentLanguage
}): ConversationResponder {
  const copy = conversationCopy(language)
  return {
    async respond({ text, intent, context }) {
      await scheduler.wait(delayMilliseconds)
      const normalizedText = normalizeText(text)
      if (
        CRISIS_DEATH_PATTERN.test(normalizedText) ||
        CRISIS_TERMS.some((term) => normalizedText.includes(term))
      ) {
        return copy?.replies.crisis ?? MOCK_REPLIES.CRISIS
      }
      if (intent !== undefined) {
        return replyForIntent(intent, context, copy)
      }
      return replyForFreeText(normalizedText, context, copy)
    },
  }
}
