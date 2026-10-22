import { roundHalfUp, roundTo } from '../lib/math'
import { ask, densUpTo, expression, frac, knobBool, knobFlag, knobNum, knobStr, L, n, scene, shuffleNotSorted, textChoice, type Ctx } from './shared'
import type { Localized } from '../lib/types'
import { fractionQuestion, chosenRoundPlace, g4mdA, g4nbtB, placeColumns, reducedMixed, roundPhrase } from './bank4'
import { avoidTie } from './ops'

function span(ctx: Ctx, lo: number, hi: number) {
  const low = Math.min(lo, hi)
  const high = Math.max(lo, hi)
  return ctx.rng.int(low, high)
}

function exprText(pieces: Array<{ t: 'v'; value: number } | { t: 'op'; v: string }>) {
  const text = (loc: 'en' | 'de' | 'es') => pieces.map((piece) => (piece.t === 'v' ? n(piece.value)[loc] : piece.v)).join(' ')
  return L(text('en'), text('de'), text('es'))
}

export function g5oaA(ctx: Ctx) {
  const top = Math.max(4, Math.round(knobNum(ctx, 'max', 12) * (0.55 + knobNum(ctx, 'qty', 3) / 8)))
  const shape = knobStr(ctx, 'shape', 'sumprod')
  const cCap = Math.max(2, Math.min(top, shape === 'three' ? 15 : top))
  const a = span(ctx, 2, top)
  const b = span(ctx, 2, top)
  const c = span(ctx, 2, cCap)
  if (shape === 'div') {
    const divisor = span(ctx, 2, Math.max(2, Math.min(12, top)))
    const parts = span(ctx, 2, Math.max(2, Math.min(top, 40)))
    const sum = divisor * parts
    const left = span(ctx, 1, Math.max(1, sum - 1))
    const right = sum - left
    const grouped = ctx.mode === 'words' || (!knobBool(ctx, 'twist', false) && ctx.rng.chance(0.55))
    const loose = divisor * span(ctx, 2, Math.max(2, Math.floor(top / divisor) || 2))
    const head = span(ctx, 2, top)
    const value = grouped ? parts : head + loose / divisor
    const pieces = grouped
      ? [{ t: 'op' as const, v: '(' }, { t: 'v' as const, value: left }, { t: 'op' as const, v: '+' }, { t: 'v' as const, value: right }, { t: 'op' as const, v: ')' }, { t: 'op' as const, v: '÷' }, { t: 'v' as const, value: divisor }]
      : [{ t: 'v' as const, value: head }, { t: 'op' as const, v: '+' }, { t: 'v' as const, value: loose }, { t: 'op' as const, v: '÷' }, { t: 'v' as const, value: divisor }]
    const steps = grouped
      ? [
          L(`Parentheses first: ${n(left).en} + ${n(right).en} = ${n(sum).en}.`, `Zuerst die Klammern: ${n(left).de} + ${n(right).de} = ${n(sum).de}.`, `Primero los paréntesis: ${n(left).es} + ${n(right).es} = ${n(sum).es}.`),
          L(`${n(sum).en} ÷ ${n(divisor).en} = ${n(parts).en}.`, `${n(sum).de} ÷ ${n(divisor).de} = ${n(parts).de}.`, `${n(sum).es} ÷ ${n(divisor).es} = ${n(parts).es}.`),
        ]
      : [
          L(`Division happens before addition: ${n(loose).en} ÷ ${n(divisor).en} = ${n(loose / divisor).en}.`, `Die Division geschieht vor der Addition: ${n(loose).de} ÷ ${n(divisor).de} = ${n(loose / divisor).de}.`, `La división ocurre antes de la suma: ${n(loose).es} ÷ ${n(divisor).es} = ${n(loose / divisor).es}.`),
          L(`${n(head).en} + ${n(loose / divisor).en} = ${n(value).en}.`, `${n(head).de} + ${n(loose / divisor).de} = ${n(value).de}.`, `${n(head).es} + ${n(loose / divisor).es} = ${n(value).es}.`),
        ]
    if (ctx.mode === 'words') {
      const correct = exprText(pieces)
      const pack = textChoice(correct, [
        exprText([{ t: 'v', value: left }, { t: 'op', v: '+' }, { t: 'v', value: right }, { t: 'op', v: '÷' }, { t: 'v', value: divisor }]),
        exprText([{ t: 'op', v: '(' }, { t: 'v', value: left }, { t: 'op', v: '×' }, { t: 'v', value: right }, { t: 'op', v: ')' }, { t: 'op', v: '÷' }, { t: 'v', value: divisor }]),
        exprText([{ t: 'v', value: left }, { t: 'op', v: '÷' }, { t: 'v', value: right }, { t: 'op', v: '+' }, { t: 'v', value: divisor }]),
      ], ctx.rng)
      return ask(ctx, L(
        `Which expression means: add ${n(left).en} and ${n(right).en}, then divide by ${n(divisor).en}?`,
        `Welcher Term bedeutet: addiere ${n(left).de} und ${n(right).de}, dann teile durch ${n(divisor).de}?`,
        `¿Cuál expresión significa: suma ${n(left).es} y ${n(right).es}, luego divide entre ${n(divisor).es}?`,
      ), { type: 'choice', options: pack.options }, pack.answer, steps)
    }
    return ask(ctx, L('Evaluate the expression.', 'Werte den Term aus.', 'Evalúa la expresión.'), { type: 'number' }, { kind: 'number', value }, steps, expression(pieces))
  }
  if (shape === 'three') {
    const factor = span(ctx, 2, Math.max(2, Math.min(top, 12)))
    const grouped = ctx.mode === 'words' || (!knobBool(ctx, 'twist', false) && ctx.rng.chance(0.55))
    const product = grouped ? (a + b) * factor : a + b * factor
    const take = span(ctx, 1, Math.max(1, Math.min(top, product)))
    const value = product - take
    const pieces = grouped
      ? [{ t: 'op' as const, v: '(' }, { t: 'v' as const, value: a }, { t: 'op' as const, v: '+' }, { t: 'v' as const, value: b }, { t: 'op' as const, v: ')' }, { t: 'op' as const, v: '×' }, { t: 'v' as const, value: factor }, { t: 'op' as const, v: '−' }, { t: 'v' as const, value: take }]
      : [{ t: 'v' as const, value: a }, { t: 'op' as const, v: '+' }, { t: 'v' as const, value: b }, { t: 'op' as const, v: '×' }, { t: 'v' as const, value: factor }, { t: 'op' as const, v: '−' }, { t: 'v' as const, value: take }]
    const steps = [
      L(grouped ? `Parentheses first, then multiply: ${n(product).en}.` : `Multiply before you add: ${n(b).en} × ${n(factor).en} = ${n(b * factor).en}.`, grouped ? `Zuerst die Klammern, dann malnehmen: ${n(product).de}.` : `Erst multiplizieren: ${n(b).de} × ${n(factor).de} = ${n(b * factor).de}.`, grouped ? `Primero los paréntesis, luego multiplica: ${n(product).es}.` : `Primero multiplica: ${n(b).es} × ${n(factor).es} = ${n(b * factor).es}.`),
      L(`Then subtract ${n(take).en}: ${n(value).en}.`, `Dann subtrahiere ${n(take).de}: ${n(value).de}.`, `Luego resta ${n(take).es}: ${n(value).es}.`),
    ]
    if (ctx.mode === 'words') {
      const correct = exprText(pieces)
      const pack = textChoice(correct, [
        exprText([{ t: 'v', value: a }, { t: 'op', v: '+' }, { t: 'v', value: b }, { t: 'op', v: '×' }, { t: 'v', value: factor }, { t: 'op', v: '−' }, { t: 'v', value: take }]),
        exprText([{ t: 'v', value: a }, { t: 'op', v: '×' }, { t: 'v', value: b }, { t: 'op', v: '+' }, { t: 'v', value: factor }, { t: 'op', v: '−' }, { t: 'v', value: take }]),
        exprText([{ t: 'op', v: '(' }, { t: 'v', value: a }, { t: 'op', v: '+' }, { t: 'v', value: b }, { t: 'op', v: '×' }, { t: 'v', value: factor }, { t: 'op', v: ')' }, { t: 'op', v: '−' }, { t: 'v', value: take }]),
      ], ctx.rng)
      return ask(ctx, L(
        `Which expression means: add ${n(a).en} and ${n(b).en}, multiply by ${n(factor).en}, then subtract ${n(take).en}?`,
        `Welcher Term bedeutet: addiere ${n(a).de} und ${n(b).de}, multipliziere mit ${n(factor).de}, dann subtrahiere ${n(take).de}?`,
        `¿Cuál expresión significa: suma ${n(a).es} y ${n(b).es}, multiplica por ${n(factor).es} y luego resta ${n(take).es}?`,
      ), { type: 'choice', options: pack.options }, pack.answer, steps)
    }
    return ask(ctx, L('Evaluate the expression.', 'Werte den Term aus.', 'Evalúa la expresión.'), { type: 'number' }, { kind: 'number', value }, steps, expression(pieces))
  }
  if (shape === 'diff') {
    const factor = span(ctx, 2, Math.max(2, Math.min(top, 20)))
    const small = span(ctx, 2, top)
    const large = small + span(ctx, 1, top)
    const grouped = ctx.mode === 'words' || (!knobBool(ctx, 'twist', false) && ctx.rng.chance(0.55))
    const product = small * factor
    const head = product + span(ctx, 0, top)
    const value = grouped ? (large - small) * factor : head - product
    const pieces = grouped
      ? [{ t: 'op' as const, v: '(' }, { t: 'v' as const, value: large }, { t: 'op' as const, v: '−' }, { t: 'v' as const, value: small }, { t: 'op' as const, v: ')' }, { t: 'op' as const, v: '×' }, { t: 'v' as const, value: factor }]
      : [{ t: 'v' as const, value: head }, { t: 'op' as const, v: '−' }, { t: 'v' as const, value: small }, { t: 'op' as const, v: '×' }, { t: 'v' as const, value: factor }]
    const steps = grouped
      ? [
          L(`Parentheses first: ${n(large).en} − ${n(small).en} = ${n(large - small).en}.`, `Zuerst die Klammern: ${n(large).de} − ${n(small).de} = ${n(large - small).de}.`, `Primero los paréntesis: ${n(large).es} − ${n(small).es} = ${n(large - small).es}.`),
          L(`${n(large - small).en} × ${n(factor).en} = ${n(value).en}.`, `${n(large - small).de} × ${n(factor).de} = ${n(value).de}.`, `${n(large - small).es} × ${n(factor).es} = ${n(value).es}.`),
        ]
      : [
          L(`Multiply first: ${n(small).en} × ${n(factor).en} = ${n(product).en}.`, `Zuerst malnehmen: ${n(small).de} × ${n(factor).de} = ${n(product).de}.`, `Primero multiplica: ${n(small).es} × ${n(factor).es} = ${n(product).es}.`),
          L(`${n(head).en} − ${n(product).en} = ${n(value).en}.`, `${n(head).de} − ${n(product).de} = ${n(value).de}.`, `${n(head).es} − ${n(product).es} = ${n(value).es}.`),
        ]
    if (ctx.mode === 'words') {
      const correct = exprText(pieces)
      const pack = textChoice(correct, [
        exprText([{ t: 'v', value: large }, { t: 'op', v: '−' }, { t: 'v', value: small }, { t: 'op', v: '×' }, { t: 'v', value: factor }]),
        exprText([{ t: 'v', value: large }, { t: 'op', v: '×' }, { t: 'v', value: small }, { t: 'op', v: '−' }, { t: 'v', value: factor }]),
        exprText([{ t: 'op', v: '(' }, { t: 'v', value: large }, { t: 'op', v: '×' }, { t: 'v', value: small }, { t: 'op', v: ')' }, { t: 'op', v: '−' }, { t: 'v', value: factor }]),
      ], ctx.rng)
      return ask(ctx, L(
        `Which expression means: subtract ${n(small).en} from ${n(large).en}, then multiply by ${n(factor).en}?`,
        `Welcher Term bedeutet: subtrahiere ${n(small).de} von ${n(large).de}, dann multipliziere mit ${n(factor).de}?`,
        `¿Cuál expresión significa: resta ${n(small).es} de ${n(large).es} y luego multiplica por ${n(factor).es}?`,
      ), { type: 'choice', options: pack.options }, pack.answer, steps)
    }
    return ask(ctx, L('Evaluate the expression.', 'Werte den Term aus.', 'Evalúa la expresión.'), { type: 'number' }, { kind: 'number', value }, steps, expression(pieces))
  }
  const grouped = ctx.mode === 'words' || (!knobBool(ctx, 'twist', false) && ctx.rng.chance(0.55))
  const value = grouped ? (a + b) * c : a + b * c
  const pieces = grouped
    ? [{ t: 'op' as const, v: '(' }, { t: 'v' as const, value: a }, { t: 'op' as const, v: '+' }, { t: 'v' as const, value: b }, { t: 'op' as const, v: ')' }, { t: 'op' as const, v: '×' }, { t: 'v' as const, value: c }]
    : [{ t: 'v' as const, value: a }, { t: 'op' as const, v: '+' }, { t: 'v' as const, value: b }, { t: 'op' as const, v: '×' }, { t: 'v' as const, value: c }]
  const steps = grouped
    ? [
        L(`Parentheses first: ${n(a).en} + ${n(b).en} = ${n(a + b).en}.`, `Zuerst die Klammern: ${n(a).de} + ${n(b).de} = ${n(a + b).de}.`, `Primero los paréntesis: ${n(a).es} + ${n(b).es} = ${n(a + b).es}.`),
        L(`${n(a + b).en} × ${n(c).en} = ${n(value).en}.`, `${n(a + b).de} × ${n(c).de} = ${n(value).de}.`, `${n(a + b).es} × ${n(c).es} = ${n(value).es}.`),
      ]
    : [
        L(`Multiplication happens before addition: ${n(b).en} × ${n(c).en} = ${n(b * c).en}.`, `Die Multiplikation geschieht vor der Addition: ${n(b).de} × ${n(c).de} = ${n(b * c).de}.`, `La multiplicación ocurre antes de la suma: ${n(b).es} × ${n(c).es} = ${n(b * c).es}.`),
        L(`${n(a).en} + ${n(b * c).en} = ${n(value).en}.`, `${n(a).de} + ${n(b * c).de} = ${n(value).de}.`, `${n(a).es} + ${n(b * c).es} = ${n(value).es}.`),
      ]
  if (ctx.mode === 'words') {
    const pack = textChoice(exprText(pieces), [
      exprText([{ t: 'v', value: a }, { t: 'op', v: '+' }, { t: 'v', value: b }, { t: 'op', v: '×' }, { t: 'v', value: c }]),
      exprText([{ t: 'v', value: a }, { t: 'op', v: '×' }, { t: 'v', value: b }, { t: 'op', v: '+' }, { t: 'v', value: c }]),
      exprText([{ t: 'op', v: '(' }, { t: 'v', value: a }, { t: 'op', v: '×' }, { t: 'v', value: b }, { t: 'op', v: ')' }, { t: 'op', v: '+' }, { t: 'v', value: c }]),
    ], ctx.rng)
    return ask(ctx, L(
      `Which expression means: add ${n(a).en} and ${n(b).en}, then multiply by ${n(c).en}?`,
      `Welcher Term bedeutet: addiere ${n(a).de} und ${n(b).de}, dann multipliziere mit ${n(c).de}?`,
      `¿Cuál expresión significa: suma ${n(a).es} y ${n(b).es}, luego multiplica por ${n(c).es}?`,
    ), { type: 'choice', options: pack.options }, pack.answer, [
      L('The phrase “then” means the addition happens before the multiplication, so it needs parentheses.', 'Das Wort „dann“ heißt: die Addition geschieht vor der Multiplikation, also braucht sie Klammern.', 'La palabra “luego” dice que la suma ocurre antes de la multiplicación, así que necesita paréntesis.'),
      L('Without parentheses, multiplication would happen first.', 'Ohne Klammern geschähe die Multiplikation zuerst.', 'Sin paréntesis, la multiplicación ocurriría primero.'),
    ])
  }
  return ask(ctx, L('Evaluate the expression.', 'Werte den Term aus.', 'Evalúa la expresión.'), { type: 'number' }, { kind: 'number', value }, steps, expression(pieces))
}

export function g5oaB(ctx: Ctx) {
  const stepA = ctx.rng.int(2, Math.max(2, knobNum(ctx, 'max', 6)))
  const stepB = stepA * ctx.rng.int(2, 3)
  const term = ctx.rng.int(3, Math.max(3, knobNum(ctx, 'term', 6)))
  const a = stepA * term
  const b = stepB * term
  return ask(
    ctx,
    L(
      `Pattern A starts at 0 and adds ${n(stepA).en}. Pattern B starts at 0 and adds ${n(stepB).en}. When pattern A shows ${n(a).en}, what does pattern B show?`,
      `Muster A beginnt bei 0 und addiert ${n(stepA).de}. Muster B beginnt bei 0 und addiert ${n(stepB).de}. Wenn Muster A ${n(a).de} zeigt, was zeigt Muster B?`,
      `El patrón A empieza en 0 y suma ${n(stepA).es}. El patrón B empieza en 0 y suma ${n(stepB).es}. Cuando el patrón A muestra ${n(a).es}, ¿qué muestra el patrón B?`,
    ),
    { type: 'number' },
    { kind: 'number', value: b },
    [
      L(`${n(a).en} ÷ ${n(stepA).en} = ${n(term).en}, so this is term number ${n(term).en}.`, `${n(a).de} ÷ ${n(stepA).de} = ${n(term).de}, also ist es Glied Nummer ${n(term).de}.`, `${n(a).es} ÷ ${n(stepA).es} = ${n(term).es}, así que es el término número ${n(term).es}.`),
      L(`Pattern B at that term is ${n(term).en} × ${n(stepB).en} = ${n(b).en}.`, `Muster B an diesem Glied ist ${n(term).de} × ${n(stepB).de} = ${n(b).de}.`, `El patrón B en ese término es ${n(term).es} × ${n(stepB).es} = ${n(b).es}.`),
    ],
  )
}

export function g5nbtA(ctx: Ctx) {
  if (ctx.mode === 'compare') {
    // The decimal places come from the variable: 2 gives hundredths (1.25), 1 gives tenths (1.2).
    const places = Math.min(4, Math.max(1, knobNum(ctx, 'decimals', 2)))
    const scale = 10 ** places
    const a = roundTo(ctx.rng.int(scale, 10 * scale - 1) / scale, places)
    let b = roundTo(ctx.rng.int(scale, 10 * scale - 1) / scale, places)
    if (a === b) b = roundTo(a + 1 / scale, places)
    const sign = a < b ? '<' : a > b ? '>' : '='
    return ask(
      ctx,
      L('Which sign is true?', 'Welches Zeichen stimmt?', '¿Qué signo es cierto?'),
      { type: 'compare', left: n(a, places), right: n(b, places) },
      { kind: 'compare', sign },
      [
        L('Compare whole numbers, then tenths, then hundredths.', 'Vergleiche zuerst die Ganzen, dann die Zehntel, dann die Hundertstel.', 'Compara los enteros, luego los décimos y después los centésimos.'),
        L(`${n(a, places).en} ${sign} ${n(b, places).en}.`, `${n(a, places).de} ${sign} ${n(b, places).de}.`, `${n(a, places).es} ${sign} ${n(b, places).es}.`),
      ],
    )
  }
  if (ctx.mode === 'round') {
    const places = Math.min(4, Math.max(1, knobNum(ctx, 'decimals', 2)))
    const place = places === 1 || ctx.rng.chance(0.5) ? 1 : 0.1
    let raw = roundTo(ctx.rng.int(10 ** places, 10 ** (places + 2) - 1) / 10 ** places, places)
    if (place === 0.1) raw = avoidTie(Math.round(raw * 10), 1) / 10
    const rounded = place === 1 ? roundHalfUp(raw, 1) : roundHalfUp(Math.round(raw * 100), 10) / 100
    const name = place === 1 ? L('whole number', 'ganzen Zahl', 'número entero') : L('tenth', 'Zehntel', 'décimo')
    return ask(
      ctx,
      L(`Round ${n(raw, 2).en} to the nearest ${name.en}.`, `Runde ${n(raw, 2).de} auf ${name.de === 'Zehntel' ? 'das nächste Zehntel' : 'die nächste ganze Zahl'}.`, `Redondea ${n(raw, 2).es} al ${name.es} más cercano.`),
      { type: 'number', allowDecimal: true },
      { kind: 'number', value: rounded, tolerance: 0.001 },
      [
        L('Look one place to the right of the place you are rounding to.', 'Schau eine Stelle rechts von der Stelle, auf die du rundest.', 'Mira un lugar a la derecha del lugar al que redondeas.'),
        L(`${n(raw, 2).en} rounds to ${n(rounded, rounded % 1 === 0 ? 0 : 1).en}.`, `${n(raw, 2).de} wird zu ${n(rounded, rounded % 1 === 0 ? 0 : 1).de}.`, `${n(raw, 2).es} se redondea a ${n(rounded, rounded % 1 === 0 ? 0 : 1).es}.`),
      ],
    )
  }
  if (ctx.mode === 'expand') {
    const whole = ctx.rng.int(1, 9)
    const tenth = ctx.rng.int(1, 9)
    const hundredth = ctx.rng.int(0, 9)
    const value = roundTo(whole + tenth / 10 + hundredth / 100, 2)
    const correct = L(
      `${n(whole).en} + ${n(tenth).en} tenths + ${n(hundredth).en} hundredths`,
      `${n(whole).de} + ${n(tenth).de} Zehntel + ${n(hundredth).de} Hundertstel`,
      `${n(whole).es} + ${n(tenth).es} décimos + ${n(hundredth).es} centésimos`,
    )
    const pack = textChoice(correct, [
      L(`${n(whole).en} + ${n(tenth).en} hundredths + ${n(hundredth).en} tenths`, `${n(whole).de} + ${n(tenth).de} Hundertstel + ${n(hundredth).de} Zehntel`, `${n(whole).es} + ${n(tenth).es} centésimos + ${n(hundredth).es} décimos`),
      L(`${n(whole).en} × ${n(tenth).en} + ${n(hundredth).en}`, `${n(whole).de} × ${n(tenth).de} + ${n(hundredth).de}`, `${n(whole).es} × ${n(tenth).es} + ${n(hundredth).es}`),
      L(`${n(tenth).en} + ${n(whole).en} tenths`, `${n(tenth).de} + ${n(whole).de} Zehntel`, `${n(tenth).es} + ${n(whole).es} décimos`),
    ], ctx.rng)
    return ask(
      ctx,
      L(`Which is the expanded form of ${n(value, 2).en}?`, `Welche ist die erweiterte Form von ${n(value, 2).de}?`, `¿Cuál es la forma desarrollada de ${n(value, 2).es}?`),
      { type: 'choice', options: pack.options },
      pack.answer,
      [
        L('The first decimal place is tenths. The second is hundredths.', 'Die erste Dezimalstelle sind Zehntel. Die zweite sind Hundertstel.', 'El primer lugar decimal son décimos. El segundo son centésimos.'),
        L(`${n(value, 2).en} = ${n(whole).en} + ${frac(0, tenth, 10)} + ${frac(0, hundredth, 100)}.`, `${n(value, 2).de} = ${n(whole).de} + ${frac(0, tenth, 10)} + ${frac(0, hundredth, 100)}.`, `${n(value, 2).es} = ${n(whole).es} + ${frac(0, tenth, 10)} + ${frac(0, hundredth, 100)}.`),
      ],
    )
  }
  const base = roundTo(ctx.rng.int(12, 99) / 10, 1)
  const power = ctx.rng.int(1, 3) * (ctx.rng.chance(0.35) ? -1 : 1)
  const value = roundTo(base * 10 ** power, 6)
  return ask(
    ctx,
    L(
      `What is ${n(base, 1).en} × 10${power < 0 ? `^(${power})` : `^${power}`}? You may enter a decimal.`,
      `Wie viel ist ${n(base, 1).de} × 10${power < 0 ? `^(${power})` : `^${power}`}? Eine Dezimalzahl ist erlaubt.`,
      `¿Cuánto es ${n(base, 1).es} × 10${power < 0 ? `^(${power})` : `^${power}`}? Puedes escribir un decimal.`,
    ),
    { type: 'number', allowDecimal: true },
    { kind: 'number', value, tolerance: 0.0001 },
    [
      L(
        power >= 0 ? `A positive power of ten moves the decimal point ${n(power).en} places right.` : `A negative power of ten moves the decimal point ${n(Math.abs(power)).en} places left.`,
        power >= 0 ? `Eine positive Zehnerpotenz schiebt das Komma ${n(power).de} Stellen nach rechts.` : `Eine negative Zehnerpotenz schiebt das Komma ${n(Math.abs(power)).de} Stellen nach links.`,
        power >= 0 ? `Una potencia positiva de diez mueve el punto ${n(power).es} lugares a la derecha.` : `Una potencia negativa de diez mueve el punto ${n(Math.abs(power)).es} lugares a la izquierda.`,
      ),
      L(`The result is ${n(value, Math.max(0, 1 - power)).en}.`, `Das Ergebnis ist ${n(value, Math.max(0, 1 - power)).de}.`, `El resultado es ${n(value, Math.max(0, 1 - power)).es}.`),
    ],
    expression([{ t: 'v', value: base, digits: 1 }, { t: 'op', v: '×' }, { t: 'op', v: power < 0 ? `10^(${power})` : `10^${power}` }]),
  )
}

export function g5nbtB(ctx: Ctx) {
  if (ctx.mode === 'head') return mentalWhole(ctx)
  if (ctx.mode === 'mul' || ctx.mode === 'div') {
    return g4nbtB({ ...ctx, mode: ctx.mode, knobs: { ...ctx.knobs, digits: knobNum(ctx, 'digits', 3), remain: false } })
  }
  if (ctx.mode === 'muldec' || ctx.mode === 'divdec') {
    const places = Math.min(3, Math.max(1, knobNum(ctx, 'places', 2)))
    const aT = ctx.rng.int(2, 12)
    const bT = ctx.rng.int(2, 9)
    const left = places === 3 ? aT / 100 : aT / 10
    const right = places === 1 ? bT : bT / 10
    if (ctx.mode === 'divdec') {
      const quotient = left
      const divisor = right
      const dividend = roundTo(quotient * divisor, 4)
      const qDigits = places === 3 ? 2 : 1
      const dDigits = places === 1 ? 0 : 1
      return ask(
        ctx,
        L('Find the quotient.', 'Bestimme den Quotienten.', 'Halla el cociente.'),
        { type: 'number', allowDecimal: true },
        { kind: 'number', value: quotient, tolerance: 0.001 },
        [
          L('Multiply the divisor and the quotient to check the dividend.', 'Multipliziere Divisor und Quotient, um den Dividenden zu prüfen.', 'Multiplica el divisor y el cociente para comprobar el dividendo.'),
          L(`${n(dividend, qDigits + dDigits).en} ÷ ${n(divisor, dDigits).en} = ${n(quotient, qDigits).en}.`, `${n(dividend, qDigits + dDigits).de} ÷ ${n(divisor, dDigits).de} = ${n(quotient, qDigits).de}.`, `${n(dividend, qDigits + dDigits).es} ÷ ${n(divisor, dDigits).es} = ${n(quotient, qDigits).es}.`),
        ],
        expression([{ t: 'v', value: dividend, digits: qDigits + dDigits }, { t: 'op', v: '÷' }, { t: 'v', value: divisor, digits: dDigits }]),
      )
    }
    const product = roundTo(left * right, 4)
    const leftDigits = places === 3 ? 2 : 1
    const rightDigits = places === 1 ? 0 : 1
    return ask(
      ctx,
      L('Find the product.', 'Bestimme das Produkt.', 'Halla el producto.'),
      { type: 'number', allowDecimal: true },
      { kind: 'number', value: product, tolerance: 0.001 },
      [
        L('Multiply as whole numbers, then give the product as many decimal places as both factors have together.', 'Multipliziere wie ganze Zahlen und gib dem Produkt so viele Dezimalstellen, wie beide Faktoren zusammen haben.', 'Multiplica como enteros y dale al producto tantos decimales como tienen los factores juntos.'),
        L(`${n(left, leftDigits).en} × ${n(right, rightDigits).en} = ${n(product, leftDigits + rightDigits).en}.`, `${n(left, leftDigits).de} × ${n(right, rightDigits).de} = ${n(product, leftDigits + rightDigits).de}.`, `${n(left, leftDigits).es} × ${n(right, rightDigits).es} = ${n(product, leftDigits + rightDigits).es}.`),
      ],
      expression([{ t: 'v', value: left, digits: leftDigits }, { t: 'op', v: '×' }, { t: 'v', value: right, digits: rightDigits }]),
    )
  }
  const places = Math.min(3, Math.max(1, knobNum(ctx, 'places', 2)))
  const scale = 10 ** places
  let a = roundTo(ctx.rng.int(scale, 40 * scale) / scale, places)
  let b = roundTo(ctx.rng.int(scale, 25 * scale) / scale, places)
  if (a === b) b = roundTo(a + 1 / scale, places)
  const left = ctx.mode === 'subdec' ? Math.max(a, b) : a
  const right = ctx.mode === 'subdec' ? Math.min(a, b) : b
  const value = ctx.mode === 'subdec' ? roundTo(left - right, places) : roundTo(left + right, places)
  return ask(
    ctx,
    L(ctx.mode === 'subdec' ? 'Find the difference.' : 'Find the sum.', ctx.mode === 'subdec' ? 'Bestimme die Differenz.' : 'Bestimme die Summe.', ctx.mode === 'subdec' ? 'Halla la diferencia.' : 'Halla la suma.'),
    { type: 'number', allowDecimal: true },
    { kind: 'number', value, tolerance: 0.001 },
    [
      L('Line up the decimal points, then work from the smallest place.', 'Richte die Dezimalzeichen aus und rechne von der kleinsten Stelle aus.', 'Alinea los puntos decimales y opera desde el lugar menor.'),
      L(`${n(left, places).en} ${ctx.mode === 'subdec' ? '−' : '+'} ${n(right, places).en} = ${n(value, places).en}.`, `${n(left, places).de} ${ctx.mode === 'subdec' ? '−' : '+'} ${n(right, places).de} = ${n(value, places).de}.`, `${n(left, places).es} ${ctx.mode === 'subdec' ? '−' : '+'} ${n(right, places).es} = ${n(value, places).es}.`),
    ],
    expression([{ t: 'v', value: left, digits: places }, { t: 'op', v: ctx.mode === 'subdec' ? '−' : '+' }, { t: 'v', value: right, digits: places }]),
  )
}

function mentalWhole(ctx: Ctx) {
  const digits = Math.min(6, Math.max(2, knobNum(ctx, 'digits', 3)))
  const op = ctx.rng.pick(['add', 'sub', 'mul', 'div'] as const)
  const lo = 10 ** (digits - 1)
  const hi = 10 ** digits - 1
  const prompt = L('Work this out in your head.', 'Rechne das im Kopf.', 'Calcúlalo mentalmente.')
  if (op === 'mul') {
    const a = ctx.rng.int(lo, hi)
    const b = ctx.rng.int(2, 12)
    return ask(ctx, prompt, { type: 'number' }, { kind: 'number', value: a * b }, [
      L(`Multiply ${n(a).en} by ${n(b).en}.`, `Multipliziere ${n(a).de} mit ${n(b).de}.`, `Multiplica ${n(a).es} por ${n(b).es}.`),
      L(`${n(a).en} × ${n(b).en} = ${n(a * b).en}.`, `${n(a).de} × ${n(b).de} = ${n(a * b).de}.`, `${n(a).es} × ${n(b).es} = ${n(a * b).es}.`),
    ], expression([{ t: 'v', value: a }, { t: 'op', v: '×' }, { t: 'v', value: b }]))
  }
  if (op === 'div') {
    const divisor = ctx.rng.int(2, 12)
    const quotient = ctx.rng.int(lo, Math.max(lo, Math.floor(hi / divisor)))
    const dividend = quotient * divisor
    return ask(ctx, prompt, { type: 'number' }, { kind: 'number', value: quotient }, [
      L(`How many groups of ${n(divisor).en} are in ${n(dividend).en}?`, `Wie viele Gruppen zu ${n(divisor).de} stecken in ${n(dividend).de}?`, `¿Cuántos grupos de ${n(divisor).es} hay en ${n(dividend).es}?`),
      L(`${n(dividend).en} ÷ ${n(divisor).en} = ${n(quotient).en}.`, `${n(dividend).de} ÷ ${n(divisor).de} = ${n(quotient).de}.`, `${n(dividend).es} ÷ ${n(divisor).es} = ${n(quotient).es}.`),
    ], expression([{ t: 'v', value: dividend }, { t: 'op', v: '÷' }, { t: 'v', value: divisor }]))
  }
  const otherDigits = ctx.rng.chance(0.45) ? Math.max(2, digits - 1) : digits
  const a = ctx.rng.int(lo, hi)
  const bLo = 10 ** (otherDigits - 1)
  const bHi = 10 ** otherDigits - 1
  let b = ctx.rng.int(bLo, bHi)
  let big = a
  if (op === 'sub') {
    big = Math.max(a, b)
    const smallHi = Math.max(1, big - 1)
    b = ctx.rng.int(Math.min(bLo, smallHi), smallHi)
  }
  const value = op === 'sub' ? big - b : a + b
  return ask(ctx, prompt, { type: 'number' }, { kind: 'number', value }, [
    L('Line the places up and work from the ones.', 'Richte die Stellen aus und arbeite von den Einern.', 'Alinea los lugares y trabaja desde las unidades.'),
    L(`${n(op === 'sub' ? big : a).en} ${op === 'sub' ? '−' : '+'} ${n(b).en} = ${n(value).en}.`, `${n(op === 'sub' ? big : a).de} ${op === 'sub' ? '−' : '+'} ${n(b).de} = ${n(value).de}.`, `${n(op === 'sub' ? big : a).es} ${op === 'sub' ? '−' : '+'} ${n(b).es} = ${n(value).es}.`),
  ], expression([{ t: 'v', value: op === 'sub' ? big : a }, { t: 'op', v: op === 'sub' ? '−' : '+' }, { t: 'v', value: b }]))
}

export function g5nfA(ctx: Ctx) {
  const den = knobNum(ctx, 'den', 8)
  const pool = densUpTo(den)
  const d1 = ctx.rng.pick(pool)
  const rest = pool.filter((d) => d !== d1)
  const d2 = ctx.rng.pick(rest.length ? rest : pool)
  const n1 = ctx.rng.int(1, d1 - 1)
  const n2 = ctx.rng.int(1, d2 - 1)
  const common = (d1 * d2) / gcdSafe(d1, d2)
  const a = n1 * (common / d1)
  const b = n2 * (common / d2)
  if (ctx.mode === 'mixed') {
    const whole = ctx.rng.int(1, 3)
    const total = (whole * d1 + n1) * (common / d1) + b
    return fractionQuestion(ctx, total, common, L(
      `What is ${frac(whole, n1, d1)} + ${frac(0, n2, d2)}?`,
      `Wie viel ist ${frac(whole, n1, d1)} + ${frac(0, n2, d2)}?`,
      `¿Cuánto es ${frac(whole, n1, d1)} + ${frac(0, n2, d2)}?`,
    ), [
      L(`A common denominator is ${n(common).en}.`, `Ein gemeinsamer Nenner ist ${n(common).de}.`, `Un denominador común es ${n(common).es}.`),
      L(`Rewrite each fraction, add, then simplify if needed.`, `Schreibe jeden Bruch um, addiere und kürze wenn nötig.`, `Reescribe cada fracción, suma y simplifica si hace falta.`),
    ])
  }
  if (ctx.mode === 'sub') {
    const left = Math.max(a, b)
    const right = Math.min(a, b)
    const ln = left === a ? n1 : n2
    const ld = left === a ? d1 : d2
    const rn = left === a ? n2 : n1
    const rd = left === a ? d2 : d1
    return fractionQuestion(ctx, left - right, common, L(
      `What is ${frac(0, ln, ld)} − ${frac(0, rn, rd)}?`,
      `Wie viel ist ${frac(0, ln, ld)} − ${frac(0, rn, rd)}?`,
      `¿Cuánto es ${frac(0, ln, ld)} − ${frac(0, rn, rd)}?`,
    ), [
      L(`Common denominator: ${n(common).en}. The rewritten numerators are ${n(left).en} and ${n(right).en}.`, `Gemeinsamer Nenner: ${n(common).de}. Die neuen Zähler sind ${n(left).de} und ${n(right).de}.`, `Denominador común: ${n(common).es}. Los numeradores nuevos son ${n(left).es} y ${n(right).es}.`),
      L(`${n(left).en} − ${n(right).en} = ${n(left - right).en}, over ${n(common).en}.`, `${n(left).de} − ${n(right).de} = ${n(left - right).de}, über ${n(common).de}.`, `${n(left).es} − ${n(right).es} = ${n(left - right).es}, sobre ${n(common).es}.`),
    ])
  }
  return fractionQuestion(ctx, a + b, common, L(
    `What is ${frac(0, n1, d1)} + ${frac(0, n2, d2)}?`,
    `Wie viel ist ${frac(0, n1, d1)} + ${frac(0, n2, d2)}?`,
    `¿Cuánto es ${frac(0, n1, d1)} + ${frac(0, n2, d2)}?`,
  ), [
    L(`The least common denominator of ${n(d1).en} and ${n(d2).en} is ${n(common).en}.`, `Der kleinste gemeinsame Nenner von ${n(d1).de} und ${n(d2).de} ist ${n(common).de}.`, `El mínimo común denominador de ${n(d1).es} y ${n(d2).es} es ${n(common).es}.`),
    L(`${frac(0, a, common)} + ${frac(0, b, common)} = ${frac(0, a + b, common)}.`, `${frac(0, a, common)} + ${frac(0, b, common)} = ${frac(0, a + b, common)}.`, `${frac(0, a, common)} + ${frac(0, b, common)} = ${frac(0, a + b, common)}.`),
  ])
}

function gcdSafe(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

export function g5nfB(ctx: Ctx) {
  // The largest denominator the variable allows. Every mode keeps its denominators at or under this value.
  const cap = knobNum(ctx, 'den', 8)
  if (ctx.mode === 'divwhole' || ctx.mode === 'divunit') {
    if (ctx.mode === 'divwhole') {
      const whole = ctx.rng.int(2, 6)
      const den = ctx.rng.pick(densUpTo(cap))
      return fractionQuestion(ctx, whole * den, 1, L(
        `What is ${n(whole).en} ÷ ${frac(0, 1, den)}?`,
        `Wie viel ist ${n(whole).de} ÷ ${frac(0, 1, den)}?`,
        `¿Cuánto es ${n(whole).es} ÷ ${frac(0, 1, den)}?`,
      ), [
        L(`Dividing by ${frac(0, 1, den)} asks how many ${frac(0, 1, den)} fit in the whole number.`, `Geteilt durch ${frac(0, 1, den)} fragt, wie viele ${frac(0, 1, den)} in die ganze Zahl passen.`, `Dividir entre ${frac(0, 1, den)} pregunta cuántos ${frac(0, 1, den)} caben en el entero.`),
        L(`${n(whole).en} × ${n(den).en} = ${n(whole * den).en}.`, `${n(whole).de} × ${n(den).de} = ${n(whole * den).de}.`, `${n(whole).es} × ${n(den).es} = ${n(whole * den).es}.`),
      ])
    }
    const a = ctx.rng.pick([2, 3, 4])
    const b = ctx.rng.pick(densUpTo(cap))
    return fractionQuestion(ctx, b, a, L(
      `What is ${frac(0, 1, a)} ÷ ${frac(0, 1, b)}?`,
      `Wie viel ist ${frac(0, 1, a)} ÷ ${frac(0, 1, b)}?`,
      `¿Cuánto es ${frac(0, 1, a)} ÷ ${frac(0, 1, b)}?`,
    ), [
      L('Dividing by a fraction means multiplying by its reciprocal.', 'Durch einen Bruch teilen heißt mit seinem Kehrwert malnehmen.', 'Dividir entre una fracción es multiplicar por su recíproco.'),
      L(`${frac(0, 1, a)} × ${frac(0, b, 1)} = ${frac(0, b, a)}.`, `${frac(0, 1, a)} × ${frac(0, b, 1)} = ${frac(0, b, a)}.`, `${frac(0, 1, a)} × ${frac(0, b, 1)} = ${frac(0, b, a)}.`),
    ])
  }
  if (ctx.mode === 'mulwhole') {
    const whole = ctx.rng.int(8, 36)
    const den = ctx.rng.pick(densUpTo(cap))
    const numer = ctx.rng.int(1, den - 1)
    return fractionQuestion(ctx, whole * numer, den, L(
      `What is ${frac(0, numer, den)} of ${n(whole).en}?`,
      `Wie viel ist ${frac(0, numer, den)} von ${n(whole).de}?`,
      `¿Cuánto es ${frac(0, numer, den)} de ${n(whole).es}?`,
    ), [
      L(`Divide ${n(whole).en} into ${n(den).en} equal parts, then take ${n(numer).en} of them.`, `Teile ${n(whole).de} in ${n(den).de} gleiche Teile und nimm ${n(numer).de} davon.`, `Divide ${n(whole).es} en ${n(den).es} partes iguales y toma ${n(numer).es} de ellas.`),
      L(`${n(whole).en} × ${frac(0, numer, den)} = ${frac(0, whole * numer, den)}.`, `${n(whole).de} × ${frac(0, numer, den)} = ${frac(0, whole * numer, den)}.`, `${n(whole).es} × ${frac(0, numer, den)} = ${frac(0, whole * numer, den)}.`),
    ])
  }
  const n1 = ctx.rng.int(1, 5)
  const d1 = ctx.rng.int(n1 + 1, cap)
  const n2 = ctx.rng.int(1, 5)
  const d2 = ctx.rng.int(n2 + 1, cap)
  return fractionQuestion(ctx, n1 * n2, d1 * d2, L(
    `What is ${frac(0, n1, d1)} × ${frac(0, n2, d2)}?`,
    `Wie viel ist ${frac(0, n1, d1)} × ${frac(0, n2, d2)}?`,
    `¿Cuánto es ${frac(0, n1, d1)} × ${frac(0, n2, d2)}?`,
  ), [
    L('Multiply the numerators. Multiply the denominators.', 'Multipliziere die Zähler. Multipliziere die Nenner.', 'Multiplica los numeradores. Multiplica los denominadores.'),
    L(`${frac(0, n1, d1)} × ${frac(0, n2, d2)} = ${frac(0, n1 * n2, d1 * d2)}.`, `${frac(0, n1, d1)} × ${frac(0, n2, d2)} = ${frac(0, n1 * n2, d1 * d2)}.`, `${frac(0, n1, d1)} × ${frac(0, n2, d2)} = ${frac(0, n1 * n2, d1 * d2)}.`),
  ])
}

export function g5mdA(ctx: Ctx) {
  if (ctx.mode === 'compound') {
    const meters = ctx.rng.int(1, Math.max(1, knobNum(ctx, 'max', 6)))
    const cm = ctx.rng.int(5, 90)
    return ask(
      ctx,
      L(`How many centimeters are in ${n(meters).en} m ${n(cm).en} cm?`, `Wie viele Zentimeter sind ${n(meters).de} m ${n(cm).de} cm?`, `¿Cuántos centímetros hay en ${n(meters).es} m ${n(cm).es} cm?`),
      { type: 'number' },
      { kind: 'number', value: meters * 100 + cm },
      [
        L(`One meter is 100 centimeters, so ${n(meters).en} m = ${n(meters * 100).en} cm.`, `Ein Meter sind 100 Zentimeter, also sind ${n(meters).de} m = ${n(meters * 100).de} cm.`, `Un metro son 100 centímetros, así que ${n(meters).es} m = ${n(meters * 100).es} cm.`),
        L(`${n(meters * 100).en} + ${n(cm).en} = ${n(meters * 100 + cm).en}.`, `${n(meters * 100).de} + ${n(cm).de} = ${n(meters * 100 + cm).de}.`, `${n(meters * 100).es} + ${n(cm).es} = ${n(meters * 100 + cm).es}.`),
      ],
    )
  }
  return g4mdA({ ...ctx, mode: 'metric' })
}

export function g5mdB(ctx: Ctx) {
  const labels = ['1/8', '1/4', '1/2', '3/4', '1']
  const counts = labels.map(() => ctx.rng.int(1, Math.max(2, knobNum(ctx, 'qty', 4))))
  const values = [0.125, 0.25, 0.5, 0.75, 1]
  if (ctx.mode === 'greater') {
    const threshold = 0.5
    const total = counts.reduce((sum, count, index) => sum + (values[index] > threshold ? count : 0), 0)
    return ask(
      ctx,
      L('How many measurements are longer than 1/2?', 'Wie viele Messungen sind länger als 1/2?', '¿Cuántas medidas son más largas que 1/2?'),
      { type: 'number' },
      { kind: 'number', value: total },
      [
        L('1/2 itself is not longer than 1/2. Count only the marks to its right.', '1/2 selbst ist nicht länger als 1/2. Zähle nur die Marken rechts davon.', '1/2 mismo no es más largo que 1/2. Cuenta solo las marcas a su derecha.'),
        L(`That count is ${n(total).en}.`, `Diese Anzahl ist ${n(total).de}.`, `Esa cantidad es ${n(total).es}.`),
      ],
      { type: 'dots', labels, counts },
    )
  }
  const index = ctx.rng.int(0, labels.length - 1)
  return ask(
    ctx,
    L(`How many measurements are at ${labels[index]}?`, `Wie viele Messungen liegen bei ${labels[index]}?`, `¿Cuántas medidas hay en ${labels[index]}?`),
    { type: 'number' },
    { kind: 'number', value: counts[index] },
    [
      L('Count the dots above that fraction.', 'Zähle die Punkte über diesem Bruch.', 'Cuenta los puntos sobre esa fracción.'),
      L(`There are ${n(counts[index]).en}.`, `Es sind ${n(counts[index]).de}.`, `Hay ${n(counts[index]).es}.`),
    ],
    { type: 'dots', labels, counts },
  )
}

export function g5mdC(ctx: Ctx) {
  const top = knobNum(ctx, 'max', 8)
  const l = ctx.rng.int(2, Math.max(2, top))
  const w = ctx.rng.int(2, Math.max(2, top - 1))
  const h = ctx.rng.int(2, Math.max(2, top - 2))
  if (ctx.mode === 'layers') {
    return ask(
      ctx,
      L(`A prism is ${n(l).en} by ${n(w).en} by ${n(h).en} unit cubes. How many cubes fill it?`, `Ein Quader ist ${n(l).de} mal ${n(w).de} mal ${n(h).de} Einheitswürfel. Wie viele Würfel füllen ihn?`, `Un prisma mide ${n(l).es} por ${n(w).es} por ${n(h).es} cubos unitarios. ¿Cuántos cubos lo llenan?`),
      { type: 'number' },
      { kind: 'number', value: l * w * h },
      [
        L(`One layer holds ${n(l).en} × ${n(w).en} = ${n(l * w).en} cubes.`, `Eine Schicht hält ${n(l).de} × ${n(w).de} = ${n(l * w).de} Würfel.`, `Una capa contiene ${n(l).es} × ${n(w).es} = ${n(l * w).es} cubos.`),
        L(`${n(h).en} layers make ${n(l * w * h).en} cubes.`, `${n(h).de} Schichten ergeben ${n(l * w * h).de} Würfel.`, `${n(h).es} capas hacen ${n(l * w * h).es} cubos.`),
      ],
      { type: 'prism', l, w, h },
    )
  }
  if (ctx.mode === 'missing') {
    return ask(
      ctx,
      L(`The volume is ${n(l * w * h).en} cubic units. The base is ${n(l).en} by ${n(w).en}. What is the height?`, `Das Volumen ist ${n(l * w * h).de} Kubikeinheiten. Die Grundfläche ist ${n(l).de} mal ${n(w).de}. Wie hoch ist der Körper?`, `El volumen es ${n(l * w * h).es} unidades cúbicas. La base mide ${n(l).es} por ${n(w).es}. ¿Cuál es la altura?`),
      { type: 'number' },
      { kind: 'number', value: h },
      [
        L(`The base area is ${n(l * w).en}. Height = volume ÷ base area.`, `Die Grundfläche ist ${n(l * w).de}. Höhe = Volumen ÷ Grundfläche.`, `El área de la base es ${n(l * w).es}. Altura = volumen ÷ área de la base.`),
        L(`${n(l * w * h).en} ÷ ${n(l * w).en} = ${n(h).en}.`, `${n(l * w * h).de} ÷ ${n(l * w).de} = ${n(h).de}.`, `${n(l * w * h).es} ÷ ${n(l * w).es} = ${n(h).es}.`),
      ],
      { type: 'prism', l, w, h },
    )
  }
  return ask(
    ctx,
    L('What is the volume in cubic units?', 'Wie groß ist das Volumen in Kubikeinheiten?', '¿Cuál es el volumen en unidades cúbicas?'),
    { type: 'number' },
    { kind: 'number', value: l * w * h },
    [
      L('Volume of a rectangular prism is length × width × height.', 'Das Volumen eines Quaders ist Länge × Breite × Höhe.', 'El volumen de un prisma rectangular es largo × ancho × alto.'),
      L(`${n(l).en} × ${n(w).en} × ${n(h).en} = ${n(l * w * h).en}.`, `${n(l).de} × ${n(w).de} × ${n(h).de} = ${n(l * w * h).de}.`, `${n(l).es} × ${n(w).es} × ${n(h).es} = ${n(l * w * h).es}.`),
    ],
    { type: 'prism', l, w, h },
  )
}

export function g5gA(ctx: Ctx) {
  // The first quadrant by default. The quadrants toggle opens negative coordinates on every axis.
  const top = knobNum(ctx, 'max', 8)
  const four = knobBool(ctx, 'quadrants', false)
  const low = four ? -top : 0
  const grid = { xMin: low, xMax: top, yMin: low, yMax: top }
  const x = ctx.rng.int(low, top)
  const y = ctx.rng.int(low, top)
  if (ctx.mode === 'read') {
    return ask(
      ctx,
      L('What are the coordinates of the marked point? Enter x, then y.', 'Welche Koordinaten hat der markierte Punkt? Erst x, dann y.', '¿Cuáles son las coordenadas del punto marcado? Primero x, luego y.'),
      {
        type: 'multi',
        fields: [
          { id: 'x', label: L('x', 'x', 'x'), allowNegative: four },
          { id: 'y', label: L('y', 'y', 'y'), allowNegative: four },
        ],
      },
      { kind: 'multi', parts: { x, y } },
      [
        L('Move along the x-axis first, then up to the point.', 'Gehe zuerst entlang der x-Achse, dann nach oben zum Punkt.', 'Muévete primero por el eje x y luego sube hasta el punto.'),
        L(`The point is (${n(x).en}, ${n(y).en}).`, `Der Punkt ist (${n(x).de}, ${n(y).de}).`, `El punto es (${n(x).es}, ${n(y).es}).`),
      ],
      { type: 'coord', ...grid, points: [{ x, y }] },
    )
  }
  if (ctx.mode === 'distance') {
    const y2 = ctx.rng.int(low, top)
    const dist = Math.abs(y2 - y)
    return ask(
      ctx,
      L(
        `The library is at (${n(x).en}, ${n(y).en}) and the bakery is at (${n(x).en}, ${n(y2).en}). How many units apart are they?`,
        `Die Bibliothek liegt bei (${n(x).de}, ${n(y).de}) und die Bäckerei bei (${n(x).de}, ${n(y2).de}). Wie viele Einheiten liegen sie auseinander?`,
        `La biblioteca está en (${n(x).es}, ${n(y).es}) y la panadería en (${n(x).es}, ${n(y2).es}). ¿Cuántas unidades las separan?`,
      ),
      { type: 'number' },
      { kind: 'number', value: dist },
      [
        L('The x-coordinates match, so the distance is the difference of the y-coordinates.', 'Die x-Koordinaten stimmen überein, also ist der Abstand die Differenz der y-Koordinaten.', 'Las coordenadas x coinciden, así que la distancia es la diferencia de las coordenadas y.'),
        L(`|${n(y).en} − ${n(y2).en}| = ${n(dist).en}.`, `|${n(y).de} − ${n(y2).de}| = ${n(dist).de}.`, `|${n(y).es} − ${n(y2).es}| = ${n(dist).es}.`),
      ],
      { type: 'coord', ...grid, points: [{ x, y }, { x, y: y2 }] },
    )
  }
  return ask(
    ctx,
    L(`Plot the point (${n(x).en}, ${n(y).en}).`, `Setze den Punkt (${n(x).de}, ${n(y).de}).`, `Marca el punto (${n(x).es}, ${n(y).es}).`),
    { type: 'coordinate', ...grid },
    { kind: 'points', points: [{ x, y }] },
    [
      L('Start at the origin. Move x units to the right, then y units up.', 'Beginne im Ursprung. Gehe x Einheiten nach rechts, dann y Einheiten nach oben.', 'Empieza en el origen. Muévete x unidades a la derecha y luego y unidades hacia arriba.'),
      L(`You land at (${n(x).en}, ${n(y).en}).`, `Du landest bei (${n(x).de}, ${n(y).de}).`, `Llegas a (${n(x).es}, ${n(y).es}).`),
    ],
  )
}

export function g5gB(ctx: Ctx) {
  const sides = Math.min(6, Math.max(3, knobNum(ctx, 'sides', 4)))
  const right = knobBool(ctx, 'twist', false)
  const shape = sides <= 3 ? 'triangle' as const : sides === 5 ? 'pentagon' as const : sides >= 6 ? 'hexagon' as const : right ? 'rectangle' as const : 'rhombus' as const
  const actual = shape === 'triangle' ? 3 : shape === 'pentagon' ? 5 : shape === 'hexagon' ? 6 : 4
  const name = shape === 'triangle' ? L('triangle', 'Dreieck', 'triángulo') : shape === 'pentagon' ? L('pentagon', 'Fünfeck', 'pentágono') : shape === 'hexagon' ? L('hexagon', 'Sechseck', 'hexágono') : shape === 'rectangle' ? L('rectangle', 'Rechteck', 'rectángulo') : L('rhombus', 'Raute', 'rombo')
  if (ctx.mode === 'figure') {
    const pack = textChoice(
      name,
      [
        L('scalene triangle', 'ungleichseitiges Dreieck', 'triángulo escaleno'),
        L('pentagon', 'Fünfeck', 'pentágono'),
        L('hexagon', 'Sechseck', 'hexágono'),
        L('A figure with only one pair of parallel sides', 'Eine Figur mit nur einem parallelen Paar', 'Una figura con un solo par de lados paralelos'),
      ].filter((item) => item.en !== name.en).slice(0, Math.max(2, Math.min(3, knobNum(ctx, 'qty', 2)))),
      ctx.rng,
    )
    const prompt = actual === 4 && right
      ? L('Which figure has 4 sides and 4 right angles?', 'Welche Figur hat 4 Seiten und 4 rechte Winkel?', '¿Cuál figura tiene 4 lados y 4 ángulos rectos?')
      : actual === 4
        ? L('Which figure has 4 equal sides and is not required to have right angles?', 'Welche Figur hat 4 gleiche Seiten und muss keine rechten Winkel haben?', '¿Cuál figura tiene 4 lados iguales y no exige ángulos rectos?')
        : L(`Which figure has ${n(actual).en} sides?`, `Welche Figur hat ${n(actual).de} Seiten?`, `¿Cuál figura tiene ${n(actual).es} lados?`)
    return ask(ctx, prompt, { type: 'choice', options: pack.options }, pack.answer, [
      L(`Count the sides. This figure has ${n(actual).en}.`, `Zähle die Seiten. Diese Figur hat ${n(actual).de}.`, `Cuenta los lados. Esta figura tiene ${n(actual).es}.`),
      L(`The name that fits is ${name.en}.`, `Der passende Name ist ${name.de}.`, `El nombre que encaja es ${name.es}.`),
    ], { type: 'shape', shape })
  }
  const copies = Math.max(1, knobNum(ctx, 'qty', 2))
  const pack = textChoice(
    L(`A ${name.en} has ${n(actual).en} sides.`, `Ein ${name.de} hat ${n(actual).de} Seiten.`, `Un ${name.es} tiene ${n(actual).es} lados.`),
    [
      L(`A ${name.en} has ${n(actual + copies).en} sides.`, `Ein ${name.de} hat ${n(actual + copies).de} Seiten.`, `Un ${name.es} tiene ${n(actual + copies).es} lados.`),
      L('A triangle can have two right angles.', 'Ein Dreieck kann zwei rechte Winkel haben.', 'Un triángulo puede tener dos ángulos rectos.'),
      L('Every rectangle is a triangle.', 'Jedes Rechteck ist ein Dreieck.', 'Todo rectángulo es un triángulo.'),
    ].slice(0, Math.max(2, Math.min(3, copies))),
    ctx.rng,
  )
  return ask(
    ctx,
    L('Which statement is true?', 'Welcher Satz stimmt?', '¿Cuál afirmación es cierta?'),
    { type: 'choice', options: pack.options },
    pack.answer,
    [
      L(`A ${name.en} has ${n(actual).en} sides.`, `Ein ${name.de} hat ${n(actual).de} Seiten.`, `Un ${name.es} tiene ${n(actual).es} lados.`),
      L('The other sentences add extra sides or mix the categories.', 'Die anderen Sätze fügen Seiten hinzu oder vermischen die Kategorien.', 'Las otras oraciones agregan lados o mezclan las categorías.'),
    ],
  )
}

function groupPiece(count: number, one: Localized, many: Localized): Localized | null {
  if (count <= 0) return null
  const word = count === 1 ? one : many
  return L(`${n(count).en} ${word.en}`, `${n(count).de} ${word.de}`, `${n(count).es} ${word.es}`)
}

export function groupedWords(value: number): Localized {
  const abs = Math.abs(Math.trunc(value))
  const trillions = Math.floor(abs / 1_000_000_000_000)
  const billions = Math.floor(abs / 1_000_000_000) % 1000
  const millions = Math.floor(abs / 1_000_000) % 1000
  const thousands = Math.floor(abs / 1000) % 1000
  const rest = abs % 1000
  const parts = [
    groupPiece(trillions, L('trillion', 'Billion', 'billón'), L('trillion', 'Billionen', 'billones')),
    groupPiece(billions, L('billion', 'Milliarde', 'mil millones'), L('billion', 'Milliarden', 'mil millones')),
    groupPiece(millions, L('million', 'Million', 'millón'), L('million', 'Millionen', 'millones')),
    groupPiece(thousands, L('thousand', 'Tausend', 'mil'), L('thousand', 'Tausend', 'mil')),
    rest > 0 ? n(rest) : null,
  ].filter((part): part is Localized => part != null)
  if (!parts.length) return n(0)
  return L(parts.map((part) => part.en).join(' '), parts.map((part) => part.de).join(' '), parts.map((part) => part.es).join(' '))
}

function largeDigits(ctx: Ctx) {
  return Math.min(15, Math.max(3, knobNum(ctx, 'digits', 6)))
}

function wholeOf(ctx: Ctx, digits: number) {
  const width = Math.min(15, Math.max(1, digits))
  const lo = width <= 1 ? 0 : 10 ** (width - 1)
  const hi = 10 ** width - 1
  return Math.min(hi, Math.max(lo, ctx.rng.int(lo, Math.max(lo, hi))))
}

export function g5nbtC(ctx: Ctx) {
  const digits = largeDigits(ctx)
  if (ctx.mode === 'neighbor') {
    let value = wholeOf(ctx, digits)
    if (ctx.rng.chance(0.6)) {
      const power = 10 ** ctx.rng.int(1, Math.max(1, digits - 1))
      value = ctx.rng.chance(0.5) ? power : Math.max(1, power - 1)
    }
    return ask(
      ctx,
      L(`Write the predecessor and the successor of ${n(value).en}.`, `Schreibe Vorgänger und Nachfolger von ${n(value).de}.`, `Escribe el anterior y el siguiente de ${n(value).es}.`),
      {
        type: 'multi',
        fields: [
          { id: 'before', label: L('Predecessor', 'Vorgänger', 'Anterior') },
          { id: 'after', label: L('Successor', 'Nachfolger', 'Siguiente') },
        ],
      },
      { kind: 'multi', parts: { before: value - 1, after: value + 1 } },
      [
        L('The predecessor is one less. The successor is one more.', 'Der Vorgänger ist eins weniger. Der Nachfolger ist eins mehr.', 'El anterior es uno menos. El siguiente es uno más.'),
        L(`${n(value - 1).en} comes just before ${n(value).en}, and ${n(value + 1).en} comes just after.`, `${n(value - 1).de} steht direkt vor ${n(value).de}, und ${n(value + 1).de} direkt danach.`, `${n(value - 1).es} va justo antes de ${n(value).es}, y ${n(value + 1).es} justo después.`),
      ],
    )
  }
  if (ctx.mode === 'compare') {
    const value = wholeOf(ctx, digits)
    const useWords = knobFlag(ctx, 'words')
    let other = value
    if (!useWords || ctx.rng.chance(0.65)) {
      const delta = ctx.rng.pick([1, -1, 10, -10, 100, -100, 1000, -1000, 1_000_000, -1_000_000])
      other = value + delta
      if (other < 0) other = value + Math.abs(delta)
    }
    if (!useWords && other === value) other = value + ctx.rng.pick([1, 10, 1000])
    const wordsOnLeft = useWords && ctx.rng.chance(0.5)
    const left = wordsOnLeft ? groupedWords(value) : n(value)
    const right = wordsOnLeft ? n(other) : useWords ? groupedWords(other) : n(other)
    const sign = value < other ? '<' : value > other ? '>' : '='
    return ask(
      ctx,
      L('Which sign is true?', 'Welches Zeichen stimmt?', '¿Qué signo es cierto?'),
      { type: 'compare', left, right },
      { kind: 'compare', sign },
      [
        L('Turn a number written in words into digits, then compare from the largest place.', 'Wandle eine Zahl in Worten in Ziffern um und vergleiche von der größten Stelle aus.', 'Convierte un número en palabras a cifras y compara desde el lugar mayor.'),
        L(`${n(value).en} ${sign} ${n(other).en}.`, `${n(value).de} ${sign} ${n(other).de}.`, `${n(value).es} ${sign} ${n(other).es}.`),
      ],
    )
  }
  if (ctx.mode === 'order') {
    const howMany = Math.min(6, Math.max(3, knobNum(ctx, 'count', 4)))
    const values: number[] = []
    let guard = 0
    while (values.length < howMany && guard < 40) {
      const width = ctx.rng.int(Math.max(1, digits - 2), digits)
      const next = wholeOf(ctx, width)
      if (!values.includes(next)) values.push(next)
      guard += 1
    }
    while (values.length < howMany) values.push((values[values.length - 1] ?? 10) + values.length * 3 + 1)
    if (values[0] >= 10) {
      const chars = String(values[0]).split('')
      const index = ctx.rng.int(0, chars.length - 2)
      const swap = chars[index]
      chars[index] = chars[index + 1]
      chars[index + 1] = swap
      const close = Number(chars.join(''))
      if (close !== values[0] && !values.includes(close)) values[1] = close
    }
    const ids = values.map((value, index) => `${value}:${index}`)
    const correct = values.map((value, index) => ({ value, id: ids[index] })).sort((a, b) => a.value - b.value || a.id.localeCompare(b.id)).map((item) => item.id)
    const shown = shuffleNotSorted(ids, correct, ctx.rng)
    return ask(
      ctx,
      L('Order the numbers from least to greatest.', 'Ordne die Zahlen von der kleinsten zur größten.', 'Ordena los números de menor a mayor.'),
      { type: 'order', items: shown.map((id) => ({ id, label: n(Number(id.split(':')[0])) })) },
      { kind: 'order', ids: correct },
      [
        L('Compare the largest place first. A number with fewer digits is smaller when the others are at least that long.', 'Vergleiche zuerst die größte Stelle. Eine Zahl mit weniger Stellen ist kleiner, wenn die anderen mindestens so lang sind.', 'Compara primero el lugar mayor. Un número con menos cifras es menor cuando los otros son al menos así de largos.'),
        L(`The order is ${[...values].sort((a, b) => a - b).map((value) => n(value).en).join(', ')}.`, `Die Reihenfolge ist ${[...values].sort((a, b) => a - b).map((value) => n(value).de).join(', ')}.`, `El orden es ${[...values].sort((a, b) => a - b).map((value) => n(value).es).join(', ')}.`),
      ],
    )
  }
  if (ctx.mode === 'round') {
    const place = chosenRoundPlace(ctx, digits)
    const safe = avoidTie(wholeOf(ctx, digits), place)
    const rounded = roundHalfUp(safe, place)
    const phrase = roundPhrase(place)
    return ask(
      ctx,
      L(`Round ${n(safe).en} to ${phrase.en}.`, `Runde ${n(safe).de} auf ${phrase.de}.`, `Redondea ${n(safe).es} a ${phrase.es}.`),
      { type: 'number' },
      { kind: 'number', value: rounded },
      [
        L('Look one digit to the right of the place you are rounding to.', 'Schau eine Ziffer rechts von der Stelle, auf die du rundest.', 'Mira una cifra a la derecha del lugar al que redondeas.'),
        L(`${n(safe).en} rounds to ${n(rounded).en}.`, `${n(safe).de} wird zu ${n(rounded).de}.`, `${n(safe).es} se redondea a ${n(rounded).es}.`),
      ],
    )
  }
  if (ctx.mode === 'line') {
    const stepTable = [1, 10, 50, 100, 500, 1000, 5000, 10_000, 50_000, 100_000, 500_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000, 10_000_000_000, 100_000_000_000, 1_000_000_000_000]
    const step = [...stepTable].reverse().find((item) => item * 12 < 10 ** digits) ?? 10
    let target = Math.max(step, Math.round(wholeOf(ctx, digits) / step) * step)
    const before = ctx.rng.int(3, 5)
    let min = Math.max(0, target - before * step)
    min -= min % step
    let max = min + step * ctx.rng.int(8, 12)
    if (target < min || target > max) target = min + step * 4
    if (target > max) max = target + step * 3
    return ask(
      ctx,
      L(
        `Place ${n(target).en} on the number line. It runs from ${n(min).en} to ${n(max).en}.`,
        `Setze ${n(target).de} auf den Zahlenstrahl. Er geht von ${n(min).de} bis ${n(max).de}.`,
        `Ubica ${n(target).es} en la recta numérica. Va de ${n(min).es} a ${n(max).es}.`,
      ),
      { type: 'numberline', min, max, step },
      { kind: 'number', value: target },
      [
        L(`Each jump is ${n(step).en}. Count the jumps from ${n(min).en}.`, `Jeder Sprung ist ${n(step).de}. Zähle die Sprünge ab ${n(min).de}.`, `Cada salto es ${n(step).es}. Cuenta los saltos desde ${n(min).es}.`),
        L(`${n(target).en} sits on this line.`, `${n(target).de} liegt auf diesem Strahl.`, `${n(target).es} queda en esta recta.`),
      ],
    )
  }
  const width = digits
  const used = knobFlag(ctx, 'words') && ctx.rng.chance(0.5) ? ctx.rng.int(Math.max(1, width - 3), width) : width
  const value = wholeOf(ctx, used)
  const cells = String(value).padStart(width, '0').slice(-width).split('').map(Number)
  const words = knobFlag(ctx, 'words')
  return ask(
    ctx,
    words
      ? L(`Enter ${groupedWords(value).en} in the place-value chart.`, `Trage ${groupedWords(value).de} in die Stellenwerttafel ein.`, `Escribe ${groupedWords(value).es} en el tablero de valor posicional.`)
      : L(`Build ${n(value).en} in the place-value chart.`, `Baue ${n(value).de} in der Stellenwerttafel.`, `Arma ${n(value).es} en el tablero de valor posicional.`),
    { type: 'digits', columns: placeColumns(width) },
    { kind: 'digits', digits: cells },
    [
      L('Each column is worth ten times the column on its right. Empty places are zeros.', 'Jede Spalte ist zehnmal so viel wert wie die Spalte rechts. Leere Stellen sind Nullen.', 'Cada columna vale diez veces la de su derecha. Los lugares vacíos son ceros.'),
      L(`The digits are ${cells.join(' ')}.`, `Die Ziffern sind ${cells.join(' ')}.`, `Las cifras son ${cells.join(' ')}.`),
    ],
  )
}

void knobFlag
void reducedMixed
void scene
void roundTo
