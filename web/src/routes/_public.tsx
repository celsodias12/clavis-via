import { createFileRoute } from '@tanstack/react-router'
import { PublicRouteGuard } from '@/components/route-guard/route-guard.component'

export const Route = createFileRoute('/_public')({ component: PublicRouteGuard })
