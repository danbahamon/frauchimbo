import { getSkill } from '../data/skills'
import type { Attempt, DomainId, MissKind, TestRecord } from '../lib/types'

// 0 means every day since the first attempt.
export type RangeDays = 7 | 30 | 90 | 0

const DAY = 86400000

// Whole local calendar days as integers, so buckets line up regardless of the time zone.
export function dayNumber(ts: number) {
  const d = new Date(ts)
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY)
}

// One day per bar for short windows, a week for medium ones, a month for long ones.
export function bucketSize(span: number) {
  if (span <= 31) return 1
  if (span <= 120) return 7
  return 30
}

export interface Window {
  days: RangeDays
  first: number
  last: number
  span: number
  size: number
}

export function windowFor(days: RangeDays, attempts: Attempt[], now = Date.now()): Window {
  const today = dayNumber(now)
  const first = days === 0
    ? attempts.reduce((earliest, item) => Math.min(earliest, dayNumber(item.at)), today)
    : today - (days - 1)
  const span = today - first + 1
  return { days, first, last: today, span, size: bucketSize(span) }
}

// The same number of days immediately before the window, used for change arrows.
export function previousWindow(win: Window): Window {
  const last = win.first - 1
  const first = last - win.span + 1
  return { ...win, first, last }
}

export function inWindow(attempt: Attempt, win: Window) {
  const day = dayNumber(attempt.at)
  return day >= win.first && day <= win.last
}

export function attemptsIn(attempts: Attempt[], win: Window, domain: DomainId | 'all' = 'all') {
  return attempts.filter((item) => inWindow(item, win) && (domain === 'all' || getSkill(item.skillId)?.domain === domain))
}

export function testsIn(tests: TestRecord[], win: Window) {
  return tests.filter((item) => {
    const day = dayNumber(item.finishedAt)
    return day >= win.first && day <= win.last
  })
}

export interface Bucket {
  first: number
  days: number
  total: number
  correct: number
  wrong: number
  accuracy: number | null
}

// Splits the window into bars. Empty bars keep their place so the chart reads as a calendar.
export function buckets(attempts: Attempt[], win: Window): Bucket[] {
  const count = Math.ceil(win.span / win.size)
  const list: Bucket[] = Array.from({ length: count }, (_, index) => {
    const first = win.first + index * win.size
    return { first, days: Math.min(win.size, win.last - first + 1), total: 0, correct: 0, wrong: 0, accuracy: null }
  })
  for (const item of attempts) {
    const index = Math.floor((dayNumber(item.at) - win.first) / win.size)
    const bucket = list[index]
    if (!bucket) continue
    bucket.total += 1
    if (item.correct) bucket.correct += 1
    else bucket.wrong += 1
  }
  for (const bucket of list) bucket.accuracy = bucket.total ? bucket.correct / bucket.total : null
  return list
}

export function accuracyOf(list: Attempt[]) {
  return list.length ? list.filter((item) => item.correct).length / list.length : null
}

export function activeDays(list: Attempt[]) {
  return new Set(list.map((item) => dayNumber(item.at))).size
}

export function timeSpent(list: Attempt[]) {
  return list.reduce((sum, item) => sum + item.timeMs, 0)
}

// Counts of each kind of mistake, most common first. Wrong answers saved before kinds existed are counted apart.
export function missBreakdown(list: Attempt[]) {
  const counts = new Map<MissKind, number>()
  let unrecorded = 0
  for (const item of list) {
    if (item.correct) continue
    if (item.miss) counts.set(item.miss, (counts.get(item.miss) ?? 0) + 1)
    else unrecorded += 1
  }
  const kinds = [...counts.entries()].map(([kind, count]) => ({ kind, count })).sort((a, b) => b.count - a.count)
  return { kinds, unrecorded }
}

export interface SkillRow {
  skillId: string
  domain: DomainId
  total: number
  accuracy: number | null
  previous: number | null
  last: number
  series: (number | null)[]
}

// One row per skill practiced in the window, with the accuracy of the window before it for comparison.
export function skillRows(attempts: Attempt[], win: Window): SkillRow[] {
  const prior = previousWindow(win)
  const groups = new Map<string, Attempt[]>()
  for (const item of attempts) {
    if (!inWindow(item, win)) continue
    const list = groups.get(item.skillId) ?? []
    list.push(item)
    groups.set(item.skillId, list)
  }
  return [...groups.entries()]
    .map(([skillId, list]) => {
      const skill = getSkill(skillId)
      const before = attempts.filter((item) => item.skillId === skillId && inWindow(item, prior))
      return {
        skillId,
        domain: skill?.domain ?? 'NS',
        total: list.length,
        accuracy: accuracyOf(list),
        previous: accuracyOf(before),
        last: Math.max(...list.map((item) => item.at)),
        series: buckets(list, win).map((bucket) => bucket.accuracy),
      }
    })
    .sort((a, b) => b.total - a.total)
}

export interface DomainRow {
  domain: DomainId
  total: number
  accuracy: number | null
  previous: number | null
  series: (number | null)[]
}

export function domainRows(attempts: Attempt[], win: Window): DomainRow[] {
  const prior = previousWindow(win)
  const domains = new Map<DomainId, Attempt[]>()
  for (const item of attempts) {
    const skill = getSkill(item.skillId)
    if (!skill || !inWindow(item, win)) continue
    const list = domains.get(skill.domain) ?? []
    list.push(item)
    domains.set(skill.domain, list)
  }
  return [...domains.entries()]
    .map(([domain, list]) => {
      const before = attempts.filter((item) => getSkill(item.skillId)?.domain === domain && inWindow(item, prior))
      return {
        domain,
        total: list.length,
        accuracy: accuracyOf(list),
        previous: accuracyOf(before),
        series: buckets(list, win).map((bucket) => bucket.accuracy),
      }
    })
    .sort((a, b) => b.total - a.total)
}

export function recentAttempts(list: Attempt[]) {
  return [...list].sort((a, b) => b.at - a.at)
}
