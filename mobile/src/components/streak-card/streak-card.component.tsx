import {
  JOURNEY_ICON_PATHS,
  type JourneyWeekDay,
  TEST_IDS,
  WEEKDAY_LABEL_KEYS,
} from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { DESIGN } from '../../constants/design.constant'
import { JOURNEY_STREAK_LAYOUT } from '../../constants/journey-layout.constant'
import { scaleDesignValue } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'

type StreakCardProps = Readonly<{
  streakDays: number
  // The seven days of the week, Monday to Sunday.
  week: readonly JourneyWeekDay[]
  onCalendarPress: () => void
}>

// The "dias consecutivos" card: the streak, the calendar button and a dot for each day of the week, filled with
// a check on the days with a check-in. The parent gives it the card box; everything inside is placed from the
// reference measurements.
export function StreakCard({ streakDays, week, onCalendarPress }: StreakCardProps) {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()

  const layout = JOURNEY_STREAK_LAYOUT
  const calendarSize = scaleDesignValue(layout.CALENDAR_SIZE, width)
  const checkSize = scaleDesignValue(layout.DAY_CHECK_SIZE, width)

  return (
    <View testID={TEST_IDS.JOURNEY_STREAK} style={styles.shadow}>
      <View style={styles.card}>
        <View style={styles.headline}>
          <AppText variant="title" testID={TEST_IDS.JOURNEY_STREAK_NUMBER} style={styles.number}>
            {String(streakDays)}
          </AppText>
          <AppText variant="bodyMedium" style={styles.label}>
            {t('screen.journey.streakLabel', { count: streakDays })}
          </AppText>
        </View>
        <Pressable
          testID={TEST_IDS.JOURNEY_CALENDAR}
          accessibilityRole="button"
          accessibilityLabel={t('screen.journey.calendar')}
          hitSlop={layout.CALENDAR_HIT_SLOP}
          onPress={onCalendarPress}
          style={styles.calendar}
        >
          <Svg
            width={calendarSize}
            height={calendarSize}
            viewBox={`0 0 ${layout.CALENDAR_VIEW_BOX_SIZE} ${layout.CALENDAR_VIEW_BOX_SIZE}`}
          >
            <Path
              d={JOURNEY_ICON_PATHS.CALENDAR}
              fill="none"
              stroke={theme.colors.journeyCalendarIcon}
              strokeWidth={layout.CALENDAR_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
        <View style={styles.days}>
          {week.map((day, index) => {
            const weekday = t(WEEKDAY_LABEL_KEYS[index])
            return (
              <View
                key={day.localDate}
                testID={`${TEST_IDS.JOURNEY_DAY_PREFIX}${day.localDate}`}
                accessible
                accessibilityLabel={t(
                  day.hasCheckIn
                    ? 'screen.journey.dayWithCheckIn'
                    : 'screen.journey.dayWithoutCheckIn',
                  { day: weekday },
                )}
                style={styles.day}
              >
                <View style={styles.dot(day.hasCheckIn)}>
                  {day.hasCheckIn ? (
                    <View
                      testID={`${TEST_IDS.JOURNEY_DAY_PREFIX}${day.localDate}${TEST_IDS.JOURNEY_DAY_DONE_SUFFIX}`}
                    >
                      <Svg
                        width={checkSize}
                        height={checkSize}
                        viewBox={`0 0 ${layout.DAY_CHECK_VIEW_BOX_SIZE} ${layout.DAY_CHECK_VIEW_BOX_SIZE}`}
                      >
                        <Path
                          d={JOURNEY_ICON_PATHS.CHECK}
                          fill="none"
                          stroke={theme.colors.white}
                          strokeWidth={layout.DAY_CHECK_STROKE_WIDTH}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                  ) : null}
                </View>
                <AppText variant="bodyMedium" style={styles.dayLabel}>
                  {weekday}
                </AppText>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const layout = JOURNEY_STREAK_LAYOUT
  const gradientStops = theme.colors.journeyStreakGradient
    .map((stop) => `${stop.color} ${stop.offset * 100}%`)
    .join(', ')
  const dayWidth = layout.DAYS_WIDTH / 7
  const numberTop =
    (layout.NUMBER_BASELINE - AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * layout.NUMBER_FONT_SIZE) *
    scale
  const dayLabelTop =
    (layout.DAY_LABEL_BASELINE -
      layout.DAY_TOP -
      layout.DAY_DIAMETER -
      AUTHENTICATION_FONT_METRICS.BODY_ASCENT * layout.DAY_LABEL_FONT_SIZE) *
    scale

  return {
    // The card clips its content, so the shadow lives on the box around it.
    shadow: {
      flex: 1,
      borderRadius: layout.RADIUS * scale,
      boxShadow: `0 ${layout.SHADOW_OFFSET_Y * scale}px ${layout.SHADOW_BLUR * scale}px ${theme.colors.planCardShadow}`,
    },
    card: {
      flex: 1,
      borderRadius: layout.RADIUS * scale,
      overflow: 'hidden',
      backgroundColor: theme.colors.journeyStreakGradient[0].color,
      experimental_backgroundImage: `linear-gradient(${layout.GRADIENT_ANGLE}, ${gradientStops})`,
    },
    // The number and its label are laid out in a row that starts at the number's line box top.
    headline: {
      position: 'absolute',
      left: layout.CONTENT_LEFT * scale,
      top: numberTop,
      flexDirection: 'row',
      alignItems: 'baseline',
      columnGap: layout.NUMBER_LABEL_GAP * scale,
    },
    number: {
      fontSize: layout.NUMBER_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    label: {
      top: -layout.LABEL_RAISE * scale,
      fontSize: layout.LABEL_FONT_SIZE * scale,
      color: theme.colors.homeCardLabel,
    },
    calendar: {
      position: 'absolute',
      right: layout.CALENDAR_RIGHT * scale,
      top: layout.CALENDAR_TOP * scale,
    },
    days: {
      position: 'absolute',
      left: layout.DAYS_LEFT * scale,
      top: layout.DAY_TOP * scale,
      width: layout.DAYS_WIDTH * scale,
      flexDirection: 'row',
    },
    day: { width: dayWidth * scale, alignItems: 'center' },
    dot: (hasCheckIn: boolean) => ({
      width: layout.DAY_DIAMETER * scale,
      height: layout.DAY_DIAMETER * scale,
      borderRadius: (layout.DAY_DIAMETER / 2) * scale,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hasCheckIn ? theme.colors.emotionsSegmentSolid : 'transparent',
      borderWidth: hasCheckIn ? 0 : layout.DAY_RING_WIDTH * scale,
      borderColor: theme.colors.journeyDayEmptyRing,
    }),
    dayLabel: {
      marginTop: dayLabelTop,
      fontSize: layout.DAY_LABEL_FONT_SIZE * scale,
      color: theme.colors.journeyDayLabel,
    },
  }
})
