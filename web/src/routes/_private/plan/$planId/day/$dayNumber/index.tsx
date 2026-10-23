import { createFileRoute } from '@tanstack/react-router'
import { PlanDayScreen } from '@/screens/plan-day/plan-day.screen'

function PlanDayRoute() {
  const { planId, dayNumber } = Route.useParams()

  return <PlanDayScreen planId={planId} dayNumber={dayNumber} />
}

export const Route = createFileRoute('/_private/plan/$planId/day/$dayNumber/')({
  component: PlanDayRoute,
})
