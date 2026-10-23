import type { Ref } from 'react'
import type { ScrollView } from 'react-native'

export type AppTextVariant =
  | 'brand'
  | 'title'
  | 'titleMedium'
  | 'body'
  | 'bodyMedium'
  | 'bodySemiBold'

export type { HeaderIconName, PrimaryButtonSize, PrimaryButtonTone } from '@clavis-via/shared'

export type ListRowInks = Readonly<{ icon: string; label: string; chevron: string }>

// Where the parts of a ListRow sit (design units): see LIST_ROW_METRICS.
export type ListRowMetrics = Readonly<{
  HEIGHT: number
  ICON_SIZE: number
  ICON_LEFT: number
  LABEL_LEFT: number
  LABEL_FONT_SIZE: number
  LABEL_BASELINE: number
  CHEVRON_SIZE: number
  CHEVRON_RIGHT: number
  DIVIDER_LEFT: number
  DIVIDER_RIGHT: number
}>

export type SegmentedControlVariant = 'soft' | 'outline' | 'solid'

// Measures (design units) of the solid segmented control.
export type SegmentedControlSolidLayout = Readonly<{
  HEIGHT: number
  HORIZONTAL_PADDING: number
  GAP: number
  FONT_SIZE: number
}>

export type SegmentedControlSegment = Readonly<{
  key: string
  label: string
}>

// Measures (design units) of a form field: the box, its label and its error.
export type FieldMetrics = Readonly<{
  HORIZONTAL_MARGIN: number
  BOX_HEIGHT: number
  BOX_RADIUS: number
  BOX_BORDER_WIDTH: number
  TEXT_PADDING: number
  TEXT_SIZE: number
  LABEL_SIZE: number
  LABEL_GAP: number
  ERROR_SIZE: number
  ERROR_GAP: number
}>

// Where the parts of the screen header sit (design units): the icons, the title and the row where it ends.
export type ScreenHeaderLayout = Readonly<{
  LEFT_CENTER_X: number
  LEFT_CENTER_Y: number
  RIGHT_CENTER_RIGHT: number
  RIGHT_CENTER_Y: number
  TITLE_FONT_SIZE: number
  TITLE_BASELINE: number
  END_Y: number
}>

export type { PlanMetaIconName } from '@clavis-via/shared'

export type ProgressBarVariant = 'practice' | 'card'

// The instance a ScrollView ref gives (scrollTo and the like); React Native does not export it by name.
export type ScrollViewHandle = Parameters<typeof ScrollView>[0] extends {
  ref?: Ref<infer Instance>
}
  ? Instance
  : never
