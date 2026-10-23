import { TEST_IDS, usePlansBrowser } from '@clavis-via/shared'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { AppText } from '../../components/app-text/app-text.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { FilterChips } from '../../components/filter-chips/filter-chips.component'
import { HeaderIconButton } from '../../components/header-icon-button/header-icon-button.component'
import { PlanListItem } from '../../components/plan-list-item/plan-list-item.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { Skeleton } from '../../components/skeleton/skeleton.component'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { HEADER_ICON_METRICS, HEADER_ICON_STYLES } from '../../constants/component.constant'
import { DESIGN } from '../../constants/design.constant'
import { PLAN_LIST_ITEM_LAYOUT, PLANS_LAYOUT } from '../../constants/plans-layout.constant'
import { ROUTES } from '../../constants/route.constant'
import { TAB_BAR_LAYOUT } from '../../constants/tab-bar.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'

// Planos tab: title, search, category chips and the list of plans with its loading, error and empty states.
export function PlansScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const showComingSoon = useComingSoon()
  const {
    options,
    selectedKey,
    setSelectedKey,
    showAll,
    isFiltered,
    visiblePlans,
    isPending,
    isError,
    isFetching,
    refetch,
  } = usePlansBrowser()

  const renderContent = () => {
    if (isPending) {
      return PLANS_LAYOUT.SKELETON_KEYS.map((skeletonKey) => (
        <Skeleton
          key={skeletonKey}
          height={PLANS_LAYOUT.SKELETON_HEIGHT + 2 * PLAN_LIST_ITEM_LAYOUT.PHOTO_INSET_TOP}
          radius={PLAN_LIST_ITEM_LAYOUT.RADIUS}
        />
      ))
    }
    if (isError) {
      return (
        <ErrorState
          message={t('common.loadError')}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )
    }
    if (!visiblePlans?.length) {
      return (
        <View testID={TEST_IDS.PLANS_EMPTY} style={styles.empty}>
          <AppText variant="body" style={styles.emptyMessage}>
            {t('screen.plans.empty')}
          </AppText>
          {isFiltered ? (
            <PrimaryButton label={t('screen.plans.showAll')} tone="light" onPress={showAll} />
          ) : null}
        </View>
      )
    }
    return (
      <>
        {visiblePlans.map((plan) => (
          <PlanListItem
            key={plan.id}
            plan={plan}
            onPress={() => router.push({ pathname: ROUTES.PLAN, params: { planId: plan.id } })}
          />
        ))}
        <AppText variant="body" testID={TEST_IDS.PLANS_NOTE} style={styles.note}>
          {t('screen.plans.note')}
        </AppText>
      </>
    )
  }

  return (
    <View style={styles.screen}>
      <AppText variant="title" accessibilityRole="header" style={styles.title}>
        {t('screen.plans.title')}
      </AppText>
      <View style={styles.search}>
        <HeaderIconButton
          icon="search"
          onPress={showComingSoon}
          accessibilityLabel={t('screen.plans.search')}
        />
      </View>
      <View style={styles.chips}>
        <FilterChips options={options} selectedKey={selectedKey} onSelect={setSelectedKey} />
      </View>
      <ScrollView
        testID={TEST_IDS.PLANS_LIST}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      >
        {renderContent()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const topOf = (designY: number) =>
    runtime.insets.top + (designY - DESIGN.STATUS_BAR_HEIGHT) * scale
  const searchHalfSize =
    Math.max(HEADER_ICON_METRICS.MINIMUM_TOUCH_SIZE, HEADER_ICON_STYLES.search.size * scale) / 2

  return {
    screen: { flex: 1, backgroundColor: theme.colors.homeBackground },
    title: {
      position: 'absolute',
      left: PLANS_LAYOUT.TITLE_LEFT * scale,
      top: topOf(
        PLANS_LAYOUT.TITLE_BASELINE -
          AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * PLANS_LAYOUT.TITLE_FONT_SIZE,
      ),
      fontSize: PLANS_LAYOUT.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    search: {
      position: 'absolute',
      right: PLANS_LAYOUT.SEARCH_CENTER_RIGHT * scale - searchHalfSize,
      top: topOf(PLANS_LAYOUT.SEARCH_CENTER_Y) - searchHalfSize,
    },
    chips: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: topOf(PLANS_LAYOUT.CHIPS_TOP),
    },
    list: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: topOf(PLANS_LAYOUT.LIST_TOP),
    },
    // The tab bar is drawn over the scene, so the list reserves its height (plus the navigation inset).
    listContent: {
      paddingTop: (PLANS_LAYOUT.FIRST_CARD_TOP - PLANS_LAYOUT.LIST_TOP) * scale,
      paddingLeft: PLANS_LAYOUT.CARD_LEFT * scale,
      paddingRight: PLANS_LAYOUT.CARD_RIGHT * scale,
      paddingBottom:
        runtime.insets.bottom +
        (TAB_BAR_LAYOUT.BAR_HEIGHT + PLANS_LAYOUT.CONTENT_BOTTOM_GAP) * scale,
      rowGap: PLANS_LAYOUT.CARD_GAP * scale,
    },
    note: {
      marginTop: (PLANS_LAYOUT.NOTE_TOP_GAP - PLANS_LAYOUT.CARD_GAP) * scale,
      textAlign: 'center',
      fontSize: PLANS_LAYOUT.NOTE_FONT_SIZE * scale,
      color: theme.colors.placeholder,
    },
    empty: {
      alignItems: 'center',
      gap: 16 * scale,
      paddingTop: 40 * scale,
    },
    emptyMessage: {
      textAlign: 'center',
      fontSize: 13.5 * scale,
      color: theme.colors.body,
    },
  }
})
