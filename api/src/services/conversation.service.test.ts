import { reset } from 'cloudflare:test'
import { env } from 'cloudflare:workers'
import { TRPCError } from '@trpc/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyMigrations } from '../../tests/utils/apply-migrations'
import type { ConversationContext, ConversationResponder } from '../@types/conversation.type'
import { createDatabase } from '../configs/d1.config'
import {
  CONVERSATION_ERRORS,
  CONVERSATION_LIMITS,
  CONVERSATION_ROLES,
  QUICK_REPLY_INTENTS,
} from '../constants/conversation.constant'
import { TRPC_ERRORS } from '../constants/trpc.constant'
import { conversationMessages, planEnrollments } from '../database/schema.database'
import { createCheckIn } from './check-in.service'
import { listMessages, sendMessage } from './conversation.service'

const USER_ID = 'user_1'
const OTHER_USER_ID = 'user_2'
const LOCAL_DATE = '2026-10-20'

const database = createDatabase(env.DB)

const received: { text: string; intent?: string; context: ConversationContext }[] = []
const responder: ConversationResponder = {
  respond: async (input) => {
    received.push(input)
    return `reply to ${input.text}`
  },
}

beforeEach(async () => {
  await reset()
  await applyMigrations()
  received.length = 0
})

afterEach(() => {
  vi.useRealTimers()
})

// One insert per row: D1 caps the bound variables of a statement, so a bulk insert would not fit 60 rows.
async function insertMessages(userId: string, count: number, startMilliseconds: number) {
  for (let index = 0; index < count; index += 1) {
    await database.insert(conversationMessages).values({
      id: crypto.randomUUID(),
      userId,
      role: CONVERSATION_ROLES.USER,
      text: `message ${index}`,
      createdAt: new Date(startMilliseconds + index),
    })
  }
}

async function expectError(promise: Promise<unknown>, code: string, message?: string) {
  const error = await promise.then(
    () => null,
    (caught: unknown) => caught,
  )
  expect(error).toBeInstanceOf(TRPCError)
  expect(error).toMatchObject(message ? { code, message } : { code })
}

describe('sendMessage', () => {
  it('stores the message of the person and the reply and returns both', async () => {
    const result = await sendMessage(
      database,
      USER_ID,
      { text: 'Oi', localDate: LOCAL_DATE },
      responder,
    )
    expect(result.userMessage).toMatchObject({ role: 'user', text: 'Oi' })
    expect(result.assistantMessage).toMatchObject({ role: 'assistant', text: 'reply to Oi' })
    expect(Object.keys(result.userMessage).sort()).toEqual(['createdAt', 'id', 'role', 'text'])
    const stored = await listMessages(database, USER_ID)
    expect(stored).toEqual([result.userMessage, result.assistantMessage])
  })

  it('passes the intent and the context of the day to the responder', async () => {
    await createCheckIn(database, USER_ID, { state: 'anxious', localDate: LOCAL_DATE })
    await database
      .insert(planEnrollments)
      .values({ userId: USER_ID, planId: 'when-discouragement-weighs', startedAt: new Date() })
    await sendMessage(
      database,
      USER_ID,
      {
        text: 'Quero fazer uma prática',
        localDate: LOCAL_DATE,
        intent: QUICK_REPLY_INTENTS.PRACTICE,
      },
      responder,
    )
    await sendMessage(database, USER_ID, { text: 'Oi', localDate: LOCAL_DATE }, responder)
    const [first, second] = received
    expect(first.intent).toBe('practice')
    expect(first.context.todayCheckIn?.state).toBe('anxious')
    expect(first.context.currentPlan?.planId).toBe('when-discouragement-weighs')
    expect(first.context.verse.reference).toBeTruthy()
    expect(first.context.assistantMessageCount).toBe(0)
    expect(second.intent).toBeUndefined()
    expect(second.context.assistantMessageCount).toBe(1)
  })

  it('does not count the replies of another person', async () => {
    await sendMessage(database, OTHER_USER_ID, { text: 'Oi', localDate: LOCAL_DATE }, responder)
    await sendMessage(database, USER_ID, { text: 'Oi', localDate: LOCAL_DATE }, responder)
    expect(received[1].context.assistantMessageCount).toBe(0)
  })

  it('refuses the 31st message within 24 hours and stores nothing', async () => {
    const now = Date.parse('2026-10-20T12:00:00.000Z')
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(now))
    await insertMessages(USER_ID, CONVERSATION_LIMITS.DAILY_MESSAGE_LIMIT - 1, now - 3_600_000)
    await sendMessage(database, USER_ID, { text: 'a 30a', localDate: LOCAL_DATE }, responder)
    const before = await database.select().from(conversationMessages)

    await expectError(
      sendMessage(database, USER_ID, { text: 'a 31a', localDate: LOCAL_DATE }, responder),
      TRPC_ERRORS.TOO_MANY_REQUESTS,
      CONVERSATION_ERRORS.DAILY_LIMIT_REACHED,
    )

    expect(await database.select().from(conversationMessages)).toHaveLength(before.length)
    expect(received).toHaveLength(1)
  })

  it('ignores messages older than 24 hours and the ones of other people', async () => {
    const now = Date.parse('2026-10-20T12:00:00.000Z')
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(now))
    await insertMessages(USER_ID, 40, now - 25 * 3_600_000)
    await insertMessages(OTHER_USER_ID, 40, now - 3_600_000)
    const result = await sendMessage(
      database,
      USER_ID,
      { text: 'Oi', localDate: LOCAL_DATE },
      responder,
    )
    expect(result.userMessage.text).toBe('Oi')
  })
})

describe('listMessages', () => {
  it('returns the messages oldest first', async () => {
    const now = Date.parse('2026-10-20T12:00:00.000Z')
    await insertMessages(USER_ID, 3, now)
    const messages = await listMessages(database, USER_ID)
    expect(messages.map((message) => message.text)).toEqual(['message 0', 'message 1', 'message 2'])
    expect(messages[0].createdAt).toBe(new Date(now).toISOString())
  })

  it('returns only the latest 50, still oldest first', async () => {
    const now = Date.parse('2026-10-20T12:00:00.000Z')
    await insertMessages(USER_ID, 60, now)
    const messages = await listMessages(database, USER_ID)
    expect(messages).toHaveLength(CONVERSATION_LIMITS.LIST_LENGTH)
    expect(messages[0].text).toBe('message 10')
    expect(messages[49].text).toBe('message 59')
  })

  it('never returns the messages of another person', async () => {
    await insertMessages(OTHER_USER_ID, 3, Date.now())
    expect(await listMessages(database, USER_ID)).toEqual([])
  })
})
