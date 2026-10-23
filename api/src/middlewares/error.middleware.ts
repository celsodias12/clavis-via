import type { Context } from 'hono'
import { HTTP_ERRORS } from '../constants/http.constant'

const INTERNAL_SERVER_ERROR = 500
const NOT_FOUND = 404

// The error goes to Workers Logs; the client only gets a generic body.
export function handleApplicationError(error: Error, context: Context) {
  console.error(error)
  return context.json({ error: HTTP_ERRORS.INTERNAL }, INTERNAL_SERVER_ERROR)
}

export function handleNotFound(context: Context) {
  return context.json({ error: HTTP_ERRORS.NOT_FOUND }, NOT_FOUND)
}
