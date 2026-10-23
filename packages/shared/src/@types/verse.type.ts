import type { AppRouter } from '@clavis-via/api/router'
import type { inferRouterOutputs } from '@trpc/server'

export type VerseOfDay = inferRouterOutputs<AppRouter>['verse']['ofDay']
