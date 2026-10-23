import { type FilterChipOption, TEST_IDS } from '@clavis-via/shared'
import { cn } from '@/lib/utils'
import { FILTER_CHIPS_CLASSES } from '../../constants/plan.constant'

type FilterChipsProps = Readonly<{
  options: readonly FilterChipOption[]
  selectedKey: string
  onSelect: (key: string) => void
}>

// Row of pill-shaped filters: it scrolls sideways on a phone and wraps on a wide screen.
export function FilterChips({ options, selectedKey, onSelect }: FilterChipsProps) {
  return (
    <div data-testid={TEST_IDS.FILTER_CHIPS} className={FILTER_CHIPS_CLASSES.ROW}>
      {options.map((option) => {
        const isSelected = option.key === selectedKey

        return (
          <button
            key={option.key}
            type="button"
            data-testid={`${TEST_IDS.FILTER_CHIP_PREFIX}${option.key}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(option.key)}
            className={cn(
              FILTER_CHIPS_CLASSES.CHIP,
              isSelected ? FILTER_CHIPS_CLASSES.SELECTED : FILTER_CHIPS_CLASSES.UNSELECTED,
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
