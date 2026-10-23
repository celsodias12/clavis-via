import { TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import type { ProgressBarVariant } from '../../@types/component.type'
import { CURRENT_PLAN_CARD_LAYOUT } from '../../constants/home-layout.constant'
import { PROGRESS_BAR_METRICS } from '../../constants/practice-layout.constant'
import { scaleDesignValue } from '../../utils/design'

type ProgressBarProps = Readonly<{
  // From 0 to 1; anything outside is held to the nearest end.
  progress: number
  // The practice bar is thin with a knob at the end of the fill; the card bar (Início) is thicker, with no knob.
  variant?: ProgressBarVariant
  // Read by assistive technology; defaults to the practice progress.
  accessibilityLabel?: string
}>

// Track with a fill (and a knob at the end of it). It stretches to the width its parent gives it.
export function ProgressBar({
  progress,
  variant = 'practice',
  accessibilityLabel,
}: ProgressBarProps) {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()

  const isCard = variant === 'card'
  const clamped = Math.min(1, Math.max(0, progress))
  const fillPercent = clamped * PROGRESS_BAR_METRICS.FULL_PERCENT

  return (
    <View
      testID={TEST_IDS.PROGRESS_BAR}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? t('screen.practice.progress')}
      accessibilityValue={{
        min: 0,
        max: PROGRESS_BAR_METRICS.FULL_PERCENT,
        now: Math.round(clamped * PROGRESS_BAR_METRICS.FULL_PERCENT),
      }}
      style={styles.container(width, isCard)}
    >
      <View style={styles.track(width, isCard)} />
      <View testID={TEST_IDS.PROGRESS_BAR_FILL} style={styles.fill(width, fillPercent, isCard)} />
      {isCard ? null : (
        <View testID={TEST_IDS.PROGRESS_BAR_KNOB} style={styles.knob(width, fillPercent)} />
      )}
    </View>
  )
}

// Height of the track, in design units.
const trackHeightOf = (isCard: boolean) =>
  isCard ? CURRENT_PLAN_CARD_LAYOUT.BAR_HEIGHT : PROGRESS_BAR_METRICS.TRACK_HEIGHT

const styles = StyleSheet.create((theme) => ({
  // The practice bar is as tall as its knob; the card bar is just its track.
  container: (width: number, isCard: boolean) => ({
    height: scaleDesignValue(
      isCard ? CURRENT_PLAN_CARD_LAYOUT.BAR_HEIGHT : PROGRESS_BAR_METRICS.KNOB_DIAMETER,
      width,
    ),
    justifyContent: 'center',
  }),
  track: (width: number, isCard: boolean) => ({
    height: scaleDesignValue(trackHeightOf(isCard), width),
    borderRadius: scaleDesignValue(trackHeightOf(isCard), width) / 2,
    backgroundColor: isCard ? theme.colors.homeProgressTrack : theme.colors.practiceTrack,
  }),
  fill: (width: number, fillPercent: number, isCard: boolean) => ({
    position: 'absolute',
    left: 0,
    width: `${fillPercent}%`,
    height: scaleDesignValue(trackHeightOf(isCard), width),
    borderRadius: scaleDesignValue(trackHeightOf(isCard), width) / 2,
    backgroundColor: isCard ? theme.colors.homeProgressFill : theme.colors.practiceFill,
  }),
  knob: (width: number, fillPercent: number) => ({
    position: 'absolute',
    left: `${fillPercent}%`,
    marginLeft: -scaleDesignValue(PROGRESS_BAR_METRICS.KNOB_DIAMETER, width) / 2,
    width: scaleDesignValue(PROGRESS_BAR_METRICS.KNOB_DIAMETER, width),
    height: scaleDesignValue(PROGRESS_BAR_METRICS.KNOB_DIAMETER, width),
    borderRadius: scaleDesignValue(PROGRESS_BAR_METRICS.KNOB_DIAMETER, width) / 2,
    backgroundColor: theme.colors.practiceKnob,
  }),
}))
