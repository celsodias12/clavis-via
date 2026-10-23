import { createFileRoute } from '@tanstack/react-router'
import { PlansScreen } from '@/screens/plans/plans.screen'

export const Route = createFileRoute('/_private/_tabs/plans')({ component: PlansScreen })
