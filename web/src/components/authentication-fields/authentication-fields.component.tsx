import {
  AUTHENTICATION_FONT_METRICS,
  AUTHENTICATION_LAYOUT,
  FIELD_METRICS,
} from '@clavis-via/shared'
import type { ReactNode } from 'react'
import { WEB_PAGE_CLASSES } from '../../constants/split-page.constant'
import { useIsWideScreen } from '../../hooks/layout/use-is-wide-screen'
import { designTop, designUnits } from '../../utils/design'

type AuthenticationFieldsProps = Readonly<{
  // Design y of the first label's baseline.
  firstLabelBaseline: number
  children: ReactNode
}>

const LABEL_LINE_HEIGHT =
  (AUTHENTICATION_FONT_METRICS.BODY_ASCENT + AUTHENTICATION_FONT_METRICS.BODY_DESCENT) *
  FIELD_METRICS.LABEL_SIZE
const FIELD_HEIGHT = LABEL_LINE_HEIGHT + FIELD_METRICS.LABEL_GAP + FIELD_METRICS.BOX_HEIGHT

// Stacks the form fields of an authentication screen so the label baselines sit FIELD_PITCH apart.
export function AuthenticationFields({ firstLabelBaseline, children }: AuthenticationFieldsProps) {
  const isWide = useIsWideScreen()

  if (isWide) {
    return <div className={WEB_PAGE_CLASSES.FIELDS}>{children}</div>
  }

  return (
    <div
      className="absolute inset-x-0 flex flex-col"
      style={{
        // The first label's line box starts one ascent above its baseline.
        top: designTop(
          firstLabelBaseline - AUTHENTICATION_FONT_METRICS.BODY_ASCENT * FIELD_METRICS.LABEL_SIZE,
        ),
        gap: designUnits(AUTHENTICATION_LAYOUT.FIELD_PITCH - FIELD_HEIGHT),
      }}
    >
      {children}
    </div>
  )
}
