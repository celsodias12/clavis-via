import { env } from 'cloudflare:workers'
import { asc, eq } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import { describe, expect, it } from 'vitest'
import { createDatabase } from '../configs/d1.config'
import { PLAN_CATEGORIES } from '../constants/plan.constant'
import { dayCompletions } from './day-completions.table'
import { planDays } from './plan-days.table'
import { planEnrollments } from './plan-enrollments.table'
import { plans } from './plans.table'
import { practiceCompletions } from './practice-completions.table'
import { verses } from './verses.table'

const database = createDatabase(env.DB)

const EXPECTED_PLANS = [
  {
    id: 'when-discouragement-weighs',
    title: 'Quando o desânimo pesar',
    category: PLAN_CATEGORIES.EMOTIONS,
    days: 3,
  },
  {
    id: 'after-a-rejection',
    title: 'Depois de uma rejeição',
    category: PLAN_CATEGORIES.EMOTIONS,
    days: 7,
  },
  {
    id: 'learning-to-set-boundaries',
    title: 'Aprendendo a colocar limites',
    category: PLAN_CATEGORIES.RELATIONSHIPS,
    days: 7,
  },
  {
    id: 'when-your-faith-is-tired',
    title: 'Quando sua fé estiver cansada',
    category: PLAN_CATEGORIES.FAITH,
    days: 5,
  },
  {
    id: 'finding-direction-again',
    title: 'Encontrando direção novamente',
    category: PLAN_CATEGORIES.FAITH,
    days: 7,
  },
]

const LONG_TEXT_FIELDS = ['message', 'reflection', 'prayer'] as const
const SHORT_TEXT_FIELDS = ['action', 'tip'] as const

describe('plans content', () => {
  it('seeds the 5 plans in order with their day counts', async () => {
    const rows = await database.select().from(plans).orderBy(asc(plans.position))
    expect(rows.map((row) => row.position)).toEqual([0, 1, 2, 3, 4])
    expect(rows.map(({ id, title, category }) => ({ id, title, category }))).toEqual(
      EXPECTED_PLANS.map(({ id, title, category }) => ({ id, title, category })),
    )
    for (const row of rows) {
      expect(row.description.length).toBeGreaterThan(0)
      expect(row.description.length).toBeLessThanOrEqual(120)
    }
    const days = await database.select().from(planDays)
    expect(days).toHaveLength(29)
    for (const expected of EXPECTED_PLANS) {
      const numbers = days
        .filter((day) => day.planId === expected.id)
        .map((day) => day.dayNumber)
        .sort((first, second) => first - second)
      expect(numbers).toEqual(Array.from({ length: expected.days }, (_, index) => index + 1))
    }
  })

  it('keeps every day text within the screen limits', async () => {
    const days = await database.select().from(planDays)
    for (const day of days) {
      expect(day.title.length).toBeGreaterThan(0)
      expect(day.title.length).toBeLessThanOrEqual(26)
      expect(day.summary.length).toBeGreaterThan(0)
      expect(day.summary.length).toBeLessThanOrEqual(90)
      for (const field of LONG_TEXT_FIELDS) {
        expect(day[field].length).toBeGreaterThanOrEqual(150)
        expect(day[field].length).toBeLessThanOrEqual(320)
      }
      for (const field of SHORT_TEXT_FIELDS) {
        expect(day[field].length).toBeGreaterThan(0)
        expect(day[field].length).toBeLessThanOrEqual(110)
      }
      expect(day.videoDurationSeconds).toBeGreaterThanOrEqual(90)
      expect(day.videoDurationSeconds).toBeLessThanOrEqual(240)
    }
  })

  it('uses the design texts for when-discouragement-weighs', async () => {
    const [plan] = await database
      .select()
      .from(plans)
      .where(eq(plans.id, 'when-discouragement-weighs'))
    expect(plan.description).toBe(
      'Um plano curto para te ajudar a respirar, organizar os pensamentos e reencontrar pequenos motivos para continuar.',
    )
    const days = await database
      .select()
      .from(planDays)
      .where(eq(planDays.planId, 'when-discouragement-weighs'))
      .orderBy(asc(planDays.dayNumber))
    expect(days.map((day) => day.title)).toEqual([
      'Respirar e reconhecer',
      'Pequenos movimentos',
      'Voltar a acreditar',
    ])
    expect(days[0].message).toBe(
      'Antes de exigir força de você, vamos aprender a respirar. Nem todo dia precisa ser produtivo. Hoje, o convite é apenas reconhecer como você está e se permitir um novo começo.',
    )
    expect(days[0].videoDurationSeconds).toBe(138)
  })

  it('uses the design action and tip for learning-to-set-boundaries day 1', async () => {
    const [day] = await database
      .select()
      .from(planDays)
      .where(eq(planDays.planId, 'learning-to-set-boundaries'))
      .orderBy(asc(planDays.dayNumber))
      .limit(1)
    expect(day.action).toBe(
      'Diga um “não” pequeno para algo que você faria apenas para não desagradar.',
    )
    expect(day.tip).toBe(
      'Colocar limites não é se afastar das pessoas, é se aproximar de quem realmente você é.',
    )
  })

  it('seeds 14 verses with Jeremias 29:11 first', async () => {
    const rows = await database.select().from(verses).orderBy(asc(verses.position))
    expect(rows.map((row) => row.position)).toEqual(Array.from({ length: 14 }, (_, index) => index))
    expect(rows[0].reference).toBe('Jeremias 29:11')
    for (const row of rows) {
      expect(row.text.length).toBeGreaterThan(0)
      expect(row.text.length).toBeLessThanOrEqual(160)
      expect(row.reference).toMatch(/^[1-3]?\s?[\p{L}]+(?: [\p{L}]+)* \d+:\d+$/u)
    }
  })

  it('rejects a day completion for a day that does not exist', async () => {
    await expect(
      database.insert(dayCompletions).values({
        userId: 'user-test',
        planId: 'when-discouragement-weighs',
        dayNumber: 4,
        completedAt: new Date(),
      }),
    ).rejects.toThrow()
  })

  it('declares the composite keys and the practice completion index', () => {
    expect(getTableConfig(planDays).primaryKeys[0].columns).toEqual([
      planDays.planId,
      planDays.dayNumber,
    ])
    expect(getTableConfig(planEnrollments).primaryKeys[0].columns).toEqual([
      planEnrollments.userId,
      planEnrollments.planId,
    ])
    expect(getTableConfig(dayCompletions).primaryKeys[0].columns).toHaveLength(3)
    expect(getTableConfig(practiceCompletions).indexes[0].config.columns).toHaveLength(2)
  })

  it('references the parent tables', () => {
    for (const table of [planDays, planEnrollments, practiceCompletions]) {
      expect(getTableConfig(table).foreignKeys[0].reference().foreignColumns).toHaveLength(1)
    }
  })
})
