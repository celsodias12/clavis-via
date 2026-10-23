import { VERSE_PLAY_ICON } from '../design/home-card.constant'

// The outline of the play triangle, inset by half the stroke so the stroke stays inside its box.
export function buildPlayTrianglePath(): string {
  const inset = VERSE_PLAY_ICON.TRIANGLE_STROKE_WIDTH / 2
  const left = VERSE_PLAY_ICON.TRIANGLE_LEFT + inset
  const top = VERSE_PLAY_ICON.TRIANGLE_TOP + inset
  const right = VERSE_PLAY_ICON.TRIANGLE_LEFT + VERSE_PLAY_ICON.TRIANGLE_WIDTH - inset
  const bottom = VERSE_PLAY_ICON.TRIANGLE_TOP + VERSE_PLAY_ICON.TRIANGLE_HEIGHT - inset
  const middle = (top + bottom) / 2
  return `M${left} ${top} L${right} ${middle} L${left} ${bottom} Z`
}
