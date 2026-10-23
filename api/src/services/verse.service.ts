import { asc } from 'drizzle-orm'
import type { Database } from '../@types/database.type'
import type { Verse } from '../@types/verse.type'
import { verses } from '../database/schema.database'
import { verseCopy } from '../i18n/content'
import type { ContentLanguage } from '../i18n/language'
import { daysSinceEpoch } from '../utils/date'

// Deterministic verse of the day: the position cycles with the number of days since 1970-01-01.
export async function findVerseOfDay(
  database: Database,
  localDate: string,
  language: ContentLanguage = 'pt-BR',
): Promise<Verse> {
  const rows = await database.select().from(verses).orderBy(asc(verses.position))
  const { position, text, reference } = rows[daysSinceEpoch(localDate) % rows.length]
  return verseCopy(position, language) ?? { text, reference }
}
