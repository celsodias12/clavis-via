import {
  colors,
  EMOTION_INSIGHT_KINDS,
  type EmotionInsightKind,
  INSIGHT_FACE,
  INSIGHT_ICON_METRICS,
  INSIGHT_SPROUT_PATHS,
  TEST_IDS,
} from '@clavis-via/shared'
import { INSIGHT_CIRCLE_CLASSES, INSIGHT_ROW_CLASSES } from '../../constants/emotions.constant'

type InsightRowProps = Readonly<{
  kind: EmotionInsightKind
  title: string
  text: string
  // Draws the faint line under the row (every row but the last); only a phone list shows it.
  hasDivider?: boolean
}>

// One "Principais percepções" row: a round colored icon (sprout, lavender face, warm face), a title and a text.
export function InsightRow({ kind, title, text, hasDivider = false }: InsightRowProps) {
  const rowTestID = `${TEST_IDS.INSIGHT_ROW_PREFIX}${kind}`
  const faceColors =
    kind === EMOTION_INSIGHT_KINDS.LESS_ANXIETY
      ? { fill: colors.insightAnxietyFill, ink: colors.insightAnxietyInk }
      : { fill: colors.insightRoutineFill, ink: colors.insightRoutineInk }

  return (
    <div data-testid={rowTestID} className={INSIGHT_ROW_CLASSES.ROW}>
      <div className={`${INSIGHT_ROW_CLASSES.CIRCLE} ${INSIGHT_CIRCLE_CLASSES[kind]}`}>
        <svg
          data-testid={`${rowTestID}-icon`}
          width={INSIGHT_ROW_CLASSES.ICON_SIZE}
          height={INSIGHT_ROW_CLASSES.ICON_SIZE}
          viewBox={`0 0 ${INSIGHT_ICON_METRICS.VIEW_BOX_SIZE} ${INSIGHT_ICON_METRICS.VIEW_BOX_SIZE}`}
          aria-hidden="true"
          focusable="false"
        >
          {kind === EMOTION_INSIGHT_KINDS.BALANCED_DAYS ? (
            INSIGHT_SPROUT_PATHS.map((path) => (
              <path
                key={path}
                d={path}
                fill="none"
                stroke={colors.insightBalancedInk}
                strokeWidth={INSIGHT_ICON_METRICS.STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))
          ) : (
            <>
              <circle
                cx={INSIGHT_FACE.CENTER}
                cy={INSIGHT_FACE.CENTER}
                r={INSIGHT_FACE.RADIUS}
                fill={faceColors.fill}
              />
              <circle
                cx={INSIGHT_FACE.EYE_LEFT_X}
                cy={INSIGHT_FACE.EYE_Y}
                r={INSIGHT_FACE.EYE_RADIUS}
                fill={faceColors.ink}
              />
              <circle
                cx={INSIGHT_FACE.EYE_RIGHT_X}
                cy={INSIGHT_FACE.EYE_Y}
                r={INSIGHT_FACE.EYE_RADIUS}
                fill={faceColors.ink}
              />
              {kind === EMOTION_INSIGHT_KINDS.LESS_ANXIETY ? (
                <path
                  d={INSIGHT_FACE.FROWN_PATH}
                  fill="none"
                  stroke={faceColors.ink}
                  strokeWidth={INSIGHT_ICON_METRICS.STROKE_WIDTH}
                  strokeLinecap="round"
                />
              ) : (
                <circle
                  cx={INSIGHT_FACE.CENTER}
                  cy={INSIGHT_FACE.MOUTH_DOT_Y}
                  r={INSIGHT_FACE.MOUTH_DOT_RADIUS}
                  fill={faceColors.ink}
                />
              )}
            </>
          )}
        </svg>
      </div>
      <div className={INSIGHT_ROW_CLASSES.TEXTS}>
        <p className={INSIGHT_ROW_CLASSES.TITLE}>{title}</p>
        <p className={INSIGHT_ROW_CLASSES.TEXT}>{text}</p>
      </div>
      {hasDivider ? (
        <span
          data-testid={`${rowTestID}${TEST_IDS.LIST_ROW_DIVIDER_SUFFIX}`}
          className={INSIGHT_ROW_CLASSES.DIVIDER}
        />
      ) : null}
    </div>
  )
}
