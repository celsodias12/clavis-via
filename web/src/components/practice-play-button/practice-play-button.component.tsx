import {
  colors,
  PRACTICE_ICONS,
  PRACTICE_PLAY_STATES,
  type PracticePlayState,
  TEST_IDS,
} from '@clavis-via/shared'
import { PRACTICE_CLASSES, PRACTICE_PLAY_GRADIENT_ID } from '../../constants/practice.constant'

type PracticePlayButtonProps = Readonly<{
  state: PracticePlayState
  // The accessible name: what the button does now.
  label: string
  onPress: () => void
}>

const ICON = PRACTICE_ICONS.PLAY_BUTTON

function renderGlyph(state: PracticePlayState) {
  if (state === PRACTICE_PLAY_STATES.AGAIN) {
    return (
      <>
        <path
          d={ICON.REPLAY_ARC_PATH}
          fill="none"
          stroke={colors.white}
          strokeWidth={ICON.REPLAY_STROKE_WIDTH}
          strokeLinecap="round"
        />
        <path d={ICON.REPLAY_ARROW_PATH} fill={colors.white} />
      </>
    )
  }
  if (state === PRACTICE_PLAY_STATES.PAUSE) {
    return [-1, 1].map((side) => (
      <rect
        key={side}
        x={side * ICON.PAUSE_BAR_OFFSET - ICON.PAUSE_BAR_WIDTH / 2}
        y={-ICON.PAUSE_BAR_HEIGHT / 2}
        width={ICON.PAUSE_BAR_WIDTH}
        height={ICON.PAUSE_BAR_HEIGHT}
        rx={ICON.PAUSE_BAR_RADIUS}
        fill={colors.white}
      />
    ))
  }
  return (
    <path
      d={ICON.PLAY_PATH}
      fill={colors.white}
      stroke={colors.white}
      strokeWidth={ICON.PLAY_STROKE_WIDTH}
      strokeLinejoin="round"
    />
  )
}

// The big round button of the practice player: play, pause or replay on a blue gradient disc with a white ring.
export function PracticePlayButton({ state, label, onPress }: PracticePlayButtonProps) {
  const half = ICON.VIEW_BOX_SIZE / 2

  return (
    <button
      type="button"
      data-testid={TEST_IDS.PRACTICE_PLAY_BUTTON}
      aria-label={label}
      onClick={onPress}
      className={PRACTICE_CLASSES.PLAY_BUTTON}
    >
      <svg
        width={PRACTICE_CLASSES.PLAY_SIZE}
        height={PRACTICE_CLASSES.PLAY_SIZE}
        viewBox={`${-half} ${-half} ${ICON.VIEW_BOX_SIZE} ${ICON.VIEW_BOX_SIZE}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={PRACTICE_PLAY_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={colors.practicePlayTop} />
            <stop offset="1" stopColor={colors.practicePlayBottom} />
          </linearGradient>
        </defs>
        <circle
          cx={0}
          cy={0}
          r={ICON.DISC_DIAMETER / 2 + ICON.RING_WIDTH}
          fill={colors.practicePlayRing}
        />
        <circle
          cx={0}
          cy={0}
          r={ICON.DISC_DIAMETER / 2}
          fill={`url(#${PRACTICE_PLAY_GRADIENT_ID})`}
        />
        {renderGlyph(state)}
      </svg>
    </button>
  )
}
