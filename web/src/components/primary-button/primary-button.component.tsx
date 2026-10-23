import {
  BUTTON_ARROW_PATH,
  type PrimaryButtonSize,
  type PrimaryButtonTone,
  runWithPressLock,
  TEST_IDS,
} from '@clavis-via/shared'
import { Link, type LinkProps } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  BUTTON_ARROW_METRICS,
  ICON_METRICS,
  PRIMARY_BUTTON_CLASSES,
  PRIMARY_BUTTON_SIZE_CLASSES,
  PRIMARY_BUTTON_TONE_CLASSES,
} from '../../constants/component.constant'
import { AppIcon } from '../app-icon/app-icon.component'
import { Button } from '../ui/button'

type PrimaryButtonProps = Readonly<{
  label: string
  // Not needed for a submit button: the form's submit handler does the work.
  onPress?: () => unknown
  // Makes it the submit button of its <form>, so Enter in a field and a click send the form the same way.
  isSubmit?: boolean
  // For a button that only navigates: it becomes a real link (open in a new tab, URL on hover) with the look of
  // the button, and needs no onPress.
  linkProps?: LinkProps
  tone: PrimaryButtonTone
  // The compact size is the pill of the Início card.
  size?: PrimaryButtonSize
  // Draws an arrow after the label.
  hasArrow?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  // Stretches the button to the width its parent gives it instead of the fixed phone width.
  isFullWidth?: boolean
  testID?: string
}>

export function PrimaryButton({
  label,
  onPress,
  isSubmit = false,
  linkProps,
  tone,
  size = 'regular',
  hasArrow = false,
  isLoading = false,
  isDisabled = false,
  isFullWidth = false,
  testID,
}: PrimaryButtonProps) {
  const { t } = useTranslation()

  const isPendingRef = useRef(false)

  const isBlocked = isLoading || isDisabled

  // Synchronous lock: closes the race window between the click and the parent's pending state.
  const handleClick = () => runWithPressLock(isPendingRef, () => onPress?.())

  const className = cn(
    PRIMARY_BUTTON_CLASSES.BASE,
    PRIMARY_BUTTON_TONE_CLASSES[tone],
    PRIMARY_BUTTON_SIZE_CLASSES[size],
    isFullWidth ? PRIMARY_BUTTON_CLASSES.FULL_WIDTH : PRIMARY_BUTTON_CLASSES.FIXED_WIDTH,
    // The light tone is already the muted look of the design, so the other tones are the ones dimmed.
    isDisabled && tone !== 'light' && PRIMARY_BUTTON_CLASSES.DIMMED,
  )

  const arrow = hasArrow ? (
    <AppIcon
      testID={testID ? `${testID}${TEST_IDS.PRIMARY_BUTTON_ARROW_SUFFIX}` : undefined}
      size={BUTTON_ARROW_METRICS.SIZE}
      paths={[
        {
          d: BUTTON_ARROW_PATH,
          stroke: ICON_METRICS.CURRENT_COLOR,
          strokeWidth: BUTTON_ARROW_METRICS.STROKE_WIDTH,
        },
      ]}
    />
  ) : null

  if (linkProps) {
    return (
      <Button asChild className={className}>
        <Link {...linkProps} data-testid={testID}>
          {label}
          {arrow}
        </Link>
      </Button>
    )
  }

  return (
    <Button
      type={isSubmit ? 'submit' : 'button'}
      data-testid={testID}
      aria-busy={isLoading}
      disabled={isBlocked}
      onClick={isSubmit ? undefined : handleClick}
      className={className}
    >
      {isLoading ? (
        <LoaderCircle
          role="status"
          aria-label={t('common.loading')}
          data-testid={testID ? `${testID}${TEST_IDS.PRIMARY_BUTTON_SPINNER_SUFFIX}` : undefined}
          className={PRIMARY_BUTTON_CLASSES.SPINNER}
        />
      ) : (
        <>
          {label}
          {arrow}
        </>
      )}
    </Button>
  )
}
