import {
  GREETING_KEYS,
  greetingPeriod,
  TEST_IDS,
  useCurrentPlan,
  useNow,
  useTodayCheckIn,
  useVerseOfDay,
} from '@clavis-via/shared'
import { useUser } from '@clerk/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BrandKey } from '../../components/brand-key/brand-key.component'
import { CurrentPlanCard } from '../../components/current-plan-card/current-plan-card.component'
import { DailyKeyCard } from '../../components/daily-key-card/daily-key-card.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { HeaderIconButton } from '../../components/header-icon-button/header-icon-button.component'
import { LoadingSkeleton } from '../../components/loading-skeleton/loading-skeleton.component'
import { UserAvatar } from '../../components/user-avatar/user-avatar.component'
import { VerseCard } from '../../components/verse-card/verse-card.component'
import { HOME_CLASSES, HOME_METRICS } from '../../constants/home.constant'
import { SHELL_METRICS } from '../../constants/layout.constant'
import { ROUTES } from '../../constants/route.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'
import { useIsWideScreen } from '../../hooks/layout/use-is-wide-screen'

// Início: greeting and three cards (today's key, the verse of the day and the plan in progress), each with its
// own loading and error state. From the wide breakpoint it is a dashboard: the key as the large card on the left,
// the verse and the plan stacked on the right. On a phone it is the app's layout, with the brand and the avatar
// in the top header (on a wide screen they live in the side navigation).
export function HomeScreen() {
  const { t } = useTranslation()
  const { user } = useUser()
  const isWide = useIsWideScreen()
  const showComingSoon = useComingSoon()
  const now = useNow()
  const { data, isPending, isError, isFetching, refetch } = useTodayCheckIn()
  const verse = useVerseOfDay()
  const currentPlan = useCurrentPlan()

  const firstName = user?.firstName?.trim()
  const greetingKeys = GREETING_KEYS[greetingPeriod(now)]

  const bell = (
    <HeaderIconButton
      icon="bell"
      onPress={showComingSoon}
      accessibilityLabel={t('screen.home.notifications')}
    />
  )

  const renderKeyCard = () => {
    if (isPending) {
      return <LoadingSkeleton className={HOME_CLASSES.KEY_SKELETON} />
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
    if (data === null) {
      return (
        <DailyKeyCard
          label={t('screen.home.keyLabel')}
          title={t('screen.home.inviteTitle')}
          text={t('screen.home.inviteText')}
          buttonLabel={t('screen.home.inviteButton')}
          buttonLinkProps={{ to: ROUTES.CHECK_IN }}
        />
      )
    }
    return (
      <DailyKeyCard
        label={t('screen.home.keyLabel')}
        title={data.dailyKey.title}
        text={data.dailyKey.text}
        buttonLabel={t('screen.home.practiceButton')}
        buttonLinkProps={{
          to: ROUTES.PRACTICE,
          params: { practiceId: data.dailyKey.practice.id },
        }}
      />
    )
  }

  const renderVerseCard = () => {
    if (verse.isPending) {
      return <LoadingSkeleton className={HOME_CLASSES.VERSE_SKELETON} />
    }
    if (verse.isError) {
      return (
        <ErrorState
          message={t('common.loadError')}
          onRetry={() => verse.refetch()}
          isRetrying={verse.isFetching}
        />
      )
    }
    return (
      <VerseCard
        text={verse.data.text}
        reference={verse.data.reference}
        onPlayPress={showComingSoon}
      />
    )
  }

  const renderCurrentPlanCard = () => {
    if (currentPlan.isPending) {
      return <LoadingSkeleton className={HOME_CLASSES.PLAN_SKELETON} />
    }
    if (currentPlan.isError) {
      return (
        <ErrorState
          message={t('common.loadError')}
          onRetry={() => currentPlan.refetch()}
          isRetrying={currentPlan.isFetching}
        />
      )
    }
    const plan = currentPlan.data
    return (
      <CurrentPlanCard
        plan={plan}
        linkProps={
          plan ? { to: ROUTES.PLAN, params: { planId: plan.planId } } : { to: ROUTES.PLANS }
        }
      />
    )
  }

  return (
    <div className={HOME_CLASSES.PAGE}>
      {isWide ? null : (
        <header className={HOME_CLASSES.PHONE_HEADER}>
          <div className={HOME_CLASSES.PHONE_BRAND}>
            <BrandKey width={HOME_METRICS.PHONE_KEY_WIDTH} />
            <span className={HOME_CLASSES.PHONE_BRAND_TEXT}>{t('welcome.brand')}</span>
          </div>
          <div className={HOME_CLASSES.PHONE_ACTIONS}>
            {bell}
            <Link
              to={ROUTES.PROFILE}
              aria-label={t('screen.home.profile')}
              className={HOME_CLASSES.AVATAR_BUTTON}
            >
              <UserAvatar size={SHELL_METRICS.AVATAR_SIZE} />
            </Link>
          </div>
        </header>
      )}
      <div className={isWide ? HOME_CLASSES.WIDE_HEADER : HOME_CLASSES.PHONE_GREETING_BLOCK}>
        <div className={HOME_CLASSES.SLOT}>
          <h1 data-testid={TEST_IDS.HOME_GREETING} className={HOME_CLASSES.GREETING}>
            {t(firstName ? greetingKeys.named : greetingKeys.anonymous, { name: firstName })}
          </h1>
          <p className={HOME_CLASSES.SUBTITLE}>{t('screen.home.subtitle')}</p>
        </div>
        {isWide ? bell : null}
      </div>
      <div className={HOME_CLASSES.GRID}>
        <div className={HOME_CLASSES.KEY_SLOT}>{renderKeyCard()}</div>
        <div className={HOME_CLASSES.SIDE_COLUMN}>
          <div className={HOME_CLASSES.SLOT}>{renderVerseCard()}</div>
          <div className={HOME_CLASSES.SLOT}>{renderCurrentPlanCard()}</div>
        </div>
      </div>
    </div>
  )
}
