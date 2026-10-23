import type { ContentLanguage } from '../i18n/language'
import type { Database } from './database.type'

export type ApplicationEnvironment = { Bindings: Cloudflare.Env }

export type Environment = {
  corsAllowedOrigins: string[]
  clerkJwtKey: string
  mockReplyDelayMilliseconds: number
}

export type TrpcContext = {
  userId: string | null
  language: ContentLanguage
  bindings: Cloudflare.Env
  database: Database
}
