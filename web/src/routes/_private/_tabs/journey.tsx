import { createFileRoute } from '@tanstack/react-router'
import { JourneyScreen } from '@/screens/journey/journey.screen'

export const Route = createFileRoute('/_private/_tabs/journey')({ component: JourneyScreen })
