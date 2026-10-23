import { createFileRoute } from '@tanstack/react-router'
import { SignUpScreen } from '@/screens/sign-up/sign-up.screen'

export const Route = createFileRoute('/_public/sign-up')({ component: SignUpScreen })
