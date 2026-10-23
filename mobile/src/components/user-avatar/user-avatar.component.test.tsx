import { TEST_IDS } from '@clavis-via/shared'
import { useUser } from '@clerk/expo'
import { render, screen } from '@testing-library/react-native'
import { UserAvatar } from './user-avatar.component'

jest.mock('@clerk/expo', () => require('../../../tests/utils/clerk-mock').clerkModule)

function mockUser(user: { firstName: string | null; hasImage: boolean; imageUrl?: string }) {
  jest.mocked(useUser).mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: { imageUrl: 'https://img.test/ana.png', ...user },
  } as unknown as ReturnType<typeof useUser>)
}

describe('UserAvatar', () => {
  it('shows the Clerk photo in a circle of the given size when the user has one', async () => {
    mockUser({ firstName: 'Ana', hasImage: true })
    await render(<UserAvatar size={40} />)
    const image = screen.getByTestId(TEST_IDS.USER_AVATAR_IMAGE)
    expect(image.props.source).toEqual({ uri: 'https://img.test/ana.png' })
    expect(image).toHaveStyle({ width: 40, height: 40 })
    expect(screen.getByTestId(TEST_IDS.USER_AVATAR)).toHaveStyle({
      width: 40,
      height: 40,
      borderRadius: 20,
    })
    expect(screen.queryByTestId(TEST_IDS.USER_AVATAR_INITIAL)).toBeNull()
  })

  it('shows the uppercase initial of the first name when there is no photo', async () => {
    mockUser({ firstName: ' ana ', hasImage: false })
    await render(<UserAvatar size={40} />)
    expect(screen.getByTestId(TEST_IDS.USER_AVATAR_INITIAL)).toHaveTextContent('A')
    expect(screen.queryByTestId(TEST_IDS.USER_AVATAR_IMAGE)).toBeNull()
  })

  it('shows an empty circle when there is neither photo nor name', async () => {
    mockUser({ firstName: null, hasImage: false })
    await render(<UserAvatar size={40} />)
    expect(screen.getByTestId(TEST_IDS.USER_AVATAR)).toBeTruthy()
    expect(screen.queryByTestId(TEST_IDS.USER_AVATAR_IMAGE)).toBeNull()
    expect(screen.queryByTestId(TEST_IDS.USER_AVATAR_INITIAL)).toBeNull()
  })

  it('shows an empty circle while the user is not loaded', async () => {
    jest
      .mocked(useUser)
      .mockReturnValue({ isLoaded: false, isSignedIn: undefined, user: undefined } as ReturnType<
        typeof useUser
      >)
    await render(<UserAvatar size={40} />)
    expect(screen.queryByTestId(TEST_IDS.USER_AVATAR_IMAGE)).toBeNull()
    expect(screen.queryByTestId(TEST_IDS.USER_AVATAR_INITIAL)).toBeNull()
  })
})
