import type { AppRouter } from '@clavis-via/api/router'
import type { inferRouterOutputs } from '@trpc/server'
import type { PRACTICE_PLAY_STATES } from '../constants/practice.constant'

export type Practice = inferRouterOutputs<AppRouter>['practice']['byId']

export type PracticePlayerOptions = Readonly<{
  durationSeconds: number
  // Called once each time the practice reaches its duration.
  onFinish: () => void
}>

export type PracticePlayer = Readonly<{
  elapsedSeconds: number
  isPlaying: boolean
  isFinished: boolean
  // Starts or pauses; does nothing once the practice has finished (use `restart`).
  toggle: () => void
  // Back to 0:00, paused.
  restart: () => void
}>

// What the clock reports while it runs.
export type PracticeClockReading = Readonly<{
  elapsedSeconds: number
  isFinished: boolean
}>

// The pure clock of a practice. Every method takes the current time (a Date.now mark) so it never reads a timer
// itself: a late tick or a blocked thread cannot make it drift.
export type PracticeClock = Readonly<{
  isRunning: () => boolean
  isFinished: () => boolean
  // Starts a run; false (and nothing happens) when it already runs or the practice has finished.
  start: (nowMilliseconds: number) => boolean
  // Stops the run and returns the whole seconds played so far; null when nothing was running.
  pause: (nowMilliseconds: number) => number | null
  // The reading of the current run, null when nothing runs. Reaching the duration finishes the practice.
  read: (nowMilliseconds: number, durationSeconds: number) => PracticeClockReading | null
  // Back to 0:00, stopped and not finished.
  restart: () => void
}>

// The sound of a practice, as the timer drives it. Each platform adapts its own player to this.
export type PracticeAudio = Readonly<{
  play: () => void
  pause: () => void
}>

// A practice player plus `pause`, which a platform calls when the app or tab leaves the foreground.
export type PracticeTimer = PracticePlayer & Readonly<{ pause: () => void }>

// What the big button of the practice shows.
export type PracticePlayState = (typeof PRACTICE_PLAY_STATES)[keyof typeof PRACTICE_PLAY_STATES]

// What the platform gives the practice session: the practice to run and its ambient sound.
export type PracticeSessionOptions = Readonly<{
  practiceId: string
  audio: PracticeAudio
}>
