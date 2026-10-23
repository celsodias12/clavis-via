import { createFileRoute } from '@tanstack/react-router'
import { DayActionScreen } from '@/screens/day-action/day-action.screen'

function DayActionRoute() {
  const { planId, dayNumber } = Route.useParams()

  return <DayActionScreen planId={planId} dayNumber={dayNumber} />
}

export const Route = createFileRoute('/_private/plan/$planId/day/$dayNumber/action')({
  component: DayActionRoute,
})
