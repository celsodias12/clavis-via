import { createFileRoute, Outlet } from '@tanstack/react-router'

// Groups the four tab screens (Início, Planos, Conversa, Jornada). The shell shows the bottom tabs on exactly
// these routes.
export const Route = createFileRoute('/_private/_tabs')({ component: Outlet })
