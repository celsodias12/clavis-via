import { createFileRoute } from '@tanstack/react-router'
import { EmotionsScreen } from '@/screens/emotions/emotions.screen'

export const Route = createFileRoute('/_private/emotions')({ component: EmotionsScreen })
