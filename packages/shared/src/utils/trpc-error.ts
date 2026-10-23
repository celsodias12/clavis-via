import { TRPCClientError } from '@trpc/client'

// The tRPC error code of a failed call (e.g. "TOO_MANY_REQUESTS"), or undefined for any other failure.
export function getTrpcErrorCode(error: unknown): string | undefined {
  return error instanceof TRPCClientError ? error.data?.code : undefined
}
