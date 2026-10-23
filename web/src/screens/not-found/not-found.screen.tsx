import { TEST_IDS } from '@clavis-via/shared'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/route.constant'

// A path that does not exist: an error with a link back to Início.
export function NotFoundScreen() {
  const { t } = useTranslation()

  return (
    <div
      data-testid={TEST_IDS.NOT_FOUND}
      className="flex min-h-svh flex-col items-center justify-center gap-4 bg-home-background px-6 text-center"
    >
      <h1 className="font-title text-2xl font-medium text-title">{t('screen.notFound.title')}</h1>
      <p className="font-body text-body">{t('screen.notFound.message')}</p>
      <Link
        to={ROUTES.HOME}
        data-testid={TEST_IDS.NOT_FOUND_HOME}
        className="font-body font-semibold text-link-strong underline"
      >
        {t('screen.notFound.action')}
      </Link>
    </div>
  )
}
