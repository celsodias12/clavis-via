import type { z } from 'zod'
import type { completePracticeInputSchema, practiceInputSchema } from '../schemas/practice.schema'

export type PracticeCompletion = {
  id: string
  practiceId: string
  localDate: string
  completedAt: string
}

export type PracticeInput = z.infer<typeof practiceInputSchema>
export type CompletePracticeInput = z.infer<typeof completePracticeInputSchema>
