import type { ReactNode } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import {
  AUTHENTICATION_FONT_METRICS,
  AUTHENTICATION_LAYOUT,
} from '../../constants/authentication-layout.constant'
import { FIELD_METRICS } from '../../constants/component.constant'
import { scaleDesignValue, topFromDesign } from '../../utils/design'

type AuthenticationFieldsProps = Readonly<{
  // Design y of the first label's baseline.
  firstLabelBaseline: number
  children: ReactNode
}>

// Stacks the form fields of an authentication screen so the label baselines sit FIELD_PITCH apart.
export function AuthenticationFields({ firstLabelBaseline, children }: AuthenticationFieldsProps) {
  return <View style={styles.fields(firstLabelBaseline)}>{children}</View>
}

const styles = StyleSheet.create((_theme, runtime) => {
  const scale = scaleDesignValue(1, runtime.screen.width)
  const labelLineHeight =
    (AUTHENTICATION_FONT_METRICS.BODY_ASCENT + AUTHENTICATION_FONT_METRICS.BODY_DESCENT) *
    FIELD_METRICS.LABEL_SIZE
  const fieldHeight = labelLineHeight + FIELD_METRICS.LABEL_GAP + FIELD_METRICS.BOX_HEIGHT

  return {
    // The first label's line box starts one ascent above its baseline; the gap between fields keeps the
    // label baselines FIELD_PITCH apart.
    fields: (firstLabelBaseline: number) => ({
      position: 'absolute',
      left: 0,
      right: 0,
      top: topFromDesign(
        firstLabelBaseline - AUTHENTICATION_FONT_METRICS.BODY_ASCENT * FIELD_METRICS.LABEL_SIZE,
        runtime.insets.top,
        runtime.screen.width,
      ),
      gap: (AUTHENTICATION_LAYOUT.FIELD_PITCH - fieldHeight) * scale,
    }),
  }
})
