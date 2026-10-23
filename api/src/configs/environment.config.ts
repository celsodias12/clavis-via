import { z } from 'zod'
import type { Environment } from '../@types/application.type'
import { ORIGIN_SEPARATOR } from '../constants/http.constant'

// Validate the text bindings of the request in a single place. A Worker has no
// useful global `process.env`, so the bindings are passed in.
const environmentSchema = z
  .object({
    CORS_ALLOWED_ORIGINS: z
      .string()
      .transform((value) =>
        value
          .split(ORIGIN_SEPARATOR)
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0),
      )
      .pipe(z.array(z.url())),
    CLERK_JWT_KEY: z.string().min(1),
    // How long the mock responder "types" before answering.
    MOCK_REPLY_DELAY_MILLISECONDS: z.coerce.number().min(0),
  })
  .strict()

export function getEnvironment(bindings: Cloudflare.Env): Environment {
  const parsed = environmentSchema.parse({
    CORS_ALLOWED_ORIGINS: bindings.CORS_ALLOWED_ORIGINS,
    CLERK_JWT_KEY: bindings.CLERK_JWT_KEY,
    MOCK_REPLY_DELAY_MILLISECONDS: bindings.MOCK_REPLY_DELAY_MILLISECONDS,
  })
  return {
    corsAllowedOrigins: parsed.CORS_ALLOWED_ORIGINS,
    clerkJwtKey: parsed.CLERK_JWT_KEY,
    mockReplyDelayMilliseconds: parsed.MOCK_REPLY_DELAY_MILLISECONDS,
  }
}
