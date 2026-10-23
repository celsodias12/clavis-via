import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import type {
  SegmentedControlSegment,
  SegmentedControlSolidLayout,
  SegmentedControlVariant,
} from '../../@types/component.type'
import { DESIGN } from '../../constants/design.constant'
import {
  SEGMENTED_CONTROL_LAYOUT,
  SEGMENTED_CONTROL_OUTLINE_LAYOUT,
  SEGMENTED_CONTROL_SOLID_LAYOUT,
} from '../../constants/plan-layout.constant'
import { AppText } from '../app-text/app-text.component'

type SegmentedControlProps = Readonly<{
  segments: readonly SegmentedControlSegment[]
  selectedKey: string
  onSelect: (key: string) => void
  // Soft: touching segments, a pale pill and an underline on the selected one (Plano). Outline: separate pills,
  // the selected one white with an outline (Dia). Solid: separate pale pills, the selected one filled with the
  // accent and a white label (Minhas emoções).
  variant: SegmentedControlVariant
  // The test ID of each segment is the prefix followed by its key.
  testIDPrefix?: string
  // Measures of the solid variant (design units); the default is the one of Minhas emoções.
  solidLayout?: SegmentedControlSolidLayout
}>

// Row of segments of which exactly one is selected; each segment is as wide as its label.
export function SegmentedControl({
  segments,
  selectedKey,
  onSelect,
  variant,
  testIDPrefix = '',
  solidLayout = SEGMENTED_CONTROL_SOLID_LAYOUT,
}: SegmentedControlProps) {
  return (
    <View accessibilityRole="tablist" style={styles.row(variant, solidLayout)}>
      {segments.map((segment) => {
        const isSelected = segment.key === selectedKey
        return (
          <Pressable
            key={segment.key}
            testID={`${testIDPrefix}${segment.key}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(segment.key)}
            style={styles.segment(isSelected, variant, solidLayout)}
          >
            <AppText
              variant={isSelected ? 'bodySemiBold' : 'bodyMedium'}
              style={styles.label(isSelected, variant, solidLayout)}
            >
              {segment.label}
            </AppText>
            {isSelected && variant === 'soft' ? (
              <View pointerEvents="none" style={styles.underline} />
            ) : null}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  const layout = SEGMENTED_CONTROL_LAYOUT
  const outline = SEGMENTED_CONTROL_OUTLINE_LAYOUT

  const pillSegment = (
    pill: { HEIGHT: number; HORIZONTAL_PADDING: number },
    backgroundColor: string,
  ) => ({
    height: pill.HEIGHT * scale,
    paddingHorizontal: pill.HORIZONTAL_PADDING * scale,
    borderRadius: (pill.HEIGHT / 2) * scale,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor,
  })

  return {
    row: (variant: SegmentedControlVariant, solid: SegmentedControlSolidLayout) => ({
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: { soft: 0, outline: outline.GAP * scale, solid: solid.GAP * scale }[variant],
    }),
    segment: (
      isSelected: boolean,
      variant: SegmentedControlVariant,
      solid: SegmentedControlSolidLayout,
    ) => {
      if (variant === 'outline') {
        return {
          ...pillSegment(outline, isSelected ? theme.colors.white : theme.colors.pillBackground),
          borderWidth: outline.BORDER_WIDTH * scale,
          borderColor: isSelected ? theme.colors.dayChipOutline : 'transparent',
        }
      }
      if (variant === 'solid') {
        return pillSegment(
          solid,
          isSelected ? theme.colors.emotionsSegmentSolid : theme.colors.pillBackground,
        )
      }
      return pillSegment(layout, isSelected ? theme.colors.planSegmentPill : 'transparent')
    },
    label: (
      isSelected: boolean,
      variant: SegmentedControlVariant,
      solid: SegmentedControlSolidLayout,
    ) => ({
      fontSize:
        { soft: layout.FONT_SIZE, outline: outline.FONT_SIZE, solid: solid.FONT_SIZE }[variant] *
        scale,
      color: isSelected
        ? {
            soft: theme.colors.planAccent,
            outline: theme.colors.planAccent,
            solid: theme.colors.white,
          }[variant]
        : theme.colors.body,
    }),
    underline: {
      position: 'absolute',
      left: layout.UNDERLINE_INSET * scale,
      right: layout.UNDERLINE_INSET * scale,
      bottom: layout.UNDERLINE_OFFSET_BOTTOM * scale,
      height: layout.UNDERLINE_HEIGHT * scale,
      borderBottomWidth: layout.UNDERLINE_THICKNESS * scale,
      borderBottomLeftRadius: layout.UNDERLINE_RADIUS * scale,
      borderBottomRightRadius: layout.UNDERLINE_RADIUS * scale,
      borderColor: theme.colors.planAccent,
    },
  }
})
