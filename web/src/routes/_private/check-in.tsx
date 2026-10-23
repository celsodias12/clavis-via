import { createFileRoute } from '@tanstack/react-router'
import { CheckInScreen } from '@/screens/check-in/check-in.screen'

export const Route = createFileRoute('/_private/check-in')({ component: CheckInScreen })
