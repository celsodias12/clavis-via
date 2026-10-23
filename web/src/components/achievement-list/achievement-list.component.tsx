import {
  ACHIEVEMENT_COPY,
  achievementTextOptions,
  type JourneyAchievement,
  TEST_IDS,
} from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { ListRow } from '../list-row/list-row.component'

type AchievementListProps = Readonly<{
  achievements: readonly JourneyAchievement[]
  onAchievementPress: () => void
}>

// The rows of "Minhas conquistas": one sentence per achievement the API computed, in the order it sent them.
export function AchievementList({ achievements, onAchievementPress }: AchievementListProps) {
  const { t } = useTranslation()

  return (
    <div data-testid={TEST_IDS.JOURNEY_ACHIEVEMENTS}>
      {achievements.map((achievement, index) => (
        <ListRow
          key={achievement.kind}
          icon={ACHIEVEMENT_COPY[achievement.kind].icon}
          label={t(ACHIEVEMENT_COPY[achievement.kind].textKey, achievementTextOptions(achievement))}
          onPress={onAchievementPress}
          testID={`${TEST_IDS.JOURNEY_ACHIEVEMENT_PREFIX}${achievement.kind}`}
          hasDivider={index < achievements.length - 1}
          tone="achievement"
        />
      ))}
    </div>
  )
}
