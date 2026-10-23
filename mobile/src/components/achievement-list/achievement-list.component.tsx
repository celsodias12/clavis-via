import {
  ACHIEVEMENT_COPY,
  achievementTextOptions,
  type JourneyAchievement,
  TEST_IDS,
} from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { JOURNEY_ROW_METRICS } from '../../constants/journey-layout.constant'
import { ListRow } from '../list-row/list-row.component'

type AchievementListProps = Readonly<{
  achievements: readonly JourneyAchievement[]
  onAchievementPress: () => void
}>

// The rows of "Minhas conquistas": one sentence per achievement the API computed, in the order it sent them.
export function AchievementList({ achievements, onAchievementPress }: AchievementListProps) {
  const { t } = useTranslation()
  const { theme } = useUnistyles()

  const inks = {
    icon: theme.colors.journeyAchievementIcon,
    label: theme.colors.journeyAchievementLabel,
    chevron: theme.colors.journeyAchievementChevron,
  }

  const sentence = (achievement: JourneyAchievement): string =>
    t(ACHIEVEMENT_COPY[achievement.kind].textKey, achievementTextOptions(achievement))

  return (
    <View testID={TEST_IDS.JOURNEY_ACHIEVEMENTS}>
      {achievements.map((achievement, index) => (
        <ListRow
          key={achievement.kind}
          icon={ACHIEVEMENT_COPY[achievement.kind].icon}
          label={sentence(achievement)}
          onPress={onAchievementPress}
          testID={`${TEST_IDS.JOURNEY_ACHIEVEMENT_PREFIX}${achievement.kind}`}
          hasDivider={index < achievements.length - 1}
          metrics={JOURNEY_ROW_METRICS}
          inks={inks}
        />
      ))}
    </View>
  )
}
