import { TEST_IDS } from '@clavis-via/shared'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vite-plus/test'
import { clerkMock } from '../../../tests/utils/clerk-mock'
import { UserAvatar } from './user-avatar.component'

describe('UserAvatar', () => {
  it('shows the Clerk photo when the user has one', () => {
    clerkMock.user = { firstName: 'Ana', hasImage: true, imageUrl: 'https://img.test/ana.png' }
    render(<UserAvatar size={36} />)

    expect(screen.getByTestId(TEST_IDS.USER_AVATAR_IMAGE).getAttribute('src')).toBe(
      'https://img.test/ana.png',
    )
    expect(screen.queryByTestId(TEST_IDS.USER_AVATAR_INITIAL)).toBeNull()
  })

  it('shows the initial of the first name without a photo', () => {
    clerkMock.user = { firstName: ' ana', hasImage: false, imageUrl: '' }
    render(<UserAvatar size={36} />)

    expect(screen.getByTestId(TEST_IDS.USER_AVATAR_INITIAL).textContent).toBe('A')
    expect(screen.getByTestId(TEST_IDS.USER_AVATAR).style.width).toBe('36px')
  })

  it('is an empty circle without a user or a first name', () => {
    render(<UserAvatar size={36} />)
    expect(screen.getByTestId(TEST_IDS.USER_AVATAR).childElementCount).toBe(0)

    clerkMock.user = { firstName: null, hasImage: false, imageUrl: '' }
    render(<UserAvatar size={36} />)
    expect(screen.queryByTestId(TEST_IDS.USER_AVATAR_INITIAL)).toBeNull()
  })
})
