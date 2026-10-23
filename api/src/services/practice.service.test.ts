import { reset } from 'cloudflare:test'
import { env } from 'cloudflare:workers'
import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { applyMigrations } from '../../tests/utils/apply-migrations'
import { createDatabase } from '../configs/d1.config'
import { PRACTICE_ERRORS } from '../constants/practice.constant'
import { TRPC_ERRORS } from '../constants/trpc.constant'
import { practiceCompletions } from '../database/schema.database'
import { completePractice, findPractice } from './practice.service'

const USER_ID = 'user_1'
const PRACTICE_ID = 'guided-breathing'
const LOCAL_DATE = '2026-10-19'

const database = createDatabase(env.DB)

beforeEach(async () => {
  await reset()
  await applyMigrations()
})

async function expectNotFound(promise: Promise<unknown>) {
  const error = await promise.then(
    () => null,
    (caught: unknown) => caught,
  )
  expect(error).toBeInstanceOf(TRPCError)
  expect(error).toMatchObject({
    code: TRPC_ERRORS.NOT_FOUND,
    message: PRACTICE_ERRORS.PRACTICE_NOT_FOUND,
  })
}

describe('findPractice', () => {
  it('returns the guided breathing practice with 180 seconds', async () => {
    const practice = await findPractice(database, PRACTICE_ID)
    expect(practice).toMatchObject({ id: PRACTICE_ID, durationSeconds: 180 })
    expect(Object.keys(practice).sort()).toEqual(['description', 'durationSeconds', 'id', 'title'])
  })

  it('fails with NOT_FOUND for an unknown practice', async () => {
    await expectNotFound(findPractice(database, 'unknown'))
  })
})

describe('completePractice', () => {
  it('records two completions on the same day as two rows', async () => {
    const first = await completePractice(database, USER_ID, {
      practiceId: PRACTICE_ID,
      localDate: LOCAL_DATE,
    })
    const second = await completePractice(database, USER_ID, {
      practiceId: PRACTICE_ID,
      localDate: LOCAL_DATE,
    })
    expect(first.id).not.toBe(second.id)
    expect(first).toMatchObject({ practiceId: PRACTICE_ID, localDate: LOCAL_DATE })
    expect(new Date(first.completedAt).toISOString()).toBe(first.completedAt)
    const rows = await database
      .select()
      .from(practiceCompletions)
      .where(eq(practiceCompletions.userId, USER_ID))
    expect(rows).toHaveLength(2)
  })

  it('fails with NOT_FOUND when the practice does not exist', async () => {
    await expectNotFound(
      completePractice(database, USER_ID, { practiceId: 'unknown', localDate: LOCAL_DATE }),
    )
  })
})
