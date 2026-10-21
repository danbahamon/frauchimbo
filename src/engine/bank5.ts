import { roundHalfUp, roundTo } from '../lib/math'
import { ask, expression, frac, knobFlag, L, n, scene, textChoice, type Ctx } from './shared'
import { fractionQuestion, g4mdA, g4nbtB, reducedMixed } from './bank4'
import { avoidTie } from './ops'

export function g5oaA(ctx: Ctx) {
  const a = ctx.rng.int(2, 9)
  const b = ctx.rng.int(2, 8)
  const c = ctx.rng.int(2, 6)
  if (ctx.mode === 'words') {
    const pack = textChoice(
      L(`(${n(a).en} + ${n(b).en}) × ${n(c).en}`, `(${n(a).de} + ${n(b).de}) × ${n(c).de}`, `(${n(a).es} + ${n(b).es}) × ${n(c).es}`),
      [
        L(`${n(a).en} + ${n(b).en} × ${n(c).en}`, `${n(a).de} + ${n(b).de} × ${n(c).de}`, `${n(a).es} + ${n(b).es} × ${n(c).es}`),
        L(`${n(a).en} × ${n(b).en} + ${n(c).en}`, `${n(a).de} × ${n(b).de} + ${n(c).de}`, `${n(a).es} × ${n(b).es} + ${n(c).es}`),
        L(`(${n(a).en} × ${n(b).en}) + ${n(c).en}`, `(${n(a).de} × ${n(b).de}) + ${n(c).de}`, `(${n(a).es} × ${n(b).es}) + ${n(c).es}`),
      ],
      ctx.rng,
    )
    return ask(
      ctx,
      L(
        `Which expression means: add ${n(a).en} and ${n(b).en}, then multiply by ${n(c).en}?`,
        `Welcher Term bedeutet: addiere ${n(a).de} und ${n(b).de}, dann multipliziere mit ${n(c).de}?`,
        `¿Cuál expresión significa: suma ${n(a).es} y ${n(b).es}, luego multiplica por ${n(c).es}?`,
      ),
      { type: 'choice', options: pack.options },
      pack.answer,
      [
        L('The phrase “then” means the addition happens before the multiplication, so it needs parentheses.', 'Das Wort „dann“ heißt: die Addition geschieht vor der Multiplikation, also braucht sie Klammern.', 'La palabra “luego” dice que la suma ocurre antes de la multiplicación, así que necesita paréntesis.'),
        L(`Without parentheses, multiplication would happen first.`, `Ohne Klammern geschähe die Multiplikation zuerst.`, `Sin paréntesis, la multiplicación ocurriría primero.`),
      ],
    )
  }
  const grouped = ctx.rng.chance(0.55)
  const value = grouped ? (a + b) * c : a + b * c
  return ask(
    ctx,
    L('Evaluate the expression.', 'Werte den Term aus.', 'Evalúa la expresión.'),
    { type: 'number' },
    { kind: 'number', value },
    grouped
      ? [
          L(`Parentheses first: ${n(a).en} + ${n(b).en} = ${n(a + b).en}.`, `Zuerst die Klammern: ${n(a).de} + ${n(b).de} = ${n(a + b).de}.`, `Primero los paréntesis: ${n(a).es} + ${n(b).es} = ${n(a + b).es}.`),
          L(`${n(a + b).en} × ${n(c).en} = ${n(value).en}.`, `${n(a + b).de} × ${n(c).de} = ${n(value).de}.`, `${n(a + b).es} × ${n(c).es} = ${n(value).es}.`),
        ]
      : [
          L(`Multiplication happens before addition: ${n(b).en} × ${n(c).en} = ${n(b * c).en}.`, `Die Multiplikation geschieht vor der Addition: ${n(b).de} × ${n(c).de} = ${n(b * c).de}.`, `La multiplicación ocurre antes de la suma: ${n(b).es} × ${n(c).es} = ${n(b * c).es}.`),
          L(`${n(a).en} + ${n(b * c).en} = ${n(value).en}.`, `${n(a).de} + ${n(b * c).de} = ${n(value).de}.`, `${n(a).es} + ${n(b * c).es} = ${n(value).es}.`),
        ],
    expression(
      grouped
        ? [{ t: 'op', v: '(' }, { t: 'v', value: a }, { t: 'op', v: '+' }, { t: 'v', value: b }, { t: 'op', v: ')' }, { t: 'op', v: '×' }, { t: 'v', value: c }]
        : [{ t: 'v', value: a }, { t: 'op', v: '+' }, { t: 'v', value: b }, { t: 'op', v: '×' }, { t: 'v', value: c }],
    ),
  )
}

export function g5oaB(ctx: Ctx) {
  const stepA = ctx.rng.int(2, 6)
  const stepB = stepA * ctx.rng.int(2, 3)
  const term = ctx.rng.int(3, 6)
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
    const a = roundTo(ctx.rng.int(100, 999) / 100, 2)
    let b = roundTo(ctx.rng.int(100, 999) / 100, 2)
    if (a === b) b = roundTo(a + 0.1, 2)
    const sign = a < b ? '<' : a > b ? '>' : '='
    return ask(
      ctx,
      L('Which sign is true?', 'Welches Zeichen stimmt?', '¿Qué signo es cierto?'),
      { type: 'compare', left: n(a, 2), right: n(b, 2) },
      { kind: 'compare', sign },
      [
        L('Compare whole numbers, then tenths, then hundredths.', 'Vergleiche zuerst die Ganzen, dann die Zehntel, dann die Hundertstel.', 'Compara los enteros, luego los décimos y después los centésimos.'),
        L(`${n(a, 2).en} ${sign} ${n(b, 2).en}.`, `${n(a, 2).de} ${sign} ${n(b, 2).de}.`, `${n(a, 2).es} ${sign} ${n(b, 2).es}.`),
      ],
    )
  }
  if (ctx.mode === 'round') {
    const place = ctx.rng.chance(0.5) ? 0.1 : 1
    let raw = roundTo(ctx.rng.int(1000, 9999) / 100, 2)
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
  if (ctx.mode === 'mul' || ctx.mode === 'div') {
    return g4nbtB({ ...ctx, mode: ctx.mode, knobs: { ...ctx.knobs, digits: 3, remain: false } })
  }
  if (ctx.mode === 'muldec' || ctx.mode === 'divdec') {
    const aT = ctx.rng.int(2, 12)
    const bT = ctx.rng.int(2, 9)
    if (ctx.mode === 'divdec') {
      const quotient = aT / 10
      const divisor = bT / 10
      const dividend = roundTo(quotient * divisor, 2)
      return ask(
        ctx,
        L('Find the quotient.', 'Bestimme den Quotienten.', 'Halla el cociente.'),
        { type: 'number', allowDecimal: true },
        { kind: 'number', value: quotient, tolerance: 0.001 },
        [
          L('Multiply the divisor and the quotient to check the dividend.', 'Multipliziere Divisor und Quotient, um den Dividenden zu prüfen.', 'Multiplica el divisor y el cociente para comprobar el dividendo.'),
          L(`${n(dividend, 2).en} ÷ ${n(divisor, 1).en} = ${n(quotient, 1).en}.`, `${n(dividend, 2).de} ÷ ${n(divisor, 1).de} = ${n(quotient, 1).de}.`, `${n(dividend, 2).es} ÷ ${n(divisor, 1).es} = ${n(quotient, 1).es}.`),
        ],
        expression([{ t: 'v', value: dividend, digits: 2 }, { t: 'op', v: '÷' }, { t: 'v', value: divisor, digits: 1 }]),
      )
    }
    const product = roundTo((aT / 10) * (bT / 10), 2)
    return ask(
      ctx,
      L('Find the product.', 'Bestimme das Produkt.', 'Halla el producto.'),
      { type: 'number', allowDecimal: true },
      { kind: 'number', value: product, tolerance: 0.001 },
      [
        L('Multiply as whole numbers, then give the product as many decimal places as both factors have together.', 'Multipliziere wie ganze Zahlen und gib dem Produkt so viele Dezimalstellen, wie beide Faktoren zusammen haben.', 'Multiplica como enteros y dale al producto tantos decimales como tienen los factores juntos.'),
        L(`${n(aT / 10, 1).en} × ${n(bT / 10, 1).en} = ${n(product, 2).en}.`, `${n(aT / 10, 1).de} × ${n(bT / 10, 1).de} = ${n(product, 2).de}.`, `${n(aT / 10, 1).es} × ${n(bT / 10, 1).es} = ${n(product, 2).es}.`),
      ],
      expression([{ t: 'v', value: aT / 10, digits: 1 }, { t: 'op', v: '×' }, { t: 'v', value: bT / 10, digits: 1 }]),
    )
  }
  const a = roundTo(ctx.rng.int(50, 400) / 100, 2)
  const b = roundTo(ctx.rng.int(20, 250) / 100, 2)
  const left = ctx.mode === 'subdec' ? Math.max(a, b) : a
  const right = ctx.mode === 'subdec' ? Math.min(a, b) : b
  const value = ctx.mode === 'subdec' ? roundTo(left - right, 2) : roundTo(left + right, 2)
  return ask(
    ctx,
    L(ctx.mode === 'subdec' ? 'Find the difference.' : 'Find the sum.', ctx.mode === 'subdec' ? 'Bestimme die Differenz.' : 'Bestimme die Summe.', ctx.mode === 'subdec' ? 'Halla la diferencia.' : 'Halla la suma.'),
    { type: 'number', allowDecimal: true },
    { kind: 'number', value, tolerance: 0.001 },
    [
      L('Line up the decimal points, then add or subtract from the hundredths.', 'Richte die Dezimalzeichen aus und rechne von den Hundertsteln aus.', 'Alinea los puntos decimales y opera desde los centésimos.'),
      L(`${n(left, 2).en} ${ctx.mode === 'subdec' ? '−' : '+'} ${n(right, 2).en} = ${n(value, 2).en}.`, `${n(left, 2).de} ${ctx.mode === 'subdec' ? '−' : '+'} ${n(right, 2).de} = ${n(value, 2).de}.`, `${n(left, 2).es} ${ctx.mode === 'subdec' ? '−' : '+'} ${n(right, 2).es} = ${n(value, 2).es}.`),
    ],
    expression([{ t: 'v', value: left, digits: 2 }, { t: 'op', v: ctx.mode === 'subdec' ? '−' : '+' }, { t: 'v', value: right, digits: 2 }]),
  )
}

export function g5nfA(ctx: Ctx) {
  const d1 = ctx.rng.pick([2, 3, 4, 6])
  const d2 = ctx.rng.pick([3, 4, 5, 8].filter((d) => d !== d1))
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
  if (ctx.mode === 'divwhole' || ctx.mode === 'divunit') {
    if (ctx.mode === 'divwhole') {
      const whole = ctx.rng.int(2, 6)
      const den = ctx.rng.pick([2, 3, 4, 5])
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
    const b = ctx.rng.pick([2, 3, 4, 5, 8])
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
    const den = ctx.rng.pick([2, 3, 4, 5, 6])
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
  const d1 = ctx.rng.int(n1 + 1, 8)
  const n2 = ctx.rng.int(1, 5)
  const d2 = ctx.rng.int(n2 + 1, 8)
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
    const meters = ctx.rng.int(1, 6)
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
  const counts = labels.map(() => ctx.rng.int(1, 5))
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
  const l = ctx.rng.int(2, 8)
  const w = ctx.rng.int(2, 6)
  const h = ctx.rng.int(2, 5)
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
  const x = ctx.rng.int(0, 8)
  const y = ctx.rng.int(0, 8)
  if (ctx.mode === 'read') {
    return ask(
      ctx,
      L('What are the coordinates of the marked point? Enter x, then y.', 'Welche Koordinaten hat der markierte Punkt? Erst x, dann y.', '¿Cuáles son las coordenadas del punto marcado? Primero x, luego y.'),
      {
        type: 'multi',
        fields: [
          { id: 'x', label: L('x', 'x', 'x'), allowNegative: false },
          { id: 'y', label: L('y', 'y', 'y'), allowNegative: false },
        ],
      },
      { kind: 'multi', parts: { x, y } },
      [
        L('Move along the x-axis first, then up to the point.', 'Gehe zuerst entlang der x-Achse, dann nach oben zum Punkt.', 'Muévete primero por el eje x y luego sube hasta el punto.'),
        L(`The point is (${n(x).en}, ${n(y).en}).`, `Der Punkt ist (${n(x).de}, ${n(y).de}).`, `El punto es (${n(x).es}, ${n(y).es}).`),
      ],
      { type: 'coord', xMin: 0, xMax: 8, yMin: 0, yMax: 8, points: [{ x, y }] },
    )
  }
  if (ctx.mode === 'distance') {
    const y2 = ctx.rng.int(0, 8)
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
      { type: 'coord', xMin: 0, xMax: 8, yMin: 0, yMax: 8, points: [{ x, y }, { x, y: y2 }] },
    )
  }
  return ask(
    ctx,
    L(`Plot the point (${n(x).en}, ${n(y).en}).`, `Setze den Punkt (${n(x).de}, ${n(y).de}).`, `Marca el punto (${n(x).es}, ${n(y).es}).`),
    { type: 'coordinate', xMin: 0, xMax: 8, yMin: 0, yMax: 8 },
    { kind: 'points', points: [{ x, y }] },
    [
      L('Start at the origin. Move x units to the right, then y units up.', 'Beginne im Ursprung. Gehe x Einheiten nach rechts, dann y Einheiten nach oben.', 'Empieza en el origen. Muévete x unidades a la derecha y luego y unidades hacia arriba.'),
      L(`You land at (${n(x).en}, ${n(y).en}).`, `Du landest bei (${n(x).de}, ${n(y).de}).`, `Llegas a (${n(x).es}, ${n(y).es}).`),
    ],
  )
}

export function g5gB(ctx: Ctx) {
  if (ctx.mode === 'figure') {
    const pack = textChoice(
      L('rhombus', 'Raute', 'rombo'),
      [L('scalene triangle', 'ungleichseitiges Dreieck', 'triángulo escaleno'), L('A figure with only one pair of parallel sides', 'Eine Figur mit nur einem parallelen Paar', 'Una figura con un solo par de lados paralelos')],
      ctx.rng,
    )
    return ask(
      ctx,
      L('Which figure is a parallelogram with all sides equal, and is not required to have right angles?', 'Welche Figur ist ein Parallelogramm mit lauter gleichen Seiten und muss keine rechten Winkel haben?', '¿Cuál figura es un paralelogramo con todos los lados iguales y no exige ángulos rectos?'),
      { type: 'choice', options: pack.options },
      pack.answer,
      [
        L('A rhombus has four equal sides. A square is a special rhombus with right angles.', 'Eine Raute hat vier gleiche Seiten. Ein Quadrat ist eine besondere Raute mit rechten Winkeln.', 'Un rombo tiene cuatro lados iguales. Un cuadrado es un rombo especial con ángulos rectos.'),
        L('The description points to the rhombus.', 'Die Beschreibung zeigt auf die Raute.', 'La descripción señala al rombo.'),
      ],
      { type: 'shape', shape: 'rhombus' },
    )
  }
  const pack = textChoice(
    L('Every square is a rectangle.', 'Jedes Quadrat ist ein Rechteck.', 'Todo cuadrado es un rectángulo.'),
    [
      L('Every rectangle is a square.', 'Jedes Rechteck ist ein Quadrat.', 'Todo rectángulo es un cuadrado.'),
      L('A triangle can have two right angles.', 'Ein Dreieck kann zwei rechte Winkel haben.', 'Un triángulo puede tener dos ángulos rectos.'),
      L('A parallelogram cannot be a rectangle.', 'Ein Parallelogramm kann kein Rechteck sein.', 'Un paralelogramo no puede ser un rectángulo.'),
    ],
    ctx.rng,
  )
  return ask(
    ctx,
    L('Which statement is true?', 'Welcher Satz stimmt?', '¿Cuál afirmación es cierta?'),
    { type: 'choice', options: pack.options },
    pack.answer,
    [
      L('Squares have four right angles and opposite sides equal, so they belong inside the rectangles.', 'Quadrate haben vier rechte Winkel und gleiche Gegenseiten, also gehören sie zu den Rechtecken.', 'Los cuadrados tienen cuatro ángulos rectos y lados opuestos iguales, así que viven dentro de los rectángulos.'),
      L('The other way fails: a long rectangle is not a square.', 'Umgekehrt stimmt es nicht: ein langes Rechteck ist kein Quadrat.', 'Al revés falla: un rectángulo largo no es un cuadrado.'),
    ],
  )
}

void knobFlag
void reducedMixed
void scene
void roundTo
