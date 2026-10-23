import { TEST_IDS } from '@clavis-via/shared'
import { useUser } from '@clerk/react'
import { AVATAR_INITIAL_RATIO } from '../../constants/component.constant'

type UserAvatarProps = Readonly<{
  // Diameter in px.
  size: number
}>

// The signed in user in a circle: the Clerk photo when there is one, otherwise the initial of the first name.
export function UserAvatar({ size }: UserAvatarProps) {
  const { user } = useUser()

  const initial = user?.firstName?.trim().charAt(0).toUpperCase()

  return (
    <div
      data-testid={TEST_IDS.USER_AVATAR}
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-avatar-background"
    >
      {user?.hasImage ? (
        <img
          data-testid={TEST_IDS.USER_AVATAR_IMAGE}
          src={user.imageUrl}
          alt=""
          width={size}
          height={size}
          className="size-full object-cover"
        />
      ) : null}
      {!user?.hasImage && initial ? (
        <span
          data-testid={TEST_IDS.USER_AVATAR_INITIAL}
          style={{ fontSize: size * AVATAR_INITIAL_RATIO }}
          className="font-title font-medium text-avatar-initial"
        >
          {initial}
        </span>
      ) : null}
    </div>
  )
}
