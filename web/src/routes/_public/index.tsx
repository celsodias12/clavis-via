import { createFileRoute } from '@tanstack/react-router'
import { WelcomeScreen } from '@/screens/welcome/welcome.screen'

export const Route = createFileRoute('/_public/')({ component: WelcomeScreen })
