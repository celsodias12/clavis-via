import { createFileRoute } from '@tanstack/react-router'
import { PlanScreen } from '@/screens/plan/plan.screen'

function PlanRoute() {
  const { planId } = Route.useParams()

  return <PlanScreen planId={planId} />
}

export const Route = createFileRoute('/_private/plan/$planId/')({ component: PlanRoute })
