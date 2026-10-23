import type { TextLine } from '../@types/text.type'
import { LINE_ID_PREFIX, LINE_SEPARATOR } from '../constants/text.constant'

// Splits a translation on its line breaks; the id is the position, because the lines are fixed copy
// that is replaced as a whole (a language change), never reordered.
export function splitLines(text: string): readonly TextLine[] {
  return text.split(LINE_SEPARATOR).map((content, position) => ({
    id: `${LINE_ID_PREFIX}${position}`,
    position,
    content,
  }))
}
