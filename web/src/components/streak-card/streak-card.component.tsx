import {
  colors,
  JOURNEY_ICON_PATHS,
  type JourneyWeekDay,
  TEST_IDS,
  WEEKDAY_LABEL_KEYS,
} from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import {
  GRADIENT_PERCENT,
  JOURNEY_GRADIENT_ANGLE,
  STREAK_CARD_CLASSES,
} from '../../constants/journey.constant'
import { AppIcon } from '../app-icon/app-icon.component'

type StreakCardProps = Readonly<{
  streakDays: number
  // The seven days of the week, Monday to Sunday.
  week: readonly JourneyWeekDay[]
  onCalendarPress: () => void
}>

const BACKGROUND = `linear-gradient(${JOURNEY_GRADIENT_ANGLE}, ${colors.journeyStreakGradient
  .map((stop) => `${stop.color} ${stop.offset * GRADIENT_PERCENT}%`)
  .join(', ')})`

// The "dias consecutivos" card: the streak, the calendar button and a dot for each day of the week, filled with
// a check on the days with a check-in.
export function StreakCard({ streakDays, week, onCalendarPress }: StreakCardProps) {
  const { t } = useTranslation()

  return (
    <div data-testid={TEST_IDS.JOURNEY_STREAK} className={STREAK_CARD_CLASSES.SHADOW}>
      <div
        className={STREAK_CARD_CLASSES.CARD}
        style={{
          backgroundColor: colors.journeyStreakGradient[0].color,
          backgroundImage: BACKGROUND,
        }}
      >
        <div className={STREAK_CARD_CLASSES.HEADLINE}>
          <p data-testid={TEST_IDS.JOURNEY_STREAK_NUMBER} className={STREAK_CARD_CLASSES.NUMBER}>
            {streakDays}
          </p>
          <p className={STREAK_CARD_CLASSES.LABEL}>
            {t('screen.journey.streakLabel', { count: streakDays })}
          </p>
        </div>
        <button
          type="button"
          data-testid={TEST_IDS.JOURNEY_CALENDAR}
          aria-label={t('screen.journey.calendar')}
          onClick={onCalendarPress}
          className={STREAK_CARD_CLASSES.CALENDAR}
        >
          <AppIcon
            size={STREAK_CARD_CLASSES.CALENDAR_SIZE}
            paths={[
              {
                d: JOURNEY_ICON_PATHS.CALENDAR,
                stroke: colors.journeyCalendarIcon,
                strokeWidth: STREAK_CARD_CLASSES.CALENDAR_ICON_STROKE_WIDTH,
              },
            ]}
          />
        </button>
        <div className={STREAK_CARD_CLASSES.DAYS}>
          {week.map((day, index) => {
            const weekday = t(WEEKDAY_LABEL_KEYS[index])
            const dayTestID = `${TEST_IDS.JOURNEY_DAY_PREFIX}${day.localDate}`

            return (
              <div
                key={day.localDate}
                data-testid={dayTestID}
                role="img"
                aria-label={t(
                  day.hasCheckIn
                    ? 'screen.journey.dayWithCheckIn'
                    : 'screen.journey.dayWithoutCheckIn',
                  { day: weekday },
                )}
                className={STREAK_CARD_CLASSES.DAY}
              >
                <span
                  className={`${STREAK_CARD_CLASSES.DOT} ${
                    day.hasCheckIn ? STREAK_CARD_CLASSES.DOT_DONE : STREAK_CARD_CLASSES.DOT_EMPTY
                  }`}
                >
                  {day.hasCheckIn ? (
                    <span data-testid={`${dayTestID}${TEST_IDS.JOURNEY_DAY_DONE_SUFFIX}`}>
                      <AppIcon
                        size={STREAK_CARD_CLASSES.CHECK_SIZE}
                        paths={[
                          {
                            d: JOURNEY_ICON_PATHS.CHECK,
                            stroke: colors.white,
                            strokeWidth: STREAK_CARD_CLASSES.CHECK_ICON_STROKE_WIDTH,
                          },
                        ]}
                      />
                    </span>
                  ) : null}
                </span>
                <span className={STREAK_CARD_CLASSES.DAY_LABEL}>{weekday}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
