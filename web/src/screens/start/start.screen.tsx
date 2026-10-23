import { useTodayCheckIn } from '@clavis-via/shared'
import { Navigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BrandSplash } from '../../components/brand-splash/brand-splash.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { ROUTES } from '../../constants/route.constant'

// Entry route of a signed-in user: sends them to the check-in (nothing today yet) or to Início.
export function StartScreen() {
  const { t } = useTranslation()
  const { data, isPending, isError, isFetching, refetch } = useTodayCheckIn()

  if (isPending) {
    return <BrandSplash />
  }

  if (isError) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-home-background">
        <ErrorState
          message={t('common.loadError')}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </div>
    )
  }

  return <Navigate to={data ? ROUTES.HOME : ROUTES.CHECK_IN} replace />
}
