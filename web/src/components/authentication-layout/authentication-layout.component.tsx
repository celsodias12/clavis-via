import {
  AUTHENTICATION_FONT_METRICS,
  AUTHENTICATION_LAYOUT,
  HEADER_ICON_METRICS,
  splitLines,
  TEST_IDS,
} from '@clavis-via/shared'
import { Link, useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AUTHENTICATION_CLASSES } from '../../constants/authentication.constant'
import { ROUTES } from '../../constants/route.constant'
import { WEB_PAGE_CLASSES } from '../../constants/split-page.constant'
import { useFormSubmit } from '../../hooks/forms/use-form-submit'
import { useIsWideScreen } from '../../hooks/layout/use-is-wide-screen'
import { useGoBack } from '../../hooks/navigation/use-go-back'
import { designBottom, designTop, designUnits, lineBox } from '../../utils/design'
import { HeaderIconButton } from '../header-icon-button/header-icon-button.component'
import { PrimaryButton } from '../primary-button/primary-button.component'
import { SplitPage } from '../split-page/split-page.component'
import { TextLines } from '../text-lines/text-lines.component'
import { WaveCard } from '../wave-card/wave-card.component'

type AuthenticationLayoutProps = Readonly<{
  // Title and subtitle may hold several lines separated by "\n"; each line is placed on its own baseline.
  title: string
  subtitle: string
  // The form fields; each screen places them where its design needs them.
  children: ReactNode
  submitLabel: string
  onSubmit: () => unknown
  isSubmitting: boolean
  formErrorMessage?: string
  footerQuestion: string
  footerActionLabel: string
  // The other authentication route (sign up from sign in and the other way round); replaces this one.
  footerRoute: typeof ROUTES.SIGN_IN | typeof ROUTES.SIGN_UP
}>

// Shared frame of the sign in and sign up screens: waves, back arrow, title, subtitle, a slot for the
// fields, the form error, the submit button and the footer link to the other screen.
export function AuthenticationLayout({
  title,
  subtitle,
  children,
  submitLabel,
  onSubmit,
  isSubmitting,
  formErrorMessage,
  footerQuestion,
  footerActionLabel,
  footerRoute,
}: AuthenticationLayoutProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isWide = useIsWideScreen()

  const titleLineCount = splitLines(title).length
  const lastTitleBaseline =
    AUTHENTICATION_LAYOUT.TITLE_FIRST_BASELINE +
    (titleLineCount - 1) * AUTHENTICATION_LAYOUT.TITLE_LINE_PITCH
  const subtitleFirstBaseline = lastTitleBaseline + AUTHENTICATION_LAYOUT.SUBTITLE_AFTER_TITLE
  const titleLineBox = lineBox(
    AUTHENTICATION_LAYOUT.TITLE_FONT_SIZE,
    AUTHENTICATION_FONT_METRICS.TITLE_ASCENT,
    AUTHENTICATION_FONT_METRICS.TITLE_DESCENT,
  )
  const subtitleLineBox = lineBox(
    AUTHENTICATION_LAYOUT.SUBTITLE_FONT_SIZE,
    AUTHENTICATION_FONT_METRICS.BODY_ASCENT,
    AUTHENTICATION_FONT_METRICS.BODY_DESCENT,
  )
  const touchHalf = HEADER_ICON_METRICS.MINIMUM_TOUCH_SIZE / 2

  // A direct visit has no previous page of the app to return to, so the arrow goes to the entry page instead.
  const goBack = useGoBack(() => navigate({ to: ROUTES.WELCOME, replace: true }))
  const handleSubmit = useFormSubmit(onSubmit)
  const footerContent = (
    <>
      {footerQuestion}{' '}
      <span className={AUTHENTICATION_CLASSES.FOOTER_ACTION}>{footerActionLabel}</span>
    </>
  )

  if (isWide) {
    return (
      <SplitPage hasTagline>
        <form noValidate onSubmit={handleSubmit} className={WEB_PAGE_CLASSES.FORM}>
          <div className={WEB_PAGE_CLASSES.BACK}>
            <HeaderIconButton icon="back" onPress={goBack} accessibilityLabel={t('common.back')} />
          </div>
          <TextLines as="h1" text={title} className={WEB_PAGE_CLASSES.HEADING} isFlowing />
          <TextLines text={subtitle} className={WEB_PAGE_CLASSES.SUBTITLE} isFlowing />
          {children}
          {formErrorMessage ? (
            <p
              data-testid={TEST_IDS.AUTHENTICATION_FORM_ERROR}
              role="alert"
              className={WEB_PAGE_CLASSES.FORM_ERROR}
            >
              {formErrorMessage}
            </p>
          ) : null}
          <div className={WEB_PAGE_CLASSES.ACTIONS}>
            <PrimaryButton
              testID={TEST_IDS.AUTHENTICATION_SUBMIT}
              tone="navy"
              label={submitLabel}
              isLoading={isSubmitting}
              isFullWidth
              isSubmit
            />
          </div>
          <Link to={footerRoute} replace className={WEB_PAGE_CLASSES.FOOTER}>
            {footerContent}
          </Link>
        </form>
      </SplitPage>
    )
  }

  return (
    <WaveCard>
      <form noValidate onSubmit={handleSubmit} className={AUTHENTICATION_CLASSES.FORM}>
        <div
          className="absolute"
          style={{
            left: `calc(${designUnits(AUTHENTICATION_LAYOUT.BACK_CENTER_X)} - ${touchHalf}px)`,
            top: `calc(${designTop(AUTHENTICATION_LAYOUT.BACK_CENTER_Y)} - ${touchHalf}px)`,
          }}
        >
          <HeaderIconButton icon="back" onPress={goBack} accessibilityLabel={t('common.back')} />
        </div>
        <TextLines
          as="h1"
          text={title}
          className={AUTHENTICATION_CLASSES.TITLE}
          lineClassName="block"
          style={{
            left: designUnits(AUTHENTICATION_LAYOUT.TITLE_LEFT),
            top: designTop(
              AUTHENTICATION_LAYOUT.TITLE_FIRST_BASELINE -
                AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * AUTHENTICATION_LAYOUT.TITLE_FONT_SIZE,
            ),
            fontSize: designUnits(AUTHENTICATION_LAYOUT.TITLE_FONT_SIZE),
            lineHeight: titleLineBox,
            rowGap: designUnits(
              AUTHENTICATION_LAYOUT.TITLE_LINE_PITCH -
                (AUTHENTICATION_FONT_METRICS.TITLE_ASCENT +
                  AUTHENTICATION_FONT_METRICS.TITLE_DESCENT) *
                  AUTHENTICATION_LAYOUT.TITLE_FONT_SIZE,
            ),
          }}
        />
        <TextLines
          text={subtitle}
          className={AUTHENTICATION_CLASSES.SUBTITLE}
          lineClassName="block"
          style={{
            left: designUnits(AUTHENTICATION_LAYOUT.SUBTITLE_LEFT),
            top: designTop(
              subtitleFirstBaseline -
                AUTHENTICATION_FONT_METRICS.BODY_ASCENT * AUTHENTICATION_LAYOUT.SUBTITLE_FONT_SIZE,
            ),
            fontSize: designUnits(AUTHENTICATION_LAYOUT.SUBTITLE_FONT_SIZE),
            lineHeight: subtitleLineBox,
            rowGap: designUnits(
              AUTHENTICATION_LAYOUT.SUBTITLE_LINE_PITCH -
                (AUTHENTICATION_FONT_METRICS.BODY_ASCENT +
                  AUTHENTICATION_FONT_METRICS.BODY_DESCENT) *
                  AUTHENTICATION_LAYOUT.SUBTITLE_FONT_SIZE,
            ),
          }}
        />
        {children}
        {formErrorMessage ? (
          <p
            data-testid={TEST_IDS.AUTHENTICATION_FORM_ERROR}
            role="alert"
            className={AUTHENTICATION_CLASSES.FORM_ERROR}
            style={{
              insetInline: designUnits(AUTHENTICATION_LAYOUT.FORM_ERROR_MARGIN),
              bottom: `calc(${designBottom(AUTHENTICATION_LAYOUT.BUTTON_TOP)} + ${designUnits(AUTHENTICATION_LAYOUT.FORM_ERROR_GAP)})`,
              fontSize: designUnits(AUTHENTICATION_LAYOUT.FORM_ERROR_FONT_SIZE),
            }}
          >
            {formErrorMessage}
          </p>
        ) : null}
        <div
          className={AUTHENTICATION_CLASSES.BUTTON_SLOT}
          style={{
            bottom: designBottom(
              AUTHENTICATION_LAYOUT.BUTTON_TOP + AUTHENTICATION_LAYOUT.BUTTON_HEIGHT,
            ),
          }}
        >
          <PrimaryButton
            testID={TEST_IDS.AUTHENTICATION_SUBMIT}
            tone="navy"
            label={submitLabel}
            isLoading={isSubmitting}
            isSubmit
          />
        </div>
        <Link
          to={footerRoute}
          replace
          className={AUTHENTICATION_CLASSES.FOOTER}
          style={{
            bottom: designBottom(
              AUTHENTICATION_LAYOUT.FOOTER_BASELINE +
                AUTHENTICATION_FONT_METRICS.BODY_DESCENT * AUTHENTICATION_LAYOUT.FOOTER_FONT_SIZE,
            ),
            fontSize: designUnits(AUTHENTICATION_LAYOUT.FOOTER_FONT_SIZE),
          }}
        >
          {footerContent}
        </Link>
      </form>
    </WaveCard>
  )
}
