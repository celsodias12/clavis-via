import type { AppRouter } from '@clavis-via/api/router'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { z } from 'zod'
import type { EMOTION_SHAPE_KINDS } from '../design/emotion-shape.constant'
import type { TranslationKeys } from '../i18n/types'
import type { checkInFormSchema } from '../validation/check-in.schema'

export type CheckInState = inferRouterInputs<AppRouter>['checkIn']['create']['state']
export type TodayCheckIn = inferRouterOutputs<AppRouter>['checkIn']['latestForDate']

export type CheckInFormInput = z.input<typeof checkInFormSchema>
export type CheckInFormValues = z.output<typeof checkInFormSchema>

export type EmotionIconColors = Readonly<{
  // Face fill (sparkle fill for Esperançosa).
  fill: string
  // Eyes, brows, mouth and dots.
  ink: string
}>

export type CheckInOption = Readonly<{
  state: CheckInState
  labelKey: TranslationKeys
  tileColor: string
  iconColors: EmotionIconColors
}>

type EmotionShapeKind = (typeof EMOTION_SHAPE_KINDS)[keyof typeof EMOTION_SHAPE_KINDS]

// Shapes are drawn in a 38 x 38 box centered on (0, 0); every length is in that box's units.
export type EmotionShape =
  | Readonly<{ kind: Extract<EmotionShapeKind, 'face'>; radius: number }>
  | Readonly<{
      kind: Extract<EmotionShapeKind, 'dot'>
      centerX: number
      centerY: number
      radiusX: number
      radiusY: number
    }>
  | Readonly<{ kind: Extract<EmotionShapeKind, 'stroke'>; path: string; width: number }>
  | Readonly<{ kind: Extract<EmotionShapeKind, 'sparkle'>; path: string }>

// What the platform gives the check-in form: what to do once the check-in is saved (leave the screen).
export type CheckInFormOptions = Readonly<{ onSaved: () => unknown }>
