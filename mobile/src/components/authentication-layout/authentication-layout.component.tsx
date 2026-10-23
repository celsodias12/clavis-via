import { splitLines, TEST_IDS } from '@clavis-via/shared'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import {
  AUTHENTICATION_FONT_METRICS,
  AUTHENTICATION_LAYOUT,
} from '../../constants/authentication-layout.constant'
import { HEADER_ICON_METRICS } from '../../constants/component.constant'
import { bottomFromDesign, scaleDesignValue, topFromDesign } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'
import { HeaderIconButton } from '../header-icon-button/header-icon-button.component'
import { PrimaryButton } from '../primary-button/primary-button.component'
import { WaveBackground } from '../wave-background/wave-background.component'

type AuthenticationLayoutProps = Readonly<{
  // Title and subtitle may hold several lines separated by "\n"; each line is placed on its own baseline.
  title: string
  subtitle: string
  onBack: () => unknown
  // The form fields; each screen places them where its design needs them.
  children: ReactNode
  submitLabel: string
  onSubmit: () => unknown
  isSubmitting: boolean
  formErrorMessage?: string
  footerQuestion: string
  footerActionLabel: string
  onFooterAction: () => unknown
}>

// Shared frame of the sign in and sign up screens: waves, back arrow, title, subtitle, a slot for the
// fields, the form error, the submit button and the footer link to the other screen.
export function AuthenticationLayout({
  title,
  subtitle,
  onBack,
  children,
  submitLabel,
  onSubmit,
  isSubmitting,
  formErrorMessage,
  footerQuestion,
  footerActionLabel,
  onFooterAction,
}: AuthenticationLayoutProps) {
  const { t } = useTranslation()

  const titleLines = splitLines(title)
  const subtitleLines = splitLines(subtitle)
  const lastTitleBaseline =
    AUTHENTICATION_LAYOUT.TITLE_FIRST_BASELINE +
    (titleLines.length - 1) * AUTHENTICATION_LAYOUT.TITLE_LINE_PITCH
  const subtitleFirstBaseline = lastTitleBaseline + AUTHENTICATION_LAYOUT.SUBTITLE_AFTER_TITLE

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.viewport}
    >
      <ScrollView
        style={styles.viewport}
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled"
      >
        <WaveBackground />
        <View style={styles.back}>
          <HeaderIconButton icon="back" onPress={onBack} accessibilityLabel={t('common.back')} />
        </View>
        <View accessible accessibilityRole="header" style={styles.title(titleLines.length)}>
          {titleLines.map((line) => (
            <AppText key={line.id} variant="title" style={styles.titleLine(line.position)}>
              {line.content}
            </AppText>
          ))}
        </View>
        <View accessible style={styles.subtitle(subtitleFirstBaseline, subtitleLines.length)}>
          {subtitleLines.map((line) => (
            <AppText key={line.id} variant="body" style={styles.subtitleLine(line.position)}>
              {line.content}
            </AppText>
          ))}
        </View>
        <View pointerEvents="box-none" style={styles.content}>
          {children}
        </View>
        {formErrorMessage ? (
          <AppText
            testID={TEST_IDS.AUTHENTICATION_FORM_ERROR}
            variant="body"
            accessibilityLiveRegion="polite"
            style={styles.formError}
          >
            {formErrorMessage}
          </AppText>
        ) : null}
        <View style={styles.buttonSlot}>
          <PrimaryButton
            testID={TEST_IDS.AUTHENTICATION_SUBMIT}
            tone="navy"
            label={submitLabel}
            isLoading={isSubmitting}
            onPress={onSubmit}
          />
        </View>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${footerQuestion} ${footerActionLabel}`}
          hitSlop={AUTHENTICATION_LAYOUT.FOOTER_HIT_SLOP}
          onPress={onFooterAction}
          style={styles.footer}
        >
          <AppText variant="body" style={styles.footerText}>
            {footerQuestion}{' '}
            <AppText variant="bodySemiBold" style={styles.footerAction}>
              {footerActionLabel}
            </AppText>
          </AppText>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const width = runtime.screen.width
  const scale = scaleDesignValue(1, width)
  const topOf = (designY: number) => topFromDesign(designY, runtime.insets.top, width)
  const bottomOf = (designY: number) => bottomFromDesign(designY, runtime.insets.bottom, width)
  const titleSize = AUTHENTICATION_LAYOUT.TITLE_FONT_SIZE
  const subtitleSize = AUTHENTICATION_LAYOUT.SUBTITLE_FONT_SIZE
  const footerSize = AUTHENTICATION_LAYOUT.FOOTER_FONT_SIZE
  const titleLineHeight =
    (AUTHENTICATION_FONT_METRICS.TITLE_ASCENT + AUTHENTICATION_FONT_METRICS.TITLE_DESCENT) *
    titleSize
  const subtitleLineHeight =
    (AUTHENTICATION_FONT_METRICS.BODY_ASCENT + AUTHENTICATION_FONT_METRICS.BODY_DESCENT) *
    subtitleSize
  const backHalfSize =
    Math.max(
      HEADER_ICON_METRICS.MINIMUM_TOUCH_SIZE,
      scaleDesignValue(HEADER_ICON_METRICS.VIEW_BOX_SIZE, width),
    ) / 2
  const footerLineHeight =
    (AUTHENTICATION_FONT_METRICS.BODY_ASCENT + AUTHENTICATION_FONT_METRICS.BODY_DESCENT) *
    footerSize

  return {
    viewport: { flex: 1 },
    screen: {
      flexGrow: 1,
      minHeight: runtime.screen.height,
      backgroundColor: theme.colors.waveTop,
    },
    // The arrow is centered on its design point; the touch target is at least 44 dp.
    back: {
      position: 'absolute',
      left: AUTHENTICATION_LAYOUT.BACK_CENTER_X * scale - backHalfSize,
      top: topOf(AUTHENTICATION_LAYOUT.BACK_CENTER_Y) - backHalfSize,
    },
    title: (lineCount: number) => ({
      position: 'absolute',
      left: AUTHENTICATION_LAYOUT.TITLE_LEFT * scale,
      right: 0,
      top: topOf(
        AUTHENTICATION_LAYOUT.TITLE_FIRST_BASELINE -
          AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * titleSize,
      ),
      height: ((lineCount - 1) * AUTHENTICATION_LAYOUT.TITLE_LINE_PITCH + titleLineHeight) * scale,
    }),
    titleLine: (index: number) => ({
      position: 'absolute',
      top: index * AUTHENTICATION_LAYOUT.TITLE_LINE_PITCH * scale,
      fontSize: titleSize * scale,
      color: theme.colors.title,
    }),
    subtitle: (firstBaseline: number, lineCount: number) => ({
      position: 'absolute',
      left: AUTHENTICATION_LAYOUT.SUBTITLE_LEFT * scale,
      right: 0,
      top: topOf(firstBaseline - AUTHENTICATION_FONT_METRICS.BODY_ASCENT * subtitleSize),
      height:
        ((lineCount - 1) * AUTHENTICATION_LAYOUT.SUBTITLE_LINE_PITCH + subtitleLineHeight) * scale,
    }),
    subtitleLine: (index: number) => ({
      position: 'absolute',
      top: index * AUTHENTICATION_LAYOUT.SUBTITLE_LINE_PITCH * scale,
      fontSize: subtitleSize * scale,
      color: theme.colors.body,
    }),
    content: { ...StyleSheet.absoluteFillObject },
    formError: {
      position: 'absolute',
      left: AUTHENTICATION_LAYOUT.FORM_ERROR_MARGIN * scale,
      right: AUTHENTICATION_LAYOUT.FORM_ERROR_MARGIN * scale,
      bottom:
        bottomOf(AUTHENTICATION_LAYOUT.BUTTON_TOP) + AUTHENTICATION_LAYOUT.FORM_ERROR_GAP * scale,
      textAlign: 'center',
      fontSize: AUTHENTICATION_LAYOUT.FORM_ERROR_FONT_SIZE * scale,
      color: theme.colors.error,
    },
    buttonSlot: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: bottomOf(AUTHENTICATION_LAYOUT.BUTTON_TOP + AUTHENTICATION_LAYOUT.BUTTON_HEIGHT),
      alignItems: 'center',
    },
    // The card is centered on x = 133, which is the middle of the screen.
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: bottomOf(
        AUTHENTICATION_LAYOUT.FOOTER_BASELINE +
          AUTHENTICATION_FONT_METRICS.BODY_DESCENT * footerSize,
      ),
      height: footerLineHeight * scale,
      alignItems: 'center',
    },
    footerText: {
      fontSize: footerSize * scale,
      color: theme.colors.body,
    },
    footerAction: {
      color: theme.colors.linkStrong,
      textDecorationLine: 'underline',
    },
  }
})
