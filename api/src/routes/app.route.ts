import { router } from '../configs/trpc.config'
import { checkInRouter } from './check-in.route'
import { conversationRouter } from './conversation.route'
import { emotionRouter } from './emotion.route'
import { journeyRouter } from './journey.route'
import { planRouter } from './plan.route'
import { practiceRouter } from './practice.route'
import { verseRouter } from './verse.route'

// Feature routers are added here as they are built.
export const appRouter = router({
  checkIn: checkInRouter,
  plan: planRouter,
  practice: practiceRouter,
  verse: verseRouter,
  journey: journeyRouter,
  emotion: emotionRouter,
  conversation: conversationRouter,
})

export type AppRouter = typeof appRouter
