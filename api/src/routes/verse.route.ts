import { protectedProcedure, router } from '../configs/trpc.config'
import { verseInputSchema } from '../schemas/verse.schema'
import { findVerseOfDay } from '../services/verse.service'

export const verseRouter = router({
  ofDay: protectedProcedure
    .input(verseInputSchema)
    .query(({ ctx, input }) => findVerseOfDay(ctx.database, input.localDate, ctx.language)),
})
