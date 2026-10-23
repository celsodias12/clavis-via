import { colors, formatClock, PLAN_DAY_ICONS, TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { DAY_VIDEO_COVER_FILES, VIDEO_PLACEHOLDER_CLASSES } from '../../constants/plan-day.constant'

type VideoPlaceholderProps = Readonly<{
  durationSeconds: number
  onPlay: () => void
}>

// The video of a day: a still cover, a play button and the length. There is no player yet, so playing is a notice.
export function VideoPlaceholder({ durationSeconds, onPlay }: VideoPlaceholderProps) {
  const { t } = useTranslation()

  const video = PLAN_DAY_ICONS.VIDEO

  return (
    <div data-testid={TEST_IDS.VIDEO_PLACEHOLDER} className={VIDEO_PLACEHOLDER_CLASSES.CONTAINER}>
      <img
        src={DAY_VIDEO_COVER_FILES.STANDARD}
        srcSet={`${DAY_VIDEO_COVER_FILES.STANDARD} ${DAY_VIDEO_COVER_FILES.STANDARD_WIDTH}w, ${DAY_VIDEO_COVER_FILES.HIGH} ${DAY_VIDEO_COVER_FILES.HIGH_WIDTH}w`}
        sizes={VIDEO_PLACEHOLDER_CLASSES.SIZES}
        alt=""
        className={VIDEO_PLACEHOLDER_CLASSES.COVER}
      />
      <button
        type="button"
        data-testid={TEST_IDS.VIDEO_PLAY}
        aria-label={t('screen.planDay.playVideo')}
        onClick={onPlay}
        className={VIDEO_PLACEHOLDER_CLASSES.PLAY}
      >
        <svg
          viewBox={`0 0 ${video.PLAY_DIAMETER} ${video.PLAY_DIAMETER}`}
          className="size-full"
          aria-hidden="true"
          focusable="false"
        >
          <circle
            cx={video.PLAY_DIAMETER / 2}
            cy={video.PLAY_DIAMETER / 2}
            r={(video.PLAY_DIAMETER - video.PLAY_RING_WIDTH) / 2}
            fill={colors.dayVideoPlayFill}
            stroke={colors.white}
            strokeWidth={video.PLAY_RING_WIDTH}
          />
          <path
            d={video.PLAY_TRIANGLE}
            fill={colors.white}
            stroke={colors.white}
            strokeWidth={video.PLAY_TRIANGLE_STROKE_WIDTH}
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className={VIDEO_PLACEHOLDER_CLASSES.CLOCK}>
        <svg
          width={VIDEO_PLACEHOLDER_CLASSES.CLOCK_SIZE}
          height={VIDEO_PLACEHOLDER_CLASSES.CLOCK_SIZE}
          viewBox={`0 0 ${video.CLOCK_VIEW_BOX_SIZE} ${video.CLOCK_VIEW_BOX_SIZE}`}
          aria-hidden="true"
          focusable="false"
        >
          <circle
            cx={video.CLOCK_VIEW_BOX_SIZE / 2}
            cy={video.CLOCK_VIEW_BOX_SIZE / 2}
            r={video.CLOCK_CIRCLE_RADIUS}
            fill="none"
            stroke={colors.white}
            strokeWidth={video.CLOCK_STROKE_WIDTH}
          />
          <path
            d={video.CLOCK_HANDS}
            fill="none"
            stroke={colors.white}
            strokeWidth={video.CLOCK_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={VIDEO_PLACEHOLDER_CLASSES.CLOCK_TEXT}>
          {t('screen.planDay.clock', { clock: formatClock(durationSeconds) })}
        </span>
      </div>
    </div>
  )
}
