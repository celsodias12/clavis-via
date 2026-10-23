import {
  buildPlayTrianglePath,
  colors,
  TEST_IDS,
  VERSE_BOOK_ICON,
  VERSE_PLAY_ICON,
} from '@clavis-via/shared'
import { useTranslation } from 'react-i18next'
import { HOME_METRICS, VERSE_CARD_CLASSES } from '../../constants/home.constant'

type VerseCardProps = Readonly<{
  text: string
  reference: string
  onPlayPress: () => unknown
}>

const BOOK_HEIGHT =
  (HOME_METRICS.VERSE_BOOK_WIDTH * VERSE_BOOK_ICON.VIEW_BOX_HEIGHT) / VERSE_BOOK_ICON.VIEW_BOX_WIDTH

// The "Um minuto com Deus" card: the verse of the day, its reference and the (coming soon) play button.
export function VerseCard({ text, reference, onPlayPress }: VerseCardProps) {
  const { t } = useTranslation()

  return (
    <section data-testid={TEST_IDS.HOME_VERSE_CARD} className={VERSE_CARD_CLASSES.CARD}>
      <div className={VERSE_CARD_CLASSES.TILE}>
        <svg
          width={HOME_METRICS.VERSE_BOOK_WIDTH}
          height={BOOK_HEIGHT}
          viewBox={`0 0 ${VERSE_BOOK_ICON.VIEW_BOX_WIDTH} ${VERSE_BOOK_ICON.VIEW_BOX_HEIGHT}`}
          aria-hidden="true"
          focusable="false"
        >
          {[VERSE_BOOK_ICON.PAGES_PATH, VERSE_BOOK_ICON.COVER_PATH].map((path) => (
            <path
              key={path}
              d={path}
              fill="none"
              stroke={colors.verseBook}
              strokeWidth={VERSE_BOOK_ICON.STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>
      <div className={VERSE_CARD_CLASSES.TEXT}>
        <h2 className={VERSE_CARD_CLASSES.TITLE}>{t('screen.home.verseTitle')}</h2>
        <p className={VERSE_CARD_CLASSES.QUOTE}>{t('screen.home.verseQuote', { text })}</p>
        <div className={VERSE_CARD_CLASSES.FOOTER}>
          <p className={VERSE_CARD_CLASSES.REFERENCE}>
            {t('screen.home.verseReference', {
              reference,
              translation: t('screen.home.verseTranslation'),
            })}
          </p>
          <button
            type="button"
            data-testid={TEST_IDS.HOME_VERSE_PLAY}
            aria-label={t('screen.home.versePlay')}
            onClick={onPlayPress}
            className={VERSE_CARD_CLASSES.PLAY}
          >
            <svg
              width={HOME_METRICS.PLAY_SIZE}
              height={HOME_METRICS.PLAY_SIZE}
              viewBox={`0 0 ${VERSE_PLAY_ICON.DIAMETER} ${VERSE_PLAY_ICON.DIAMETER}`}
              aria-hidden="true"
              focusable="false"
            >
              <circle
                cx={VERSE_PLAY_ICON.DIAMETER / 2}
                cy={VERSE_PLAY_ICON.DIAMETER / 2}
                r={VERSE_PLAY_ICON.DIAMETER / 2}
                fill={colors.primaryAccent}
              />
              <path
                d={buildPlayTrianglePath()}
                fill="none"
                stroke={colors.white}
                strokeWidth={VERSE_PLAY_ICON.TRIANGLE_STROKE_WIDTH}
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
