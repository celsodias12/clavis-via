import { z } from 'zod'
import { localDateSchema } from './local-date.schema'

export const journeyInputSchema = z.object({ localDate: localDateSchema }).strict()
