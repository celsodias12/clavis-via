import { TAB_ICON_PATHS, type TabIconName } from '@clavis-via/shared'
import type { AppIconPath } from '../@types/component.type'
import { NAVIGATION_ICON_METRICS } from '../constants/layout.constant'
import { COLOR_VARIABLES } from '../constants/theme.constant'

// The paths of a navigation icon: the body (filled when selected, outlined otherwise) and the detail on top.
export function buildTabIconPaths(icon: TabIconName, isSelected: boolean): AppIconPath[] {
  const paths = TAB_ICON_PATHS[icon]
  const body: AppIconPath = isSelected
    ? {
        d: paths.filledBody,
        fill: COLOR_VARIABLES.TAB_BAR_ACTIVE,
        stroke: COLOR_VARIABLES.TAB_BAR_ACTIVE,
        strokeWidth: NAVIGATION_ICON_METRICS.FILLED_STROKE_WIDTH,
      }
    : {
        d: paths.outlineBody,
        stroke: COLOR_VARIABLES.TAB_BAR_INACTIVE_ICON,
        strokeWidth: NAVIGATION_ICON_METRICS.STROKE_WIDTH,
      }
  if (!paths.detail) {
    return [body]
  }
  return [
    body,
    {
      d: paths.detail,
      stroke: isSelected ? COLOR_VARIABLES.WHITE : COLOR_VARIABLES.TAB_BAR_INACTIVE_ICON,
      strokeWidth: NAVIGATION_ICON_METRICS.DETAIL_STROKE_WIDTH,
    },
  ]
}
