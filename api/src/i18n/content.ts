import type { ContentLanguage } from './language'
import english from './locales/en.json'
import spanish from './locales/es.json'

type PracticeCopy = { title: string; description: string }
type DailyKeyCopy = { title: string; text: string }
type PlanCopy = { title: string; description: string }
type DayCopy = {
  title: string
  summary: string
  message: string
  reflection: string
  action: string
  tip: string
  prayer: string
}
type VerseCopy = { text: string; reference: string }
type ConversationCopy = {
  duration: { oneMinute: string; minutes: string; minutesAndSeconds: string }
  names: { discouragementPlan: string; directionPlan: string }
  replies: {
    crisis: string
    talk: string
    directionWithPlan: string
    directionWithoutPlan: string
    practiceWithCheckIn: string
    practiceWithoutCheckIn: string
    prayer: string
    breathingIntro: string
    discouragement: string
    faith: string
  }
  defaults: string[]
}
type ContentCopy = {
  practices: Record<string, PracticeCopy>
  dailyKeys: Record<string, DailyKeyCopy>
  plans: Record<string, PlanCopy>
  days: Record<string, Record<string, DayCopy>>
  verses: Record<string, VerseCopy>
  conversation: ConversationCopy
}

const copies: Record<'en' | 'es', ContentCopy> = { en: english, es: spanish }

function copyFor(language: ContentLanguage): ContentCopy | null {
  return language === 'pt-BR' ? null : copies[language]
}

function required<T>(copy: T | undefined, key: string): T {
  if (copy === undefined) throw new Error(`Missing localized content: ${key}`)
  return copy
}

export function practiceCopy(id: string, language: ContentLanguage): PracticeCopy | null {
  const copy = copyFor(language)
  return copy ? required(copy.practices[id], `practice/${language}/${id}`) : null
}

export function dailyKeyCopy(state: string, language: ContentLanguage): DailyKeyCopy | null {
  const copy = copyFor(language)
  return copy ? required(copy.dailyKeys[state], `daily-key/${language}/${state}`) : null
}

export function planCopy(id: string, language: ContentLanguage): PlanCopy | null {
  const copy = copyFor(language)
  return copy ? required(copy.plans[id], `plan/${language}/${id}`) : null
}

export function dayCopy(
  planId: string,
  dayNumber: number,
  language: ContentLanguage,
): DayCopy | null {
  const copy = copyFor(language)
  return copy
    ? required(copy.days[planId]?.[String(dayNumber)], `day/${language}/${planId}/${dayNumber}`)
    : null
}

export function verseCopy(position: number, language: ContentLanguage): VerseCopy | null {
  const copy = copyFor(language)
  return copy ? required(copy.verses[String(position)], `verse/${language}/${position}`) : null
}

export function conversationCopy(language: ContentLanguage): ConversationCopy | null {
  return copyFor(language)?.conversation ?? null
}
