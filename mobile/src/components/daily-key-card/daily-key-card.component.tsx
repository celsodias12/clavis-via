import { TEST_IDS } from '@clavis-via/shared'
import { Image, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { DESIGN } from '../../constants/design.constant'
import { DAILY_KEY_CARD_LAYOUT } from '../../constants/home-layout.constant'
import { AppText } from '../app-text/app-text.component'
import { PrimaryButton } from '../primary-button/primary-button.component'

type DailyKeyCardProps = Readonly<{
  label: string
  title: string
  text: string
  buttonLabel: string
  onButtonPress: () => unknown
}>

// The pastel "Sua chave de hoje" card: key illustration on the left, the key and a button on the right.
// The parent gives it the card box; everything inside is placed from the reference measurements.
export function DailyKeyCard({
  label,
  title,
  text,
  buttonLabel,
  onButtonPress,
}: DailyKeyCardProps) {
  return (
    <View style={styles.shadow}>
      <View style={styles.card}>
        <Image
          testID={TEST_IDS.DAILY_KEY_ILLUSTRATION}
          source={ILLUSTRATION}
          resizeMode="contain"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.illustration}
        />
        <AppText variant="bodyMedium" numberOfLines={1} style={styles.label}>
          {label}
        </AppText>
        <AppText
          variant="titleMedium"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={DAILY_KEY_CARD_LAYOUT.TITLE_MINIMUM_FONT_SCALE}
          style={styles.title}
        >
          {title}
        </AppText>
        <AppText
          variant="body"
          numberOfLines={DAILY_KEY_CARD_LAYOUT.BODY_MAXIMUM_LINES}
          style={styles.body}
        >
          {text}
        </AppText>
        <View style={styles.button}>
          <PrimaryButton
            label={buttonLabel}
            tone="accent"
            size="compact"
            hasArrow
            isFullWidth
            onPress={onButtonPress}
          />
        </View>
      </View>
    </View>
  )
}

const ILLUSTRATION = require('../../../assets/images/daily-key-illustration.png')

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  // Line-box top of a text whose baseline is `baseline` design units below the card top.
  const topOf = (baseline: number, ascent: number, fontSize: number) =>
    (baseline - ascent * fontSize) * scale
  const gradientStops = theme.colors.dailyKeyCardGradient
    .map((stop) => `${stop.color} ${stop.offset * 100}%`)
    .join(', ')
  // The patches sit above the linear gradient (the first image of the list is the topmost).
  const blobGradients = DAILY_KEY_CARD_LAYOUT.BLOBS.map((blob, index) => {
    const { color, fadeColor } = theme.colors.dailyKeyCardBlobs[index]
    return `radial-gradient(ellipse ${blob.RADIUS_X * scale}px ${blob.RADIUS_Y * scale}px at ${blob.CENTER_X * scale}px ${blob.CENTER_Y * scale}px, ${color}, ${fadeColor})`
  })

  return {
    // The card clips its content, so the shadow lives on the box around it.
    shadow: {
      flex: 1,
      borderRadius: DAILY_KEY_CARD_LAYOUT.RADIUS * scale,
      boxShadow: `0 ${DAILY_KEY_CARD_LAYOUT.SHADOW_OFFSET_Y * scale} ${DAILY_KEY_CARD_LAYOUT.SHADOW_BLUR * scale} ${theme.colors.dailyKeyCardShadow}`,
    },
    card: {
      flex: 1,
      borderRadius: DAILY_KEY_CARD_LAYOUT.RADIUS * scale,
      overflow: 'hidden',
      backgroundColor: theme.colors.dailyKeyCardGradient[0].color,
      experimental_backgroundImage: [
        ...blobGradients,
        `linear-gradient(${DAILY_KEY_CARD_LAYOUT.GRADIENT_ANGLE}, ${gradientStops})`,
      ].join(', '),
    },
    illustration: {
      position: 'absolute',
      left: DAILY_KEY_CARD_LAYOUT.ILLUSTRATION_LEFT * scale,
      top: DAILY_KEY_CARD_LAYOUT.ILLUSTRATION_TOP * scale,
      width: DAILY_KEY_CARD_LAYOUT.ILLUSTRATION_WIDTH * scale,
      height: DAILY_KEY_CARD_LAYOUT.ILLUSTRATION_HEIGHT * scale,
    },
    label: {
      position: 'absolute',
      left: DAILY_KEY_CARD_LAYOUT.TEXT_LEFT * scale,
      right: 0,
      top: topOf(
        DAILY_KEY_CARD_LAYOUT.LABEL_BASELINE,
        AUTHENTICATION_FONT_METRICS.BODY_ASCENT,
        DAILY_KEY_CARD_LAYOUT.LABEL_FONT_SIZE,
      ),
      fontSize: DAILY_KEY_CARD_LAYOUT.LABEL_FONT_SIZE * scale,
      color: theme.colors.homeCardLabel,
    },
    title: {
      position: 'absolute',
      left: DAILY_KEY_CARD_LAYOUT.TEXT_LEFT * scale,
      right: DAILY_KEY_CARD_LAYOUT.TEXT_RIGHT * scale,
      top: topOf(
        DAILY_KEY_CARD_LAYOUT.TITLE_BASELINE,
        AUTHENTICATION_FONT_METRICS.TITLE_ASCENT,
        DAILY_KEY_CARD_LAYOUT.TITLE_FONT_SIZE,
      ),
      fontSize: DAILY_KEY_CARD_LAYOUT.TITLE_FONT_SIZE * scale,
      color: theme.colors.homeHeading,
    },
    body: {
      position: 'absolute',
      left: DAILY_KEY_CARD_LAYOUT.TEXT_LEFT * scale,
      width: DAILY_KEY_CARD_LAYOUT.BODY_WIDTH * scale,
      top: topOf(
        DAILY_KEY_CARD_LAYOUT.BODY_FIRST_BASELINE,
        AUTHENTICATION_FONT_METRICS.BODY_ASCENT,
        DAILY_KEY_CARD_LAYOUT.BODY_FONT_SIZE,
      ),
      fontSize: DAILY_KEY_CARD_LAYOUT.BODY_FONT_SIZE * scale,
      lineHeight: DAILY_KEY_CARD_LAYOUT.BODY_LINE_PITCH * scale,
      color: theme.colors.body,
    },
    button: {
      position: 'absolute',
      left: DAILY_KEY_CARD_LAYOUT.BUTTON_LEFT * scale,
      top: DAILY_KEY_CARD_LAYOUT.BUTTON_TOP * scale,
      width: DAILY_KEY_CARD_LAYOUT.BUTTON_WIDTH * scale,
    },
  }
})
