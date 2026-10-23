import { DESIGN, TEST_IDS } from '@clavis-via/shared'
import type { CSSProperties, ReactNode } from 'react'
import { DESIGN_UNIT_CARD_VALUE, DESIGN_UNIT_VARIABLE } from '../../constants/design.constant'
import { WAVE_CARD_CLASSES, WAVE_FADE_HEIGHT, WAVE_IMAGE } from '../../constants/wave-card.constant'
import { designUnits } from '../../utils/design'

type WaveCardProps = Readonly<{
  // Absolutely positioned in design units (see utils/design.ts) relative to the card.
  children: ReactNode
}>

// The app screen on the web: the wave background and the design laid out on a 266 x 560 card. A phone gets the
// whole viewport; a wide screen gets a centered phone-proportion card (up to 430 px) on a lilac page. The image
// keeps the card width and its own proportion, pinned to the bottom, so it is never stretched or cropped at the
// sides.
export function WaveCard({ children }: WaveCardProps) {
  const cardStyle = {
    containerType: 'inline-size',
    [DESIGN_UNIT_VARIABLE]: DESIGN_UNIT_CARD_VALUE,
  } as CSSProperties

  return (
    <div className={WAVE_CARD_CLASSES.PAGE}>
      <div style={cardStyle} className={WAVE_CARD_CLASSES.CARD}>
        <div
          data-testid={TEST_IDS.WAVE_BACKGROUND}
          aria-hidden="true"
          className={WAVE_CARD_CLASSES.LAYER}
        >
          <img
            data-testid={TEST_IDS.WAVE_BACKGROUND_IMAGE}
            src={WAVE_IMAGE.SOURCE}
            srcSet={WAVE_IMAGE.SOURCE_SET}
            sizes={WAVE_IMAGE.SIZES}
            alt=""
            draggable={false}
            className={WAVE_CARD_CLASSES.IMAGE}
          />
          {/* Fades the flat top color into the image so no horizontal edge shows where they meet. */}
          <div
            data-testid={TEST_IDS.WAVE_BACKGROUND_FADE}
            style={{
              height: designUnits(WAVE_FADE_HEIGHT),
              // The image is as tall as the card design, pinned to the bottom; the fade ends where the image starts.
              bottom: designUnits(DESIGN.CARD_HEIGHT - WAVE_FADE_HEIGHT),
            }}
            className={WAVE_CARD_CLASSES.FADE}
          />
        </div>
        {children}
      </div>
    </div>
  )
}
