import {
  CHECK_IN_OPTION_BY_STATE,
  type CheckInState,
  EMOTION_ICON_METRICS,
  EMOTION_SHAPE_KINDS,
  EMOTION_SHAPES,
  TEST_IDS,
} from '@clavis-via/shared'

type EmotionIconProps = Readonly<{
  state: CheckInState
  // Side of the square icon, in any CSS length.
  size: string
}>

const HALF_BOX = EMOTION_ICON_METRICS.VIEW_BOX_SIZE / 2

// Decorative face of an emotion, drawn with SVG shapes measured on the design (see EMOTION_SHAPES).
export function EmotionIcon({ state, size }: EmotionIconProps) {
  const { fill, ink } = CHECK_IN_OPTION_BY_STATE[state].iconColors

  return (
    <svg
      data-testid={TEST_IDS.EMOTION_ICON}
      width={size}
      height={size}
      viewBox={`${-HALF_BOX} ${-HALF_BOX} ${EMOTION_ICON_METRICS.VIEW_BOX_SIZE} ${EMOTION_ICON_METRICS.VIEW_BOX_SIZE}`}
      aria-hidden="true"
      focusable="false"
    >
      {EMOTION_SHAPES[state].map((shape) => {
        switch (shape.kind) {
          case EMOTION_SHAPE_KINDS.FACE:
            return <circle key={shape.kind} cx={0} cy={0} r={shape.radius} fill={fill} />
          case EMOTION_SHAPE_KINDS.DOT:
            return (
              <ellipse
                key={`${shape.kind}-${shape.centerX}-${shape.centerY}`}
                cx={shape.centerX}
                cy={shape.centerY}
                rx={shape.radiusX}
                ry={shape.radiusY}
                fill={ink}
              />
            )
          case EMOTION_SHAPE_KINDS.STROKE:
            return (
              <path
                key={shape.path}
                d={shape.path}
                fill="none"
                stroke={ink}
                strokeWidth={shape.width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          default:
            return <path key={shape.path} d={shape.path} fill={fill} />
        }
      })}
    </svg>
  )
}
