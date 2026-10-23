import type { CheckInState, EmotionShape } from '../@types/check-in.type'
import { CHECK_IN_STATES } from '../constants/check-in.constant'

export const EMOTION_SHAPE_KINDS = Object.freeze({
  FACE: 'face',
  DOT: 'dot',
  STROKE: 'stroke',
  SPARKLE: 'sparkle',
})

export const EMOTION_ICON_METRICS = Object.freeze({
  // Side of the box the shapes are drawn in; the faces are 38 design units wide.
  VIEW_BOX_SIZE: 38,
  FACE_RADIUS: 19,
})

// Drawn on the Check-in reference: positions are relative to the center of the icon box.
export const EMOTION_SHAPES: Readonly<Record<CheckInState, readonly EmotionShape[]>> =
  Object.freeze({
    [CHECK_IN_STATES.HEAVY]: [
      { kind: EMOTION_SHAPE_KINDS.FACE, radius: EMOTION_ICON_METRICS.FACE_RADIUS },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: -6.8, centerY: -2.1, radiusX: 1.85, radiusY: 1.85 },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: 5.8, centerY: -2.7, radiusX: 1.75, radiusY: 1.75 },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M 6.2 -2.3 L 7.9 -1.4', width: 2.3 },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M -5.9 7 C -4.4 3.4 4.4 3.4 6 7', width: 1.75 },
    ],
    [CHECK_IN_STATES.ANXIOUS]: [
      { kind: EMOTION_SHAPE_KINDS.FACE, radius: EMOTION_ICON_METRICS.FACE_RADIUS },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: -7.1, centerY: -1.9, radiusX: 1.9, radiusY: 1.9 },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: 6.4, centerY: -1.9, radiusX: 1.9, radiusY: 1.9 },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M -10 -5.8 Q -7.6 -6.2 -5.8 -8.5', width: 1.75 },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M 4.4 -8.5 Q 7.6 -6.6 10.2 -5.6', width: 1.75 },
      {
        kind: EMOTION_SHAPE_KINDS.STROKE,
        path: 'M -6.1 6.6 C -4.5 3.4 4 3.4 5.6 6.8',
        width: 1.75,
      },
    ],
    [CHECK_IN_STATES.DISCOURAGED]: [
      { kind: EMOTION_SHAPE_KINDS.FACE, radius: EMOTION_ICON_METRICS.FACE_RADIUS },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M -10 -3.8 Q -7.1 0 -4.2 -3.8', width: 1.75 },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M 3.9 -4 Q 6.9 0 10 -4', width: 1.75 },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M -5 6.6 Q 0 2.2 4.75 6.6', width: 1.75 },
    ],
    [CHECK_IN_STATES.IRRITATED]: [
      { kind: EMOTION_SHAPE_KINDS.FACE, radius: EMOTION_ICON_METRICS.FACE_RADIUS },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: -7.1, centerY: -1.5, radiusX: 1.95, radiusY: 1.95 },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: 6.6, centerY: -1.3, radiusX: 1.95, radiusY: 1.95 },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M -9.8 -7.1 L -3.4 -3.6', width: 1.8 },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M 9.75 -6.7 L 3.1 -3.6', width: 1.8 },
      {
        kind: EMOTION_SHAPE_KINDS.STROKE,
        path: 'M -5.5 7.2 C -4 3.4 3.8 3.4 5.4 7.5',
        width: 1.75,
      },
    ],
    [CHECK_IN_STATES.SENSITIVE]: [
      { kind: EMOTION_SHAPE_KINDS.FACE, radius: EMOTION_ICON_METRICS.FACE_RADIUS },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: -6.9, centerY: -1.5, radiusX: 2.15, radiusY: 2.15 },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: 6.2, centerY: -1.5, radiusX: 2.15, radiusY: 2.15 },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M -9.6 -5.5 Q -7.6 -6.4 -6.3 -7.3', width: 1.8 },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M 5.2 -7.5 Q 8 -6.8 9.1 -5.4', width: 1.8 },
      {
        kind: EMOTION_SHAPE_KINDS.STROKE,
        path: 'M -4.6 6.8 C -3 3.6 2.8 3.6 4.3 6.8',
        width: 1.75,
      },
    ],
    [CHECK_IN_STATES.AT_PEACE]: [
      { kind: EMOTION_SHAPE_KINDS.FACE, radius: EMOTION_ICON_METRICS.FACE_RADIUS },
      {
        kind: EMOTION_SHAPE_KINDS.DOT,
        centerX: -6.5,
        centerY: -2.75,
        radiusX: 2.05,
        radiusY: 2.05,
      },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: 6.4, centerY: -2.8, radiusX: 2.05, radiusY: 2.05 },
      { kind: EMOTION_SHAPE_KINDS.STROKE, path: 'M -6.7 4.4 Q 0 11.5 6.4 4.4', width: 1.75 },
    ],
    [CHECK_IN_STATES.HOPEFUL]: [
      {
        kind: EMOTION_SHAPE_KINDS.SPARKLE,
        path: 'M -3.3 -3.6 Q -1.26 2 3.5 4.4 Q -1.26 6.8 -3.3 12.4 Q -5.34 6.8 -10.1 4.4 Q -5.34 2 -3.3 -3.6 Z',
      },
      {
        kind: EMOTION_SHAPE_KINDS.SPARKLE,
        path: 'M 6.7 -13.1 Q 8.2 -8.62 11.7 -6.7 Q 8.2 -4.78 6.7 -0.3 Q 5.2 -4.78 1.7 -6.7 Q 5.2 -8.62 6.7 -13.1 Z',
      },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: -7.7, centerY: -6.3, radiusX: 1.5, radiusY: 2.1 },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: -8.4, centerY: -9.6, radiusX: 0.9, radiusY: 1.3 },
    ],
    [CHECK_IN_STATES.OTHER]: [
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: -7.8, centerY: 0.3, radiusX: 2.0, radiusY: 2.0 },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: -0.4, centerY: 0.3, radiusX: 2.0, radiusY: 2.0 },
      { kind: EMOTION_SHAPE_KINDS.DOT, centerX: 7.1, centerY: 0.3, radiusX: 2.0, radiusY: 2.0 },
    ],
  })
