import { TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { ERROR_STATE_METRICS } from '../../constants/component.constant'
import { scaleDesignValue } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'
import { PrimaryButton } from '../primary-button/primary-button.component'

type ErrorStateProps = Readonly<{
  message: string
  onRetry: () => unknown
  // True while the retry request is running: the button shows its spinner and ignores presses.
  isRetrying: boolean
}>

export function ErrorState({ message, onRetry, isRetrying }: ErrorStateProps) {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()

  return (
    <View testID={TEST_IDS.ERROR_STATE} style={styles.container(width)}>
      <AppText variant="body" testID={TEST_IDS.ERROR_STATE_MESSAGE} style={styles.message(width)}>
        {message}
      </AppText>
      <PrimaryButton
        label={t('common.tryAgain')}
        tone="light"
        isLoading={isRetrying}
        onPress={onRetry}
        testID={TEST_IDS.ERROR_STATE_RETRY}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: (width: number) => ({
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleDesignValue(ERROR_STATE_METRICS.GAP, width),
    paddingHorizontal: scaleDesignValue(ERROR_STATE_METRICS.HORIZONTAL_PADDING, width),
  }),
  message: (width: number) => ({
    fontSize: scaleDesignValue(ERROR_STATE_METRICS.MESSAGE_SIZE, width),
    color: theme.colors.body,
    textAlign: 'center',
  }),
}))
