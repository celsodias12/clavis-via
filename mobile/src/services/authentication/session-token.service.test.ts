import { clerkMock } from '../../../tests/utils/clerk-mock'
import { getSessionToken } from './session-token.service'

jest.mock('@clerk/expo', () => require('../../../tests/utils/clerk-mock').clerkModule)

beforeEach(() => clerkMock.reset())

describe('getSessionToken', () => {
  it('returns the Clerk session token', async () => {
    clerkMock.getToken.mockResolvedValue('session-token')

    await expect(getSessionToken()).resolves.toBe('session-token')
  })

  it('returns null when the session has no token', async () => {
    await expect(getSessionToken()).resolves.toBeNull()
  })
})
