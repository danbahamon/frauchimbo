import { dayNumber } from './analytics'
import { getSkill } from '../data/skills'
import type { Attempt, KnobValues, Pin } from '../lib/types'
import { heatFor, unitVariant, type Heat } from '../lib/units'

const DAY = 86400000
const WINDOW = 10

export interface DayTotals {
  count: number
  correct: number
  wrong: number
  timeMs: number
}

export interface CalendarDay {
  day: number
  inSpan: boolean
  count: number
  correct: number
  wrong: number
  timeMs: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface CalendarWeek {
  labelDay: number | null
  days: CalendarDay[]
}

export interface UnitTrack {
  key: string
  skillId: string
  variant: string
  knobs: KnobValues
  heat: Heat
  rate: number | null
  seen: number
  values: (number | null)[]
}

export interface WorkoutSnapshot {
  first: number
  last: number
  today: number
  span: number
  days: number[]
  weeks: CalendarWeek[]
  byDay: Map<number, DayTotals>
  activeDays: number
  questions: number
  correct: number
  wrong: number
  timeMs: number
  overall: (number | null)[]
  units: UnitTrack[]
  red: number
  yellow: number
}

// Same local calendar day the rest of the stats use, so a session near midnight stays on one square.
function shiftMonths(now: number, months: number) {
  const date = new Date(now)
  const day = date.getDate()
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  next.setDate(Math.min(day, last))
  return dayNumber(next.getTime())
}

function mondayIndex(day: number) {
  return (new Date(day * DAY).getUTCDay() + 6) % 7
}

export function activityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 10) return 3
  return 4
}

function pushSample(buffer: boolean[], correct: boolean) {
  buffer.push(correct)
  if (buffer.length > WINDOW) buffer.shift()
}

function rateOf(buffer: boolean[]) {
  if (!buffer.length) return null
  let correct = 0
  for (const item of buffer) if (item) correct += 1
  return correct / buffer.length
}

// Accuracy of the most recent 10 answers, sampled at the end of each day.
// Days before the first answer stay empty. Later quiet days keep the standing average,
// and answers from before the window still count so the first day is not a cold start.
export function rollingAccuracy(attempts: Attempt[], first: number, last: number) {
  const sorted = [...attempts].sort((a, b) => a.at - b.at)
  const buffer: boolean[] = []
  const values: (number | null)[] = []
  let index = 0
  while (index < sorted.length && dayNumber(sorted[index].at) < first) {
    pushSample(buffer, sorted[index].correct)
    index += 1
  }
  for (let day = first; day <= last; day += 1) {
    while (index < sorted.length && dayNumber(sorted[index].at) <= day) {
      pushSample(buffer, sorted[index].correct)
      index += 1
    }
    values.push(rateOf(buffer))
  }
  return values
}

function totalsFor(attempts: Attempt[], first: number, last: number) {
  const byDay = new Map<number, DayTotals>()
  for (const item of attempts) {
    const day = dayNumber(item.at)
    if (day < first || day > last) continue
    const row = byDay.get(day) ?? { count: 0, correct: 0, wrong: 0, timeMs: 0 }
    row.count += 1
    if (item.correct) row.correct += 1
    else row.wrong += 1
    if (Number.isFinite(item.timeMs) && item.timeMs > 0) row.timeMs += item.timeMs
    byDay.set(day, row)
  }
  return byDay
}

function monthOf(day: number) {
  return new Date(day * DAY).getUTCMonth()
}

function weeksFor(first: number, last: number, byDay: Map<number, DayTotals>) {
  const start = first - mondayIndex(first)
  const end = last + (6 - mondayIndex(last))
  const weeks: CalendarWeek[] = []
  let seenMonth = -1
  for (let weekStart = start; weekStart <= end; weekStart += 7) {
    const days: CalendarDay[] = []
    for (let offset = 0; offset < 7; offset += 1) {
      const day = weekStart + offset
      const inSpan = day >= first && day <= last
      const row = inSpan ? byDay.get(day) : undefined
      const count = row?.count ?? 0
      days.push({
        day,
        inSpan,
        count,
        correct: row?.correct ?? 0,
        wrong: row?.wrong ?? 0,
        timeMs: row?.timeMs ?? 0,
        level: inSpan ? activityLevel(count) : 0,
      })
    }
    // One month name per column: the first day whose month has not been labeled yet.
    let labelDay: number | null = null
    for (const item of days) {
      if (!item.inSpan) continue
      const month = monthOf(item.day)
      if (month === seenMonth) continue
      labelDay = item.day
      seenMonth = month
      break
    }
    weeks.push({ labelDay, days })
  }
  return weeks
}

export function workoutSnapshot(attempts: Attempt[], pins: Pin[], now = Date.now()): WorkoutSnapshot {
  const today = dayNumber(now)
  const first = Math.min(today, shiftMonths(now, -2))
  const last = today
  const byDay = totalsFor(attempts, first, last)
  const days: number[] = []
  for (let day = first; day <= last; day += 1) days.push(day)

  let questions = 0
  let correct = 0
  let wrong = 0
  let timeMs = 0
  let activeDays = 0
  for (const row of byDay.values()) {
    if (row.count <= 0) continue
    activeDays += 1
    questions += row.count
    correct += row.correct
    wrong += row.wrong
    timeMs += row.timeMs
  }

  const units: UnitTrack[] = []
  const seen = new Set<string>()
  for (const pin of pins) {
    const skill = getSkill(pin.skillId)
    if (!skill) continue
    const variant = unitVariant(skill, pin.knobs)
    const key = `${pin.skillId}|${variant}`
    if (seen.has(key)) continue
    seen.add(key)
    const mine = attempts.filter((item) => item.skillId === pin.skillId && item.variant === variant)
    const heat = heatFor(attempts, pin.skillId, variant)
    units.push({
      key,
      skillId: pin.skillId,
      variant,
      knobs: pin.knobs,
      heat: heat.heat,
      rate: heat.rate,
      seen: heat.seen,
      values: rollingAccuracy(mine, first, last),
    })
  }

  return {
    first,
    last,
    today,
    span: last - first + 1,
    days,
    weeks: weeksFor(first, last, byDay),
    byDay,
    activeDays,
    questions,
    correct,
    wrong,
    timeMs,
    overall: rollingAccuracy(attempts, first, last),
    units,
    red: units.filter((unit) => unit.heat === 'red').length,
    yellow: units.filter((unit) => unit.heat === 'yellow').length,
  }
}
