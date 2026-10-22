import type { Locale, Localized } from './types'

export function L(en: string, de: string, es: string): Localized {
  return { en, de, es }
}

export function tri(fn: (loc: Locale) => string): Localized {
  return { en: fn('en'), de: fn('de'), es: fn('es') }
}

export function localeTag(loc: Locale) {
  if (loc === 'de') return 'de-DE'
  if (loc === 'es') return 'es-ES'
  return 'en-US'
}

export function formatNumber(loc: Locale, value: number, digits?: number) {
  return new Intl.NumberFormat(localeTag(loc), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits ?? 6,
  }).format(value)
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a))
  let y = Math.abs(Math.round(b))
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

export function lcm(a: number, b: number) {
  return Math.abs(a * b) / gcd(a, b)
}

export function simplify(n: number, d: number): [number, number] {
  const sign = n < 0 ? -1 : 1
  const g = gcd(n, d)
  return [(sign * Math.abs(n)) / g, Math.abs(d) / g]
}

export function roundTo(n: number, places: number) {
  const p = 10 ** places
  return Math.round((n + Number.EPSILON) * p) / p
}

function roundPowerOfTen(abs: number, place: number) {
  const zeros = Math.round(Math.log10(place))
  if (10 ** zeros !== place) return null
  if (zeros <= 0) return abs
  if (abs < place) return abs * 2 >= place ? place : 0
  const text = String(abs)
  const head = text.slice(0, text.length - zeros)
  const tail = text.slice(text.length - zeros)
  const next = Number(head) + (tail[0] >= '5' ? 1 : 0)
  return next * place
}

export function roundHalfUp(n: number, place: number) {
  const sign = n < 0 ? -1 : 1
  const abs = Math.abs(n)
  // Digit strings stay exact. Dividing a 15-digit number by 100 in floating point can lose the remainder.
  if (Number.isSafeInteger(abs) && Number.isInteger(place) && place >= 1) {
    const rounded = roundPowerOfTen(abs, place)
    if (rounded != null && Number.isSafeInteger(rounded)) return sign * rounded
    const q = Math.floor(abs / place)
    const rem = abs - q * place
    return sign * (q + (rem * 2 >= place ? 1 : 0)) * place
  }
  return sign * Math.round(abs / place) * place
}

export function fractionValue(whole: number, n: number, d: number) {
  if (d === 0) return Number.NaN
  if (whole < 0) return whole - Math.abs(n) / d
  return whole + n / d
}

export function isSimplifiedFraction(whole: number, n: number, d: number) {
  if (d <= 0) return false
  if (gcd(n, d) !== 1) return false
  if (whole !== 0 && Math.abs(n) >= d) return false
  return true
}

export interface Rng {
  int(min: number, max: number): number
  pick<T>(arr: readonly T[]): T
  shuffle<T>(arr: readonly T[]): T[]
  chance(p: number): boolean
}

export function makeRng(random: () => number = Math.random): Rng {
  return {
    int(min, max) {
      return min + Math.floor(random() * (max - min + 1))
    },
    pick(arr) {
      return arr[Math.floor(random() * arr.length)]
    },
    shuffle(arr) {
      const copy = [...arr]
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        const tmp = copy[i]
        copy[i] = copy[j]
        copy[j] = tmp
      }
      return copy
    },
    chance(p) {
      return random() < p
    },
  }
}

export function distractors(correct: number, rng: Rng, count: number, spread = 8) {
  const found = new Set<number>([correct])
  let guard = 0
  while (found.size < count + 1 && guard < 40) {
    const delta = rng.int(1, spread) * (rng.chance(0.5) ? 1 : -1)
    found.add(correct + delta)
    guard += 1
  }
  return [...found].filter((n) => n !== correct).slice(0, count)
}

export function fracMarkup(n: number, d: number, whole = 0) {
  const body = `[[${n}/${d}]]`
  if (!whole) return body
  return `${whole} ${body}`
}

export function monthIndex(date = new Date()) {
  const month = date.getMonth() + 1
  if (month === 7 || month === 8) return 6
  return month
}

export function dayKey(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function practiceStreak(timestamps: number[]) {
  const days = new Set(timestamps.map(dayKey))
  const cursor = new Date()
  if (!days.has(dayKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(dayKey(cursor.getTime()))) return 0
  }
  let count = 0
  while (days.has(dayKey(cursor.getTime()))) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function positionDifficulty(position: 'review' | 'onlevel' | 'stretch') {
  if (position === 'review') return 2
  if (position === 'stretch') return 4
  return 3
}
