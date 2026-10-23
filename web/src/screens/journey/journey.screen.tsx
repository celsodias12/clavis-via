import {
  JOURNEY_SEGMENT_KEYS,
  JOURNEY_SEGMENTS,
  type JourneyAchievement,
  type JourneySegmentKey,
  TEST_IDS,
  useJourneyOverview,
} from '@clavis-via/shared'
import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AchievementList } from '../../components/achievement-list/achievement-list.component'
import { ErrorState } from '../../components/error-state/error-state.component'
import { LoadingSkeleton } from '../../components/loading-skeleton/loading-skeleton.component'
import { PhraseCard } from '../../components/phrase-card/phrase-card.component'
import { SegmentedControl } from '../../components/segmented-control/segmented-control.component'
import { StreakCard } from '../../components/streak-card/streak-card.component'
import { JOURNEY_CLASSES } from '../../constants/journey.constant'
import { ROUTES } from '../../constants/route.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'

// Minha jornada: the streak of consecutive days with the dots of the week, a phrase and the achievements the
// API computed from the check-ins, plans, practices and actions. From 1024 px the streak and the phrase sit
// side by side with the achievements in a card below. "Minhas emoções" opens its own page and "Minhas
// conquistas" scrolls to the list.
export function JourneyScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const showComingSoon = useComingSoon()
  const { data, isPending, isError, isFetching, refetch } = useJourneyOverview()

  const achievementsReference = useRef<HTMLElement>(null)
  const [selectedKey, setSelectedKey] = useState<JourneySegmentKey>(JOURNEY_SEGMENT_KEYS.OVERVIEW)

  const handleSegmentSelect = (key: string) => {
    if (key === JOURNEY_SEGMENT_KEYS.EMOTIONS) {
      navigate({ to: ROUTES.EMOTIONS })
      return
    }
    setSelectedKey(key as JourneySegmentKey)
    if (key === JOURNEY_SEGMENT_KEYS.ACHIEVEMENTS) {
      achievementsReference.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderAchievements = (achievements: readonly JourneyAchievement[] | undefined) => {
    if (achievements === undefined) {
      return (
        <div data-testid={TEST_IDS.JOURNEY_SKELETON} className={JOURNEY_CLASSES.SKELETON_ROWS}>
          {JOURNEY_CLASSES.SKELETON_KEYS.map((rowKey) => (
            <LoadingSkeleton key={rowKey} className={JOURNEY_CLASSES.SKELETON_ROW} />
          ))}
        </div>
      )
    }
    if (achievements.length === 0) {
      return (
        <p data-testid={TEST_IDS.JOURNEY_ACHIEVEMENTS_EMPTY} className={JOURNEY_CLASSES.EMPTY}>
          {t('screen.journey.empty')}
        </p>
      )
    }
    return <AchievementList achievements={achievements} onAchievementPress={showComingSoon} />
  }

  const renderBody = () => {
    if (isError) {
      return (
        <div className={JOURNEY_CLASSES.STATE}>
          <ErrorState
            message={t('common.loadError')}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        </div>
      )
    }
    return (
      <>
        <div className={JOURNEY_CLASSES.GRID}>
          {isPending ? (
            <>
              <LoadingSkeleton className={JOURNEY_CLASSES.STREAK_SKELETON} />
              <LoadingSkeleton className={JOURNEY_CLASSES.PHRASE_SKELETON} />
            </>
          ) : (
            <StreakCard
              streakDays={data.streakDays}
              week={data.week}
              onCalendarPress={showComingSoon}
            />
          )}
          {isPending ? null : <PhraseCard text={t('screen.journey.phrase')} />}
        </div>
        <section ref={achievementsReference} className={JOURNEY_CLASSES.ACHIEVEMENTS}>
          <div className={JOURNEY_CLASSES.ACHIEVEMENTS_HEADER}>
            <h2 className={JOURNEY_CLASSES.ACHIEVEMENTS_TITLE}>
              {t('screen.journey.achievementsTitle')}
            </h2>
            <button
              type="button"
              data-testid={TEST_IDS.JOURNEY_VIEW_ALL}
              onClick={showComingSoon}
              className={JOURNEY_CLASSES.VIEW_ALL}
            >
              {t('screen.journey.viewAll')}
            </button>
          </div>
          <div className={JOURNEY_CLASSES.LIST}>{renderAchievements(data?.achievements)}</div>
        </section>
      </>
    )
  }

  return (
    <div data-testid={TEST_IDS.JOURNEY_SCREEN} className={JOURNEY_CLASSES.PAGE}>
      <h1 className={JOURNEY_CLASSES.TITLE}>{t('screen.journey.title')}</h1>
      <div className={JOURNEY_CLASSES.SEGMENTS}>
        <SegmentedControl
          segments={JOURNEY_SEGMENTS.map((segment) => ({
            key: segment.key,
            label: t(segment.labelKey),
          }))}
          selectedKey={selectedKey}
          onSelect={handleSegmentSelect}
          variant="solid"
          testIDPrefix={TEST_IDS.JOURNEY_SEGMENT_PREFIX}
        />
      </div>
      {renderBody()}
    </div>
  )
}
