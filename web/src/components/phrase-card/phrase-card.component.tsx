import { colors, TEST_IDS } from '@clavis-via/shared'
import {
  GRADIENT_PERCENT,
  JOURNEY_GRADIENT_ANGLE,
  JOURNEY_PHRASE_IMAGE,
  PHRASE_CARD_CLASSES,
} from '../../constants/journey.constant'

type PhraseCardProps = Readonly<{ text: string }>

const TILE_BACKGROUND = `linear-gradient(${JOURNEY_GRADIENT_ANGLE}, ${colors.journeyPhraseTileGradient
  .map((stop) => `${stop.color} ${stop.offset * GRADIENT_PERCENT}%`)
  .join(', ')})`

// The phrase of the Minha jornada: a pastel tile with the leaf on the left and the text on the right.
export function PhraseCard({ text }: PhraseCardProps) {
  return (
    <div data-testid={TEST_IDS.JOURNEY_PHRASE} className={PHRASE_CARD_CLASSES.CARD}>
      <div
        className={PHRASE_CARD_CLASSES.TILE}
        style={{
          backgroundColor: colors.journeyPhraseTileGradient[0].color,
          backgroundImage: TILE_BACKGROUND,
        }}
      >
        <img
          data-testid={TEST_IDS.JOURNEY_PHRASE_ILLUSTRATION}
          src={JOURNEY_PHRASE_IMAGE.SOURCE}
          srcSet={JOURNEY_PHRASE_IMAGE.SOURCE_SET}
          sizes={JOURNEY_PHRASE_IMAGE.SIZES}
          width={JOURNEY_PHRASE_IMAGE.INTRINSIC_WIDTH}
          height={JOURNEY_PHRASE_IMAGE.INTRINSIC_HEIGHT}
          alt=""
          aria-hidden="true"
          className={PHRASE_CARD_CLASSES.ILLUSTRATION}
        />
      </div>
      <p className={PHRASE_CARD_CLASSES.TEXT}>{text}</p>
    </div>
  )
}
