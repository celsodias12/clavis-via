import {
  CHECK_IN_GRID_ROWS,
  CHECK_IN_OTHER_TEXT_MAXIMUM_LENGTH,
  CHECK_IN_STATES,
  splitLines,
  TEST_IDS,
  useCheckInForm,
} from '@clavis-via/shared'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { AppText } from '../../components/app-text/app-text.component'
import { CheckInOption } from '../../components/check-in-option/check-in-option.component'
import { HeaderIconButton } from '../../components/header-icon-button/header-icon-button.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { TextField } from '../../components/text-field/text-field.component'
import { BACK_PRESS_EVENT } from '../../constants/app-state.constant'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { CHECK_IN_LAYOUT, CHECK_IN_TILE_METRICS } from '../../constants/check-in-layout.constant'
import { HEADER_ICON_METRICS } from '../../constants/component.constant'
import { ROUTES } from '../../constants/route.constant'
import { bottomFromDesign, scaleDesignValue, topFromDesign } from '../../utils/design'

// The mood check-in: the user picks one of eight states (or "Outro" with a few words) and saves it.
export function CheckInScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { control, selectedState, selectState, submit, isValid, isSubmitting, isError } =
    useCheckInForm({ onSaved: () => router.dismissTo(ROUTES.HOME) })

  // With no screen behind it (the first check-in of a session) the hardware back button would leave the app;
  // it goes to Início instead, like the X. With a screen behind it, the default back already lands on Início.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(BACK_PRESS_EVENT, () => {
      if (router.canGoBack()) {
        return false
      }
      router.dismissTo(ROUTES.HOME)
      return true
    })
    return () => subscription.remove()
  }, [router])

  const titleLines = splitLines(t('screen.checkIn.title'))
  const subtitleLines = splitLines(t('screen.checkIn.subtitle'))

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
        <View style={styles.close}>
          <HeaderIconButton
            icon="close"
            onPress={() => router.dismissTo(ROUTES.HOME)}
            accessibilityLabel={t('common.close')}
          />
        </View>
        <View accessible accessibilityRole="header" style={styles.title(titleLines.length)}>
          {titleLines.map((line) => (
            <AppText key={line.id} variant="titleMedium" style={styles.titleLine(line.position)}>
              {line.content}
            </AppText>
          ))}
        </View>
        <View accessible style={styles.subtitle(subtitleLines.length)}>
          {subtitleLines.map((line) => (
            <AppText key={line.id} variant="body" style={styles.subtitleLine(line.position)}>
              {line.content}
            </AppText>
          ))}
        </View>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t('screen.checkIn.groupLabel')}
          pointerEvents="box-none"
          style={styles.grid}
        >
          {CHECK_IN_GRID_ROWS.map((row, rowIndex) => (
            <View key={row[0].state} style={styles.row(rowIndex, row.length)}>
              {row.map((option) => (
                <View key={option.state} style={styles.tile(row.length)}>
                  <CheckInOption
                    state={option.state}
                    label={t(option.labelKey)}
                    isSelected={selectedState === option.state}
                    onPress={() => selectState(option.state)}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
        {selectedState === CHECK_IN_STATES.OTHER ? (
          <View style={styles.otherField}>
            <Controller
              control={control}
              name="otherText"
              render={({ field }) => (
                <TextField
                  testID={TEST_IDS.CHECK_IN_OTHER_TEXT}
                  label={t('screen.checkIn.otherLabel')}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  maxLength={CHECK_IN_OTHER_TEXT_MAXIMUM_LENGTH}
                />
              )}
            />
          </View>
        ) : null}
        {isError ? (
          <AppText
            testID={TEST_IDS.CHECK_IN_ERROR}
            variant="body"
            accessibilityLiveRegion="polite"
            style={styles.error}
          >
            {t('screen.checkIn.saveError')}
          </AppText>
        ) : null}
        <View style={styles.buttonSlot}>
          <PrimaryButton
            testID={TEST_IDS.CHECK_IN_SUBMIT}
            tone={isValid ? 'navy' : 'light'}
            label={t('screen.checkIn.continue')}
            isDisabled={!isValid}
            isLoading={isSubmitting}
            isFullWidth
            onPress={submit}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const width = runtime.screen.width
  const scale = scaleDesignValue(1, width)
  const topOf = (designY: number) => topFromDesign(designY, runtime.insets.top, width)
  const bottomOf = (designY: number) => bottomFromDesign(designY, runtime.insets.bottom, width)
  const titleSize = CHECK_IN_LAYOUT.TITLE_FONT_SIZE
  const subtitleSize = CHECK_IN_LAYOUT.SUBTITLE_FONT_SIZE
  const titleLineHeight =
    (AUTHENTICATION_FONT_METRICS.TITLE_ASCENT + AUTHENTICATION_FONT_METRICS.TITLE_DESCENT) *
    titleSize
  const subtitleLineHeight =
    (AUTHENTICATION_FONT_METRICS.BODY_ASCENT + AUTHENTICATION_FONT_METRICS.BODY_DESCENT) *
    subtitleSize
  const closeHalfSize =
    Math.max(
      HEADER_ICON_METRICS.MINIMUM_TOUCH_SIZE,
      scaleDesignValue(HEADER_ICON_METRICS.VIEW_BOX_SIZE, width),
    ) / 2

  return {
    viewport: { flex: 1 },
    screen: {
      flexGrow: 1,
      minHeight: runtime.screen.height,
      backgroundColor: theme.colors.checkInBackgroundBottom,
      experimental_backgroundImage: `linear-gradient(${theme.colors.checkInBackgroundTop}, ${theme.colors.checkInBackgroundBottom})`,
    },
    // The X is centered on its design point; the touch target is at least 44 dp.
    close: {
      position: 'absolute',
      left: CHECK_IN_LAYOUT.CLOSE_CENTER_X * scale - closeHalfSize,
      top: topOf(CHECK_IN_LAYOUT.CLOSE_CENTER_Y) - closeHalfSize,
    },
    title: (lineCount: number) => ({
      position: 'absolute',
      left: CHECK_IN_LAYOUT.TITLE_LEFT * scale,
      right: 0,
      top: topOf(
        CHECK_IN_LAYOUT.TITLE_FIRST_BASELINE - AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * titleSize,
      ),
      height: ((lineCount - 1) * CHECK_IN_LAYOUT.TITLE_LINE_PITCH + titleLineHeight) * scale,
    }),
    titleLine: (index: number) => ({
      position: 'absolute',
      top: index * CHECK_IN_LAYOUT.TITLE_LINE_PITCH * scale,
      fontSize: titleSize * scale,
      color: theme.colors.title,
    }),
    subtitle: (lineCount: number) => ({
      position: 'absolute',
      left: CHECK_IN_LAYOUT.SUBTITLE_LEFT * scale,
      right: 0,
      top: topOf(
        CHECK_IN_LAYOUT.SUBTITLE_FIRST_BASELINE -
          AUTHENTICATION_FONT_METRICS.BODY_ASCENT * subtitleSize,
      ),
      height: ((lineCount - 1) * CHECK_IN_LAYOUT.SUBTITLE_LINE_PITCH + subtitleLineHeight) * scale,
    }),
    subtitleLine: (index: number) => ({
      position: 'absolute',
      top: index * CHECK_IN_LAYOUT.SUBTITLE_LINE_PITCH * scale,
      fontSize: subtitleSize * scale,
      color: theme.colors.body,
    }),
    grid: { ...StyleSheet.absoluteFillObject },
    // Full rows keep their margins and spread the tiles; the shorter last row is centered.
    row: (rowIndex: number, tileCount: number) => ({
      position: 'absolute',
      top: topOf(CHECK_IN_LAYOUT.ROW_TOPS[rowIndex]),
      flexDirection: 'row',
      ...(tileCount === CHECK_IN_LAYOUT.COLUMNS
        ? {
            left: CHECK_IN_LAYOUT.GRID_LEFT * scale,
            right: CHECK_IN_LAYOUT.GRID_RIGHT * scale,
            justifyContent: 'space-between',
          }
        : {
            left: 0,
            right: 0,
            justifyContent: 'center',
            columnGap: CHECK_IN_LAYOUT.WIDE_ROW_GAP * scale,
          }),
    }),
    tile: (tileCount: number) => ({
      width:
        (tileCount === CHECK_IN_LAYOUT.COLUMNS
          ? CHECK_IN_TILE_METRICS.WIDTH
          : CHECK_IN_TILE_METRICS.WIDE_WIDTH) * scale,
    }),
    otherField: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: topOf(CHECK_IN_LAYOUT.OTHER_FIELD_TOP),
    },
    error: {
      position: 'absolute',
      left: CHECK_IN_LAYOUT.ERROR_MARGIN * scale,
      right: CHECK_IN_LAYOUT.ERROR_MARGIN * scale,
      bottom:
        bottomOf(CHECK_IN_LAYOUT.BUTTON_BOTTOM) +
        (CHECK_IN_LAYOUT.BUTTON_HEIGHT + CHECK_IN_LAYOUT.ERROR_GAP) * scale,
      textAlign: 'center',
      fontSize: CHECK_IN_LAYOUT.ERROR_FONT_SIZE * scale,
      color: theme.colors.error,
    },
    buttonSlot: {
      position: 'absolute',
      left: CHECK_IN_LAYOUT.BUTTON_LEFT * scale,
      right: CHECK_IN_LAYOUT.BUTTON_RIGHT * scale,
      bottom: bottomOf(CHECK_IN_LAYOUT.BUTTON_BOTTOM),
    },
  }
})
