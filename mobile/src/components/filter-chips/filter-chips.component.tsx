import { type FilterChipOption, TEST_IDS } from '@clavis-via/shared'
import { Pressable, ScrollView } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { DESIGN } from '../../constants/design.constant'
import { FILTER_CHIPS_LAYOUT } from '../../constants/plans-layout.constant'
import { AppText } from '../app-text/app-text.component'

type FilterChipsProps = Readonly<{
  options: readonly FilterChipOption[]
  selectedKey: string
  onSelect: (key: string) => void
}>

// Row of pill-shaped filters that scrolls horizontally (the design cuts the last chip at the screen edge).
export function FilterChips({ options, selectedKey, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      testID={TEST_IDS.FILTER_CHIPS}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* False positive: a horizontal row of at most a handful of chips, so virtualizing it would only add
          overhead. */}
      {/* react-doctor-disable-next-line react-doctor/rn-no-scrollview-mapped-list */}
      {options.map((option) => {
        const isSelected = option.key === selectedKey
        return (
          <Pressable
            key={option.key}
            testID={`${TEST_IDS.FILTER_CHIP_PREFIX}${option.key}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(option.key)}
            style={styles.chip(isSelected)}
          >
            <AppText
              variant={isSelected ? 'bodySemiBold' : 'bodyMedium'}
              style={styles.label(isSelected)}
            >
              {option.label}
            </AppText>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH

  return {
    content: {
      alignItems: 'center',
      paddingHorizontal: FILTER_CHIPS_LAYOUT.SIDE_PADDING * scale,
      columnGap: FILTER_CHIPS_LAYOUT.GAP * scale,
    },
    chip: (isSelected: boolean) => ({
      height: FILTER_CHIPS_LAYOUT.HEIGHT * scale,
      borderRadius: (FILTER_CHIPS_LAYOUT.HEIGHT / 2) * scale,
      paddingHorizontal:
        (isSelected ? FILTER_CHIPS_LAYOUT.SELECTED_PADDING : FILTER_CHIPS_LAYOUT.PADDING) * scale,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isSelected ? theme.colors.primaryAccent : theme.colors.pillBackground,
    }),
    label: (isSelected: boolean) => ({
      fontSize: FILTER_CHIPS_LAYOUT.FONT_SIZE * scale,
      color: isSelected ? theme.colors.white : theme.colors.body,
    }),
  }
})
