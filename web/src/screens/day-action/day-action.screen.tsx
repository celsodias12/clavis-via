import {
  colors,
  DAY_ACTION_REFLECTION_MAXIMUM_LENGTH,
  PLAN_DAY_ICONS,
  TEST_IDS,
  translateFormError,
  useDayActionForm,
  usePlanDayRequest,
} from '@clavis-via/shared'
import { useNavigate } from '@tanstack/react-router'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '../../components/error-state/error-state.component'
import { LoadingSkeleton } from '../../components/loading-skeleton/loading-skeleton.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { ScreenHeader } from '../../components/screen-header/screen-header.component'
import { TextAreaField } from '../../components/text-area-field/text-area-field.component'
import { DAY_ACTION_CLASSES } from '../../constants/day-action.constant'
import { ROUTES } from '../../constants/route.constant'
import { useToast } from '../../hooks/feedback/use-toast'
import { useFormSubmit } from '../../hooks/forms/use-form-submit'
import { useIsWideScreen } from '../../hooks/layout/use-is-wide-screen'
import { useGoBack } from '../../hooks/navigation/use-go-back'

type DayActionScreenProps = Readonly<{ planId: string; dayNumber: string }>

// Ação do dia: the action and the tip of a plan day, the optional reflection and the button that completes the
// day. A focused page (720 px at most) on wide screens. Completing replaces the page with the plan, so the
// browser Back does not reopen this form.
export function DayActionScreen({ planId, dayNumber: routeDayNumber }: DayActionScreenProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const showToast = useToast()
  // A direct visit has no previous page of the app to return to, so it goes to the day instead.
  const goBack = useGoBack(() =>
    navigate({
      to: ROUTES.PLAN_DAY,
      params: { planId, dayNumber: routeDayNumber },
      replace: true,
    }),
  )
  const { dayNumber, isValid, data, isPending, isFetching, retry } = usePlanDayRequest(
    planId,
    routeDayNumber,
    goBack,
  )
  const isWide = useIsWideScreen()
  const { control, submit, isSubmitting, isError } = useDayActionForm({
    planId,
    dayNumber,
    showToast,
    // Replaces the page with the plan, so the browser Back does not reopen this form.
    onCompleted: () => navigate({ to: ROUTES.PLAN, params: { planId }, replace: true }),
  })
  const handleSubmit = useFormSubmit(submit)

  const renderBody = () => {
    if (!isValid || (!isPending && data === undefined)) {
      return (
        <div className={DAY_ACTION_CLASSES.CARDS}>
          <ErrorState message={t('common.loadError')} onRetry={retry} isRetrying={isFetching} />
        </div>
      )
    }
    if (data === undefined) {
      return (
        <div className={DAY_ACTION_CLASSES.CARDS}>
          <LoadingSkeleton className={DAY_ACTION_CLASSES.SKELETON_ACTION_CARD} />
          <LoadingSkeleton className={DAY_ACTION_CLASSES.SKELETON_TIP_CARD} />
          <LoadingSkeleton className={DAY_ACTION_CLASSES.SKELETON_FIELD} />
          <LoadingSkeleton className={DAY_ACTION_CLASSES.SKELETON_BUTTON} />
        </div>
      )
    }
    const isCompleted = data.completion !== null
    const check = PLAN_DAY_ICONS.ACTION_CHECK
    const tip = PLAN_DAY_ICONS.TIP

    const reflectionBlock = (
      <div key="reflection" className={DAY_ACTION_CLASSES.REFLECTION}>
        {isCompleted ? (
          <TextAreaField
            testID={TEST_IDS.DAY_ACTION_REFLECTION}
            label={t('screen.dayAction.reflectionLabel')}
            value={data.completion?.reflection ?? ''}
            maxLength={DAY_ACTION_REFLECTION_MAXIMUM_LENGTH}
            isReadOnly
          />
        ) : (
          <Controller
            control={control}
            name="reflection"
            render={({ field, fieldState }) => (
              <TextAreaField
                testID={TEST_IDS.DAY_ACTION_REFLECTION}
                label={t('screen.dayAction.reflectionLabel')}
                placeholder={t('screen.dayAction.reflectionPlaceholder')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                errorMessage={translateFormError(t, fieldState.error?.message)}
                maxLength={DAY_ACTION_REFLECTION_MAXIMUM_LENGTH}
              />
            )}
          />
        )}
      </div>
    )
    const footerBlock = (
      <div key="footer" className={DAY_ACTION_CLASSES.FOOTER}>
        <PrimaryButton
          testID={TEST_IDS.DAY_ACTION_COMPLETE_BUTTON}
          label={t(isCompleted ? 'screen.dayAction.completed' : 'screen.dayAction.complete')}
          tone="accent"
          size="medium"
          isFullWidth
          isDisabled={isCompleted}
          isLoading={isSubmitting}
          isSubmit
        />
        {isError ? (
          <p
            data-testid={TEST_IDS.DAY_ACTION_ERROR}
            role="status"
            aria-live="polite"
            className={DAY_ACTION_CLASSES.ERROR}
          >
            {t('screen.dayAction.saveError')}
          </p>
        ) : null}
      </div>
    )

    return (
      <>
        <div className={DAY_ACTION_CLASSES.CARDS}>
          <div className={DAY_ACTION_CLASSES.ACTION_CARD}>
            <svg
              className={DAY_ACTION_CLASSES.CHECK}
              viewBox={`0 0 ${check.VIEW_BOX_SIZE} ${check.VIEW_BOX_SIZE}`}
              aria-hidden="true"
              focusable="false"
            >
              <circle
                cx={DAY_ACTION_CLASSES.CHECK_CENTER}
                cy={DAY_ACTION_CLASSES.CHECK_CENTER}
                r={DAY_ACTION_CLASSES.CHECK_RADIUS}
                fill={colors.dayActionCheck}
              />
              <path
                d={check.PATH}
                fill="none"
                stroke={colors.white}
                strokeWidth={check.STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p data-testid={TEST_IDS.DAY_ACTION_TEXT} className={DAY_ACTION_CLASSES.ACTION_TEXT}>
              {data.action}
            </p>
          </div>
          <div className={DAY_ACTION_CLASSES.TIP_CARD}>
            <svg
              className={DAY_ACTION_CLASSES.TIP_ICON}
              viewBox={`0 0 ${tip.VIEW_BOX_WIDTH} ${tip.VIEW_BOX_HEIGHT}`}
              aria-hidden="true"
              focusable="false"
            >
              <path
                d={tip.PATH}
                fill="none"
                stroke={colors.dayTipIcon}
                strokeWidth={tip.STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className={DAY_ACTION_CLASSES.TIP_TITLE}>{t('screen.dayAction.tipTitle')}</h2>
            <p data-testid={TEST_IDS.DAY_ACTION_TIP} className={DAY_ACTION_CLASSES.TIP_TEXT}>
              {t('screen.dayAction.tipQuote', { tip: data.tip })}
            </p>
          </div>
        </div>
        {/* The app puts the button before the reflection; a wide page is a form, so the field comes first. */}
        <form noValidate onSubmit={handleSubmit} className={DAY_ACTION_CLASSES.FORM}>
          {isWide ? [reflectionBlock, footerBlock] : [footerBlock, reflectionBlock]}
        </form>
      </>
    )
  }

  return (
    <div data-testid={TEST_IDS.DAY_ACTION_SCREEN} className={DAY_ACTION_CLASSES.SCREEN}>
      <div className={DAY_ACTION_CLASSES.PAGE}>
        <ScreenHeader
          title={t('screen.dayAction.headerTitle')}
          isHeading
          leftIcon="back"
          onLeftPress={goBack}
        />
        {renderBody()}
      </div>
    </div>
  )
}
