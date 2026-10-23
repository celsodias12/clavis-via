import { EMOTION_INSIGHT_KINDS, type EmotionInsightKind, TEST_IDS } from '@clavis-via/shared'
import { useWindowDimensions, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { DESIGN } from '../../constants/design.constant'
import {
  INSIGHT_FACE,
  INSIGHT_ROW_LAYOUT,
  INSIGHT_SPROUT_PATHS,
} from '../../constants/emotions-layout.constant'
import { scaleDesignValue } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'

type InsightRowProps = Readonly<{
  kind: EmotionInsightKind
  title: string
  text: string
  // Draws the faint line under the row (every row but the last).
  hasDivider?: boolean
}>

// One "Principais percepções" row: a round colored icon (sprout, lavender face, warm face), a title and a text.
export function InsightRow({ kind, title, text, hasDivider = false }: InsightRowProps) {
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()

  const iconSize = scaleDesignValue(INSIGHT_ROW_LAYOUT.ICON_SIZE, width)
  const face = INSIGHT_FACE
  const faceColors =
    kind === EMOTION_INSIGHT_KINDS.LESS_ANXIETY
      ? { fill: theme.colors.insightAnxietyFill, ink: theme.colors.insightAnxietyInk }
      : { fill: theme.colors.insightRoutineFill, ink: theme.colors.insightRoutineInk }
  const circleColor = {
    [EMOTION_INSIGHT_KINDS.BALANCED_DAYS]: theme.colors.insightBalancedCircle,
    [EMOTION_INSIGHT_KINDS.LESS_ANXIETY]: theme.colors.insightAnxietyCircle,
    [EMOTION_INSIGHT_KINDS.ROUTINE_HELPS]: theme.colors.insightRoutineCircle,
  }[kind]

  return (
    <View testID={`${TEST_IDS.INSIGHT_ROW_PREFIX}${kind}`} style={styles.row}>
      <View style={styles.circle(circleColor)}>
        <Svg
          testID={`${TEST_IDS.INSIGHT_ROW_PREFIX}${kind}-icon`}
          width={iconSize}
          height={iconSize}
          viewBox={`0 0 ${INSIGHT_ROW_LAYOUT.ICON_VIEW_BOX_SIZE} ${INSIGHT_ROW_LAYOUT.ICON_VIEW_BOX_SIZE}`}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {kind === EMOTION_INSIGHT_KINDS.BALANCED_DAYS ? (
            INSIGHT_SPROUT_PATHS.map((path) => (
              <Path
                key={path}
                d={path}
                fill="none"
                stroke={theme.colors.insightBalancedInk}
                strokeWidth={INSIGHT_ROW_LAYOUT.ICON_STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))
          ) : (
            <>
              <Circle cx={face.CENTER} cy={face.CENTER} r={face.RADIUS} fill={faceColors.fill} />
              <Circle
                cx={face.EYE_LEFT_X}
                cy={face.EYE_Y}
                r={face.EYE_RADIUS}
                fill={faceColors.ink}
              />
              <Circle
                cx={face.EYE_RIGHT_X}
                cy={face.EYE_Y}
                r={face.EYE_RADIUS}
                fill={faceColors.ink}
              />
              {kind === EMOTION_INSIGHT_KINDS.LESS_ANXIETY ? (
                <Path
                  d={face.FROWN_PATH}
                  fill="none"
                  stroke={faceColors.ink}
                  strokeWidth={INSIGHT_ROW_LAYOUT.ICON_STROKE_WIDTH}
                  strokeLinecap="round"
                />
              ) : (
                <Circle
                  cx={face.CENTER}
                  cy={face.MOUTH_DOT_Y}
                  r={face.MOUTH_DOT_RADIUS}
                  fill={faceColors.ink}
                />
              )}
            </>
          )}
        </Svg>
      </View>
      <View style={styles.texts}>
        <AppText variant="bodySemiBold" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="body" style={styles.text}>
          {text}
        </AppText>
      </View>
      {hasDivider ? (
        <View
          testID={`${TEST_IDS.INSIGHT_ROW_PREFIX}${kind}${TEST_IDS.LIST_ROW_DIVIDER_SUFFIX}`}
          style={styles.divider}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const layout = INSIGHT_ROW_LAYOUT

  return {
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: layout.LEFT * scale,
      paddingRight: layout.RIGHT * scale,
      paddingVertical: layout.PADDING_VERTICAL * scale,
    },
    circle: (color: string) => ({
      width: layout.CIRCLE_SIZE * scale,
      height: layout.CIRCLE_SIZE * scale,
      borderRadius: (layout.CIRCLE_SIZE / 2) * scale,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color,
    }),
    divider: {
      position: 'absolute',
      left: layout.DIVIDER_LEFT * scale,
      right: layout.DIVIDER_RIGHT * scale,
      bottom: 0,
      height: layout.DIVIDER_HEIGHT * scale,
      backgroundColor: theme.colors.profileDivider,
    },
    texts: {
      flex: 1,
      marginLeft: (layout.TEXT_LEFT - layout.LEFT - layout.CIRCLE_SIZE) * scale,
    },
    title: {
      fontSize: layout.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    text: {
      marginTop: layout.TITLE_TEXT_GAP * scale,
      fontSize: layout.TEXT_FONT_SIZE * scale,
      lineHeight: layout.TEXT_LINE_HEIGHT * scale,
      color: theme.colors.body,
    },
  }
})
