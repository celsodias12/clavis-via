import { protectedProcedure, router } from '../configs/trpc.config'
import { createCheckInInputSchema, latestForDateInputSchema } from '../schemas/check-in.schema'
import { createCheckIn, findLatestCheckInForDate } from '../services/check-in.service'

export const checkInRouter = router({
  create: protectedProcedure
    .input(createCheckInInputSchema)
    .mutation(({ ctx, input }) => createCheckIn(ctx.database, ctx.userId, input)),
  latestForDate: protectedProcedure
    .input(latestForDateInputSchema)
    .query(({ ctx, input }) =>
      findLatestCheckInForDate(ctx.database, ctx.userId, input.localDate, ctx.language),
    ),
})
