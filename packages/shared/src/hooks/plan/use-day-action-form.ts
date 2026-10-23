import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type {
  DayActionFormInput,
  DayActionFormOptions,
  DayActionFormValues,
} from '../../@types/plan.type'
import { dayActionFormSchema } from '../../validation/plan.schema'
import { useCompleteDay } from './use-complete-day'

// The state of the reflection form of the Ação do dia without any platform piece: validation and the
// completion of the day. The platform gives the toast and what happens after the day is completed.
export function useDayActionForm({
  planId,
  dayNumber,
  showToast,
  onCompleted,
}: DayActionFormOptions) {
  const { t } = useTranslation()
  const completeDay = useCompleteDay()
  const { control, handleSubmit, formState } = useForm<
    DayActionFormInput,
    unknown,
    DayActionFormValues
  >({
    resolver: zodResolver(dayActionFormSchema),
    mode: 'onChange',
    defaultValues: { reflection: '' },
  })

  // A blank reflection is not sent. A failed save is shown through the mutation state, so the error is
  // swallowed here: the screen stays as it is and what was typed is kept.
  const submit = handleSubmit(async (values) => {
    try {
      await completeDay.mutateAsync({
        planId,
        dayNumber,
        reflection: values.reflection || undefined,
      })
      showToast(t('screen.dayAction.completedToast'))
      await onCompleted()
    } catch {
      // Nothing to do: completeDay.isError drives the message.
    }
  })

  return { control, submit, isSubmitting: formState.isSubmitting, isError: completeDay.isError }
}
