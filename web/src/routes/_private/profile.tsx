import { createFileRoute } from '@tanstack/react-router'
import { ProfileScreen } from '@/screens/profile/profile.screen'

export const Route = createFileRoute('/_private/profile')({ component: ProfileScreen })
