import { TRPCClientError } from '@trpc/client'
import { describe, expect, it } from 'vite-plus/test'
import { getTrpcErrorCode } from './trpc-error'

describe('getTrpcErrorCode', () => {
  it('returns the code of a tRPC error', () => {
    const error = TRPCClientError.from({
      error: { message: 'x', code: -32029, data: { code: 'TOO_MANY_REQUESTS', httpStatus: 429 } },
    } as never)
    expect(getTrpcErrorCode(error)).toBe('TOO_MANY_REQUESTS')
  })

  it('returns undefined for any other failure', () => {
    expect(getTrpcErrorCode(new Error('boom'))).toBeUndefined()
    expect(getTrpcErrorCode(null)).toBeUndefined()
  })
})
