import {
  LIST_ROW_ICON_PATHS,
  LIST_ROW_ICONS,
  type ListRowIconName,
  TEST_IDS,
} from '@clavis-via/shared'
import type { ListRowTone } from '../../@types/component.type'
import { LIST_ROW_CLASSES, LIST_ROW_TONES } from '../../constants/journey.constant'
import { AppIcon } from '../app-icon/app-icon.component'

type ListRowProps = Readonly<{
  icon: ListRowIconName
  label: string
  onPress: () => void
  testID?: string
  // The hairline under the row; the last row of a list has none.
  hasDivider?: boolean
  isDisabled?: boolean
  // The inks of the icon, the label and the arrow: the Perfil menu (default) or the achievements.
  tone?: ListRowTone
}>

// A menu row: icon, label, arrow and the hairline that separates it from the next row.
export function ListRow({
  icon,
  label,
  onPress,
  testID,
  hasDivider = true,
  isDisabled = false,
  tone = 'menu',
}: ListRowProps) {
  const inks = LIST_ROW_TONES[tone]

  return (
    <button
      type="button"
      data-testid={testID}
      disabled={isDisabled}
      onClick={onPress}
      className={LIST_ROW_CLASSES.ROW}
    >
      <AppIcon
        size={LIST_ROW_CLASSES.ICON_SIZE}
        paths={[
          {
            d: LIST_ROW_ICON_PATHS[icon],
            stroke: inks.ICON_COLOR,
            strokeWidth: LIST_ROW_ICONS.ICON_STROKE_WIDTH,
          },
        ]}
      />
      <span className={`${LIST_ROW_CLASSES.LABEL} ${inks.LABEL}`}>{label}</span>
      <AppIcon
        size={LIST_ROW_CLASSES.CHEVRON_SIZE}
        paths={[
          {
            d: LIST_ROW_ICONS.CHEVRON_PATH,
            stroke: inks.CHEVRON_COLOR,
            strokeWidth: LIST_ROW_ICONS.CHEVRON_STROKE_WIDTH,
          },
        ]}
      />
      {hasDivider ? (
        <span
          data-testid={testID ? `${testID}${TEST_IDS.LIST_ROW_DIVIDER_SUFFIX}` : undefined}
          className={LIST_ROW_CLASSES.DIVIDER}
        />
      ) : null}
    </button>
  )
}
