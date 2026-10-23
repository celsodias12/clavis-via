import { protectedProcedure, router } from '../configs/trpc.config'
import { journeyInputSchema } from '../schemas/journey.schema'
import { getJourneyOverview } from '../services/journey.service'

export const journeyRouter = router({
  overview: protectedProcedure
    .input(journeyInputSchema)
    .query(({ ctx, input }) =>
      getJourneyOverview(ctx.database, ctx.userId, input.localDate, ctx.language),
    ),
})
