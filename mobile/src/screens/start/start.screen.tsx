import { useTodayCheckIn } from '@clavis-via/shared'
import { Redirect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { BrandKey } from '../../components/brand-key/brand-key.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { ROUTES } from '../../constants/route.constant'
import { START_LAYOUT } from '../../constants/start-layout.constant'

// Entry route of a signed-in user: sends them to the check-in (nothing today yet) or to Início.
export function StartScreen() {
  const { t } = useTranslation()
  const { data, isPending, isError, isFetching, refetch } = useTodayCheckIn()

  if (isPending) {
    return (
      <View style={styles.screen}>
        <BrandKey width={START_LAYOUT.KEY_WIDTH} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.screen}>
        <ErrorState
          message={t('common.loadError')}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </View>
    )
  }

  return <Redirect href={data ? ROUTES.HOME : ROUTES.CHECK_IN} />
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.homeBackground,
  },
}))
