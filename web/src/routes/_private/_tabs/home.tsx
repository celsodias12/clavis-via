import { createFileRoute } from '@tanstack/react-router'
import { HomeScreen } from '@/screens/home/home.screen'

export const Route = createFileRoute('/_private/_tabs/home')({ component: HomeScreen })
