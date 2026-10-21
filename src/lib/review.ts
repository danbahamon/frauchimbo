import type { Answer, Attempt, GradeResult, Locale, MissKind, Question } from './types'
import { tx } from './i18n'
import { fractionValue } from './math'

// Turns math markup like [[3/4]] into plain text, so stored details read the same everywhere.
export function plainText(text: string) {
  return text.replace(/\[\[(-?\d+)\s*\/\s*(\d+)\]\]/g, '$1/$2')
}

// Short readable form of an answer, used by the review list, the exam summary, and attempt details.
export function answerText(question: Question, answer: Answer | null, locale: Locale, blank: string): string {
  if (!answer) return blank
  const response = question.response
  if (answer.kind === 'number') return String(answer.value)
  if (answer.kind === 'fraction') return `${answer.whole ? `${answer.whole} ` : ''}${answer.n}/${answer.d}`
  if (answer.kind === 'compare') return answer.sign
  if (answer.kind === 'choice' && response.type === 'choice') {
    const option = response.options.find((item) => item.id === answer.id)
    return option ? plainText(tx(locale, option.label)) : answer.id
  }
  if (answer.kind === 'order') {
    return answer.ids
      .map((id) => {
        const item = response.type === 'order' ? response.items.find((entry) => entry.id === id) : undefined
        return item ? plainText(tx(locale, item.label)) : id
      })
      .join(' → ')
  }
  if (answer.kind === 'points') return answer.points.map((point) => `(${point.x}, ${point.y})`).join(' ')
  if (answer.kind === 'clock') return `${answer.h}:${String(answer.m).padStart(2, '0')}`
  if (answer.kind === 'ratio') return `${answer.a}:${answer.b}`
  if (answer.kind === 'digits') return answer.digits.join('')
  if (answer.kind === 'shade') return String(answer.count)
  if (answer.kind === 'angle') return `${answer.degrees}°`
  if (answer.kind === 'chart') return answer.values.join(', ')
  if (answer.kind === 'multi') {
    return Object.entries(answer.parts)
      .map(([key, value]) => {
        const field = response.type === 'multi' ? response.fields.find((entry) => entry.id === key) : undefined
        return `${field ? plainText(tx(locale, field.label)) : key} ${value}`
      })
      .join(' · ')
  }
  return blank
}

// The kind of mistake behind a wrong answer. Pure text rules, so older attempts without a kind simply show as unrecorded.
export function classifyMiss(expected: Answer, given: Answer | null, grade: GradeResult | 'blank'): MissKind | undefined {
  if (grade === 'correct') return undefined
  if (!given || grade === 'blank') return 'blank'
  if (grade === 'unsimplified') return 'simplify'
  if (expected.kind === 'compare') return 'sign'
  if (expected.kind === 'choice') return 'pick'
  if (expected.kind === 'order') return 'order'
  if (expected.kind === 'number' && given.kind === 'number') {
    const e = expected.value
    const g = given.value
    if (e !== 0 && g !== 0 && (e < 0) !== (g < 0)) return 'sign'
    if (Math.abs(g - e) <= Math.max(1, Math.abs(e) * 0.1)) return 'close'
    if (e !== 0 && g !== 0 && Math.abs(Math.abs(Math.log10(Math.abs(g / e))) - 1) < 1e-9) return 'place'
    const digitsOf = (value: number) => String(Math.abs(Math.round(value))).split('').sort().join('')
    if (digitsOf(e) === digitsOf(g)) return 'place'
    return 'method'
  }
  if (expected.kind === 'fraction' && given.kind === 'fraction') {
    const ev = fractionValue(expected.whole ?? 0, expected.n, expected.d)
    const gv = fractionValue(given.whole ?? 0, given.n, given.d)
    if (given.n === expected.d && given.d === expected.n) return 'place'
    if (Math.sign(ev) !== Math.sign(gv)) return 'sign'
    if (Math.abs(gv - ev) <= Math.max(0.1, Math.abs(ev) * 0.1)) return 'close'
    return 'method'
  }
  if (expected.kind === 'points' && given.kind === 'points') {
    const swapped = expected.points.length > 0 && expected.points.every((point, index) => {
      const other = given.points[index]
      return other !== undefined && other.x === point.y && other.y === point.x
    })
    return swapped ? 'place' : 'read'
  }
  if (expected.kind === 'digits' && given.kind === 'digits') {
    const sorted = (list: number[]) => [...list].sort().join('')
    return sorted(expected.digits) === sorted(given.digits) ? 'place' : 'method'
  }
  if (expected.kind === 'shade' || expected.kind === 'clock' || expected.kind === 'angle' || expected.kind === 'chart') return 'read'
  return 'method'
}

// Everything worth keeping about one answer, as plain text, for the attempt log.
export function attemptDetail(question: Question, given: Answer | null, grade: GradeResult | 'blank', locale: Locale): Pick<Attempt, 'prompt' | 'given' | 'expected' | 'miss'> {
  return {
    prompt: plainText(tx(locale, question.prompt)),
    given: answerText(question, given, locale, '') || undefined,
    expected: answerText(question, question.answer, locale, '') || undefined,
    miss: classifyMiss(question.answer, given, grade),
  }
}
