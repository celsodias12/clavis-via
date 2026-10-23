import { TEST_IDS } from '@clavis-via/shared'
import { useUser } from '@clerk/expo'
import { Image, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { AVATAR_INITIAL_RATIO } from '../../constants/component.constant'
import { AppText } from '../app-text/app-text.component'

type UserAvatarProps = Readonly<{
  // Diameter in dp.
  size: number
}>

// The signed in user in a circle: the Clerk photo when there is one, otherwise the initial of the first name.
export function UserAvatar({ size }: UserAvatarProps) {
  const { user } = useUser()

  const initial = user?.firstName?.trim().charAt(0).toUpperCase()

  return (
    <View testID={TEST_IDS.USER_AVATAR} style={styles.circle(size)}>
      {user?.hasImage ? (
        <Image
          testID={TEST_IDS.USER_AVATAR_IMAGE}
          source={{ uri: user.imageUrl }}
          style={styles.image(size)}
        />
      ) : null}
      {!user?.hasImage && initial ? (
        <AppText
          variant="titleMedium"
          testID={TEST_IDS.USER_AVATAR_INITIAL}
          style={styles.initial(size)}
        >
          {initial}
        </AppText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  circle: (size: number) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.avatarBackground,
  }),
  image: (size: number) => ({ width: size, height: size }),
  initial: (size: number) => ({
    fontSize: size * AVATAR_INITIAL_RATIO,
    color: theme.colors.avatarInitial,
  }),
}))
