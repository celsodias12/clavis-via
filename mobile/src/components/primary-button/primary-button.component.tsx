import { runWithPressLock, TEST_IDS } from '@clavis-via/shared'
import { useRef } from 'react'
import { ActivityIndicator, Pressable, useWindowDimensions } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { StyleSheet } from 'react-native-unistyles'
import type { PrimaryButtonSize, PrimaryButtonTone } from '../../@types/component.type'
import {
  BUTTON_ARROW_METRICS,
  BUTTON_METRICS,
  BUTTON_SIZE_METRICS,
} from '../../constants/component.constant'
import { scaleDesignValue } from '../../utils/design'
import { AppText } from '../app-text/app-text.component'

type PrimaryButtonProps = Readonly<{
  label: string
  onPress: () => unknown
  tone: PrimaryButtonTone
  // The compact size is the 30 unit pill of the Início card.
  size?: PrimaryButtonSize
  // Draws an arrow after the label.
  hasArrow?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  // Stretches the button to the width its parent gives it instead of the fixed 226 design units.
  isFullWidth?: boolean
  testID?: string
}>

export function PrimaryButton({
  label,
  onPress,
  tone,
  size = 'regular',
  hasArrow = false,
  isLoading = false,
  isDisabled = false,
  isFullWidth = false,
  testID,
}: PrimaryButtonProps) {
  const { width } = useWindowDimensions()

  const isPendingRef = useRef(false)

  const isBlocked = isLoading || isDisabled

  const handlePress = () => runWithPressLock(isPendingRef, onPress)

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: isLoading, disabled: isBlocked }}
      disabled={isBlocked}
      onPress={handlePress}
      style={styles.button(tone, size, isDisabled, isFullWidth, width)}
    >
      {isLoading ? (
        <ActivityIndicator
          testID={testID ? `${testID}${TEST_IDS.PRIMARY_BUTTON_SPINNER_SUFFIX}` : undefined}
          color={styles.spinner.color}
        />
      ) : (
        <>
          <AppText
            variant={size === 'compact' ? 'bodySemiBold' : 'body'}
            style={styles.label(size, width)}
          >
            {label}
          </AppText>
          {hasArrow ? (
            <Svg
              testID={testID ? `${testID}${TEST_IDS.PRIMARY_BUTTON_ARROW_SUFFIX}` : undefined}
              width={scaleDesignValue(BUTTON_ARROW_METRICS.SIZE, width)}
              height={scaleDesignValue(BUTTON_ARROW_METRICS.SIZE, width)}
              viewBox={`0 0 ${BUTTON_ARROW_METRICS.VIEW_BOX_SIZE} ${BUTTON_ARROW_METRICS.VIEW_BOX_SIZE}`}
              style={styles.arrow(width)}
            >
              <Path
                d={BUTTON_ARROW_METRICS.PATH}
                fill="none"
                stroke={styles.spinner.color}
                strokeWidth={BUTTON_ARROW_METRICS.STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          ) : null}
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => {
  const backgroundByTone: Record<PrimaryButtonTone, string> = {
    navy: theme.colors.navy,
    light: theme.colors.primaryLight,
    accent: theme.colors.primaryAccent,
  }

  return {
    button: (
      tone: PrimaryButtonTone,
      size: PrimaryButtonSize,
      isDisabled: boolean,
      isFullWidth: boolean,
      width: number,
    ) => ({
      flexDirection: 'row',
      alignSelf: isFullWidth ? 'stretch' : 'center',
      alignItems: 'center',
      justifyContent: 'center',
      width: isFullWidth ? undefined : scaleDesignValue(BUTTON_METRICS.WIDTH, width),
      height: scaleDesignValue(BUTTON_SIZE_METRICS[size].HEIGHT, width),
      borderRadius: scaleDesignValue(BUTTON_SIZE_METRICS[size].RADIUS, width),
      backgroundColor: backgroundByTone[tone],
      // The light tone is already the muted look of the design, so the other tones are the ones dimmed.
      opacity:
        isDisabled && tone !== 'light'
          ? BUTTON_METRICS.DISABLED_OPACITY
          : BUTTON_METRICS.ENABLED_OPACITY,
      ...(tone === 'navy' && {
        boxShadow: [
          {
            offsetX: 0,
            offsetY: scaleDesignValue(BUTTON_METRICS.SHADOW_OFFSET_Y, width),
            blurRadius: scaleDesignValue(BUTTON_METRICS.SHADOW_BLUR, width),
            color: theme.colors.buttonShadow,
          },
        ],
      }),
    }),
    label: (size: PrimaryButtonSize, width: number) => ({
      fontSize: scaleDesignValue(BUTTON_SIZE_METRICS[size].FONT_SIZE, width),
      color: theme.colors.white,
      marginTop:
        size === 'compact' ? scaleDesignValue(BUTTON_METRICS.COMPACT_LABEL_OFFSET_Y * 2, width) : 0,
    }),
    arrow: (width: number) => ({
      marginLeft: scaleDesignValue(BUTTON_ARROW_METRICS.GAP, width),
      marginTop: scaleDesignValue(BUTTON_ARROW_METRICS.OFFSET_Y * 2, width),
    }),
    spinner: {
      color: theme.colors.white,
    },
  }
})
