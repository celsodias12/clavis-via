import { useTranslation } from 'react-i18next'
import { Skeleton } from '../ui/skeleton'

type LoadingSkeletonProps = Readonly<{
  // Tailwind classes that size the block (and round it) like the content it stands for.
  className: string
}>

// Pulsing placeholder that mirrors the real layout while content loads.
export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  const { t } = useTranslation()

  return <Skeleton role="progressbar" aria-label={t('common.loading')} className={className} />
}
