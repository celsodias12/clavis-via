import { z } from 'zod'
import { EMOTION_PERIODS } from '../constants/emotion.constant'
import { localDateSchema } from './local-date.schema'

export const emotionSummaryInputSchema = z
  .object({ period: z.enum(Object.values(EMOTION_PERIODS)), localDate: localDateSchema })
  .strict()
