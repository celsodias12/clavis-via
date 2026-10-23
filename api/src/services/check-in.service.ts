import { and, desc, eq, sql } from 'drizzle-orm'
import type { CheckIn, CheckInWithDailyKey, CreateCheckInInput } from '../@types/check-in.type'
import type { Database } from '../@types/database.type'
import { checkIns, dailyKeys, practices } from '../database/schema.database'
import { dailyKeyCopy, practiceCopy } from '../i18n/content'
import type { ContentLanguage } from '../i18n/language'

function toCheckIn(row: typeof checkIns.$inferSelect): CheckIn {
  return {
    id: row.id,
    state: row.state,
    otherText: row.otherText,
    localDate: row.localDate,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function createCheckIn(
  database: Database,
  userId: string,
  input: CreateCheckInInput,
): Promise<CheckIn> {
  const [row] = await database
    .insert(checkIns)
    .values({
      id: crypto.randomUUID(),
      userId,
      state: input.state,
      otherText: input.otherText ?? null,
      localDate: input.localDate,
      createdAt: new Date(),
    })
    .returning()
  return toCheckIn(row)
}

// Ties on created_at (same millisecond) are broken by insertion order through the rowid.
export async function findLatestCheckInForDate(
  database: Database,
  userId: string,
  localDate: string,
  language: ContentLanguage = 'pt-BR',
): Promise<CheckInWithDailyKey | null> {
  const [found] = await database
    .select({ checkIn: checkIns, dailyKey: dailyKeys, practice: practices })
    .from(checkIns)
    .innerJoin(dailyKeys, eq(dailyKeys.state, checkIns.state))
    .innerJoin(practices, eq(practices.id, dailyKeys.practiceId))
    .where(and(eq(checkIns.userId, userId), eq(checkIns.localDate, localDate)))
    .orderBy(desc(checkIns.createdAt), desc(sql`${checkIns}.rowid`))
    .limit(1)
  if (!found) {
    return null
  }
  const key = dailyKeyCopy(found.dailyKey.state, language)
  const practice = practiceCopy(found.practice.id, language)
  return {
    ...toCheckIn(found.checkIn),
    dailyKey: {
      title: key?.title ?? found.dailyKey.title,
      text: key?.text ?? found.dailyKey.text,
      practice: {
        id: found.practice.id,
        title: practice?.title ?? found.practice.title,
        durationSeconds: found.practice.durationSeconds,
        description: practice?.description ?? found.practice.description,
      },
    },
  }
}
