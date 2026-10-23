import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type {
  CheckInFormInput,
  CheckInFormOptions,
  CheckInFormValues,
  CheckInState,
} from '../../@types/check-in.type'
import { CHECK_IN_STATES } from '../../constants/check-in.constant'
import { toLocalDate } from '../../utils/date'
import { checkInFormSchema } from '../../validation/check-in.schema'
import { useCreateCheckIn } from './use-create-check-in'

// The state of the check-in form without any platform piece: the chosen state, the text of "Outro",
// validation and the save. `onSaved` is what the platform does once the check-in is stored.
export function useCheckInForm({ onSaved }: CheckInFormOptions) {
  const createCheckIn = useCreateCheckIn()
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, isSubmitting },
  } = useForm<CheckInFormInput, unknown, CheckInFormValues>({
    resolver: zodResolver(checkInFormSchema),
    mode: 'onChange',
    defaultValues: { otherText: '' },
  })
  const selectedState = useWatch({ control, name: 'state' })

  // The date is read when the button is pressed, so a check-in made after midnight belongs to the new day.
  // The text of "Outro" is only sent with that state; the API rejects it for the others.
  // A failed save is shown through the mutation state, so the error is swallowed here and never reaches the button.
  const submit = handleSubmit(async (values) => {
    try {
      await createCheckIn.mutateAsync({
        state: values.state,
        localDate: toLocalDate(new Date()),
        ...(values.state === CHECK_IN_STATES.OTHER && { otherText: values.otherText }),
      })
      await onSaved()
    } catch {
      // Nothing to do: createCheckIn.isError drives the message and the selection stays as it was.
    }
  })

  const selectState = (state: CheckInState) => setValue('state', state, { shouldValidate: true })

  return {
    control,
    selectedState,
    selectState,
    submit,
    isValid,
    isSubmitting,
    isError: createCheckIn.isError,
  }
}
