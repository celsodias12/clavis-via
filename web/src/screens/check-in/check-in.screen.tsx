import {
  AUTHENTICATION_FONT_METRICS,
  CHECK_IN_LAYOUT,
  CHECK_IN_OPTIONS,
  CHECK_IN_OTHER_TEXT_MAXIMUM_LENGTH,
  CHECK_IN_STATES,
  TEST_IDS,
  useCheckInForm,
} from '@clavis-via/shared'
import { useNavigate } from '@tanstack/react-router'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CheckInOption } from '../../components/check-in-option/check-in-option.component'
import { HeaderIconButton } from '../../components/header-icon-button/header-icon-button.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { TextField } from '../../components/text-field/text-field.component'
import { TextLines } from '../../components/text-lines/text-lines.component'
import { CHECK_IN_CLASSES } from '../../constants/check-in.constant'
import { ROUTES } from '../../constants/route.constant'
import { useFormSubmit } from '../../hooks/forms/use-form-submit'
import { useIsWideScreen } from '../../hooks/layout/use-is-wide-screen'
import { designUnits, lineBox } from '../../utils/design'

// The mood check-in: the user picks one of eight states (or "Outro" with a few words) and saves it.
export function CheckInScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isWide = useIsWideScreen()
  // Replaces the Check-in in the history, so the browser Back button from Início does not reopen the form.
  const goHome = () => navigate({ to: ROUTES.HOME, replace: true })
  const { control, selectedState, selectState, submit, isValid, isSubmitting, isError } =
    useCheckInForm({ onSaved: goHome })
  const handleSubmit = useFormSubmit(submit)

  const options = CHECK_IN_OPTIONS.map((option) => (
    <div key={option.state} className={isWide ? undefined : CHECK_IN_CLASSES.TILE_SLOT}>
      <CheckInOption
        state={option.state}
        label={t(option.labelKey)}
        isSelected={selectedState === option.state}
        onPress={() => selectState(option.state)}
      />
    </div>
  ))
  const otherField =
    selectedState === CHECK_IN_STATES.OTHER ? (
      <div className={isWide ? CHECK_IN_CLASSES.WIDE_OTHER_FIELD : CHECK_IN_CLASSES.OTHER_FIELD}>
        <Controller
          control={control}
          name="otherText"
          render={({ field }) => (
            <TextField
              testID={TEST_IDS.CHECK_IN_OTHER_TEXT}
              inputRef={field.ref}
              label={t('screen.checkIn.otherLabel')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              maxLength={CHECK_IN_OTHER_TEXT_MAXIMUM_LENGTH}
            />
          )}
        />
      </div>
    ) : null
  const submitButton = (
    <PrimaryButton
      testID={TEST_IDS.CHECK_IN_SUBMIT}
      tone={isValid ? 'navy' : 'light'}
      label={t('screen.checkIn.continue')}
      isDisabled={!isValid}
      isLoading={isSubmitting}
      isFullWidth
      isSubmit
    />
  )

  if (isWide) {
    return (
      <main className={CHECK_IN_CLASSES.WIDE_PAGE}>
        <form noValidate onSubmit={handleSubmit} className={CHECK_IN_CLASSES.FORM}>
          <div className={CHECK_IN_CLASSES.WIDE_CONTENT}>
            <div>
              <HeaderIconButton
                icon="close"
                onPress={goHome}
                accessibilityLabel={t('common.close')}
              />
            </div>
            <TextLines
              as="h1"
              text={t('screen.checkIn.title')}
              className={CHECK_IN_CLASSES.WIDE_TITLE}
              isFlowing
            />
            <TextLines
              text={t('screen.checkIn.subtitle')}
              className={CHECK_IN_CLASSES.WIDE_SUBTITLE}
              isFlowing
            />
            <div
              role="radiogroup"
              aria-label={t('screen.checkIn.groupLabel')}
              className={CHECK_IN_CLASSES.WIDE_GRID}
            >
              {options}
            </div>
            {otherField}
            {isError ? (
              <p
                data-testid={TEST_IDS.CHECK_IN_ERROR}
                role="alert"
                className={CHECK_IN_CLASSES.WIDE_ERROR}
              >
                {t('screen.checkIn.saveError')}
              </p>
            ) : null}
            <div className={CHECK_IN_CLASSES.WIDE_BUTTON_SLOT}>{submitButton}</div>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main className={CHECK_IN_CLASSES.PAGE}>
      <form noValidate onSubmit={handleSubmit} className={CHECK_IN_CLASSES.FORM}>
        <div className={CHECK_IN_CLASSES.CONTENT}>
          <div>
            <HeaderIconButton
              icon="close"
              onPress={goHome}
              accessibilityLabel={t('common.close')}
            />
          </div>
          <TextLines
            as="h1"
            text={t('screen.checkIn.title')}
            className={`${CHECK_IN_CLASSES.TITLE} mt-4`}
            lineClassName="block"
            style={{
              fontSize: designUnits(CHECK_IN_LAYOUT.TITLE_FONT_SIZE),
              lineHeight: designUnits(CHECK_IN_LAYOUT.TITLE_LINE_PITCH),
            }}
          />
          <TextLines
            text={t('screen.checkIn.subtitle')}
            className={`${CHECK_IN_CLASSES.SUBTITLE} mt-3`}
            lineClassName="block"
            style={{
              fontSize: designUnits(CHECK_IN_LAYOUT.SUBTITLE_FONT_SIZE),
              lineHeight: lineBox(
                CHECK_IN_LAYOUT.SUBTITLE_FONT_SIZE,
                AUTHENTICATION_FONT_METRICS.BODY_ASCENT,
                AUTHENTICATION_FONT_METRICS.BODY_DESCENT,
              ),
            }}
          />
          <div
            role="radiogroup"
            aria-label={t('screen.checkIn.groupLabel')}
            className={CHECK_IN_CLASSES.GRID}
          >
            {options}
          </div>
          {otherField}
          {isError ? (
            <p
              data-testid={TEST_IDS.CHECK_IN_ERROR}
              role="alert"
              className={CHECK_IN_CLASSES.ERROR}
              style={{ fontSize: designUnits(CHECK_IN_LAYOUT.ERROR_FONT_SIZE) }}
            >
              {t('screen.checkIn.saveError')}
            </p>
          ) : null}
          <div className={CHECK_IN_CLASSES.BUTTON_SLOT}>{submitButton}</div>
        </div>
      </form>
    </main>
  )
}
