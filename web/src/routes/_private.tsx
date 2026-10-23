import { createFileRoute } from '@tanstack/react-router'
import { PrivateRouteGuard } from '@/components/route-guard/route-guard.component'

export const Route = createFileRoute('/_private')({ component: PrivateRouteGuard })
