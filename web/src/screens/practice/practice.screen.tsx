import {
  colors,
  formatClock,
  formatPracticeDuration,
  PRACTICE_ICONS,
  PRACTICE_PLAY_LABEL_KEYS,
  TEST_IDS,
  usePracticeSession,
} from '@clavis-via/shared'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '../../components/error-state/error-state.component'
import { LoadingSkeleton } from '../../components/loading-skeleton/loading-skeleton.component'
import { PracticePlayButton } from '../../components/practice-play-button/practice-play-button.component'
import { ProgressBar } from '../../components/progress-bar/progress-bar.component'
import { ScreenHeader } from '../../components/screen-header/screen-header.component'
import { PRACTICE_CLASSES, PRACTICE_WAVES_VIEW_BOX_HEIGHT } from '../../constants/practice.constant'
import { ROUTES } from '../../constants/route.constant'
import { useGoBack } from '../../hooks/navigation/use-go-back'
import { usePauseWhenHidden } from '../../hooks/practice/use-pause-when-hidden'
import { usePracticeAudio } from '../../hooks/practice/use-practice-audio'

type PracticeScreenProps = Readonly<{ practiceId: string }>

const WIND = PRACTICE_ICONS.WIND
const WAVES = PRACTICE_ICONS.WAVES

// Prática de hoje: the title, length and description of a practice, a big play/pause button and a progress
// bar that runs from 0:00 to the length of the practice. When it finishes the practice is recorded once. A
// focused panel (640 px at most) on wide screens; the full-screen player of the app on a phone.
export function PracticeScreen({ practiceId }: PracticeScreenProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // A direct visit has no previous page of the app to return to, so the X goes home instead.
  const goBack = useGoBack(() => navigate({ to: ROUTES.HOME, replace: true }))
  const audio = usePracticeAudio()
  const {
    data,
    isPending,
    isFetching,
    refetch,
    elapsedSeconds,
    playState,
    onPlayPress,
    pause,
    recordPractice,
    isSaving,
    hasSaveError,
    isSaved,
  } = usePracticeSession({ practiceId, audio })
  usePauseWhenHidden(pause)

  const renderBody = () => {
    if (!isPending && data === undefined) {
      return (
        <div className={PRACTICE_CLASSES.ERROR_BLOCK}>
          <ErrorState
            message={t('common.loadError')}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        </div>
      )
    }
    if (data === undefined) {
      return (
        <div className={PRACTICE_CLASSES.TOP_BLOCK}>
          <LoadingSkeleton className={PRACTICE_CLASSES.SKELETON_CIRCLE} />
          <LoadingSkeleton className={PRACTICE_CLASSES.SKELETON_TITLE} />
          {PRACTICE_CLASSES.SKELETON_KEYS.map((key) => (
            <LoadingSkeleton key={key} className={PRACTICE_CLASSES.SKELETON_LINE} />
          ))}
        </div>
      )
    }
    return (
      <>
        <div className={PRACTICE_CLASSES.TOP_BLOCK}>
          <div className={PRACTICE_CLASSES.ICON_CIRCLE}>
            <svg
              className={PRACTICE_CLASSES.ICON}
              preserveAspectRatio="none"
              viewBox={`0 0 ${WIND.VIEW_BOX_WIDTH} ${WIND.VIEW_BOX_HEIGHT}`}
              aria-hidden="true"
              focusable="false"
            >
              <path
                d={WIND.PATH}
                fill="none"
                stroke={colors.practiceIcon}
                strokeWidth={WIND.STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 data-testid={TEST_IDS.PRACTICE_TITLE} className={PRACTICE_CLASSES.TITLE}>
            {data.title}
          </h2>
          <p data-testid={TEST_IDS.PRACTICE_DURATION} className={PRACTICE_CLASSES.DURATION}>
            {formatPracticeDuration(data.durationSeconds, t)}
          </p>
          <p data-testid={TEST_IDS.PRACTICE_DESCRIPTION} className={PRACTICE_CLASSES.DESCRIPTION}>
            {data.description}
          </p>
        </div>
        <div className={PRACTICE_CLASSES.BOTTOM_BLOCK}>
          {hasSaveError ? (
            <div data-testid={TEST_IDS.PRACTICE_SAVE_ERROR}>
              <ErrorState
                message={t('screen.practice.saveError')}
                onRetry={recordPractice}
                isRetrying={isSaving}
              />
            </div>
          ) : null}
          {isSaved ? (
            <p
              data-testid={TEST_IDS.PRACTICE_DONE}
              role="status"
              aria-live="polite"
              className={PRACTICE_CLASSES.MESSAGE}
            >
              {t('screen.practice.done')}
            </p>
          ) : null}
          <PracticePlayButton
            state={playState}
            label={t(PRACTICE_PLAY_LABEL_KEYS[playState])}
            onPress={onPlayPress}
          />
          <div className={PRACTICE_CLASSES.PROGRESS_ROW}>
            <span data-testid={TEST_IDS.PRACTICE_ELAPSED} className={PRACTICE_CLASSES.LABEL}>
              {formatClock(elapsedSeconds)}
            </span>
            <ProgressBar
              variant="practice"
              progress={elapsedSeconds / data.durationSeconds}
              accessibilityLabel={t('screen.practice.progress')}
            />
            <span
              data-testid={TEST_IDS.PRACTICE_TOTAL}
              className={`${PRACTICE_CLASSES.LABEL} ${PRACTICE_CLASSES.LABEL_END}`}
            >
              {formatClock(data.durationSeconds)}
            </span>
          </div>
        </div>
      </>
    )
  }

  return (
    <div data-testid={TEST_IDS.PRACTICE_SCREEN} className={PRACTICE_CLASSES.SCREEN}>
      <div className={PRACTICE_CLASSES.PANEL_WRAPPER}>
        <div className={PRACTICE_CLASSES.PANEL}>
          <svg
            className={PRACTICE_CLASSES.WAVES}
            viewBox={`0 0 ${WAVES.VIEW_BOX_WIDTH} ${PRACTICE_WAVES_VIEW_BOX_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path d={WAVES.BLUE_PATH} fill={colors.practiceWaveBlue} />
            <path d={WAVES.PINK_PATH} fill={colors.practiceWavePink} />
          </svg>
          <div className={PRACTICE_CLASSES.HEADER}>
            <ScreenHeader
              title={t('screen.practice.headerTitle')}
              isHeading
              leftIcon="close"
              onLeftPress={goBack}
            />
          </div>
          <div className={PRACTICE_CLASSES.CONTENT}>{renderBody()}</div>
        </div>
      </div>
    </div>
  )
}
