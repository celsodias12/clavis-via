import { getEnvironment } from '../configs/environment.config'
import { protectedProcedure, router } from '../configs/trpc.config'
import { sendMessageInputSchema } from '../schemas/conversation.schema'
import { listMessages, sendMessage } from '../services/conversation.service'
import { createMockResponder } from '../services/mock-responder.service'

export const conversationRouter = router({
  list: protectedProcedure.query(({ ctx }) => listMessages(ctx.database, ctx.userId, ctx.language)),
  send: protectedProcedure.input(sendMessageInputSchema).mutation(({ ctx, input }) =>
    sendMessage(
      ctx.database,
      ctx.userId,
      input,
      // The mock is the only responder for now; a real model replaces it here.
      createMockResponder({
        delayMilliseconds: getEnvironment(ctx.bindings).mockReplyDelayMilliseconds,
        language: ctx.language,
      }),
      ctx.language,
    ),
  ),
})
