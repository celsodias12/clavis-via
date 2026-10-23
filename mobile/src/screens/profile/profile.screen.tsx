import { PROFILE_ICONS, PROFILE_MENU_ITEMS, TEST_IDS } from '@clavis-via/shared'
import { useClerk, useUser } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { AppText } from '../../components/app-text/app-text.component'
import { ListRow } from '../../components/list-row/list-row.component'
import { ScreenHeader } from '../../components/screen-header/screen-header.component'
import { UserAvatar } from '../../components/user-avatar/user-avatar.component'
import { AUTHENTICATION_FONT_METRICS } from '../../constants/authentication-layout.constant'
import { LIST_ROW_METRICS } from '../../constants/component.constant'
import { DESIGN } from '../../constants/design.constant'
import { PROFILE_HEADER_LAYOUT, PROFILE_LAYOUT } from '../../constants/profile-layout.constant'
import { useComingSoon } from '../../hooks/feedback/use-coming-soon'
import { scaleDesignValue } from '../../utils/design'

// Meu perfil: the photo (or initial), the name, the purpose card and the menu; only "Sair" leads somewhere,
// the rest shows "Em breve".
export function ProfileScreen() {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const { width } = useWindowDimensions()
  const router = useRouter()
  const { user } = useUser()
  const { signOut } = useClerk()
  const showComingSoon = useComingSoon()

  const [isSigningOut, setIsSigningOut] = useState(false)
  const isSigningOutRef = useRef(false)

  // Synchronous lock: closes the race window between the tap and the state update. A failed sign out
  // unlocks the item so the user can try again; a successful one unmounts the screen through the route guards.
  const handleSignOut = () => {
    if (isSigningOutRef.current) {
      return
    }
    isSigningOutRef.current = true
    setIsSigningOut(true)
    signOut().catch(() => {
      isSigningOutRef.current = false
      setIsSigningOut(false)
    })
  }

  const photoSize = scaleDesignValue(PROFILE_LAYOUT.PHOTO_DIAMETER, width)
  const badgeIconSize = scaleDesignValue(PROFILE_LAYOUT.BADGE_ICON_SIZE, width)
  const purposeIconSize = scaleDesignValue(PROFILE_LAYOUT.PURPOSE_ICON_SIZE, width)

  return (
    <View testID={TEST_IDS.PROFILE_SCREEN} style={styles.screen}>
      <ScreenHeader
        title={t('screen.profile.title')}
        layout={PROFILE_HEADER_LAYOUT}
        leftIcon="back"
        onLeftPress={() => router.back()}
        rightIcon="settings"
        onRightPress={showComingSoon}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.photo}>
          <UserAvatar size={photoSize} />
        </View>
        <Pressable
          testID={TEST_IDS.PROFILE_EDIT_PHOTO}
          accessibilityRole="button"
          accessibilityLabel={t('screen.profile.changePhoto')}
          hitSlop={PROFILE_LAYOUT.BADGE_HIT_SLOP}
          onPress={showComingSoon}
          style={styles.badge}
        >
          <Svg
            width={badgeIconSize}
            height={badgeIconSize}
            viewBox={`0 0 ${PROFILE_ICONS.VIEW_BOX_SIZE} ${PROFILE_ICONS.VIEW_BOX_SIZE}`}
          >
            <Path
              d={PROFILE_ICONS.BADGE_PATH}
              fill="none"
              stroke={theme.colors.practiceIcon}
              strokeWidth={PROFILE_ICONS.BADGE_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
        <AppText
          variant="titleMedium"
          testID={TEST_IDS.PROFILE_NAME}
          numberOfLines={1}
          style={styles.name}
        >
          {user?.firstName?.trim()}
        </AppText>
        <AppText variant="body" style={styles.subtitle}>
          {t('screen.profile.subtitle')}
        </AppText>
        <View style={styles.purposeCard} />
        <View style={styles.purposeSquare}>
          <Svg
            width={purposeIconSize}
            height={purposeIconSize}
            viewBox={`0 0 ${PROFILE_ICONS.VIEW_BOX_SIZE} ${PROFILE_ICONS.VIEW_BOX_SIZE}`}
          >
            <Path
              d={PROFILE_ICONS.PURPOSE_PATH}
              fill="none"
              stroke={theme.colors.practiceIcon}
              strokeWidth={PROFILE_ICONS.PURPOSE_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <AppText variant="bodySemiBold" style={styles.purposeTitle}>
          {t('screen.profile.purposeTitle')}
        </AppText>
        <AppText variant="body" style={styles.purposeText}>
          {t('screen.profile.purposeText')}
        </AppText>
        <View style={styles.list}>
          {PROFILE_MENU_ITEMS.map((item) => (
            <ListRow
              key={item.key}
              icon={item.icon}
              label={t(item.labelKey)}
              onPress={showComingSoon}
              testID={item.testID}
            />
          ))}
          <ListRow
            icon="logout"
            label={t('screen.profile.menu.signOut')}
            onPress={handleSignOut}
            testID={TEST_IDS.PROFILE_SIGN_OUT}
            hasDivider={false}
            isDisabled={isSigningOut}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create((theme, runtime) => {
  const scale = runtime.screen.width / DESIGN.CARD_WIDTH
  // The header is fixed above the scroll area, so the content measures from the row where it ends.
  const contentTop = (designY: number) => (designY - PROFILE_HEADER_LAYOUT.END_Y) * scale
  const photoSize = PROFILE_LAYOUT.PHOTO_DIAMETER * scale
  const badgeSize = PROFILE_LAYOUT.BADGE_DIAMETER * scale
  const photoCenterX = runtime.screen.width / 2
  const nameSize = PROFILE_LAYOUT.NAME_FONT_SIZE
  const subtitleSize = PROFILE_LAYOUT.SUBTITLE_FONT_SIZE
  const purposeTitleSize = PROFILE_LAYOUT.PURPOSE_TITLE_FONT_SIZE
  const purposeBodySize = PROFILE_LAYOUT.PURPOSE_BODY_FONT_SIZE
  const listHeight = (PROFILE_MENU_ITEMS.length + 1) * LIST_ROW_METRICS.HEIGHT

  return {
    screen: { flex: 1, backgroundColor: theme.colors.planSheetBackground },
    // Everything is positioned from the top of this box; it is taller than the screen on small devices.
    content: {
      height:
        contentTop(PROFILE_LAYOUT.LIST_TOP + listHeight + PROFILE_LAYOUT.CONTENT_BOTTOM_GAP) +
        runtime.insets.bottom,
    },
    photo: {
      position: 'absolute',
      left: photoCenterX - photoSize / 2,
      top: contentTop(PROFILE_LAYOUT.PHOTO_CENTER_Y) - photoSize / 2,
    },
    badge: {
      position: 'absolute',
      left: photoCenterX + PROFILE_LAYOUT.BADGE_CENTER_FROM_PHOTO_CENTER_X * scale - badgeSize / 2,
      top:
        contentTop(PROFILE_LAYOUT.PHOTO_CENTER_Y) +
        PROFILE_LAYOUT.BADGE_CENTER_FROM_PHOTO_CENTER_Y * scale -
        badgeSize / 2,
      width: badgeSize,
      height: badgeSize,
      borderRadius: badgeSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.white,
      shadowColor: theme.colors.planCardShadow,
      boxShadow: `0 ${scale}px ${3 * scale}px ${theme.colors.planCardShadow}`,
    },
    name: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: contentTop(
        PROFILE_LAYOUT.NAME_BASELINE - AUTHENTICATION_FONT_METRICS.TITLE_ASCENT * nameSize,
      ),
      textAlign: 'center',
      fontSize: nameSize * scale,
      color: theme.colors.homeHeading,
    },
    subtitle: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: contentTop(
        PROFILE_LAYOUT.SUBTITLE_BASELINE - AUTHENTICATION_FONT_METRICS.BODY_ASCENT * subtitleSize,
      ),
      textAlign: 'center',
      fontSize: subtitleSize * scale,
      color: theme.colors.practiceSubtitle,
    },
    purposeCard: {
      position: 'absolute',
      left: PROFILE_LAYOUT.PURPOSE_LEFT * scale,
      right: PROFILE_LAYOUT.PURPOSE_RIGHT * scale,
      top: contentTop(PROFILE_LAYOUT.PURPOSE_TOP),
      height: PROFILE_LAYOUT.PURPOSE_HEIGHT * scale,
      borderRadius: PROFILE_LAYOUT.PURPOSE_RADIUS * scale,
      backgroundColor: theme.colors.profileCard,
      boxShadow: `0 ${2 * scale}px ${8 * scale}px ${theme.colors.planCardShadow}`,
    },
    purposeSquare: {
      position: 'absolute',
      left: PROFILE_LAYOUT.PURPOSE_SQUARE_LEFT * scale,
      top: contentTop(PROFILE_LAYOUT.PURPOSE_SQUARE_TOP),
      width: PROFILE_LAYOUT.PURPOSE_SQUARE_SIZE * scale,
      height: PROFILE_LAYOUT.PURPOSE_SQUARE_SIZE * scale,
      borderRadius: PROFILE_LAYOUT.PURPOSE_SQUARE_RADIUS * scale,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.profileSquare,
    },
    purposeTitle: {
      position: 'absolute',
      left: PROFILE_LAYOUT.PURPOSE_TEXT_LEFT * scale,
      top: contentTop(
        PROFILE_LAYOUT.PURPOSE_TITLE_BASELINE -
          AUTHENTICATION_FONT_METRICS.BODY_ASCENT * purposeTitleSize,
      ),
      fontSize: purposeTitleSize * scale,
      color: theme.colors.homeHeading,
    },
    purposeText: {
      position: 'absolute',
      left: PROFILE_LAYOUT.PURPOSE_TEXT_LEFT * scale,
      width: PROFILE_LAYOUT.PURPOSE_TEXT_WIDTH * scale,
      top: contentTop(
        PROFILE_LAYOUT.PURPOSE_BODY_FIRST_BASELINE -
          AUTHENTICATION_FONT_METRICS.BODY_ASCENT * purposeBodySize,
      ),
      fontSize: purposeBodySize * scale,
      lineHeight: PROFILE_LAYOUT.PURPOSE_BODY_LINE_HEIGHT * scale,
      color: theme.colors.body,
    },
    list: {
      position: 'absolute',
      left: PROFILE_LAYOUT.LIST_LEFT * scale,
      right: PROFILE_LAYOUT.LIST_RIGHT * scale,
      top: contentTop(PROFILE_LAYOUT.LIST_TOP),
    },
  }
})
