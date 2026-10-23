import { describe, expect, it, vi } from 'vitest'
import type { ConversationContext } from '../@types/conversation.type'
import {
  CRISIS_TERMS,
  DEFAULT_REPLIES,
  QUICK_REPLY_INTENTS,
  REPLY_CONTENT_NAMES,
} from '../constants/conversation.constant'
import { createMockResponder } from './mock-responder.service'

const responder = createMockResponder({ delayMilliseconds: 0 })

const VERSE = { text: 'Eu é que sei os planos que tenho para vocês.', reference: 'Jeremias 29:11' }

const CHECK_IN = {
  id: 'check-in-1',
  state: 'anxious' as const,
  otherText: null,
  localDate: '2026-10-20',
  createdAt: '2026-10-20T12:00:00.000Z',
  dailyKey: {
    title: 'Voz e Limites',
    text: 'Texto.',
    practice: {
      id: 'guided-breathing',
      title: 'Respiração guiada',
      durationSeconds: 180,
      description: 'Descrição.',
    },
  },
}

const PLAN = {
  planId: 'when-discouragement-weighs',
  title: 'Quando o desânimo pesar',
  totalDays: 7,
  completedDays: 2,
  nextDayNumber: 3,
}

function contextOf(overrides: Partial<ConversationContext> = {}): ConversationContext {
  return {
    todayCheckIn: null,
    currentPlan: null,
    verse: VERSE,
    assistantMessageCount: 0,
    ...overrides,
  }
}

function reply(text: string, overrides: Partial<ConversationContext> = {}, intent?: string) {
  return responder.respond({
    text,
    intent: intent as never,
    context: contextOf(overrides),
  })
}

function expectCrisis(text: string) {
  expect(text).toContain('CVV pelo 188 (ligação gratuita, 24 horas)')
  expect(text).toContain('SAMU pelo 192')
}

describe('createMockResponder crisis rule', () => {
  it('answers with CVV and SAMU even when a quick reply intent comes along', async () => {
    expectCrisis(await reply('quero me matar', {}, QUICK_REPLY_INTENTS.TALK))
    expectCrisis(
      await reply('quero me matar', { todayCheckIn: CHECK_IN }, QUICK_REPLY_INTENTS.PRACTICE),
    )
  })

  it.each(CRISIS_TERMS)('answers with the crisis reply when the text holds "%s"', async (term) => {
    expectCrisis(await reply(`hoje eu ${term} de verdade`))
  })

  it.each([
    'Quero morrer',
    'quero morrer.',
    'MORRER!!!',
    'Tenho vontade de morrer',
    'Às vezes queria  sumir',
    'NÃO AGUENTO MAIS',
    'estou pensando em suicídio',
    'Não quero mais viver',
    'ninguém sentiria minha falta',
    'Vou acabar com minha vida',
    'Quero tirar minha própria vida',
    'Pensei em tirar a minha própria vida',
    'Queria estar morta',
    'Seria melhor estar morto',
    'Estou cansada de viver',
    'Cansei de viver assim',
    'Quero desistir de viver',
    'Penso em me enforcar',
    'Tenho vontade de me jogar da ponte',
    'Vou me jogar do prédio',
    'Quero me jogar na frente do carro',
    'Pensei em tomar todos os remédios',
    'Tenho vontade de me mutilar',
    'Quero matar-me',
    'Vou me matar!',
    'meu pai está morto e eu quero ir junto',
    'I want to kill myself',
    'I want to end my life',
    'I just want to die',
    'I wanna die',
    'I think about self-harm',
    'I keep wanting to hurt myself',
    'Quiero morir',
    'Quiero matarme',
    'Quiero quitarme la vida',
    'No quiero vivir más',
    'Quiero hacerme daño',
  ])('recognizes the real phrasing "%s"', async (phrase) => {
    expectCrisis(await reply(phrase))
  })

  it.each([
    'morri de rir hoje',
    'vou morrer de saudade',
    'Estou morrendo de saudade',
    'vou morrer de rir',
    'Morta de vergonha!',
    'estou morta de cansaço',
    'morto de fome',
    'morro de calor',
    'morrer de frio, hoje',
    'morta de medo',
    'morrer de tédio',
    'morrer de sono',
    'morrer de ciúme',
    'morrer de inveja',
    'morrer de amor',
    'estou cansada',
    'quero viver melhor',
  ])('does not treat "%s" as a crisis', async (phrase) => {
    const text = await reply(phrase)
    expect(text).not.toContain('188')
  })

  it('still warns when an idiom is followed by a real statement', async () => {
    expectCrisis(await reply('Morri de rir ontem, mas hoje quero morrer'))
  })

  it('does not read "morrendo" alone as a crisis, a conscious choice', async () => {
    expect(await reply('estou morrendo de trabalho')).not.toContain('188')
  })

  it('accepts the false positive of "quero sumir com essa bagunça" as a conscious choice', async () => {
    expectCrisis(await reply('quero sumir com essa bagunça'))
  })
})

describe('createMockResponder intents', () => {
  it('invites the person to talk', async () => {
    const text = await reply('Quero conversar', {}, QUICK_REPLY_INTENTS.TALK)
    expect(text).toContain('Estou aqui para ouvir')
  })

  it('suggests continuing the current plan with its title and next day', async () => {
    const text = await reply(
      'Preciso de uma direção',
      { currentPlan: PLAN },
      QUICK_REPLY_INTENTS.DIRECTION,
    )
    expect(text).toContain('Dia 3 de “Quando o desânimo pesar”')
  })

  it('suggests Encontrando direção novamente without a plan', async () => {
    const text = await reply('Preciso de uma direção', {}, QUICK_REPLY_INTENTS.DIRECTION)
    expect(text).toContain('Encontrando direção novamente')
  })

  it('shows the practice of the day with its title and duration after a check-in', async () => {
    const text = await reply(
      'Quero fazer uma prática',
      { todayCheckIn: CHECK_IN },
      QUICK_REPLY_INTENTS.PRACTICE,
    )
    expect(text).toContain('Respiração guiada')
    expect(text).toContain('3 minutos')
  })

  it('writes the duration of a one minute practice in the singular', async () => {
    const practice = { ...CHECK_IN.dailyKey.practice, durationSeconds: 60 }
    const text = await reply(
      'prática',
      { todayCheckIn: { ...CHECK_IN, dailyKey: { ...CHECK_IN.dailyKey, practice } } },
      QUICK_REPLY_INTENTS.PRACTICE,
    )
    expect(text).toContain('de 1 minuto.')
  })

  it('writes a duration with a remainder in minutes and seconds', async () => {
    const practice = { ...CHECK_IN.dailyKey.practice, durationSeconds: 150 }
    const text = await reply(
      'prática',
      { todayCheckIn: { ...CHECK_IN, dailyKey: { ...CHECK_IN.dailyKey, practice } } },
      QUICK_REPLY_INTENTS.PRACTICE,
    )
    expect(text).toContain('2 min 30 s')
  })

  it('invites the check-in when there is none today', async () => {
    const text = await reply('Quero fazer uma prática', {}, QUICK_REPLY_INTENTS.PRACTICE)
    expect(text).toContain('check-in')
    expect(text).not.toContain('Respiração guiada')
  })

  it('quotes the verse of the day with its reference and the translation', async () => {
    const text = await reply('Quero um momento com Deus', {}, QUICK_REPLY_INTENTS.PRAYER)
    expect(text).toContain(`“${VERSE.text}” (Jeremias 29:11, NVI)`)
    expect(text).toContain('silêncio')
  })
})

describe('createMockResponder free text', () => {
  it.each(['estou ansiosa', 'sinto ansiedade'])(
    'answers "%s" with today\'s practice and where to find it after a check-in',
    async (text) => {
      const answer = await reply(text, { todayCheckIn: CHECK_IN })
      expect(answer).toContain('a ansiedade aparece')
      expect(answer).toContain('“Respiração guiada”, de 3 minutos')
      expect(answer).toContain('aba Início')
    },
  )

  it.each(['estou ansiosa', 'sinto ansiedade'])(
    'answers "%s" by inviting the check-in when there is none today',
    async (text) => {
      const answer = await reply(text)
      expect(answer).toContain('a ansiedade aparece')
      expect(answer).toContain('check-in de hoje')
      expect(answer).not.toContain('Respiração guiada')
    },
  )

  it.each(['estou muito cansada', 'sinto desânimo'])(
    'answers "%s" with the discouragement plan',
    async (text) => {
      expect(await reply(text)).toContain(REPLY_CONTENT_NAMES.DISCOURAGEMENT_PLAN)
    },
  )

  it.each(['quero falar com Deus', 'perdi a fé', 'preciso de uma oração'])(
    'answers "%s" with the verse',
    async (text) => {
      const answer = await reply(text)
      expect(answer).toContain('Jeremias 29:11')
    },
  )

  it('does not read "feliz" as faith', async () => {
    expect(await reply('estou feliz')).toBe(DEFAULT_REPLIES[0])
  })

  it.each(DEFAULT_REPLIES.map((expected, index) => [index, expected] as const))(
    'picks default reply %i by the number of replies given, wrapping around',
    async (index, expected) => {
      expect(await reply('hoje foi um dia normal', { assistantMessageCount: index })).toBe(expected)
      expect(
        await reply('hoje foi um dia normal', {
          assistantMessageCount: index + DEFAULT_REPLIES.length,
        }),
      ).toBe(expected)
    },
  )
})

describe('createMockResponder delay', () => {
  it('waits the configured time before answering', async () => {
    const wait = vi.spyOn(scheduler, 'wait')
    await createMockResponder({ delayMilliseconds: 5 }).respond({
      text: 'oi',
      context: contextOf(),
    })
    expect(wait).toHaveBeenCalledWith(5)
    wait.mockRestore()
  })
})
