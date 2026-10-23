import {
  buildPlayTrianglePath,
  TEST_IDS,
  VERSE_BOOK_ICON,
  VERSE_PLAY_ICON,
} from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { DESIGN } from '../../constants/design.constant'
import { VERSE_CARD_LAYOUT } from '../../constants/home-layout.constant'
import { AppText } from '../app-text/app-text.component'

type VerseCardProps = Readonly<{
  text: string
  reference: string
  onPlayPress: () => unknown
}>

// The "Um minuto com Deus" card: the verse of the day, its reference and the (coming soon) play button.
// The parent gives it the card box; everything inside is placed from the reference measurements.
export function VerseCard({ text, reference, onPlayPress }: VerseCardProps) {
  const { t } = useTranslation()
  const { theme } = useUnistyles()

  return (
    <View testID={TEST_IDS.HOME_VERSE_CARD} style={styles.card}>
      <View style={styles.tile} />
      <Svg
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        viewBox={`0 0 ${VERSE_BOOK_ICON.VIEW_BOX_WIDTH} ${VERSE_BOOK_ICON.VIEW_BOX_HEIGHT}`}
        style={styles.book}
      >
        <Path
          d={VERSE_BOOK_ICON.PAGES_PATH}
          fill="none"
          stroke={theme.colors.verseBook}
          strokeWidth={VERSE_BOOK_ICON.STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={VERSE_BOOK_ICON.COVER_PATH}
          fill="none"
          stroke={theme.colors.verseBook}
          strokeWidth={VERSE_BOOK_ICON.STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <AppText variant="titleMedium" numberOfLines={1} style={styles.title}>
        {t('screen.home.verseTitle')}
      </AppText>
      <AppText
        variant="body"
        numberOfLines={VERSE_CARD_LAYOUT.QUOTE_MAXIMUM_LINES}
        style={styles.quote}
      >
        {t('screen.home.verseQuote', { text })}
      </AppText>
      <AppText variant="body" numberOfLines={1} style={styles.reference}>
        {t('screen.home.verseReference', {
          reference,
          translation: t('screen.home.verseTranslation'),
        })}
      </AppText>
      <Pressable
        testID={TEST_IDS.HOME_VERSE_PLAY}
        accessibilityRole="button"
        accessibilityLabel={t('screen.home.versePlay')}
        hitSlop={VERSE_CARD_LAYOUT.PLAY_HIT_SLOP}
        onPress={onPlayPress}
        style={styles.play}
      >
        <Svg
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          viewBox={`0 0 ${VERSE_CARD_LAYOUT.PLAY_DIAMETER} ${VERSE_CARD_LAYOUT.PLAY_DIAMETER}`}
          style={styles.playIcon}
        >
          <Circle
            cx={VERSE_CARD_LAYOUT.PLAY_DIAMETER / 2}
            cy={VERSE_CARD_LAYOUT.PLAY_DIAMETER / 2}
            r={VERSE_CARD_LAYOUT.PLAY_DIAMETER / 2}
            fill={theme.colors.primaryAccent}
          />
          <Path
            d={buildPlayTrianglePath()}
            fill="none"
            stroke={theme.colors.white}
            strokeWidth={VERSE_PLAY_ICON.TRIANGLE_STROKE_WIDTH}
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const layout = VERSE_CARD_LAYOUT
  // Line-box top of a single line whose baseline is `baseline` design units below the card top.
  const topOf = (baseline: number, ascent: number, fontSize: number) =>
    (baseline - ascent * fontSize) * scale
  // The same for a line with an explicit line height: Android centers the font box in the line.
  const topWithLineHeight = (
    baseline: number,
    fontSize: number,
    lineHeight: number,
    ascent: number,
    descent: number,
  ) => (baseline - lineHeight / 2 - ((ascent - descent) * fontSize) / 2) * scale

  return {
    card: {
      flex: 1,
      borderRadius: layout.RADIUS * scale,
      backgroundColor: theme.colors.homeCardBackground,
      boxShadow: `0 1 ${6 * scale} ${theme.colors.homeCardShadow}`,
    },
    tile: {
      position: 'absolute',
      left: layout.TILE_LEFT * scale,
      top: layout.TILE_TOP * scale,
      width: layout.TILE_WIDTH * scale,
      height: layout.TILE_HEIGHT * scale,
      borderRadius: layout.TILE_RADIUS * scale,
      backgroundColor: theme.colors.verseTile,
    },
    book: {
      position: 'absolute',
      left: layout.BOOK_LEFT * scale,
      top: layout.BOOK_TOP * scale,
      width: layout.BOOK_WIDTH * scale,
      height: layout.BOOK_HEIGHT * scale,
    },
    title: {
      position: 'absolute',
      left: layout.TEXT_LEFT * scale,
      right: 0,
      top: topOf(
        layout.TITLE_BASELINE,
        AUTHENTICATION_FONT_METRICS.TITLE_ASCENT,
        layout.TITLE_FONT_SIZE,
      ),
      fontSize: layout.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    quote: {
      position: 'absolute',
      left: layout.TEXT_LEFT * scale,
      width: layout.QUOTE_WIDTH * scale,
      top: topWithLineHeight(
        layout.QUOTE_FIRST_BASELINE,
        layout.QUOTE_FONT_SIZE,
        layout.QUOTE_LINE_PITCH,
        AUTHENTICATION_FONT_METRICS.BODY_ASCENT,
        AUTHENTICATION_FONT_METRICS.BODY_DESCENT,
      ),
      fontSize: layout.QUOTE_FONT_SIZE * scale,
      lineHeight: layout.QUOTE_LINE_PITCH * scale,
      color: theme.colors.body,
    },
    reference: {
      position: 'absolute',
      left: layout.TEXT_LEFT * scale,
      width: layout.QUOTE_WIDTH * scale,
      top: topOf(
        layout.REFERENCE_BASELINE,
        AUTHENTICATION_FONT_METRICS.BODY_ASCENT,
        layout.REFERENCE_FONT_SIZE,
      ),
      fontSize: layout.REFERENCE_FONT_SIZE * scale,
      color: theme.colors.body,
    },
    play: {
      position: 'absolute',
      right: layout.PLAY_RIGHT * scale,
      top: layout.PLAY_TOP * scale,
      width: layout.PLAY_DIAMETER * scale,
      height: layout.PLAY_DIAMETER * scale,
    },
    playIcon: {
      width: layout.PLAY_DIAMETER * scale,
      height: layout.PLAY_DIAMETER * scale,
    },
  }
})
