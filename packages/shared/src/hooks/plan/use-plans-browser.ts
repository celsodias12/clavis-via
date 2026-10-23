import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PLAN_CATEGORY_FILTER_KEYS, PLAN_CATEGORY_FILTERS } from '../../constants/plan.constant'
import { filterPlansByCategory } from '../../utils/plan'
import { usePlans } from './use-plans'

// The state of the Planos list without any platform piece: the plans query, the category chips and the plans
// left after the selected category filters them.
export function usePlansBrowser() {
  const { t } = useTranslation()
  const { data, isPending, isError, isFetching, refetch } = usePlans()

  const [selectedKey, setSelectedKey] = useState<string>(PLAN_CATEGORY_FILTER_KEYS.ALL)

  const options = PLAN_CATEGORY_FILTERS.map((filter) => ({
    key: filter.key,
    label: t(filter.labelKey),
  }))
  const isFiltered = selectedKey !== PLAN_CATEGORY_FILTER_KEYS.ALL
  const visiblePlans = data && filterPlansByCategory(data, selectedKey)
  const showAll = () => setSelectedKey(PLAN_CATEGORY_FILTER_KEYS.ALL)

  return {
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
  }
}
