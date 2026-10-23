import { useQueryClient } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { TRPCClientError } from '@trpc/client'
import { HttpResponse, http } from 'msw/http'
import { type ReactNode, StrictMode, useLayoutEffect } from 'react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { server } from '../../tests/utils/server'
import { TEST_API_BASE_URL } from '../../tests/utils/test-constants'
import { ApiSessionProviderContext } from './api-session-provider'
import { useApi } from './trpc.service'

type SessionOptions = {
  sessionId: string
  getToken: () => Promise<string | null>
  onUnauthorized: () => unknown
  onCommit: () => void
}

function CommitProbe({ onCommit }: Readonly<{ onCommit: () => void }>) {
  useLayoutEffect(onCommit, [onCommit])
  return null
}

function renderSession(isStrict = false) {
  const getToken = vi.fn(async (): Promise<string | null> => 'session-token')
  const onUnauthorized = vi.fn()
  let options: SessionOptions = {
    sessionId: 'session-a',
    getToken,
    onUnauthorized,
    onCommit: () => {},
  }
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    const content = (
      <ApiSessionProviderContext
        key={options.sessionId}
        baseUrl={TEST_API_BASE_URL}
        getToken={options.getToken}
        onUnauthorized={options.onUnauthorized}
      >
        <CommitProbe onCommit={options.onCommit} />
        {children}
      </ApiSessionProviderContext>
    )
    return isStrict ? <StrictMode>{content}</StrictMode> : content
  }
  const rendered = renderHook(() => ({ api: useApi(), queryClient: useQueryClient() }), {
    wrapper: Wrapper,
  })
  return {
    ...rendered,
    getToken,
    onUnauthorized,
    update(next: Partial<SessionOptions>) {
      options = { ...options, ...next }
      rendered.rerender()
    },
  }
}

type Session = ReturnType<typeof renderSession>['result']['current']

function startPlan(session: Session) {
  return session.queryClient
    .getMutationCache()
    .build(session.queryClient, session.api.plan.start.mutationOptions())
    .execute({ planId: 'demo-plan' })
}

function unauthorized() {
  return TRPCClientError.from({
    error: {
      message: 'expired',
      code: -32001,
      data: { code: 'UNAUTHORIZED', httpStatus: 401 },
    },
  } as never)
}

function acceptPlanRequest() {
  const headers: (string | null)[] = []
  server.use(
    http.post(`${TEST_API_BASE_URL}/trpc/plan.start`, ({ request }) => {
      headers.push(request.headers.get('authorization'))
      return HttpResponse.json({
        result: { data: { planId: 'demo-plan', startedAt: '2026-10-22T12:00:00.000Z' } },
      })
    }),
  )
  return headers
}

describe('ApiSessionProviderContext', () => {
  it('keeps clients within a session and uses the latest token and sign-out callbacks', async () => {
    const headers = acceptPlanRequest()
    const rendered = renderSession()
    const first = rendered.result.current
    const getToken = vi.fn(async () => 'updated-token')
    const onUnauthorized = vi.fn()

    rendered.update({ getToken, onUnauthorized })

    expect(rendered.result.current.queryClient).toBe(first.queryClient)
    expect(rendered.result.current.api).toBe(first.api)
    await startPlan(rendered.result.current)
    expect(headers).toEqual(['Bearer updated-token'])
    expect(rendered.getToken).not.toHaveBeenCalled()

    await first.queryClient
      .getMutationCache()
      .build(first.queryClient, { mutationFn: () => Promise.reject(unauthorized()) })
      .execute(undefined)
      .catch(() => {})
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(rendered.onUnauthorized).not.toHaveBeenCalled()
  })

  it('retires unauthorized handlers before the next session layout commits', () => {
    const rendered = renderSession()
    const previous = rendered.result.current
    const cache = previous.queryClient.getQueryCache()
    const query = cache.build<unknown, unknown, unknown>(previous.queryClient, {
      queryKey: ['held-query'],
    })

    rendered.update({
      sessionId: 'session-b',
      // Exercise the retired error handler in the layout phase, before passive cleanup can run.
      onCommit: () => cache.config.onError?.(unauthorized(), query),
    })

    expect(rendered.result.current.queryClient).not.toBe(previous.queryClient)
    expect(rendered.onUnauthorized).not.toHaveBeenCalled()
  })

  it('does not acquire credentials when retired work starts another request', async () => {
    const headers = acceptPlanRequest()
    const rendered = renderSession()
    const previous = rendered.result.current
    rendered.unmount()

    await startPlan(previous)

    expect(rendered.getToken).not.toHaveBeenCalled()
    expect(headers).toEqual([null])
  })

  it('discards a token that resolves after its session retired', async () => {
    const headers = acceptPlanRequest()
    const rendered = renderSession()
    let release = (_token: string) => {}
    const gate = new Promise<string>((resolve) => {
      release = resolve
    })
    const getToken = vi.fn(() => gate)
    rendered.update({ getToken })
    const pending = startPlan(rendered.result.current)
    await waitFor(() => expect(getToken).toHaveBeenCalled())

    rendered.unmount()
    release('old-session-token')
    await pending

    expect(headers).toEqual([null])
  })

  it('stays usable after Strict Mode replays the mount lifecycle', async () => {
    const headers = acceptPlanRequest()
    const rendered = renderSession(true)

    await startPlan(rendered.result.current)

    expect(headers).toEqual(['Bearer session-token'])
    expect(rendered.onUnauthorized).not.toHaveBeenCalled()
  })
})
