import type { Answer, GradeResult } from './types'
import { fractionValue, isSimplifiedFraction } from './math'

export function gradeAnswer(expected: Answer, given: Answer | null): GradeResult {
  if (!given || expected.kind !== given.kind) return 'incorrect'

  if (expected.kind === 'number' && given.kind === 'number') {
    const tol = expected.tolerance ?? 0
    return Math.abs(given.value - expected.value) <= tol + 1e-9 ? 'correct' : 'incorrect'
  }
  if (expected.kind === 'fraction' && given.kind === 'fraction') {
    if (given.d <= 0) return 'incorrect'
    const ev = fractionValue(expected.whole ?? 0, expected.n, expected.d)
    const gv = fractionValue(given.whole ?? 0, given.n, given.d)
    if (!Number.isFinite(gv) || Math.abs(ev - gv) > 1e-8) return 'incorrect'
    if (expected.simplified && !isSimplifiedFraction(given.whole ?? 0, given.n, given.d)) return 'unsimplified'
    return 'correct'
  }
  if (expected.kind === 'choice' && given.kind === 'choice') {
    return given.id === expected.id ? 'correct' : 'incorrect'
  }
  if (expected.kind === 'compare' && given.kind === 'compare') {
    return given.sign === expected.sign ? 'correct' : 'incorrect'
  }
  if (expected.kind === 'order' && given.kind === 'order') {
    return given.ids.join('|') === expected.ids.join('|') ? 'correct' : 'incorrect'
  }
  if (expected.kind === 'points' && given.kind === 'points') {
    const norm = (pts: { x: number; y: number }[]) => [...pts].sort((a, b) => a.x - b.x || a.y - b.y)
    const a = norm(expected.points)
    const b = norm(given.points)
    if (a.length !== b.length) return 'incorrect'
    return a.every((p, i) => p.x === b[i].x && p.y === b[i].y) ? 'correct' : 'incorrect'
  }
  if (expected.kind === 'shade' && given.kind === 'shade') {
    return given.count === expected.count ? 'correct' : 'incorrect'
  }
  if (expected.kind === 'clock' && given.kind === 'clock') {
    return given.h === expected.h && given.m === expected.m ? 'correct' : 'incorrect'
  }
  if (expected.kind === 'chart' && given.kind === 'chart') {
    if (given.values.length !== expected.values.length) return 'incorrect'
    if (given.values.some((v, i) => v !== expected.values[i])) return 'incorrect'
    if (given.axisMax < expected.axisAtLeast) return 'incorrect'
    if (expected.colors) {
      for (let i = 0; i < expected.colors.length; i++) {
        const need = expected.colors[i]
        if (need && given.colors?.[i] !== need) return 'incorrect'
      }
    }
    return 'correct'
  }
  if (expected.kind === 'angle' && given.kind === 'angle') {
    const tol = expected.tolerance ?? 4
    return Math.abs(given.degrees - expected.degrees) <= tol ? 'correct' : 'incorrect'
  }
  if (expected.kind === 'ratio' && given.kind === 'ratio') {
    return given.a > 0 && given.b > 0 && given.a * expected.b === given.b * expected.a ? 'correct' : 'incorrect'
  }
  if (expected.kind === 'digits' && given.kind === 'digits') {
    return given.digits.join(',') === expected.digits.join(',') ? 'correct' : 'incorrect'
  }
  if (expected.kind === 'multi' && given.kind === 'multi') {
    const tol = expected.tolerance ?? 0
    for (const key of Object.keys(expected.parts)) {
      if (Math.abs((given.parts[key] ?? Number.NaN) - expected.parts[key]) > tol + 1e-9) return 'incorrect'
    }
    return 'correct'
  }
  return 'incorrect'
}

export function isCorrect(expected: Answer, given: Answer | null) {
  return gradeAnswer(expected, given) === 'correct'
}
