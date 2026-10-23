import { TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { PrimaryButton } from '../primary-button/primary-button.component'

type ErrorStateProps = Readonly<{
  message: string
  onRetry: () => unknown
  // True while the retry request is running: the button shows its spinner and ignores clicks.
  isRetrying: boolean
}>

export function ErrorState({ message, onRetry, isRetrying }: ErrorStateProps) {
  const { t } = useTranslation()

  return (
    <div
      data-testid={TEST_IDS.ERROR_STATE}
      className="flex flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <p data-testid={TEST_IDS.ERROR_STATE_MESSAGE} className="font-body text-lg text-body">
        {message}
      </p>
      <PrimaryButton
        label={t('common.tryAgain')}
        tone="light"
        isLoading={isRetrying}
        onPress={onRetry}
        testID={TEST_IDS.ERROR_STATE_RETRY}
      />
    </div>
  )
}
