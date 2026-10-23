import { HEADER_ICON_METRICS, HEADER_ICON_STYLES, type HeaderIconName } from '@clavis-via/shared'
import { DESIGN_UNIT_SCALE, ICON_METRICS } from '../../constants/component.constant'
import { AppIcon } from '../app-icon/app-icon.component'
import { Button } from '../ui/button'

type HeaderIconButtonProps = Readonly<{
  icon: HeaderIconName
  onPress: () => void
  accessibilityLabel: string
}>

export function HeaderIconButton({ icon, onPress, accessibilityLabel }: HeaderIconButtonProps) {
  const iconStyle = HEADER_ICON_STYLES[icon]

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={accessibilityLabel}
      onClick={onPress}
      style={{
        minWidth: HEADER_ICON_METRICS.MINIMUM_TOUCH_SIZE,
        minHeight: HEADER_ICON_METRICS.MINIMUM_TOUCH_SIZE,
      }}
      className="cursor-pointer rounded-full text-title"
    >
      <AppIcon
        size={iconStyle.size * DESIGN_UNIT_SCALE}
        paths={[
          {
            d: iconStyle.path,
            stroke: ICON_METRICS.CURRENT_COLOR,
            strokeWidth: iconStyle.strokeWidth,
          },
        ]}
      />
    </Button>
  )
}
