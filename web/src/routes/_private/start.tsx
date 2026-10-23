import { createFileRoute } from '@tanstack/react-router'
import { StartScreen } from '@/screens/start/start.screen'

export const Route = createFileRoute('/_private/start')({ component: StartScreen })
