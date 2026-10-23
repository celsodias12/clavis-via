import type { TRPC_ERROR_CODES } from '../constants/api.constant'
import type { SupportedLanguage } from './language.type'

export type ApiClientOptions = Readonly<{
  baseUrl: string
  getToken: () => Promise<string | null>
  language?: SupportedLanguage
  fetch?: typeof fetch
}>

export type ApiSessionResource = Readonly<{
  id: string
  getToken: ApiClientOptions['getToken']
  end: () => unknown
}>

export type TrpcErrorCode = (typeof TRPC_ERROR_CODES)[keyof typeof TRPC_ERROR_CODES]
