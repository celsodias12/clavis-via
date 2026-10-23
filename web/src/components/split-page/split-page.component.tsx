import { TEST_IDS } from '@clavis-via/shared'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BRAND_KEY_WIDTH,
  BRAND_WORDS,
  SPLIT_PAGE_CLASSES,
  SPLIT_PAGE_IMAGE_SIZES,
  TAGLINE_KEYS,
} from '../../constants/split-page.constant'
import { WAVE_IMAGE } from '../../constants/wave-card.constant'
import { BrandKey } from '../brand-key/brand-key.component'

type SplitPageProps = Readonly<{
  // Shows the tagline under the brand (the welcome page uses it as its own heading instead).
  hasTagline: boolean
  children: ReactNode
}>

// The entry screens on a wide window: from 1024 px a brand panel on the left (the wave image as a full height
// background) and the content on the right; below that the brand is a header above a centered column.
export function SplitPage({ hasTagline, children }: SplitPageProps) {
  const { t } = useTranslation()

  return (
    <div className={SPLIT_PAGE_CLASSES.PAGE}>
      <aside className={SPLIT_PAGE_CLASSES.PANEL}>
        <div data-testid={TEST_IDS.WAVE_BACKGROUND} aria-hidden="true">
          <img
            data-testid={TEST_IDS.WAVE_BACKGROUND_IMAGE}
            src={WAVE_IMAGE.SOURCE}
            srcSet={WAVE_IMAGE.SOURCE_SET}
            sizes={SPLIT_PAGE_IMAGE_SIZES}
            alt=""
            draggable={false}
            className={SPLIT_PAGE_CLASSES.IMAGE}
          />
        </div>
        <div
          data-testid={TEST_IDS.WELCOME_BRAND}
          role="img"
          aria-label={t('welcome.brand')}
          className={SPLIT_PAGE_CLASSES.BRAND}
        >
          <div aria-hidden="true" className={SPLIT_PAGE_CLASSES.KEY}>
            <BrandKey width={BRAND_KEY_WIDTH} />
          </div>
          <span aria-hidden="true" className={SPLIT_PAGE_CLASSES.CLAVIS}>
            {BRAND_WORDS.CLAVIS}
          </span>
          <span aria-hidden="true" className={SPLIT_PAGE_CLASSES.VIA}>
            {BRAND_WORDS.VIA}
          </span>
        </div>
        {hasTagline ? (
          <p className={SPLIT_PAGE_CLASSES.TAGLINE}>
            {TAGLINE_KEYS.map((key) => (
              <span key={key} className="block">
                {t(key)}
              </span>
            ))}
          </p>
        ) : null}
      </aside>
      <main className={SPLIT_PAGE_CLASSES.CONTENT}>
        <div className={SPLIT_PAGE_CLASSES.COLUMN}>{children}</div>
      </main>
    </div>
  )
}
