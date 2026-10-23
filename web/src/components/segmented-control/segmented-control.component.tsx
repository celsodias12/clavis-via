import { cn } from '@/lib/utils'
import type { SegmentedControlVariant } from '../../@types/component.type'
import {
  SEGMENTED_CONTROL_CLASSES,
  SEGMENTED_CONTROL_VARIANT_CLASSES,
} from '../../constants/plan.constant'

type SegmentedControlProps = Readonly<{
  segments: readonly Readonly<{ key: string; label: string }>[]
  selectedKey: string
  onSelect: (key: string) => void
  // Soft: touching segments, a pale pill and an underline on the selected one (Plano). Outline: separate pills,
  // the selected one white with an outline (Dia). Solid: separate pale pills, the selected one filled with the
  // accent (Minha jornada, Minhas emoções).
  variant?: SegmentedControlVariant
  // The test ID of each segment is the prefix followed by its key.
  testIDPrefix?: string
}>

// Row of segments of which exactly one is selected. They are toggle buttons (aria-pressed), not tabs: some
// segments scroll to a section or open another screen, so there is no tab panel to point to.
export function SegmentedControl({
  segments,
  selectedKey,
  onSelect,
  variant = 'soft',
  testIDPrefix = '',
}: SegmentedControlProps) {
  const classes = SEGMENTED_CONTROL_VARIANT_CLASSES[variant]

  return (
    <div className={classes.ROW}>
      {segments.map((segment) => {
        const isSelected = segment.key === selectedKey

        return (
          <button
            key={segment.key}
            type="button"
            data-testid={`${testIDPrefix}${segment.key}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(segment.key)}
            className={cn(classes.SEGMENT, isSelected ? classes.SELECTED : classes.UNSELECTED)}
          >
            {segment.label}
            {isSelected && variant === 'soft' ? (
              <span className={SEGMENTED_CONTROL_CLASSES.UNDERLINE} />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
