import { TEST_IDS, usePlansBrowser } from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '../../components/error-state/error-state.component'
import { FilterChips } from '../../components/filter-chips/filter-chips.component'
import { HeaderIconButton } from '../../components/header-icon-button/header-icon-button.component'
import { LoadingSkeleton } from '../../components/loading-skeleton/loading-skeleton.component'
import { PlanCard } from '../../components/plan-card/plan-card.component'
import { PrimaryButton } from '../../components/primary-button/primary-button.component'
import { PLANS_CLASSES } from '../../constants/plan.constant'
import { ROUTES } from '../../constants/route.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'

// Planos tab: title, search, category chips and the grid of plans with its loading, error and empty states.
// The grid has one column on a phone, two from 768 px and three from 1024 px.
export function PlansScreen() {
  const { t } = useTranslation()
  const showComingSoon = useComingSoon()
  const {
    options,
    selectedKey,
    setSelectedKey,
    showAll,
    isFiltered,
    visiblePlans,
    isPending,
    isError,
    isFetching,
    refetch,
  } = usePlansBrowser()

  const renderContent = () => {
    if (isPending) {
      return (
        <div className={PLANS_CLASSES.GRID}>
          {PLANS_CLASSES.SKELETON_KEYS.map((skeletonKey) => (
            <LoadingSkeleton key={skeletonKey} className={PLANS_CLASSES.CARD_SKELETON} />
          ))}
        </div>
      )
    }
    if (isError) {
      return (
        <div className={PLANS_CLASSES.STATE}>
          <ErrorState
            message={t('common.loadError')}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        </div>
      )
    }
    if (!visiblePlans?.length) {
      return (
        <div data-testid={TEST_IDS.PLANS_EMPTY} className={PLANS_CLASSES.STATE}>
          <p className={PLANS_CLASSES.EMPTY_MESSAGE}>{t('screen.plans.empty')}</p>
          {isFiltered ? (
            <PrimaryButton label={t('screen.plans.showAll')} tone="light" onPress={showAll} />
          ) : null}
        </div>
      )
    }
    return (
      <>
        <div className={PLANS_CLASSES.GRID}>
          {visiblePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              linkProps={{ to: ROUTES.PLAN, params: { planId: plan.id } }}
            />
          ))}
        </div>
        <p data-testid={TEST_IDS.PLANS_NOTE} className={PLANS_CLASSES.NOTE}>
          {t('screen.plans.note')}
        </p>
      </>
    )
  }

  return (
    <div className={PLANS_CLASSES.PAGE}>
      <header className={PLANS_CLASSES.HEADER}>
        <h1 className={PLANS_CLASSES.TITLE}>{t('screen.plans.title')}</h1>
        <HeaderIconButton
          icon="search"
          onPress={showComingSoon}
          accessibilityLabel={t('screen.plans.search')}
        />
      </header>
      <div className={PLANS_CLASSES.CHIPS}>
        <FilterChips options={options} selectedKey={selectedKey} onSelect={setSelectedKey} />
      </div>
      <div data-testid={TEST_IDS.PLANS_LIST}>{renderContent()}</div>
    </div>
  )
}
