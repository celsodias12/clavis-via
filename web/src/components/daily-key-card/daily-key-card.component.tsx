import { colors, DAILY_KEY_CARD_BACKGROUND, TEST_IDS } from '@clavis-via/shared'
import type { LinkProps } from '@tanstack/react-router'
import {
  DAILY_KEY_CARD_CLASSES,
  DAILY_KEY_IMAGE,
  HOME_METRICS,
} from '../../constants/home.constant'
import { PrimaryButton } from '../primary-button/primary-button.component'

type DailyKeyCardProps = Readonly<{
  label: string
  title: string
  text: string
  buttonLabel: string
  // Where the button goes: a real link.
  buttonLinkProps: LinkProps
}>

// The patches of color over the gradient, as percentages of the card so they follow its size.
const BLOB_GRADIENTS = DAILY_KEY_CARD_BACKGROUND.BLOBS.map((blob, index) => {
  const { color, fadeColor } = colors.dailyKeyCardBlobs[index]
  const radiusX = (blob.RADIUS_X / DAILY_KEY_CARD_BACKGROUND.CARD_WIDTH) * HOME_METRICS.PERCENT
  const radiusY = (blob.RADIUS_Y / DAILY_KEY_CARD_BACKGROUND.CARD_HEIGHT) * HOME_METRICS.PERCENT
  const centerX = (blob.CENTER_X / DAILY_KEY_CARD_BACKGROUND.CARD_WIDTH) * HOME_METRICS.PERCENT
  const centerY = (blob.CENTER_Y / DAILY_KEY_CARD_BACKGROUND.CARD_HEIGHT) * HOME_METRICS.PERCENT
  return `radial-gradient(ellipse ${radiusX}% ${radiusY}% at ${centerX}% ${centerY}%, ${color}, ${fadeColor})`
})

const GRADIENT_STOPS = colors.dailyKeyCardGradient
  .map((stop) => `${stop.color} ${stop.offset * HOME_METRICS.PERCENT}%`)
  .join(', ')

// The patches sit above the linear gradient (the first image of the list is the topmost).
const CARD_BACKGROUND = [
  ...BLOB_GRADIENTS,
  `linear-gradient(${DAILY_KEY_CARD_BACKGROUND.GRADIENT_ANGLE}, ${GRADIENT_STOPS})`,
].join(', ')

// The pastel "Sua chave de hoje" card: the key illustration on the left, the key and its button on the right.
export function DailyKeyCard({
  label,
  title,
  text,
  buttonLabel,
  buttonLinkProps,
}: DailyKeyCardProps) {
  return (
    <div className={DAILY_KEY_CARD_CLASSES.SHADOW}>
      <div
        className={DAILY_KEY_CARD_CLASSES.CARD}
        style={{
          backgroundColor: colors.dailyKeyCardGradient[0].color,
          backgroundImage: CARD_BACKGROUND,
        }}
      >
        <img
          data-testid={TEST_IDS.DAILY_KEY_ILLUSTRATION}
          src={DAILY_KEY_IMAGE.SOURCE}
          srcSet={DAILY_KEY_IMAGE.SOURCE_SET}
          sizes={DAILY_KEY_IMAGE.SIZES}
          width={DAILY_KEY_IMAGE.INTRINSIC_WIDTH}
          height={DAILY_KEY_IMAGE.INTRINSIC_HEIGHT}
          alt=""
          aria-hidden="true"
          className={DAILY_KEY_CARD_CLASSES.ILLUSTRATION}
        />
        <div className={DAILY_KEY_CARD_CLASSES.TEXT}>
          <p className={DAILY_KEY_CARD_CLASSES.LABEL}>{label}</p>
          <h2 className={DAILY_KEY_CARD_CLASSES.TITLE}>{title}</h2>
          <p className={DAILY_KEY_CARD_CLASSES.BODY}>{text}</p>
          <div className={DAILY_KEY_CARD_CLASSES.BUTTON_SLOT}>
            <PrimaryButton
              label={buttonLabel}
              tone="accent"
              size="compact"
              hasArrow
              isFullWidth
              linkProps={buttonLinkProps}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
