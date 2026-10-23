import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import type { Practice } from '../@types/check-in.type'
import type { Database } from '../@types/database.type'
import type { CompletePracticeInput, PracticeCompletion } from '../@types/practice.type'
import { PRACTICE_ERRORS } from '../constants/practice.constant'
import { TRPC_ERRORS } from '../constants/trpc.constant'
import { practiceCompletions, practices } from '../database/schema.database'
import { practiceCopy } from '../i18n/content'
import type { ContentLanguage } from '../i18n/language'

export async function findPractice(
  database: Database,
  practiceId: string,
  language: ContentLanguage = 'pt-BR',
): Promise<Practice> {
  const [practice] = await database.select().from(practices).where(eq(practices.id, practiceId))
  if (!practice) {
    throw new TRPCError({
      code: TRPC_ERRORS.NOT_FOUND,
      message: PRACTICE_ERRORS.PRACTICE_NOT_FOUND,
    })
  }
  return { ...practice, ...practiceCopy(practiceId, language) }
}

// Several completions per day are allowed, so every call inserts a new row.
export async function completePractice(
  database: Database,
  userId: string,
  input: CompletePracticeInput,
): Promise<PracticeCompletion> {
  await findPractice(database, input.practiceId)
  const [completion] = await database
    .insert(practiceCompletions)
    .values({
      id: crypto.randomUUID(),
      userId,
      practiceId: input.practiceId,
      localDate: input.localDate,
      completedAt: new Date(),
    })
    .returning()
  return {
    id: completion.id,
    practiceId: completion.practiceId,
    localDate: completion.localDate,
    completedAt: completion.completedAt.toISOString(),
  }
}
