import { Text, type TextProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import type { AppTextVariant } from '../../@types/component.type'

type AppTextProps = TextProps & {
  variant: AppTextVariant
}

// Font scaling is locked (maxFontSizeMultiplier 1): the layout is measured in design pixels and a
// large system font would break it. Registered as a decision for DECISOES.md.
export function AppText({ variant, style, children, ...textProps }: Readonly<AppTextProps>) {
  return (
    <Text {...textProps} maxFontSizeMultiplier={1} style={[styles.text(variant), style]}>
      {children}
    </Text>
  )
}

const styles = StyleSheet.create((theme) => ({
  text: (variant: AppTextVariant) => ({
    fontFamily: theme.fonts[variant],
    includeFontPadding: false,
  }),
}))
