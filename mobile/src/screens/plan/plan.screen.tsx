import {
  PLAN_TAB_KEYS,
  PLAN_TABS,
  type PlanDetail,
  type PlanTabKey,
  primaryActionForPlan,
  REFLECTION_DATE_OPTIONS,
  TEST_IDS,
  usePlan,
  useStartPlan,
} from '@clavis-via/shared'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, ScrollView, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { AppText } from '../../components/app-text/app-text.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { HeaderIconButton } from '../../components/header-icon-button/header-icon-button.component'
import { PlanDayRow } from '../../components/plan-day-row/plan-day-row.component'
import { PlanMetaIcon } from '../../components/plan-meta-icon/plan-meta-icon.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { SegmentedControl } from '../../components/segmented-control/segmented-control.component'
import { Skeleton } from '../../components/skeleton/skeleton.component'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { HEADER_ICON_METRICS, HEADER_ICON_STYLES } from '../../constants/component.constant'
import { DESIGN } from '../../constants/design.constant'
import {
  PLAN_DAY_ROW_LAYOUT,
  PLAN_LAYOUT,
  SEGMENTED_CONTROL_LAYOUT,
} from '../../constants/plan-layout.constant'
import { ROUTES } from '../../constants/route.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'
import { useToast } from '../../hooks/feedback/use-toast'
import { planImages } from '../../utils/plan-images'

// Plano: cover photo, title, duration, description, the Visão geral / Conteúdo / Reflexões segments and the
// button that starts, continues or (when everything is done) only reports the plan as completed.
export function PlanScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { planId } = useLocalSearchParams<{ planId: string }>()
  const showComingSoon = useComingSoon()
  const showToast = useToast()
  const { data, isPending, isError, isFetching, refetch } = usePlan(planId)
  const { mutateAsync: startPlan, isPending: isStarting } = useStartPlan()

  const [selectedKey, setSelectedKey] = useState<PlanTabKey>(PLAN_TAB_KEYS.OVERVIEW)

  const segments = PLAN_TABS.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))

  const openDay = (dayNumber: number) =>
    router.push({
      pathname: ROUTES.PLAN_DAY,
      params: { planId, dayNumber: String(dayNumber) },
    })

  const renderOverview = (plan: PlanDetail) => {
    const completedDayNumbers = new Set(plan.completedDayNumbers)
    return (
      <View style={styles.panel}>
        {plan.days.map((day, index) => (
          <PlanDayRow
            key={day.dayNumber}
            dayNumber={day.dayNumber}
            title={day.title}
            isCompleted={completedDayNumbers.has(day.dayNumber)}
            hasSeparator={index < plan.days.length - 1}
            onPress={() => openDay(day.dayNumber)}
          />
        ))}
      </View>
    )
  }

  const renderContent = (plan: PlanDetail) =>
    plan.days.map((day) => (
      <View
        key={day.dayNumber}
        testID={`${TEST_IDS.PLAN_CONTENT_ITEM_PREFIX}${day.dayNumber}`}
        style={styles.item}
      >
        <AppText variant="bodySemiBold" style={styles.itemTitle}>
          {day.title}
        </AppText>
        <AppText variant="body" style={styles.itemBody}>
          {day.summary}
        </AppText>
      </View>
    ))

  const renderReflections = (plan: PlanDetail) => {
    if (plan.reflections.length === 0) {
      return (
        <AppText
          variant="body"
          testID={TEST_IDS.PLAN_REFLECTIONS_EMPTY}
          style={styles.reflectionsEmpty}
        >
          {t('screen.plan.reflectionsEmpty')}
        </AppText>
      )
    }
    return plan.reflections.map((reflection) => (
      <View
        key={reflection.dayNumber}
        testID={`${TEST_IDS.PLAN_REFLECTION_PREFIX}${reflection.dayNumber}`}
        style={styles.item}
      >
        <AppText variant="bodySemiBold" style={styles.itemTitle}>
          {reflection.dayTitle}
        </AppText>
        <AppText variant="body" style={styles.itemDate}>
          {new Date(reflection.completedAt).toLocaleDateString(
            i18n.language,
            REFLECTION_DATE_OPTIONS,
          )}
        </AppText>
        <AppText variant="body" style={styles.itemBody}>
          {reflection.text}
        </AppText>
      </View>
    ))
  }

  const renderTab = (plan: PlanDetail) => {
    if (selectedKey === PLAN_TAB_KEYS.CONTENT) {
      return renderContent(plan)
    }
    if (selectedKey === PLAN_TAB_KEYS.REFLECTIONS) {
      return renderReflections(plan)
    }
    return renderOverview(plan)
  }

  const renderSheet = () => {
    if (isPending) {
      return (
        <View style={styles.skeletons}>
          <Skeleton
            width={PLAN_LAYOUT.SKELETON_TITLE_WIDTH}
            height={PLAN_LAYOUT.SKELETON_TITLE_HEIGHT}
          />
          {PLAN_LAYOUT.SKELETON_KEYS.map((skeletonKey) => (
            <Skeleton key={skeletonKey} height={PLAN_DAY_ROW_LAYOUT.HEIGHT} />
          ))}
        </View>
      )
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
    return (
      <>
        <AppText
          variant="titleMedium"
          testID={TEST_IDS.PLAN_TITLE}
          accessibilityRole="header"
          style={styles.title}
        >
          {data.title}
        </AppText>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <PlanMetaIcon icon="calendar" />
            <AppText variant="bodyMedium" style={styles.metaText}>
              {t('screen.plans.duration', { count: data.totalDays })}
            </AppText>
          </View>
          <View style={styles.metaItem}>
            <PlanMetaIcon icon="clock" />
            <AppText variant="bodyMedium" style={styles.metaText}>
              {t('screen.plan.dailyTime')}
            </AppText>
          </View>
        </View>
        <AppText variant="body" style={styles.description}>
          {data.description}
        </AppText>
        <View style={styles.segments}>
          <SegmentedControl
            segments={segments}
            selectedKey={selectedKey}
            onSelect={(key) => setSelectedKey(key as PlanTabKey)}
            variant="soft"
            testIDPrefix={TEST_IDS.PLAN_SEGMENT_PREFIX}
          />
        </View>
        <View style={styles.tabContent}>{renderTab(data)}</View>
      </>
    )
  }

  const renderFooter = () => {
    if (data === undefined) {
      return null
    }
    const action = primaryActionForPlan(data)

    // Starting enrolls first and then opens the first day; continuing opens the first day left to do.
    const handlePress = async () => {
      if (action.needsEnrollment) {
        try {
          await startPlan({ planId })
        } catch {
          showToast(t('screen.plan.startError'))
          return
        }
      }
      openDay(action.targetDayNumber)
    }

    return (
      <View style={styles.footer}>
        <PrimaryButton
          testID={TEST_IDS.PLAN_PRIMARY_BUTTON}
          label={t(action.labelKey)}
          tone="accent"
          size="medium"
          isFullWidth
          isLoading={isStarting}
          isDisabled={action.isDisabled}
          onPress={handlePress}
        />
      </View>
    )
  }

  return (
    <View testID={TEST_IDS.PLAN_SCREEN} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View pointerEvents="none" style={styles.cover}>
          <Image
            testID={TEST_IDS.PLAN_COVER}
            source={planImages(planId).cover}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.coverImage}
          />
        </View>
        <View style={styles.sheet}>{renderSheet()}</View>
        <View style={styles.backButton}>
          <HeaderIconButton
            icon="chevronBack"
            onPress={() => router.back()}
            accessibilityLabel={t('common.back')}
          />
        </View>
        <View style={styles.moreButton}>
          <HeaderIconButton
            icon="more"
            onPress={showComingSoon}
            accessibilityLabel={t('screen.plan.more')}
          />
        </View>
      </ScrollView>
      {renderFooter()}
    </View>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const topOf = (designY: number) =>
    runtime.insets.top + (designY - DESIGN.STATUS_BAR_HEIGHT) * scale
  const layout = PLAN_LAYOUT
  const bodyAscent = AUTHENTICATION_FONT_METRICS.BODY_ASCENT
  const bodyDescent = AUTHENTICATION_FONT_METRICS.BODY_DESCENT
  const iconHalf = (icon: keyof typeof HEADER_ICON_STYLES) =>
    Math.max(HEADER_ICON_METRICS.MINIMUM_TOUCH_SIZE, HEADER_ICON_STYLES[icon].size * scale) / 2

  // Vertical rhythm of the sheet, from baselines: every block is placed relative to the one above it, so a
  // longer title or description pushes the rest down instead of overlapping it.
  const titleTop =
    layout.TITLE_BASELINE - AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * layout.TITLE_FONT_SIZE
  const titleBottom =
    layout.TITLE_BASELINE + AUTHENTICATION_FONT_METRICS.TITLE_DESCENT * layout.TITLE_FONT_SIZE
  const metaTop = layout.META_BASELINE - bodyAscent * layout.META_FONT_SIZE
  const metaBottom = layout.META_BASELINE + bodyDescent * layout.META_FONT_SIZE
  const descriptionTop =
    layout.DESCRIPTION_FIRST_BASELINE -
    (layout.DESCRIPTION_LINE_HEIGHT - bodyDescent * layout.DESCRIPTION_FONT_SIZE)
  const descriptionBottom =
    descriptionTop + layout.DESCRIPTION_DESIGN_LINES * layout.DESCRIPTION_LINE_HEIGHT
  const footerHeight =
    runtime.insets.bottom +
    (DESIGN.CARD_HEIGHT -
      layout.FOOTER_BUTTON_BOTTOM +
      layout.BUTTON_HEIGHT +
      layout.CONTENT_BOTTOM_GAP) *
      scale

  return {
    screen: { flex: 1, backgroundColor: theme.colors.planSheetBackground },
    scrollContent: { flexGrow: 1, paddingBottom: footerHeight },
    cover: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: topOf(layout.SHEET_TOP) + layout.SHEET_RADIUS * scale,
      overflow: 'hidden',
      backgroundColor: theme.colors.planDayCircle,
    },
    coverImage: {
      width: runtime.screen.width,
      height: runtime.screen.width / layout.COVER_ASPECT_RATIO,
      marginTop: layout.COVER_OFFSET_TOP * scale,
    },
    sheet: {
      flexGrow: 1,
      marginTop: topOf(layout.SHEET_TOP),
      paddingTop: (titleTop - layout.SHEET_TOP) * scale,
      borderTopLeftRadius: layout.SHEET_RADIUS * scale,
      borderTopRightRadius: layout.SHEET_RADIUS * scale,
      backgroundColor: theme.colors.planSheetBackground,
    },
    backButton: {
      position: 'absolute',
      left: layout.BACK_CENTER_X * scale - iconHalf('chevronBack'),
      top: topOf(layout.BACK_CENTER_Y) - iconHalf('chevronBack'),
    },
    moreButton: {
      position: 'absolute',
      right: layout.MORE_CENTER_RIGHT * scale - iconHalf('more'),
      top: topOf(layout.MORE_CENTER_Y) - iconHalf('more'),
    },
    title: {
      marginHorizontal: layout.TITLE_LEFT * scale,
      fontSize: layout.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: (metaTop - titleBottom) * scale,
      marginLeft: layout.META_LEFT * scale,
      columnGap: layout.META_ITEM_GAP * scale,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      columnGap: layout.META_ICON_TEXT_GAP * scale,
    },
    metaText: {
      fontSize: layout.META_FONT_SIZE * scale,
      color: theme.colors.title,
    },
    description: {
      width: layout.DESCRIPTION_WIDTH * scale,
      marginTop: (descriptionTop - metaBottom) * scale,
      marginLeft: layout.DESCRIPTION_LEFT * scale,
      fontSize: layout.DESCRIPTION_FONT_SIZE * scale,
      lineHeight: layout.DESCRIPTION_LINE_HEIGHT * scale,
      color: theme.colors.body,
    },
    segments: {
      marginTop: (layout.SEGMENTS_TOP - descriptionBottom) * scale,
      marginLeft: layout.CONTENT_LEFT * scale,
    },
    tabContent: {
      marginTop: (layout.LIST_TOP - layout.SEGMENTS_TOP - SEGMENTED_CONTROL_LAYOUT.HEIGHT) * scale,
      marginLeft: layout.CONTENT_LEFT * scale,
      marginRight: layout.CONTENT_RIGHT * scale,
      rowGap: layout.ITEM_GAP * scale,
    },
    panel: {
      borderRadius: PLAN_DAY_ROW_LAYOUT.PANEL_RADIUS * scale,
      backgroundColor: theme.colors.homeBackground,
      boxShadow: `0 1 ${6 * scale} ${theme.colors.planCardShadow}`,
    },
    item: {
      padding: layout.ITEM_PADDING * scale,
      borderRadius: layout.ITEM_RADIUS * scale,
      backgroundColor: theme.colors.homeBackground,
      boxShadow: `0 1 ${6 * scale} ${theme.colors.planCardShadow}`,
    },
    itemTitle: {
      fontSize: layout.ITEM_TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    itemDate: {
      fontSize: layout.ITEM_BODY_FONT_SIZE * scale,
      color: theme.colors.placeholder,
    },
    itemBody: {
      fontSize: layout.ITEM_BODY_FONT_SIZE * scale,
      lineHeight: layout.ITEM_BODY_LINE_HEIGHT * scale,
      color: theme.colors.body,
    },
    reflectionsEmpty: {
      fontSize: layout.EMPTY_FONT_SIZE * scale,
      color: theme.colors.body,
    },
    skeletons: {
      marginHorizontal: layout.CONTENT_LEFT * scale,
      rowGap: layout.ITEM_GAP * scale,
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: footerHeight,
      paddingTop: layout.CONTENT_BOTTOM_GAP * scale,
      paddingLeft: layout.CONTENT_LEFT * scale,
      paddingRight: layout.CONTENT_RIGHT * scale,
      backgroundColor: theme.colors.planSheetBackground,
    },
  }
})
