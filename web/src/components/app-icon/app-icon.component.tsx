import type { AppIconPath } from '../../@types/component.type'
import { ICON_METRICS } from '../../constants/component.constant'

type AppIconProps = Readonly<{
  paths: readonly AppIconPath[]
  // Edge of the square icon in px.
  size: number
  testID?: string
}>

// A decorative icon drawn from path data in the 24 unit view box shared with the app.
export function AppIcon({ paths, size, testID }: AppIconProps) {
  return (
    <svg
      data-testid={testID}
      width={size}
      height={size}
      viewBox={`0 0 ${ICON_METRICS.VIEW_BOX_SIZE} ${ICON_METRICS.VIEW_BOX_SIZE}`}
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((path) => (
        <path
          key={path.d}
          d={path.d}
          fill={path.fill ?? ICON_METRICS.DEFAULT_FILL}
          stroke={path.stroke ?? ICON_METRICS.DEFAULT_STROKE}
          strokeWidth={path.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
