import { describe, expect, it } from 'vite-plus/test'
import { createPracticeClock } from './practice-clock'

const DURATION_SECONDS = 180

describe('createPracticeClock', () => {
  it('starts stopped and not finished', () => {
    const clock = createPracticeClock()

    expect(clock.isRunning()).toBe(false)
    expect(clock.isFinished()).toBe(false)
    expect(clock.read(5_000, DURATION_SECONDS)).toBeNull()
    expect(clock.pause(5_000)).toBeNull()
  })

  it('reads the whole seconds since the clock mark of the run', () => {
    const clock = createPracticeClock()

    expect(clock.start(1_000)).toBe(true)
    expect(clock.isRunning()).toBe(true)
    expect(clock.read(91_999, DURATION_SECONDS)).toEqual({ elapsedSeconds: 90, isFinished: false })
  })

  it('does not start a run that already runs', () => {
    const clock = createPracticeClock()
    clock.start(0)

    expect(clock.start(50_000)).toBe(false)
    expect(clock.read(10_000, DURATION_SECONDS)?.elapsedSeconds).toBe(10)
  })

  it('keeps the time played when paused and resumes from it', () => {
    const clock = createPracticeClock()
    clock.start(0)

    expect(clock.pause(90_000)).toBe(90)
    expect(clock.isRunning()).toBe(false)
    expect(clock.read(500_000, DURATION_SECONDS)).toBeNull()

    clock.start(500_000)
    expect(clock.read(510_000, DURATION_SECONDS)?.elapsedSeconds).toBe(100)
  })

  it('finishes at the duration, never goes past it and does not start again', () => {
    const clock = createPracticeClock()
    clock.start(0)

    expect(clock.read(10 * DURATION_SECONDS * 1000, DURATION_SECONDS)).toEqual({
      elapsedSeconds: DURATION_SECONDS,
      isFinished: true,
    })
    expect(clock.isFinished()).toBe(true)
    expect(clock.isRunning()).toBe(false)
    expect(clock.read(999_999_999, DURATION_SECONDS)).toBeNull()
    expect(clock.start(0)).toBe(false)
  })

  it('restarts from 0:00, stopped, and can finish again', () => {
    const clock = createPracticeClock()
    clock.start(0)
    clock.read(DURATION_SECONDS * 1000, DURATION_SECONDS)

    clock.restart()

    expect(clock.isFinished()).toBe(false)
    expect(clock.isRunning()).toBe(false)
    expect(clock.start(1_000)).toBe(true)
    expect(clock.read(1_000 + 30_000, DURATION_SECONDS)?.elapsedSeconds).toBe(30)
  })
})
