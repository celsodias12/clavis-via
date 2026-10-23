import {
  AUTHENTICATION_FONT_METRICS,
  CHECK_IN_OPTION_BY_STATE,
  CHECK_IN_TILE_METRICS,
  type CheckInState,
  EMOTION_ICON_METRICS,
  TEST_IDS,
} from '@clavis-via/shared'
import { useId } from 'react'
import { CHECK_IN_CLASSES, CHECK_IN_RADIO_GROUP_NAME } from '../../constants/check-in.constant'
import { useIsWideScreen } from '../../hooks/layout/use-is-wide-screen'
import { designUnits } from '../../utils/design'
import { EmotionIcon } from '../emotion-icon/emotion-icon.component'

type CheckInOptionProps = Readonly<{
  state: CheckInState
  label: string
  isSelected: boolean
  onPress: () => void
}>

// A pastel tile with the face of an emotion and its label. It fills the width its parent gives it. The tile is a
// label around a visually hidden native radio, so the group gets the arrow keys, one tab stop and the
// accessible name (the visible text) from the browser.
export function CheckInOption({ state, label, isSelected, onPress }: CheckInOptionProps) {
  const isWide = useIsWideScreen()
  const radioId = useId()

  const { tileColor } = CHECK_IN_OPTION_BY_STATE[state]
  const radio = (
    <input
      id={radioId}
      type="radio"
      name={CHECK_IN_RADIO_GROUP_NAME}
      value={state}
      checked={isSelected}
      onChange={onPress}
      className={CHECK_IN_CLASSES.RADIO}
    />
  )

  // Wide screens get larger web tiles: the face above the label, centered, at the web type scale.
  if (isWide) {
    return (
      <label
        htmlFor={radioId}
        data-testid={`${TEST_IDS.CHECK_IN_OPTION_PREFIX}${state}`}
        className={CHECK_IN_CLASSES.WIDE_OPTION}
        style={{ backgroundColor: tileColor }}
      >
        {radio}
        <span className={CHECK_IN_CLASSES.WIDE_OPTION_ICON}>
          <EmotionIcon state={state} size="100%" />
        </span>
        <span>{label}</span>
        {isSelected ? (
          <span
            data-testid={TEST_IDS.CHECK_IN_OPTION_BORDER}
            aria-hidden="true"
            className={CHECK_IN_CLASSES.WIDE_OPTION_BORDER}
          />
        ) : null}
      </label>
    )
  }

  return (
    <label
      htmlFor={radioId}
      data-testid={`${TEST_IDS.CHECK_IN_OPTION_PREFIX}${state}`}
      className={CHECK_IN_CLASSES.OPTION}
      style={{
        height: designUnits(CHECK_IN_TILE_METRICS.HEIGHT),
        borderRadius: designUnits(CHECK_IN_TILE_METRICS.RADIUS),
        backgroundColor: tileColor,
      }}
    >
      {radio}
      <span
        className={CHECK_IN_CLASSES.OPTION_ICON}
        style={{ top: designUnits(CHECK_IN_TILE_METRICS.ICON_TOP) }}
      >
        <EmotionIcon state={state} size={designUnits(EMOTION_ICON_METRICS.VIEW_BOX_SIZE)} />
      </span>
      <span
        className={CHECK_IN_CLASSES.OPTION_LABEL}
        style={{
          top: designUnits(
            CHECK_IN_TILE_METRICS.LABEL_BASELINE -
              AUTHENTICATION_FONT_METRICS.BODY_ASCENT * CHECK_IN_TILE_METRICS.LABEL_FONT_SIZE,
          ),
          fontSize: designUnits(CHECK_IN_TILE_METRICS.LABEL_FONT_SIZE),
        }}
      >
        {label}
      </span>
      {isSelected ? (
        <span
          data-testid={TEST_IDS.CHECK_IN_OPTION_BORDER}
          aria-hidden="true"
          className={CHECK_IN_CLASSES.OPTION_BORDER}
          style={{
            borderRadius: designUnits(CHECK_IN_TILE_METRICS.RADIUS),
            borderWidth: designUnits(CHECK_IN_TILE_METRICS.SELECTED_BORDER_WIDTH),
          }}
        />
      ) : null}
    </label>
  )
}
