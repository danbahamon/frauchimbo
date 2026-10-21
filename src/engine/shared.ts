import { L, formatNumber, fracMarkup, makeRng, roundTo, simplify, uid, type Rng } from '../lib/math'
import type {
  Answer,
  ChoiceOption,
  KnobValues,
  Locale,
  Localized,
  MathPart,
  Question,
  Response,
  Skill,
  Stimulus,
} from '../lib/types'

export type ExprPiece =
  | { t: 'v'; value: number; digits?: number }
  | { t: 'op'; v: string }
  | { t: 'frac'; n: number; d: number }

export interface Ctx {
  skill: Skill
  difficulty: number
  knobs: KnobValues
  rng: Rng
  mode: string
}

export function makeCtx(skill: Skill, difficulty: number, knobs: KnobValues): Ctx {
  const modeValue = knobs.mode
  return {
    skill,
    difficulty,
    knobs,
    rng: makeRng(),
    mode: typeof modeValue === 'string' ? modeValue : '',
  }
}

export function knobNum(ctx: Ctx, id: string, fallback: number) {
  const value = ctx.knobs[id]
  return typeof value === 'number' ? value : fallback
}

export function knobFlag(ctx: Ctx, id: string) {
  return ctx.knobs[id] === true
}

// Like knobFlag, but a missing key falls back to the given default (for older saved sets that predate the toggle).
export function knobBool(ctx: Ctx, id: string, fallback: boolean) {
  const value = ctx.knobs[id]
  return typeof value === 'boolean' ? value : fallback
}

export function familyOf(ctx: Ctx) {
  const value = ctx.knobs.family
  return typeof value === 'string' ? value : 'int'
}

export function ask(
  ctx: Ctx,
  prompt: Localized,
  response: Response,
  answer: Answer,
  steps: Localized[],
  stimulus?: Stimulus,
): Question {
  return {
    id: uid('q'),
    skillId: ctx.skill.id,
    difficulty: ctx.difficulty,
    prompt,
    stimulus,
    response,
    answer,
    steps: steps.map((text) => ({ text })),
  }
}

export function n(value: number, digits?: number): Localized {
  return {
    en: formatNumber('en', value, digits),
    de: formatNumber('de', value, digits),
    es: formatNumber('es', value, digits),
  }
}

export function join(loc: Localized, before: Localized, after: Localized = L('', '', '')): Localized {
  return {
    en: `${before.en}${loc.en}${after.en}`,
    de: `${before.de}${loc.de}${after.de}`,
    es: `${before.es}${loc.es}${after.es}`,
  }
}

export function sentence(en: string, de: string, es: string) {
  return L(en, de, es)
}

export function pickedChoice(correct: ChoiceOption, wrongs: ChoiceOption[], rng: Rng) {
  const options = rng.shuffle([correct, ...wrongs])
  return { options, answer: { kind: 'choice' as const, id: correct.id } }
}

export function textChoice(correct: Localized, wrongs: Localized[], rng: Rng) {
  const good: ChoiceOption = { id: 'ok', label: correct }
  const bad = wrongs.map((label, index) => ({ id: `no${index}`, label }))
  return pickedChoice(good, bad, rng)
}

export function expression(pieces: ExprPiece[]): Stimulus {
  const build = (loc: Locale): MathPart[] =>
    pieces.map((piece) => {
      if (piece.t === 'v') return { t: 'n', v: formatNumber(loc, piece.value, piece.digits) }
      if (piece.t === 'op') return { t: 'op', v: piece.v }
      return { t: 'frac', n: String(piece.n), d: String(piece.d) }
    })
  return { type: 'expression', en: build('en'), de: build('de'), es: build('es') }
}

export function shuffleNotSorted(ids: string[], correct: string[], rng: Rng) {
  let order = rng.shuffle(ids)
  let guard = 0
  while (order.join('|') === correct.join('|') && guard < 6) {
    order = rng.shuffle(ids)
    guard += 1
  }
  if (order.join('|') === correct.join('|') && order.length > 1) {
    const swap = order[0]
    order[0] = order[1]
    order[1] = swap
  }
  return order
}

export function frac(whole: number, num: number, den: number) {
  return fracMarkup(num, den, whole)
}

export function reduced(numer: number, den: number) {
  const [n0, d0] = simplify(numer, den)
  const whole = Math.trunc(n0 / d0)
  const rest = Math.abs(n0 % d0)
  return { whole, n: rest, d: d0, text: frac(whole, rest, d0) }
}

export function scene(tone: 'bay' | 'market' | 'sky' | 'kitchen'): Stimulus {
  return { type: 'scene', tone }
}

export { roundTo, simplify, L }
