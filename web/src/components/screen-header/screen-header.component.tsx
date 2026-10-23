import { HEADER_ICON_LABEL_KEYS, type HeaderIconName, TEST_IDS } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import type { ScreenHeaderLeftIcon } from '../../@types/component.type'
import { SCREEN_HEADER_CLASSES } from '../../constants/plan-day.constant'
import { HeaderIconButton } from '../header-icon-button/header-icon-button.component'

type ScreenHeaderProps = Readonly<{
  title: string
  // The page heading (h1) when the screen has no other one; otherwise the title is plain text.
  isHeading?: boolean
  // An icon is drawn only when its handler is given too.
  leftIcon?: ScreenHeaderLeftIcon
  onLeftPress?: () => void
  rightIcon?: HeaderIconName
  onRightPress?: () => void
}>

// Header with a back (or close) button on the left, the title centered and an optional icon on the right.
export function ScreenHeader({
  title,
  isHeading = false,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
}: ScreenHeaderProps) {
  const { t } = useTranslation()

  const leftHeaderIcon: HeaderIconName = leftIcon === 'close' ? 'close' : 'chevronBack'
  const Title = isHeading ? 'h1' : 'p'

  return (
    <header data-testid={TEST_IDS.SCREEN_HEADER} className={SCREEN_HEADER_CLASSES.ROW}>
      <span className={SCREEN_HEADER_CLASSES.SLOT}>
        {leftIcon !== undefined && onLeftPress !== undefined ? (
          <HeaderIconButton
            icon={leftHeaderIcon}
            onPress={onLeftPress}
            accessibilityLabel={t(HEADER_ICON_LABEL_KEYS[leftHeaderIcon])}
          />
        ) : null}
      </span>
      <Title className={SCREEN_HEADER_CLASSES.TITLE}>{title}</Title>
      <span className={SCREEN_HEADER_CLASSES.SLOT}>
        {rightIcon !== undefined && onRightPress !== undefined ? (
          <HeaderIconButton
            icon={rightIcon}
            onPress={onRightPress}
            accessibilityLabel={t(HEADER_ICON_LABEL_KEYS[rightIcon])}
          />
        ) : null}
      </span>
    </header>
  )
}
