import {
  TEST_IDS,
  WELCOME_BRAND_LAYOUT,
  WELCOME_CLAVIS_LETTERS,
  WELCOME_FONT_METRICS,
  WELCOME_FOOTER_LAYOUT,
  WELCOME_TAGLINE_LAYOUT,
  WELCOME_VIA_LETTERS,
} from '@clavis-via/shared'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BrandKey } from '../../components/brand-key/brand-key.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { SplitPage } from '../../components/split-page/split-page.component'
import { WaveCard } from '../../components/wave-card/wave-card.component'
import { ROUTES } from '../../constants/route.constant'
import { WEB_PAGE_CLASSES } from '../../constants/split-page.constant'
import { WELCOME_CLASSES } from '../../constants/welcome.constant'
import { useIsWideScreen } from '../../hooks/layout/use-is-wide-screen'
import { designBottom, designTop, designUnits, lineBox } from '../../utils/design'

const LINK_BOX_HEIGHT =
  (WELCOME_FONT_METRICS.BODY_ASCENT + WELCOME_FONT_METRICS.BODY_DESCENT) *
  WELCOME_FOOTER_LAYOUT.LINK_FONT_SIZE
const LINK_BOX_TOP =
  WELCOME_FOOTER_LAYOUT.LINK_BASELINE -
  WELCOME_FONT_METRICS.BODY_ASCENT * WELCOME_FOOTER_LAYOUT.LINK_FONT_SIZE

// Where a brand letter sits, centered on its design x and hung from its baseline.
function letterStyle(centerX: number, fontSize: number, baseline: number) {
  return {
    left: designUnits(centerX - WELCOME_BRAND_LAYOUT.LETTER_BOX_WIDTH / 2),
    width: designUnits(WELCOME_BRAND_LAYOUT.LETTER_BOX_WIDTH),
    top: designUnits(
      baseline - WELCOME_FONT_METRICS.BRAND_ASCENT * fontSize - WELCOME_BRAND_LAYOUT.KEY_TOP,
    ),
    fontSize: designUnits(fontSize),
  }
}

export function WelcomeScreen() {
  const { t } = useTranslation()
  const isWide = useIsWideScreen()

  if (isWide) {
    return (
      <SplitPage hasTagline={false}>
        <h1 className={WEB_PAGE_CLASSES.HEADING}>
          {WELCOME_TAGLINE_LAYOUT.LINES.map((line) => t(line.key)).join(' ')}
        </h1>
        <div className={WEB_PAGE_CLASSES.ACTIONS}>
          <PrimaryButton
            testID={TEST_IDS.WELCOME_START}
            tone="navy"
            label={t('welcome.start')}
            isFullWidth
            linkProps={{ to: ROUTES.SIGN_UP }}
          />
          <Link
            data-testid={TEST_IDS.WELCOME_SIGN_IN}
            to={ROUTES.SIGN_IN}
            className={WEB_PAGE_CLASSES.TEXT_LINK}
          >
            {t('welcome.haveAccount')}
          </Link>
        </div>
      </SplitPage>
    )
  }

  return (
    <WaveCard>
      <div
        data-testid={TEST_IDS.WELCOME_BRAND}
        role="img"
        aria-label={t('welcome.brand')}
        className={WELCOME_CLASSES.BRAND}
        style={{
          top: designTop(WELCOME_BRAND_LAYOUT.KEY_TOP),
          height: designUnits(WELCOME_BRAND_LAYOUT.BOTTOM - WELCOME_BRAND_LAYOUT.KEY_TOP),
        }}
      >
        <div
          aria-hidden="true"
          className={WELCOME_CLASSES.KEY}
          style={{
            left: designUnits(WELCOME_BRAND_LAYOUT.KEY_LEFT),
            width: designUnits(WELCOME_BRAND_LAYOUT.KEY_WIDTH),
          }}
        >
          <BrandKey width={WELCOME_BRAND_LAYOUT.KEY_WIDTH} />
        </div>
        <div aria-hidden="true" className={WELCOME_CLASSES.LETTERS}>
          {WELCOME_CLAVIS_LETTERS.map((letter) => (
            <span
              key={`clavis-${letter.character}-${letter.centerX}`}
              className={WELCOME_CLASSES.LETTER}
              style={letterStyle(
                letter.centerX,
                WELCOME_BRAND_LAYOUT.CLAVIS_FONT_SIZE,
                WELCOME_BRAND_LAYOUT.CLAVIS_BASELINE,
              )}
            >
              {letter.character}
            </span>
          ))}
          {WELCOME_VIA_LETTERS.map((letter) => (
            <span
              key={`via-${letter.character}-${letter.centerX}`}
              className={WELCOME_CLASSES.LETTER}
              style={letterStyle(
                letter.centerX,
                WELCOME_BRAND_LAYOUT.VIA_FONT_SIZE,
                WELCOME_BRAND_LAYOUT.VIA_BASELINE,
              )}
            >
              {letter.character}
            </span>
          ))}
        </div>
      </div>
      {WELCOME_TAGLINE_LAYOUT.LINES.map((line) => (
        <p
          key={line.key}
          className={WELCOME_CLASSES.TAGLINE}
          style={{
            left: designUnits(line.centerX - WELCOME_TAGLINE_LAYOUT.BOX_WIDTH / 2),
            width: designUnits(WELCOME_TAGLINE_LAYOUT.BOX_WIDTH),
            top: designTop(
              line.baseline - WELCOME_FONT_METRICS.BODY_ASCENT * WELCOME_TAGLINE_LAYOUT.FONT_SIZE,
            ),
            fontSize: designUnits(WELCOME_TAGLINE_LAYOUT.FONT_SIZE),
            letterSpacing: designUnits(WELCOME_TAGLINE_LAYOUT.LETTER_SPACING),
            lineHeight: lineBox(
              WELCOME_TAGLINE_LAYOUT.FONT_SIZE,
              WELCOME_FONT_METRICS.BODY_ASCENT,
              WELCOME_FONT_METRICS.BODY_DESCENT,
            ),
          }}
        >
          {t(line.key)}
        </p>
      ))}
      <div
        className={WELCOME_CLASSES.BUTTON_SLOT}
        style={{
          bottom: designBottom(
            WELCOME_FOOTER_LAYOUT.BUTTON_TOP + WELCOME_FOOTER_LAYOUT.BUTTON_HEIGHT,
          ),
        }}
      >
        <PrimaryButton
          testID={TEST_IDS.WELCOME_START}
          tone="navy"
          label={t('welcome.start')}
          linkProps={{ to: ROUTES.SIGN_UP }}
        />
      </div>
      {/* The row spans the card only to center the link; the link itself is as wide as its text. */}
      <div
        className={WELCOME_CLASSES.LINK_ROW}
        style={{
          bottom: designBottom(
            WELCOME_FOOTER_LAYOUT.LINK_BASELINE +
              WELCOME_FONT_METRICS.BODY_DESCENT * WELCOME_FOOTER_LAYOUT.LINK_FONT_SIZE,
          ),
          height: designUnits(LINK_BOX_HEIGHT),
        }}
      >
        <Link
          data-testid={TEST_IDS.WELCOME_SIGN_IN}
          to={ROUTES.SIGN_IN}
          className={WELCOME_CLASSES.LINK}
          style={{
            fontSize: designUnits(WELCOME_FOOTER_LAYOUT.LINK_FONT_SIZE),
            lineHeight: designUnits(LINK_BOX_HEIGHT),
            paddingBlock: 0,
          }}
        >
          {t('welcome.haveAccount')}
          <span
            aria-hidden="true"
            className={WELCOME_CLASSES.UNDERLINE}
            style={{
              top: designUnits(WELCOME_FOOTER_LAYOUT.UNDERLINE_Y - LINK_BOX_TOP),
              height: designUnits(WELCOME_FOOTER_LAYOUT.UNDERLINE_HEIGHT),
            }}
          />
        </Link>
      </div>
    </WaveCard>
  )
}
