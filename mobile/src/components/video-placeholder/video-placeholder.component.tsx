import { formatClock, TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { Image, Pressable, useWindowDimensions, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { PLAN_DAY_LAYOUT, VIDEO_PLACEHOLDER_LAYOUT } from '../../constants/plan-day-layout.constant'
import { DAY_VIDEO_COVER } from '../../constants/plan-image.constant'
import { scaleDesignValue } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'

type VideoPlaceholderProps = Readonly<{
  durationSeconds: number
  onPlay: () => void
}>

// The video of a day: a still cover, a play button and the length. There is no player yet, so playing is a notice.
export function VideoPlaceholder({ durationSeconds, onPlay }: VideoPlaceholderProps) {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()

  const layout = VIDEO_PLACEHOLDER_LAYOUT
  const playSize = scaleDesignValue(layout.PLAY_DIAMETER, width)
  const clockSize = scaleDesignValue(layout.CLOCK_SIZE, width)

  return (
    <View testID={TEST_IDS.VIDEO_PLACEHOLDER} style={styles.container(width)}>
      <Image
        source={DAY_VIDEO_COVER}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.cover(width)}
      />
      <Pressable
        testID={TEST_IDS.VIDEO_PLAY}
        accessibilityRole="button"
        accessibilityLabel={t('screen.planDay.playVideo')}
        onPress={onPlay}
        style={styles.play(width)}
      >
        <Svg
          width={playSize}
          height={playSize}
          viewBox={`0 0 ${layout.PLAY_DIAMETER} ${layout.PLAY_DIAMETER}`}
        >
          <Circle
            cx={layout.PLAY_DIAMETER / 2}
            cy={layout.PLAY_DIAMETER / 2}
            r={(layout.PLAY_DIAMETER - layout.PLAY_RING_WIDTH) / 2}
            fill={theme.colors.dayVideoPlayFill}
            stroke={theme.colors.white}
            strokeWidth={layout.PLAY_RING_WIDTH}
          />
          <Path
            d={layout.PLAY_TRIANGLE}
            fill={theme.colors.white}
            stroke={theme.colors.white}
            strokeWidth={layout.PLAY_TRIANGLE_STROKE_WIDTH}
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
      <View pointerEvents="none" style={styles.clock(width)}>
        <Svg
          width={clockSize}
          height={clockSize}
          viewBox={`0 0 ${layout.CLOCK_VIEW_BOX_SIZE} ${layout.CLOCK_VIEW_BOX_SIZE}`}
        >
          <Circle
            cx={layout.CLOCK_VIEW_BOX_SIZE / 2}
            cy={layout.CLOCK_VIEW_BOX_SIZE / 2}
            r={layout.CLOCK_CIRCLE_RADIUS}
            fill="none"
            stroke={theme.colors.white}
            strokeWidth={layout.CLOCK_STROKE_WIDTH}
          />
          <Path
            d={layout.CLOCK_HANDS}
            fill="none"
            stroke={theme.colors.white}
            strokeWidth={layout.CLOCK_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <AppText variant="bodySemiBold" style={styles.clockText(width)}>
          {t('screen.planDay.clock', { clock: formatClock(durationSeconds) })}
        </AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: (width: number) => ({
    height: scaleDesignValue(PLAN_DAY_LAYOUT.VIDEO_HEIGHT, width),
    borderRadius: scaleDesignValue(VIDEO_PLACEHOLDER_LAYOUT.RADIUS, width),
    overflow: 'hidden',
    backgroundColor: theme.colors.planDayCircle,
  }),
  // Explicit sizes: the video fills the card between its margins and the cover is cropped to it.
  cover: (width: number) => ({
    width:
      width - scaleDesignValue(PLAN_DAY_LAYOUT.CONTENT_LEFT + PLAN_DAY_LAYOUT.CONTENT_RIGHT, width),
    height: scaleDesignValue(PLAN_DAY_LAYOUT.VIDEO_HEIGHT, width),
    resizeMode: 'cover',
  }),
  play: (width: number) => ({
    position: 'absolute',
    alignSelf: 'center',
    top:
      scaleDesignValue(VIDEO_PLACEHOLDER_LAYOUT.PLAY_CENTER_Y, width) -
      scaleDesignValue(VIDEO_PLACEHOLDER_LAYOUT.PLAY_DIAMETER, width) / 2,
  }),
  clock: (width: number) => ({
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    left: scaleDesignValue(VIDEO_PLACEHOLDER_LAYOUT.CLOCK_LEFT, width),
    top: scaleDesignValue(VIDEO_PLACEHOLDER_LAYOUT.CLOCK_TOP, width),
    height: scaleDesignValue(VIDEO_PLACEHOLDER_LAYOUT.CLOCK_SIZE, width),
    columnGap: scaleDesignValue(VIDEO_PLACEHOLDER_LAYOUT.CLOCK_TEXT_GAP, width),
  }),
  clockText: (width: number) => ({
    fontSize: scaleDesignValue(VIDEO_PLACEHOLDER_LAYOUT.CLOCK_FONT_SIZE, width),
    color: theme.colors.white,
  }),
}))
