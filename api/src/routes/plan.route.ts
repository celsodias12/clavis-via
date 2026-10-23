import { protectedProcedure, router } from '../configs/trpc.config'
import { completeDayInputSchema, dayInputSchema, planInputSchema } from '../schemas/plan.schema'
import {
  completeDay,
  findCurrentPlan,
  findPlanDay,
  getPlanDetail,
  listPlans,
  startPlan,
} from '../services/plan.service'

export const planRouter = router({
  list: protectedProcedure.query(({ ctx }) => listPlans(ctx.database, ctx.language)),
  detail: protectedProcedure
    .input(planInputSchema)
    .query(({ ctx, input }) => getPlanDetail(ctx.database, ctx.userId, input.planId, ctx.language)),
  day: protectedProcedure
    .input(dayInputSchema)
    .query(({ ctx, input }) => findPlanDay(ctx.database, ctx.userId, input, ctx.language)),
  start: protectedProcedure
    .input(planInputSchema)
    .mutation(({ ctx, input }) => startPlan(ctx.database, ctx.userId, input.planId)),
  completeDay: protectedProcedure
    .input(completeDayInputSchema)
    .mutation(({ ctx, input }) => completeDay(ctx.database, ctx.userId, input)),
  current: protectedProcedure.query(({ ctx }) =>
    findCurrentPlan(ctx.database, ctx.userId, ctx.language),
  ),
})
