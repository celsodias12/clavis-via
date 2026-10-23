import { TEST_IDS } from '@clavis-via/shared'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { AppText } from '../../components/app-text/app-text.component'
import { BrandKey } from '../../components/brand-key/brand-key.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { WaveBackground } from '../../components/wave-background/wave-background.component'
import { ROUTES } from '../../constants/route.constant'
import {
  WELCOME_BRAND_LAYOUT,
  WELCOME_CLAVIS_LETTERS,
  WELCOME_FONT_METRICS,
  WELCOME_FOOTER_LAYOUT,
  WELCOME_TAGLINE_LAYOUT,
  WELCOME_VIA_LETTERS,
} from '../../constants/welcome.constant'

export function WelcomeScreen() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <View style={styles.screen}>
      <WaveBackground />
      <View
        testID={TEST_IDS.WELCOME_BRAND}
        accessible
        accessibilityLabel={t('welcome.brand')}
        style={styles.brand}
      >
        <View style={styles.key} importantForAccessibility="no-hide-descendants">
          <BrandKey width={WELCOME_BRAND_LAYOUT.KEY_WIDTH} />
        </View>
        <View
          style={styles.letters}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {WELCOME_CLAVIS_LETTERS.map((letter) => (
            <AppText
              key={`clavis-${letter.character}-${letter.centerX}`}
              variant="brand"
              style={styles.letter(
                letter.centerX,
                WELCOME_BRAND_LAYOUT.CLAVIS_FONT_SIZE,
                WELCOME_BRAND_LAYOUT.CLAVIS_BASELINE,
              )}
            >
              {letter.character}
            </AppText>
          ))}
          {WELCOME_VIA_LETTERS.map((letter) => (
            <AppText
              key={`via-${letter.character}-${letter.centerX}`}
              variant="brand"
              style={styles.letter(
                letter.centerX,
                WELCOME_BRAND_LAYOUT.VIA_FONT_SIZE,
                WELCOME_BRAND_LAYOUT.VIA_BASELINE,
              )}
            >
              {letter.character}
            </AppText>
          ))}
        </View>
      </View>
      {WELCOME_TAGLINE_LAYOUT.LINES.map((line) => (
        <AppText key={line.key} variant="body" style={styles.tagline(line.centerX, line.baseline)}>
          {t(line.key)}
        </AppText>
      ))}
      <View style={styles.buttonSlot}>
        <PrimaryButton
          testID={TEST_IDS.WELCOME_START}
          tone="navy"
          label={t('welcome.start')}
          onPress={() => router.push(ROUTES.SIGN_UP)}
        />
      </View>
      {/* The row spans the screen only to center the link; the link itself is as wide as its text. */}
      <View pointerEvents="box-none" style={styles.linkRow}>
        <Pressable
          testID={TEST_IDS.WELCOME_SIGN_IN}
          accessibilityRole="link"
          accessibilityLabel={t('welcome.haveAccount')}
          hitSlop={WELCOME_FOOTER_LAYOUT.LINK_HIT_SLOP}
          onPress={() => router.push(ROUTES.SIGN_IN)}
          style={styles.link}
        >
          <AppText variant="body" style={styles.linkLabel}>
            {t('welcome.haveAccount')}
          </AppText>
          <View style={styles.underline} />
        </Pressable>
      </View>
    </View>
  )
}

// Design units become dp with s = screen width / 266 on both axes. Top elements sit at
// inset_top + (y - 30) * s and bottom elements at inset_bottom + (560 - y) * s.
const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / 266
  const topOf = (designY: number) => runtime.insets.top + (designY - 30) * scale
  const bottomOf = (designY: number) => runtime.insets.bottom + (560 - designY) * scale
  const brandTop = topOf(WELCOME_BRAND_LAYOUT.KEY_TOP)
  const linkFontSize = WELCOME_FOOTER_LAYOUT.LINK_FONT_SIZE
  const linkBoxHeight =
    (WELCOME_FONT_METRICS.BODY_ASCENT + WELCOME_FONT_METRICS.BODY_DESCENT) * linkFontSize
  const linkBoxTop =
    WELCOME_FOOTER_LAYOUT.LINK_BASELINE - WELCOME_FONT_METRICS.BODY_ASCENT * linkFontSize

  return {
    screen: { flex: 1, backgroundColor: theme.colors.waveTop },
    // Positioned at the key; the letters are placed relative to its top edge.
    brand: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: brandTop,
      height: (WELCOME_BRAND_LAYOUT.BOTTOM - WELCOME_BRAND_LAYOUT.KEY_TOP) * scale,
    },
    key: {
      position: 'absolute',
      left: WELCOME_BRAND_LAYOUT.KEY_LEFT * scale,
      top: 0,
    },
    letters: { ...StyleSheet.absoluteFillObject },
    letter: (centerX: number, fontSize: number, baseline: number) => ({
      position: 'absolute',
      left: (centerX - WELCOME_BRAND_LAYOUT.LETTER_BOX_WIDTH / 2) * scale,
      width: WELCOME_BRAND_LAYOUT.LETTER_BOX_WIDTH * scale,
      top:
        (baseline - WELCOME_FONT_METRICS.BRAND_ASCENT * fontSize - WELCOME_BRAND_LAYOUT.KEY_TOP) *
        scale,
      textAlign: 'center',
      fontSize: fontSize * scale,
      color: theme.colors.brand,
    }),
    tagline: (centerX: number, baseline: number) => ({
      position: 'absolute',
      left: (centerX - WELCOME_TAGLINE_LAYOUT.BOX_WIDTH / 2) * scale,
      width: WELCOME_TAGLINE_LAYOUT.BOX_WIDTH * scale,
      top: topOf(baseline - WELCOME_FONT_METRICS.BODY_ASCENT * WELCOME_TAGLINE_LAYOUT.FONT_SIZE),
      textAlign: 'center',
      fontSize: WELCOME_TAGLINE_LAYOUT.FONT_SIZE * scale,
      letterSpacing: WELCOME_TAGLINE_LAYOUT.LETTER_SPACING * scale,
      color: theme.colors.body,
    }),
    buttonSlot: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: bottomOf(WELCOME_FOOTER_LAYOUT.BUTTON_TOP + WELCOME_FOOTER_LAYOUT.BUTTON_HEIGHT),
      alignItems: 'center',
    },
    linkRow: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: bottomOf(
        WELCOME_FOOTER_LAYOUT.LINK_BASELINE + WELCOME_FONT_METRICS.BODY_DESCENT * linkFontSize,
      ),
      height: linkBoxHeight * scale,
      alignItems: 'center',
    },
    link: { height: linkBoxHeight * scale },
    linkLabel: {
      fontSize: linkFontSize * scale,
      color: theme.colors.link,
    },
    underline: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: (WELCOME_FOOTER_LAYOUT.UNDERLINE_Y - linkBoxTop) * scale,
      height: WELCOME_FOOTER_LAYOUT.UNDERLINE_HEIGHT * scale,
      backgroundColor: theme.colors.link,
    },
  }
})
