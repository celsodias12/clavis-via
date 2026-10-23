import { TEST_IDS } from '@clavis-via/shared'
import type { ProgressBarVariant } from '../../@types/component.type'
import { HOME_METRICS, PROGRESS_BAR_CLASSES } from '../../constants/home.constant'
import { PRACTICE_PROGRESS_BAR_CLASSES } from '../../constants/practice.constant'

type ProgressBarProps = Readonly<{
  // From 0 to 1; anything outside is held to the nearest end.
  progress: number
  // Read by assistive technology.
  accessibilityLabel: string
  variant?: ProgressBarVariant
}>

// Track with a fill (and a knob at the end of it in the practice variant). It stretches to the width its parent
// gives it. Built from inline elements so it can sit inside a button.
export function ProgressBar({ progress, accessibilityLabel, variant = 'card' }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress))
  const percent = clamped * HOME_METRICS.PERCENT
  const isPractice = variant === 'practice'

  const fill = (
    <span
      data-testid={TEST_IDS.PROGRESS_BAR_FILL}
      style={{ width: `${percent}%` }}
      className={isPractice ? PRACTICE_PROGRESS_BAR_CLASSES.FILL : PROGRESS_BAR_CLASSES.FILL}
    />
  )

  return (
    <span
      data-testid={TEST_IDS.PROGRESS_BAR}
      role="progressbar"
      aria-label={accessibilityLabel}
      aria-valuemin={0}
      aria-valuemax={HOME_METRICS.PERCENT}
      aria-valuenow={Math.round(percent)}
      className={isPractice ? PRACTICE_PROGRESS_BAR_CLASSES.ROOT : PROGRESS_BAR_CLASSES.TRACK}
    >
      {isPractice ? (
        <>
          <span className={PRACTICE_PROGRESS_BAR_CLASSES.TRACK}>{fill}</span>
          <span
            data-testid={TEST_IDS.PROGRESS_BAR_KNOB}
            style={{ left: `${percent}%` }}
            className={PRACTICE_PROGRESS_BAR_CLASSES.KNOB}
          />
        </>
      ) : (
        fill
      )}
    </span>
  )
}
