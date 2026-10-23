import {
  DAY_ACTION_REFLECTION_MAXIMUM_LENGTH,
  TEST_IDS,
  translateFormError,
  useDayActionForm,
  usePlanDayRequest,
} from '@clavis-via/shared'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { AppText } from '../../components/app-text/app-text.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { ScreenHeader } from '../../components/screen-header/screen-header.component'
import { Skeleton } from '../../components/skeleton/skeleton.component'
import { TextField } from '../../components/text-field/text-field.component'
import { BUTTON_METRICS } from '../../constants/component.constant'
import {
  DAY_ACTION_FIELD_METRICS,
  DAY_ACTION_HEADER_LAYOUT,
  DAY_ACTION_LAYOUT,
} from '../../constants/day-action-layout.constant'
import { DESIGN } from '../../constants/design.constant'
import { ROUTES } from '../../constants/route.constant'
import { useToast } from '../../hooks/feedback/use-toast'

// Ação do dia: the action and the tip of a plan day, the button that completes it and the optional reflection.
export function DayActionScreen() {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const router = useRouter()
  const showToast = useToast()
  const { planId, dayNumber: routeDayNumber } = useLocalSearchParams<{
    planId: string
    dayNumber: string
  }>()
  const { dayNumber, isValid, data, isPending, isFetching, retry } = usePlanDayRequest(
    planId,
    routeDayNumber,
    () => router.back(),
  )
  const { control, submit, isSubmitting, isError } = useDayActionForm({
    planId,
    dayNumber,
    showToast,
    onCompleted: () => router.dismissTo({ pathname: ROUTES.PLAN, params: { planId } }),
  })

  const renderBody = () => {
    if (!isValid || (!isPending && data === undefined)) {
      return <ErrorState message={t('common.loadError')} onRetry={retry} isRetrying={isFetching} />
    }
    if (data === undefined) {
      return (
        <>
          <View style={styles.topBlock}>
            <Skeleton
              height={DAY_ACTION_LAYOUT.SKELETON_ACTION_CARD_HEIGHT}
              radius={DAY_ACTION_LAYOUT.CARD_RADIUS}
            />
            <View style={styles.skeletonTipCard}>
              <Skeleton
                height={DAY_ACTION_LAYOUT.SKELETON_TIP_CARD_HEIGHT}
                radius={DAY_ACTION_LAYOUT.CARD_RADIUS}
              />
            </View>
            <View style={styles.buttonSlot}>
              <Skeleton
                height={BUTTON_METRICS.MEDIUM_HEIGHT}
                radius={BUTTON_METRICS.MEDIUM_RADIUS}
              />
            </View>
          </View>
          <View style={[styles.bottomBlock, styles.skeletonBottomBlock]}>
            <Skeleton
              width={DAY_ACTION_LAYOUT.SKELETON_LABEL_WIDTH}
              height={DAY_ACTION_LAYOUT.SKELETON_LABEL_HEIGHT}
            />
            <View style={styles.skeletonField}>
              <Skeleton
                height={DAY_ACTION_FIELD_METRICS.BOX_HEIGHT}
                radius={DAY_ACTION_FIELD_METRICS.BOX_RADIUS}
              />
            </View>
          </View>
        </>
      )
    }
    const isCompleted = data.completion !== null
    return (
      <>
        <View style={styles.topBlock}>
          <View style={styles.actionCard}>
            <View style={styles.check}>
              <Svg
                width={styles.checkIcon.width}
                height={styles.checkIcon.height}
                viewBox={`0 0 ${DAY_ACTION_LAYOUT.CHECK_VIEW_BOX_SIZE} ${DAY_ACTION_LAYOUT.CHECK_VIEW_BOX_SIZE}`}
              >
                <Circle cx={12} cy={12} r={12} fill={theme.colors.dayActionCheck} />
                <Path
                  d={DAY_ACTION_LAYOUT.CHECK_PATH}
                  fill="none"
                  stroke={theme.colors.white}
                  strokeWidth={DAY_ACTION_LAYOUT.CHECK_STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <AppText
              variant="bodySemiBold"
              testID={TEST_IDS.DAY_ACTION_TEXT}
              style={styles.actionText}
            >
              {data.action}
            </AppText>
          </View>
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Svg
                width={styles.tipIconSize.width}
                height={styles.tipIconSize.height}
                viewBox={`0 0 ${DAY_ACTION_LAYOUT.TIP_ICON_VIEW_BOX_WIDTH} ${DAY_ACTION_LAYOUT.TIP_ICON_VIEW_BOX_HEIGHT}`}
              >
                <Path
                  d={DAY_ACTION_LAYOUT.TIP_ICON_PATH}
                  fill="none"
                  stroke={theme.colors.dayTipIcon}
                  strokeWidth={DAY_ACTION_LAYOUT.TIP_ICON_STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <AppText variant="bodySemiBold" style={styles.tipTitle}>
              {t('screen.dayAction.tipTitle')}
            </AppText>
            <AppText variant="body" testID={TEST_IDS.DAY_ACTION_TIP} style={styles.tipText}>
              {t('screen.dayAction.tipQuote', { tip: data.tip })}
            </AppText>
          </View>
          <View style={styles.buttonSlot}>
            <PrimaryButton
              testID={TEST_IDS.DAY_ACTION_COMPLETE_BUTTON}
              label={t(isCompleted ? 'screen.dayAction.completed' : 'screen.dayAction.complete')}
              tone="accent"
              size="medium"
              isFullWidth
              isDisabled={isCompleted}
              isLoading={isSubmitting}
              onPress={submit}
            />
          </View>
          {isError ? (
            <AppText
              testID={TEST_IDS.DAY_ACTION_ERROR}
              variant="body"
              accessibilityLiveRegion="polite"
              style={styles.error}
            >
              {t('screen.dayAction.saveError')}
            </AppText>
          ) : null}
        </View>
        <View style={styles.bottomBlock}>
          {isCompleted ? (
            <TextField
              testID={TEST_IDS.DAY_ACTION_REFLECTION}
              label={t('screen.dayAction.reflectionLabel')}
              value={data.completion?.reflection ?? ''}
              editable={false}
              isMultiline
              metrics={DAY_ACTION_FIELD_METRICS}
              maxLength={DAY_ACTION_REFLECTION_MAXIMUM_LENGTH}
            />
          ) : (
            <Controller
              control={control}
              name="reflection"
              render={({ field, fieldState }) => (
                <TextField
                  testID={TEST_IDS.DAY_ACTION_REFLECTION}
                  label={t('screen.dayAction.reflectionLabel')}
                  placeholder={t('screen.dayAction.reflectionPlaceholder')}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorMessage={translateFormError(t, fieldState.error?.message)}
                  isMultiline
                  metrics={DAY_ACTION_FIELD_METRICS}
                  maxLength={DAY_ACTION_REFLECTION_MAXIMUM_LENGTH}
                />
              )}
            />
          )}
        </View>
      </>
    )
  }

  return (
    <KeyboardAvoidingView
      testID={TEST_IDS.DAY_ACTION_SCREEN}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <ScreenHeader
        title={t('screen.dayAction.headerTitle')}
        leftIcon="back"
        onLeftPress={() => router.back()}
        layout={DAY_ACTION_HEADER_LAYOUT}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderBody()}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const layout = DAY_ACTION_LAYOUT
  const cardShadow = `0 1 ${6 * scale} ${theme.colors.planCardShadow}`

  return {
    screen: { flex: 1, backgroundColor: theme.colors.planSheetBackground },
    // The top block sits under the header and the reflection area under the content, anchored to the bottom;
    // on a screen too short for both, the gap collapses to its minimum and the page scrolls.
    scrollContent: { flexGrow: 1, justifyContent: 'space-between' },
    topBlock: {
      marginTop: layout.CARDS_TOP_GAP * scale,
      marginHorizontal: layout.CARD_MARGIN * scale,
    },
    actionCard: {
      borderRadius: layout.CARD_RADIUS * scale,
      backgroundColor: theme.colors.dayActionCard,
      boxShadow: cardShadow,
      paddingTop: layout.ACTION_CARD_PADDING_TOP * scale,
      paddingBottom: layout.ACTION_CARD_PADDING_BOTTOM * scale,
      paddingLeft: layout.ACTION_TEXT_LEFT * scale,
      paddingRight: layout.ACTION_TEXT_RIGHT * scale,
    },
    check: {
      position: 'absolute',
      left: layout.CHECK_LEFT * scale,
      top: layout.CHECK_TOP * scale,
    },
    checkIcon: { width: layout.CHECK_SIZE * scale, height: layout.CHECK_SIZE * scale },
    actionText: {
      fontSize: layout.ACTION_TEXT_FONT_SIZE * scale,
      lineHeight: layout.ACTION_TEXT_LINE_HEIGHT * scale,
      color: theme.colors.homeHeading,
    },
    tipCard: {
      marginTop: layout.TIP_CARD_GAP * scale,
      borderRadius: layout.CARD_RADIUS * scale,
      backgroundColor: theme.colors.dayTipCard,
      paddingTop: layout.TIP_CARD_PADDING_TOP * scale,
      paddingBottom: layout.TIP_CARD_PADDING_BOTTOM * scale,
      paddingLeft: layout.TIP_TEXT_LEFT * scale,
      paddingRight: layout.TIP_TEXT_RIGHT * scale,
    },
    tipIcon: {
      position: 'absolute',
      left: layout.TIP_ICON_LEFT * scale,
      top: layout.TIP_ICON_TOP * scale,
    },
    tipIconSize: {
      width: layout.TIP_ICON_WIDTH * scale,
      height: layout.TIP_ICON_HEIGHT * scale,
    },
    tipTitle: {
      fontSize: layout.TIP_TITLE_FONT_SIZE * scale,
      lineHeight: layout.TIP_LINE_HEIGHT * scale,
      color: theme.colors.homeHeading,
    },
    tipText: {
      marginTop: layout.TIP_TEXT_GAP * scale,
      fontSize: layout.TIP_TEXT_FONT_SIZE * scale,
      lineHeight: layout.TIP_LINE_HEIGHT * scale,
      color: theme.colors.dayTipText,
    },
    buttonSlot: { marginTop: layout.BUTTON_GAP * scale },
    error: {
      marginTop: layout.ERROR_GAP * scale,
      textAlign: 'center',
      fontSize: layout.ERROR_FONT_SIZE * scale,
      color: theme.colors.error,
    },
    bottomBlock: {
      marginTop: layout.BOTTOM_MINIMUM_GAP * scale,
      marginBottom: runtime.insets.bottom + layout.BOTTOM_MARGIN * scale,
    },
    skeletonBottomBlock: { marginHorizontal: layout.CARD_MARGIN * scale },
    skeletonTipCard: { marginTop: layout.TIP_CARD_GAP * scale },
    skeletonField: { marginTop: layout.SKELETON_FIELD_GAP * scale },
  }
})
