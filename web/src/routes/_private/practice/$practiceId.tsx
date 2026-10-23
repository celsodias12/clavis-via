import { createFileRoute } from '@tanstack/react-router'
import { PracticeScreen } from '@/screens/practice/practice.screen'

function PracticeRoute() {
  const { practiceId } = Route.useParams()

  return <PracticeScreen practiceId={practiceId} />
}

export const Route = createFileRoute('/_private/practice/$practiceId')({ component: PracticeRoute })
