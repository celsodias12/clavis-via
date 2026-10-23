import { act, waitFor } from '@testing-library/react'
import { useController } from 'react-hook-form'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockMutation, mockTrpcError } from '../../../tests/utils/api-handlers'
import { renderHookWithProviders } from '../../../tests/utils/render-hook'
import { server } from '../../../tests/utils/server'
import { TRPC_ERROR_CODES } from '../../constants/api.constant'
import { DAY_ACTION_REFLECTION_MAXIMUM_LENGTH } from '../../constants/plan.constant'
import { useDayActionForm } from './use-day-action-form'

const COMPLETION = { planId: 'plan-x', dayNumber: 2, reflection: null, completedAt: '2026-10-20' }

function setup() {
  const showToast = vi.fn()
  const onCompleted = vi.fn()
  const rendered = renderHookWithProviders(() => {
    const form = useDayActionForm({ planId: 'plan-x', dayNumber: 2, showToast, onCompleted })
    const reflection = useController({ control: form.control, name: 'reflection' })
    return { ...form, reflection }
  })
  const type = (text: string) =>
    act(async () => rendered.result.current.reflection.field.onChange(text))
  const submit = () => act(async () => rendered.result.current.submit())
  return { ...rendered, showToast, onCompleted, type, submit }
}

describe('useDayActionForm', () => {
  it('completes the day with the reflection, shows the toast and leaves through onCompleted', async () => {
    const received: unknown[] = []
    server.use(
      mockMutation('plan.completeDay', (input) => {
        received.push(input)
        return COMPLETION
      }),
    )
    const { i18n, showToast, onCompleted, type, submit } = setup()
    await type('Consegui dizer não.')

    await submit()

    expect(received).toEqual([
      { planId: 'plan-x', dayNumber: 2, reflection: 'Consegui dizer não.' },
    ])
    expect(showToast).toHaveBeenCalledWith(i18n.t('screen.dayAction.completedToast'))
    expect(onCompleted).toHaveBeenCalledTimes(1)
  })

  it('does not send a blank reflection', async () => {
    const received: unknown[] = []
    server.use(
      mockMutation('plan.completeDay', (input) => {
        received.push(input)
        return COMPLETION
      }),
    )
    const { submit } = setup()

    await submit()

    expect(received).toEqual([{ planId: 'plan-x', dayNumber: 2 }])
  })

  it('rejects a reflection that is too long without calling the API', async () => {
    const { result, onCompleted, type, submit } = setup()
    await type('x'.repeat(DAY_ACTION_REFLECTION_MAXIMUM_LENGTH + 1))

    await submit()

    expect(result.current.reflection.fieldState.error?.message).toBeDefined()
    expect(onCompleted).not.toHaveBeenCalled()
  })

  it('keeps the screen and the typed text, and reports the error, when the save fails', async () => {
    server.use(mockTrpcError('plan.completeDay', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    const { result, showToast, onCompleted, type, submit } = setup()
    await type('Texto')

    await submit()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(showToast).not.toHaveBeenCalled()
    expect(onCompleted).not.toHaveBeenCalled()
    expect(result.current.reflection.field.value).toBe('Texto')
  })
})
