import { protectedProcedure, router } from '../configs/trpc.config'
import { completePracticeInputSchema, practiceInputSchema } from '../schemas/practice.schema'
import { completePractice, findPractice } from '../services/practice.service'

export const practiceRouter = router({
  byId: protectedProcedure
    .input(practiceInputSchema)
    .query(({ ctx, input }) => findPractice(ctx.database, input.practiceId, ctx.language)),
  complete: protectedProcedure
    .input(completePracticeInputSchema)
    .mutation(({ ctx, input }) => completePractice(ctx.database, ctx.userId, input)),
})
