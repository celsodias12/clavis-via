import { protectedProcedure, router } from '../configs/trpc.config'
import { emotionSummaryInputSchema } from '../schemas/emotion.schema'
import { getEmotionSummary } from '../services/emotion.service'

export const emotionRouter = router({
  summary: protectedProcedure
    .input(emotionSummaryInputSchema)
    .query(({ ctx, input }) => getEmotionSummary(ctx.database, ctx.userId, input)),
})
