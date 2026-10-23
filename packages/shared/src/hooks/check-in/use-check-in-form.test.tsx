import { act, waitFor } from '@testing-library/react'
import { useController } from 'react-hook-form'
import { describe, expect, it, vi } from 'vite-plus/test'
import { mockMutation, mockTrpcError } from '../../../tests/utils/api-handlers'
import { renderHookWithProviders } from '../../../tests/utils/render-hook'
import { server } from '../../../tests/utils/server'
import { TRPC_ERROR_CODES } from '../../constants/api.constant'
import { CHECK_IN_STATES } from '../../constants/check-in.constant'
import { toLocalDate } from '../../utils/date'
import { useCheckInForm } from './use-check-in-form'

function setup() {
  const onSaved = vi.fn()
  const rendered = renderHookWithProviders(() => {
    const form = useCheckInForm({ onSaved })
    const otherText = useController({ control: form.control, name: 'otherText' })
    return { ...form, otherText }
  })
  const select = (state: Parameters<typeof rendered.result.current.selectState>[0]) =>
    act(async () => rendered.result.current.selectState(state))
  const submit = () => act(async () => rendered.result.current.submit())
  return { ...rendered, onSaved, select, submit }
}

describe('useCheckInForm', () => {
  it('starts without a state and not valid', () => {
    const { result } = setup()

    expect(result.current.selectedState).toBeUndefined()
    expect(result.current.isValid).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('saves the chosen state with the local date of the moment and leaves through onSaved', async () => {
    const received: unknown[] = []
    server.use(
      mockMutation('checkIn.create', (input) => {
        received.push(input)
        return { id: 'check-in-1' }
      }),
    )
    const { result, onSaved, select, submit } = setup()

    await select(CHECK_IN_STATES.HEAVY)
    await waitFor(() => expect(result.current.isValid).toBe(true))
    await submit()

    expect(received).toEqual([{ state: CHECK_IN_STATES.HEAVY, localDate: toLocalDate(new Date()) }])
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(result.current.selectedState).toBe(CHECK_IN_STATES.HEAVY)
  })

  it('sends the text of "Outro" only with that state', async () => {
    const received: unknown[] = []
    server.use(
      mockMutation('checkIn.create', (input) => {
        received.push(input)
        return { id: 'check-in-1' }
      }),
    )
    const { result, select, submit } = setup()
    await select(CHECK_IN_STATES.OTHER)
    expect(result.current.isValid).toBe(false)

    await act(async () => result.current.otherText.field.onChange('Cansada'))
    await waitFor(() => expect(result.current.isValid).toBe(true))
    await submit()

    expect(received).toEqual([
      { state: CHECK_IN_STATES.OTHER, localDate: toLocalDate(new Date()), otherText: 'Cansada' },
    ])
  })

  it('keeps the screen and reports the error when the save fails', async () => {
    server.use(mockTrpcError('checkIn.create', TRPC_ERROR_CODES.INTERNAL_SERVER_ERROR, 500))
    const { result, onSaved, select, submit } = setup()
    await select(CHECK_IN_STATES.AT_PEACE)
    await waitFor(() => expect(result.current.isValid).toBe(true))

    await submit()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(onSaved).not.toHaveBeenCalled()
    expect(result.current.selectedState).toBe(CHECK_IN_STATES.AT_PEACE)
  })
})
