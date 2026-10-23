import { createFileRoute } from '@tanstack/react-router'
import { SignInScreen } from '@/screens/sign-in/sign-in.screen'

export const Route = createFileRoute('/_public/sign-in')({ component: SignInScreen })
