export const QUICK_REPLY_INTENTS = Object.freeze({
  TALK: 'talk',
  DIRECTION: 'direction',
  PRACTICE: 'practice',
  PRAYER: 'prayer',
})

export const CONVERSATION_ROLES = Object.freeze({
  USER: 'user',
  ASSISTANT: 'assistant',
})

export const CONVERSATION_LIMITS = Object.freeze({
  TEXT_MINIMUM_LENGTH: 1,
  TEXT_MAXIMUM_LENGTH: 1000,
  // How many of the latest messages `conversation.list` returns.
  LIST_LENGTH: 50,
  // Messages of the person allowed inside the rolling window below (the 31st is refused).
  DAILY_MESSAGE_LIMIT: 30,
  DAILY_WINDOW_MILLISECONDS: 86_400_000,
})

export const CONVERSATION_ERRORS = Object.freeze({
  DAILY_LIMIT_REACHED: 'daily_limit_reached',
})

// Placeholders of the reply templates below, written as {{name}}.
export const REPLY_PLACEHOLDERS = Object.freeze({
  PLAN_TITLE: 'planTitle',
  NEXT_DAY: 'nextDay',
  PRACTICE_TITLE: 'practiceTitle',
  PRACTICE_DURATION: 'practiceDuration',
  VERSE_TEXT: 'verseText',
  VERSE_REFERENCE: 'verseReference',
})

export const REPLY_DURATION_UNITS = Object.freeze({
  SECONDS_PER_MINUTE: 60,
  MINUTE_ONE: '{{minutes}} minuto',
  MINUTE_OTHER: '{{minutes}} minutos',
  MINUTES_AND_SECONDS: '{{minutes}} min {{seconds}} s',
})

// What the mock responder says about the content of the app. It must match the seeded content.
export const REPLY_CONTENT_NAMES = Object.freeze({
  DISCOURAGEMENT_PLAN: 'Quando o desânimo pesar',
  DIRECTION_PLAN: 'Encontrando direção novamente',
})

// Terms that signal a crisis, searched in the normalized text (no accents, lowercase, no punctuation, single spaces).
// When in doubt the warning shows: a needless CVV notice costs little and a missing one costs a lot.
// "morrer", "morta" and "morto" are handled by CRISIS_DEATH_PATTERN below, so that idioms do not trigger them.
export const CRISIS_TERMS = Object.freeze([
  'suicid',
  'me matar',
  'matar me',
  'tirar minha vida',
  'tirar a minha vida',
  'tirar a propria vida',
  'tirar minha propria vida',
  'tirar a minha propria vida',
  'acabar com a minha vida',
  'acabar com minha vida',
  'acabar com tudo',
  'queria estar morta',
  'queria estar morto',
  'melhor estar morta',
  'melhor estar morto',
  'nao quero mais viver',
  'nao quero viver',
  'sem vontade de viver',
  'nao vale a pena viver',
  'cansei de viver',
  'cansada de viver',
  'cansado de viver',
  'desistir de viver',
  'quero sumir',
  'queria sumir',
  'vontade de sumir',
  'nao aguento mais',
  'me machucar',
  'me cortar',
  'me ferir',
  'me enforcar',
  'me jogar da',
  'me jogar do',
  'me jogar na frente',
  'tomar todos os remedios',
  'me mutilar',
  'automutil',
  'ninguem sentiria minha falta',
  'seria melhor sem mim',
  'melhor se eu nao existisse',
  // English and Spanish, because the interface is translated.
  'kill myself',
  'end my life',
  'want to die',
  'wanna die',
  'self harm',
  'hurt myself',
  'quiero morir',
  'matarme',
  'quitarme la vida',
  'no quiero vivir',
  'hacerme dano',
])

// Common idioms in which the death words are not a crisis ("morrer de rir").
export const CRISIS_DEATH_IDIOMS = Object.freeze([
  'de rir',
  'de vergonha',
  'de saudade',
  'de saudades',
  'de fome',
  'de calor',
  'de frio',
  'de medo',
  'de tedio',
  'de sono',
  'de cansaco',
  'de ciume',
  'de inveja',
  'de amor',
])

// "morrer", "morta" or "morto" as a whole word, unless an idiom above follows it immediately.
// "morrendo" and "morri" are deliberately not covered: they are mostly figures of speech.
export const CRISIS_DEATH_PATTERN = new RegExp(
  String.raw`\b(?:morrer|morta|morto)\b(?! (?:${CRISIS_DEATH_IDIOMS.join('|')})\b)`,
)

// Keywords of free text, matched on the normalized text. A whole-word pattern keeps "fe" from matching "feliz".
export const KEYWORD_PATTERNS = Object.freeze({
  BREATHING: /\bansios|\bansiedade|\banxious\b|\banxiety\b|\bbreath|\brespir/,
  DISCOURAGEMENT: /\bcansad|\bdesanim|\btired\b|\bdiscourag|\bhopeless\b/,
  FAITH: /\b(?:deus|fe|god|faith|dios)\b|\boracao|\bprayer\b|\boracion/,
})

export const MOCK_REPLIES = Object.freeze({
  CRISIS:
    'Sinto muito que você esteja passando por isso, e fico feliz que tenha me contado. Você não está sozinha, e a sua vida importa. Fale agora com alguém que pode te ouvir: CVV pelo 188 (ligação gratuita, 24 horas). Se houver risco imediato, ligue para o SAMU pelo 192. Se puder, peça também a uma pessoa de confiança que fique por perto.',
  TALK: 'Estou aqui para ouvir, no seu tempo. Conte o que está pesando ou o que tem trazido alegria ao seu dia, do jeito que vier.',
  DIRECTION_WITH_PLAN:
    'Que tal continuar de onde você parou? Você está no Dia {{nextDay}} de “{{planTitle}}”. Dá para retomar pela aba Planos, um passo de cada vez.',
  DIRECTION_WITHOUT_PLAN:
    'Quando falta direção, um bom começo é escolher um plano e dar só o primeiro passo. Experimente “{{planTitle}}”, na aba Planos.',
  PRACTICE_WITH_CHECK_IN:
    'Para o seu dia de hoje, separei a prática “{{practiceTitle}}”, de {{practiceDuration}}. Você a encontra no card da chave do dia, na aba Início.',
  PRACTICE_WITHOUT_CHECK_IN:
    'Uma prática combina melhor com o seu momento. Faça o check-in de hoje, na aba Início, e eu te mostro a prática da sua chave do dia.',
  PRAYER:
    '“{{verseText}}” ({{verseReference}}, NVI). Que tal um minuto de silêncio com essas palavras? Respire devagar e deixe que elas fiquem com você.',
  // Opens the breathing reply; the practice of the day (or the check-in invitation) follows it.
  BREATHING_INTRO: 'Quando a ansiedade aparece, o corpo costuma pedir uma pausa.',
  DISCOURAGEMENT:
    'Cansaço e desânimo também merecem cuidado. Se fizer sentido para você, o plano “{{planTitle}}”, na aba Planos, traz passos pequenos para os dias mais pesados.',
  FAITH:
    'Que bom que você quer se aproximar disso. Um versículo para este momento: “{{verseText}}” ({{verseReference}}, NVI). Fique um instante em silêncio com ele, sem pressa.',
})

// Replies for text that matches no rule; the one used is picked by the number of replies already given.
export const DEFAULT_REPLIES = Object.freeze([
  'Obrigada por compartilhar isso comigo. Quer me contar um pouco mais sobre como foi o seu dia?',
  'Entendo. O que você sente importa, e não precisa ter pressa para colocar em palavras.',
  'Estou aqui com você. Se quiser, conte o que veio à sua mente primeiro.',
  'Obrigada por confiar em mim. O que, nisso tudo, tem pesado mais para você hoje?',
  'Faz sentido sentir isso. Respire um instante, e continue quando quiser: eu continuo ouvindo.',
])
