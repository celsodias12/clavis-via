import { Hono } from 'hono'
import type { ApplicationEnvironment } from '../@types/application.type'
import { HTTP_STATUS } from '../constants/http.constant'

export const healthRoute = new Hono<ApplicationEnvironment>().get('/', (context) =>
  context.json({ status: HTTP_STATUS.OK }),
)
