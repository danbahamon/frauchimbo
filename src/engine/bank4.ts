import { gcd, lcm, roundHalfUp, roundTo } from '../lib/math'
import type { Localized } from '../lib/types'
import {
  ask,
  expression,
  frac,
  knobFlag,
  knobNum,
  L,
  n,
  scene,
  shuffleNotSorted,
  simplify,
  textChoice,
  type Ctx,
} from './shared'
import { addWithin, avoidTie } from './ops'

const SYMMETRY: { shape: 'square' | 'rectangle' | 'triangle' | 'pentagon' | 'hexagon' | 'rhombus' | 'trapezoid' | 'parallelogram' | 'scalene'; lines: number }[] = [
  { shape: 'square', lines: 4 },
  { shape: 'rectangle', lines: 2 },
  { shape: 'triangle', lines: 3 },
  { shape: 'hexagon', lines: 6 },
  { shape: 'pentagon', lines: 5 },
  { shape: 'rhombus', lines: 2 },
  { shape: 'trapezoid', lines: 1 },
  { shape: 'parallelogram', lines: 0 },
  { shape: 'scalene', lines: 0 },
]

export function g4oaA(ctx: Ctx) {
  const boxes = ctx.rng.int(4, 9)
  const each = ctx.rng.int(6, 15)
  const extra = ctx.rng.int(8, 30)
  const total = boxes * each + extra
  if (ctx.mode === 'three' || knobFlag(ctx, 'remain')) {
    const people = ctx.rng.int(3, 8)
    const made = boxes * each
    const quotient = Math.floor(made / people)
    const remainder = made % people
    if (knobFlag(ctx, 'remain') && remainder !== 0) {
      return ask(
        ctx,
        L(
          `The bakery makes ${n(made).en} rolls and packs them into bags of ${n(people).en}. How many rolls are left over?`,
          `Die Bäckerei macht ${n(made).de} Brötchen und packt sie in Tüten zu ${n(people).de}. Wie viele Brötchen bleiben übrig?`,
          `La panadería hace ${n(made).es} panes y los empaca en bolsas de ${n(people).es}. ¿Cuántos panes sobran?`,
        ),
        { type: 'number' },
        { kind: 'number', value: remainder },
        [
          L(`${n(made).en} ÷ ${n(people).en} = ${n(quotient).en} remainder ${n(remainder).en}.`, `${n(made).de} ÷ ${n(people).de} = ${n(quotient).de} Rest ${n(remainder).de}.`, `${n(made).es} ÷ ${n(people).es} = ${n(quotient).es} residuo ${n(remainder).es}.`),
          L(`The leftover is the remainder, ${n(remainder).en}.`, `Der Rest ist ${n(remainder).de}.`, `Lo que sobra es el residuo, ${n(remainder).es}.`),
        ],
        scene('kitchen'),
      )
    }
    const sold = ctx.rng.int(5, 20)
    const left = made + extra - sold
    return ask(
      ctx,
      L(
        `Sol bakes ${n(boxes).en} trays of ${n(each).en} buns and ${n(extra).en} extra buns, then sells ${n(sold).en}. How many buns remain?`,
        `Sol backt ${n(boxes).de} Bleche mit je ${n(each).de} Brötchen und ${n(extra).de} extra, dann verkauft sie ${n(sold).de}. Wie viele bleiben?`,
        `Sol hornea ${n(boxes).es} charolas de ${n(each).es} panes y ${n(extra).es} extra, luego vende ${n(sold).es}. ¿Cuántos quedan?`,
      ),
      { type: 'number' },
      { kind: 'number', value: left },
      [
        L(`${n(boxes).en} × ${n(each).en} = ${n(made).en}.`, `${n(boxes).de} × ${n(each).de} = ${n(made).de}.`, `${n(boxes).es} × ${n(each).es} = ${n(made).es}.`),
        L(`${n(made).en} + ${n(extra).en} − ${n(sold).en} = ${n(left).en}.`, `${n(made).de} + ${n(extra).de} − ${n(sold).de} = ${n(left).de}.`, `${n(made).es} + ${n(extra).es} − ${n(sold).es} = ${n(left).es}.`),
      ],
      scene('kitchen'),
    )
  }
  return ask(
    ctx,
    L(
      `A garden has ${n(boxes).en} rows of ${n(each).en} tulips, plus ${n(extra).en} tulips by the gate. How many tulips are there?`,
      `Ein Garten hat ${n(boxes).de} Reihen mit je ${n(each).de} Tulpen und ${n(extra).de} Tulpen am Tor. Wie viele Tulpen sind es?`,
      `Un jardín tiene ${n(boxes).es} filas de ${n(each).es} tulipanes y ${n(extra).es} tulipanes junto a la puerta. ¿Cuántos tulipanes hay?`,
    ),
    { type: 'number' },
    { kind: 'number', value: total },
    [
      L(`${n(boxes).en} × ${n(each).en} = ${n(boxes * each).en}.`, `${n(boxes).de} × ${n(each).de} = ${n(boxes * each).de}.`, `${n(boxes).es} × ${n(each).es} = ${n(boxes * each).es}.`),
      L(`${n(boxes * each).en} + ${n(extra).en} = ${n(total).en}.`, `${n(boxes * each).de} + ${n(extra).de} = ${n(total).de}.`, `${n(boxes * each).es} + ${n(extra).es} = ${n(total).es}.`),
    ],
    scene('bay'),
  )
}

export function g4oaB(ctx: Ctx) {
  if (ctx.mode === 'gcf' || ctx.mode === 'lcm') {
    const a = ctx.rng.int(6, 18)
    const b = ctx.rng.int(6, 20)
    const value = ctx.mode === 'gcf' ? gcd(a, b) : lcm(a, b)
    return ask(
      ctx,
      ctx.mode === 'gcf'
        ? L(`What is the greatest common factor of ${n(a).en} and ${n(b).en}?`, `Was ist der größte gemeinsame Faktor von ${n(a).de} und ${n(b).de}?`, `¿Cuál es el máximo común divisor de ${n(a).es} y ${n(b).es}?`)
        : L(`What is the least common multiple of ${n(a).en} and ${n(b).en}?`, `Was ist das kleinste gemeinsame Vielfache von ${n(a).de} und ${n(b).de}?`, `¿Cuál es el mínimo común múltiplo de ${n(a).es} y ${n(b).es}?`),
      { type: 'number' },
      { kind: 'number', value },
      ctx.mode === 'gcf'
        ? [
            L('List the factors of each number and keep the greatest one they share.', 'Liste die Faktoren jeder Zahl und behalte den größten gemeinsamen.', 'Lista los factores de cada número y quédate con el mayor que comparten.'),
            L(`The greatest common factor is ${n(value).en}.`, `Der größte gemeinsame Faktor ist ${n(value).de}.`, `El máximo común divisor es ${n(value).es}.`),
          ]
        : [
            L('List multiples of the larger number until one is also a multiple of the smaller.', 'Liste Vielfache der größeren Zahl, bis eines auch Vielfaches der kleineren ist.', 'Lista múltiplos del mayor hasta que uno también sea múltiplo del menor.'),
            L(`The least common multiple is ${n(value).en}.`, `Das kleinste gemeinsame Vielfache ist ${n(value).de}.`, `El mínimo común múltiplo es ${n(value).es}.`),
          ],
    )
  }
  const target = ctx.rng.int(12, 36)
  const factors: number[] = []
  for (let i = 2; i < target; i++) if (target % i === 0) factors.push(i)
  const good = factors[ctx.rng.int(0, factors.length - 1)] ?? 2
  if (ctx.mode === 'multiple') {
    const mult = good * ctx.rng.int(2, 5)
    const wrongs = [good + 1, good + 3, target + 1].filter((v) => v % good !== 0)
    const pack = textChoice(
      L(n(mult).en, n(mult).de, n(mult).es),
      wrongs.slice(0, 3).map((v) => L(n(v).en, n(v).de, n(v).es)),
      ctx.rng,
    )
    return ask(
      ctx,
      L(`Which number is a multiple of ${n(good).en}?`, `Welche Zahl ist ein Vielfaches von ${n(good).de}?`, `¿Cuál número es múltiplo de ${n(good).es}?`),
      { type: 'choice', options: pack.options },
      pack.answer,
      [
        L(`A multiple of ${n(good).en} divides evenly by ${n(good).en}.`, `Ein Vielfaches von ${n(good).de} lässt sich glatt durch ${n(good).de} teilen.`, `Un múltiplo de ${n(good).es} se divide exactamente entre ${n(good).es}.`),
        L(`${n(mult).en} ÷ ${n(good).en} = ${n(mult / good).en}.`, `${n(mult).de} ÷ ${n(good).de} = ${n(mult / good).de}.`, `${n(mult).es} ÷ ${n(good).es} = ${n(mult / good).es}.`),
      ],
    )
  }
  const wrongs: number[] = []
  while (wrongs.length < 3) {
    const candidate = ctx.rng.int(2, target)
    if (target % candidate !== 0 && !wrongs.includes(candidate)) wrongs.push(candidate)
  }
  const pack = textChoice(
    L(n(good).en, n(good).de, n(good).es),
    wrongs.map((v) => L(n(v).en, n(v).de, n(v).es)),
    ctx.rng,
  )
  return ask(
    ctx,
    L(`Which number is a factor of ${n(target).en}?`, `Welche Zahl ist ein Faktor von ${n(target).de}?`, `¿Cuál número es factor de ${n(target).es}?`),
    { type: 'choice', options: pack.options },
    pack.answer,
    [
      L(`${n(target).en} ÷ ${n(good).en} has no remainder.`, `${n(target).de} ÷ ${n(good).de} hat keinen Rest.`, `${n(target).es} ÷ ${n(good).es} no deja residuo.`),
      L(`So ${n(good).en} is a factor.`, `Also ist ${n(good).de} ein Faktor.`, `Entonces ${n(good).es} es un factor.`),
    ],
  )
}

export function g4oaC(ctx: Ctx) {
  const start = ctx.rng.int(3, 20)
  const step = ctx.rng.int(3, 12) * (ctx.rng.chance(0.25) ? -1 : 1)
  const seq = [0, 1, 2, 3, 4].map((i) => start + i * step)
  if (ctx.mode === 'rule') {
    return ask(
      ctx,
      L(
        `The pattern starts at ${n(seq[0]).en} and continues ${seq.slice(0, 4).map((v) => n(v).en).join(', ')}. What is added each time? Use a negative number if the pattern falls.`,
        `Das Muster beginnt bei ${n(seq[0]).de} und geht weiter: ${seq.slice(0, 4).map((v) => n(v).de).join(', ')}. Was wird jedes Mal addiert? Nimm eine negative Zahl, wenn das Muster fällt.`,
        `El patrón empieza en ${n(seq[0]).es} y sigue ${seq.slice(0, 4).map((v) => n(v).es).join(', ')}. ¿Qué se suma cada vez? Usa un número negativo si el patrón baja.`,
      ),
      { type: 'number', allowNegative: true },
      { kind: 'number', value: step },
      [
        L(`Subtract a term from the next one: ${n(seq[1]).en} − ${n(seq[0]).en}.`, `Ziehe ein Glied vom nächsten ab: ${n(seq[1]).de} − ${n(seq[0]).de}.`, `Resta un término del siguiente: ${n(seq[1]).es} − ${n(seq[0]).es}.`),
        L(`The rule is ${step < 0 ? '' : '+'}${n(step).en}.`, `Die Regel ist ${step < 0 ? '' : '+'}${n(step).de}.`, `La regla es ${step < 0 ? '' : '+'}${n(step).es}.`),
      ],
    )
  }
  return ask(
    ctx,
    L(
      `${seq.slice(0, 4).map((v) => n(v).en).join(', ')}, … What is the next number?`,
      `${seq.slice(0, 4).map((v) => n(v).de).join(', ')}, … Welche Zahl kommt als Nächstes?`,
      `${seq.slice(0, 4).map((v) => n(v).es).join(', ')}, … ¿Qué número sigue?`,
    ),
    { type: 'number', allowNegative: true },
    { kind: 'number', value: seq[4] },
    [
      L(`The pattern changes by ${n(step).en} each time.`, `Das Muster ändert sich jedes Mal um ${n(step).de}.`, `El patrón cambia ${n(step).es} cada vez.`),
      L(`${n(seq[3]).en} + (${n(step).en}) = ${n(seq[4]).en}.`, `${n(seq[3]).de} + (${n(step).de}) = ${n(seq[4]).de}.`, `${n(seq[3]).es} + (${n(seq[3] ? step : step).es}) = ${n(seq[4]).es}.`),
    ],
  )
}

export function g4nbtA(ctx: Ctx) {
  const digits = [ctx.rng.int(1, 9), ctx.rng.int(0, 9), ctx.rng.int(0, 9), ctx.rng.int(0, 9), ctx.rng.int(0, 9)]
  const places = [10000, 1000, 100, 10, 1]
  const value = digits.reduce((sum, digit, index) => sum + digit * places[index], 0)
  if (ctx.mode === 'build') {
    return ask(
      ctx,
      L(`Build ${n(value).en} in the place-value chart.`, `Baue ${n(value).de} in der Stellenwerttafel.`, `Arma ${n(value).es} en el tablero de valor posicional.`),
      {
        type: 'digits',
        columns: [L('Ten thousands', 'Zehntausender', 'Decenas de millar'), L('Thousands', 'Tausender', 'Millares'), L('Hundreds', 'Hunderter', 'Centenas'), L('Tens', 'Zehner', 'Decenas'), L('Ones', 'Einer', 'Unidades')],
      },
      { kind: 'digits', digits },
      [
        L('Each column is worth ten times the column on its right.', 'Jede Spalte ist zehnmal so viel wert wie die Spalte rechts daneben.', 'Cada columna vale diez veces la columna a su derecha.'),
        L(`The digits of ${n(value).en} are ${digits.join(' ')}.`, `Die Ziffern von ${n(value).de} sind ${digits.join(' ')}.`, `Las cifras de ${n(value).es} son ${digits.join(' ')}.`),
      ],
    )
  }
  if (ctx.mode === 'round') {
    const place = ctx.rng.pick([10, 100, 1000])
    const safe = avoidTie(value, place)
    const rounded = roundHalfUp(safe, place)
    const name = place === 10 ? L('ten', 'Zehner', 'decena') : place === 100 ? L('hundred', 'Hunderter', 'centena') : L('thousand', 'Tausender', 'millar')
    return ask(
      ctx,
      L(`Round ${n(safe).en} to the nearest ${name.en}.`, `Runde ${n(safe).de} auf den nächsten ${name.de}.`, `Redondea ${n(safe).es} al ${name.es} más cercano.`),
      { type: 'number' },
      { kind: 'number', value: rounded },
      [
        L(`Find the ${name.en}s place, then look one digit to the right.`, `Finde die Stelle der ${name.de} und schau eine Ziffer nach rechts.`, `Encuentra el lugar de ${name.es} y mira una cifra a la derecha.`),
        L(`${n(safe).en} rounds to ${n(rounded).en}.`, `${n(safe).de} wird zu ${n(rounded).de}.`, `${n(safe).es} se redondea a ${n(rounded).es}.`),
      ],
    )
  }
  if (ctx.mode === 'times') {
    const index = ctx.rng.int(0, 3)
    const digit = digits[index] || 4
    const big = digit * places[index]
    const small = digit * places[index + 1]
    const times = places[index] / places[index + 1]
    return ask(
      ctx,
      L(
        `In ${n(big + small).en}, the ${n(digit).en} in the larger place is how many times the ${n(digit).en} in the smaller place?`,
        `In ${n(big + small).de}: Wie viel mal so viel ist die ${n(digit).de} an der größeren Stelle wert wie die ${n(digit).de} an der kleineren?`,
        `En ${n(big + small).es}, el ${n(digit).es} del lugar mayor vale cuántas veces el ${n(digit).es} del lugar menor?`,
      ),
      { type: 'number' },
      { kind: 'number', value: times },
      [
        L('A place is always 10 times the place on its right.', 'Eine Stelle ist immer 10-mal so viel wert wie die Stelle rechts.', 'Un lugar siempre vale 10 veces el lugar a su derecha.'),
        L(`${n(big).en} is ${n(times).en} times ${n(small).en}.`, `${n(big).de} ist ${n(times).de}-mal ${n(small).de}.`, `${n(big).es} es ${n(times).es} veces ${n(small).es}.`),
      ],
    )
  }
  const index = digits.findIndex((digit, i) => digit > 0 && i < 4)
  const use = index === -1 ? 0 : index
  return ask(
    ctx,
    L(
      `What is the value of the digit ${n(digits[use]).en} in ${n(value).en}?`,
      `Welchen Wert hat die Ziffer ${n(digits[use]).de} in ${n(value).de}?`,
      `¿Cuál es el valor de la cifra ${n(digits[use]).es} en ${n(value).es}?`,
    ),
    { type: 'number' },
    { kind: 'number', value: digits[use] * places[use] },
    [
      L('Value means the digit times its place.', 'Wert bedeutet die Ziffer mal ihre Stelle.', 'Valor significa la cifra por su lugar.'),
      L(`${n(digits[use]).en} × ${n(places[use]).en} = ${n(digits[use] * places[use]).en}.`, `${n(digits[use]).de} × ${n(places[use]).de} = ${n(digits[use] * places[use]).de}.`, `${n(digits[use]).es} × ${n(places[use]).es} = ${n(digits[use] * places[use]).es}.`),
    ],
  )
}

export function g4nbtB(ctx: Ctx) {
  const digits = Math.min(4, Math.max(2, knobNum(ctx, 'digits', 3)))
  if (ctx.mode === 'mul') {
    const a = ctx.rng.int(12, digits > 2 ? 80 : 40)
    const b = ctx.rng.int(3, 9)
    return ask(
      ctx,
      L('Find the product.', 'Bestimme das Produkt.', 'Halla el producto.'),
      { type: 'number' },
      { kind: 'number', value: a * b },
      [
        L(`Multiply ${n(a).en} by ${n(b).en}, ones first, and regroup tens as you go.`, `Multipliziere ${n(a).de} mit ${n(b).de}, zuerst die Einer, und bündle die Zehner dabei.`, `Multiplica ${n(a).es} por ${n(b).es}, primero las unidades, y reagrupa las decenas.`),
        L(`${n(a).en} × ${n(b).en} = ${n(a * b).en}.`, `${n(a).de} × ${n(b).de} = ${n(a * b).de}.`, `${n(a).es} × ${n(b).es} = ${n(a * b).es}.`),
      ],
      expression([{ t: 'v', value: a }, { t: 'op', v: '×' }, { t: 'v', value: b }]),
    )
  }
  if (ctx.mode === 'div') {
    const divisor = ctx.rng.int(2, 9)
    const quotient = ctx.rng.int(12, digits > 2 ? 80 : 40)
    const remainder = knobFlag(ctx, 'remain') ? ctx.rng.int(1, divisor - 1) : 0
    const dividend = quotient * divisor + remainder
    if (remainder) {
      return ask(
        ctx,
        L('Divide. Enter the quotient and the remainder.', 'Dividiere. Gib Quotient und Rest ein.', 'Divide. Escribe el cociente y el residuo.'),
        {
          type: 'multi',
          fields: [
            { id: 'q', label: L('Quotient', 'Quotient', 'Cociente') },
            { id: 'r', label: L('Remainder', 'Rest', 'Residuo') },
          ],
        },
        { kind: 'multi', parts: { q: quotient, r: remainder } },
        [
          L(`${n(dividend).en} ÷ ${n(divisor).en} is ${n(quotient).en} groups, with ${n(remainder).en} left over.`, `${n(dividend).de} ÷ ${n(divisor).de} sind ${n(quotient).de} Gruppen, und ${n(remainder).de} bleiben übrig.`, `${n(dividend).es} ÷ ${n(divisor).es} son ${n(quotient).es} grupos, y sobran ${n(remainder).es}.`),
          L(`Check: ${n(quotient).en} × ${n(divisor).en} + ${n(remainder).en} = ${n(dividend).en}.`, `Probe: ${n(quotient).de} × ${n(divisor).de} + ${n(remainder).de} = ${n(dividend).de}.`, `Prueba: ${n(quotient).es} × ${n(divisor).es} + ${n(remainder).es} = ${n(dividend).es}.`),
        ],
        expression([{ t: 'v', value: dividend }, { t: 'op', v: '÷' }, { t: 'v', value: divisor }]),
      )
    }
    return ask(
      ctx,
      L('Find the quotient.', 'Bestimme den Quotienten.', 'Halla el cociente.'),
      { type: 'number' },
      { kind: 'number', value: quotient },
      [
        L(`How many groups of ${n(divisor).en} are in ${n(dividend).en}?`, `Wie viele Gruppen zu ${n(divisor).de} stecken in ${n(dividend).de}?`, `¿Cuántos grupos de ${n(divisor).es} hay en ${n(dividend).es}?`),
        L(`${n(dividend).en} ÷ ${n(divisor).en} = ${n(quotient).en}.`, `${n(dividend).de} ÷ ${n(divisor).de} = ${n(quotient).de}.`, `${n(dividend).es} ÷ ${n(divisor).es} = ${n(quotient).es}.`),
      ],
      expression([{ t: 'v', value: dividend }, { t: 'op', v: '÷' }, { t: 'v', value: divisor }]),
    )
  }
  const wide = addWithin(10 ** digits)
  const a = wide.a
  const b = ctx.mode === 'sub' ? ctx.rng.int(10 ** (digits - 1), a - 1) : wide.b
  const value = ctx.mode === 'sub' ? a - b : a + b
  return ask(
    ctx,
    L(ctx.mode === 'sub' ? 'Find the difference.' : 'Find the sum.', ctx.mode === 'sub' ? 'Bestimme die Differenz.' : 'Bestimme die Summe.', ctx.mode === 'sub' ? 'Halla la diferencia.' : 'Halla la suma.'),
    { type: 'number' },
    { kind: 'number', value },
    [
      L('Align the places and work from the ones toward the left.', 'Richte die Stellen aus und arbeite von den Einern nach links.', 'Alinea los lugares y trabaja de las unidades hacia la izquierda.'),
      L(`${n(a).en} ${ctx.mode === 'sub' ? '−' : '+'} ${n(b).en} = ${n(value).en}.`, `${n(a).de} ${ctx.mode === 'sub' ? '−' : '+'} ${n(b).de} = ${n(value).de}.`, `${n(a).es} ${ctx.mode === 'sub' ? '−' : '+'} ${n(b).es} = ${n(value).es}.`),
    ],
    expression([{ t: 'v', value: a }, { t: 'op', v: ctx.mode === 'sub' ? '−' : '+' }, { t: 'v', value: b }]),
  )
}

function unlikePair(ctx: Ctx) {
  const pool = [2, 3, 4, 5, 6, 8]
  const d1 = ctx.rng.pick(pool)
  let d2 = ctx.rng.pick(pool)
  let guard = 0
  while (d2 === d1 && guard < 6) {
    d2 = ctx.rng.pick(pool)
    guard += 1
  }
  return { d1, d2, n1: ctx.rng.int(1, d1 - 1), n2: ctx.rng.int(1, d2 - 1) }
}

export function fractionQuestion(ctx: Ctx, numer: number, den: number, prompt: Localized, steps: Localized[], whole = 0) {
  const simple = knobFlag(ctx, 'simple')
  const [sn, sd] = simplify(whole ? whole * den + numer : numer, den)
  const shown = simple ? reducedMixed(sn, sd) : { whole, n: numer, d: den }
  const simplified = simple && (shown.whole !== whole || shown.n !== numer || shown.d !== den)
  const withForm = simplified
    ? [
        ...steps,
        L(
          `Simplest form: ${frac(shown.whole, shown.n, shown.d)}.`,
          `Kürzeste Form: ${frac(shown.whole, shown.n, shown.d)}.`,
          `Forma más simple: ${frac(shown.whole, shown.n, shown.d)}.`,
        ),
      ]
    : steps
  return ask(
    ctx,
    simple
      ? L(`${prompt.en} Give the answer in simplest form.`, `${prompt.de} Gib die Antwort in der kürzesten Form.`, `${prompt.es} Da la respuesta en su forma más simple.`)
      : prompt,
    { type: 'fraction', allowWhole: true, allowNegative: numer < 0 || whole < 0 },
    { kind: 'fraction', whole: shown.whole, n: shown.n, d: shown.d, simplified: simple },
    withForm,
  )
}

export function reducedMixed(numer: number, den: number) {
  const sign = numer < 0 ? -1 : 1
  const abs = Math.abs(numer)
  const [n0, d0] = simplify(abs, den)
  const whole = Math.trunc(n0 / d0)
  const rest = n0 % d0
  return { whole: sign * whole, n: sign < 0 && whole === 0 ? -rest : rest, d: d0 }
}

export function g4nfA(ctx: Ctx) {
  const d = ctx.rng.pick([2, 3, 4, 5, 6])
  const numer = ctx.rng.int(1, d - 1)
  if (ctx.mode === 'order') {
    const fracs = [0, 1, 2].map(() => {
      const den = ctx.rng.pick([2, 3, 4, 5, 6, 8])
      const num = ctx.rng.int(1, den - 1)
      return { num, den, value: num / den, id: `${num}-${den}-${ctx.rng.int(1, 9999)}` }
    })
    const sorted = [...fracs].sort((a, b) => a.value - b.value || a.den - b.den)
    const items = shuffleNotSorted(
      fracs.map((item) => item.id),
      sorted.map((item) => item.id),
      ctx.rng,
    ).map((id) => {
      const item = fracs.find((entry) => entry.id === id)!
      return { id, label: L(frac(0, item.num, item.den), frac(0, item.num, item.den), frac(0, item.num, item.den)) }
    })
    return ask(
      ctx,
      L('Order the fractions from least to greatest.', 'Ordne die Brüche vom kleinsten zum größten.', 'Ordena las fracciones de menor a mayor.'),
      { type: 'order', items },
      { kind: 'order', ids: sorted.map((item) => item.id) },
      [
        L('Rewrite them with a common denominator, or compare each with 1/2.', 'Schreibe sie mit einem gemeinsamen Nenner oder vergleiche jeden mit 1/2.', 'Reescríbelas con un denominador común, o compara cada una con 1/2.'),
        L(
          `Least to greatest: ${sorted.map((item) => frac(0, item.num, item.den)).join(', ')}.`,
          `Von klein nach groß: ${sorted.map((item) => frac(0, item.num, item.den)).join(', ')}.`,
          `De menor a mayor: ${sorted.map((item) => frac(0, item.num, item.den)).join(', ')}.`,
        ),
      ],
    )
  }
  if (ctx.mode === 'compare') {
    const pair = unlikePair(ctx)
    const left = pair.n1 / pair.d1
    const right = pair.n2 / pair.d2
    const sign = Math.abs(left - right) < 1e-9 ? '=' : left < right ? '<' : '>'
    return ask(
      ctx,
      L('Which sign belongs between them?', 'Welches Zeichen gehört dazwischen?', '¿Qué signo va en medio?'),
      {
        type: 'compare',
        left: L(frac(0, pair.n1, pair.d1), frac(0, pair.n1, pair.d1), frac(0, pair.n1, pair.d1)),
        right: L(frac(0, pair.n2, pair.d2), frac(0, pair.n2, pair.d2), frac(0, pair.n2, pair.d2)),
      },
      { kind: 'compare', sign },
      [
        L('A common denominator makes the numerators easy to compare.', 'Ein gemeinsamer Nenner macht die Zähler leicht vergleichbar.', 'Un denominador común vuelve fáciles de comparar los numeradores.'),
        L(`${frac(0, pair.n1, pair.d1)} ${sign} ${frac(0, pair.n2, pair.d2)}.`, `${frac(0, pair.n1, pair.d1)} ${sign} ${frac(0, pair.n2, pair.d2)}.`, `${frac(0, pair.n1, pair.d1)} ${sign} ${frac(0, pair.n2, pair.d2)}.`),
      ],
    )
  }
  const k = ctx.rng.int(2, 4)
  return fractionQuestion(
    ctx,
    numer * k,
    d * k,
    L(`Write ${frac(0, numer * k, d * k)} in simplest form.`, `Schreibe ${frac(0, numer * k, d * k)} in der kürzesten Form.`, `Escribe ${frac(0, numer * k, d * k)} en su forma más simple.`),
    [
      L(`Divide the numerator and the denominator by ${n(k).en}.`, `Teile Zähler und Nenner durch ${n(k).de}.`, `Divide el numerador y el denominador entre ${n(k).es}.`),
      L(`${frac(0, numer * k, d * k)} = ${frac(0, numer, d)}.`, `${frac(0, numer * k, d * k)} = ${frac(0, numer, d)}.`, `${frac(0, numer * k, d * k)} = ${frac(0, numer, d)}.`),
    ],
  )
}

export function g4nfB(ctx: Ctx) {
  const d = ctx.rng.pick([3, 4, 5, 6, 8, 10])
  if (ctx.mode === 'mulwhole') {
    const whole = ctx.rng.int(2, 6)
    const numer = ctx.rng.int(1, d - 1)
    const product = whole * numer
    return fractionQuestion(
      ctx,
      product,
      d,
      L(`What is ${n(whole).en} × ${frac(0, numer, d)}?`, `Wie viel ist ${n(whole).de} × ${frac(0, numer, d)}?`, `¿Cuánto es ${n(whole).es} × ${frac(0, numer, d)}?`),
      [
        L(`${n(whole).en} × ${frac(0, numer, d)} = ${frac(0, product, d)}.`, `${n(whole).de} × ${frac(0, numer, d)} = ${frac(0, product, d)}.`, `${n(whole).es} × ${frac(0, numer, d)} = ${frac(0, product, d)}.`),
        L('If the numerator is at least the denominator, you can rewrite it as a mixed number.', 'Ist der Zähler mindestens so groß wie der Nenner, kannst du eine gemischte Zahl schreiben.', 'Si el numerador es al menos el denominador, puedes escribir un número mixto.'),
      ],
    )
  }
  if (ctx.mode === 'mixed') {
    const whole = ctx.rng.int(1, 3)
    const numer = ctx.rng.int(1, d - 1)
    const addN = ctx.rng.int(1, d - 1)
    const totalN = whole * d + numer + addN
    return fractionQuestion(
      ctx,
      totalN,
      d,
      L(`What is ${frac(whole, numer, d)} + ${frac(0, addN, d)}?`, `Wie viel ist ${frac(whole, numer, d)} + ${frac(0, addN, d)}?`, `¿Cuánto es ${frac(whole, numer, d)} + ${frac(0, addN, d)}?`),
      [
        L('Add the fractional parts. If they reach a whole, carry it.', 'Addiere die Bruchanteile. Erreichen sie eine Ganze, übertrage sie.', 'Suma las partes fraccionarias. Si llegan a un entero, llévalo.'),
        L(`${frac(whole, numer, d)} + ${frac(0, addN, d)} = ${frac(0, totalN, d)}.`, `${frac(whole, numer, d)} + ${frac(0, addN, d)} = ${frac(0, totalN, d)}.`, `${frac(whole, numer, d)} + ${frac(0, addN, d)} = ${frac(0, totalN, d)}.`),
      ],
    )
  }
  const a = ctx.rng.int(1, d - 1)
  let b = ctx.rng.int(1, d - 1)
  if (ctx.mode === 'sub') {
    if (b > a) {
      const swap = a
      b = swap
    }
    const left = Math.max(a, b)
    const right = Math.min(a, b)
    return fractionQuestion(
      ctx,
      left - right,
      d,
      L(`What is ${frac(0, left, d)} − ${frac(0, right, d)}?`, `Wie viel ist ${frac(0, left, d)} − ${frac(0, right, d)}?`, `¿Cuánto es ${frac(0, left, d)} − ${frac(0, right, d)}?`),
      [
        L('The denominators already match, so subtract the numerators.', 'Die Nenner stimmen schon, also subtrahiere die Zähler.', 'Los denominadores ya coinciden, así que resta los numeradores.'),
        L(`${frac(0, left, d)} − ${frac(0, right, d)} = ${frac(0, left - right, d)}.`, `${frac(0, left, d)} − ${frac(0, right, d)} = ${frac(0, left - right, d)}.`, `${frac(0, left, d)} − ${frac(0, right, d)} = ${frac(0, left - right, d)}.`),
      ],
    )
  }
  return fractionQuestion(
    ctx,
    a + b,
    d,
    L(`What is ${frac(0, a, d)} + ${frac(0, b, d)}?`, `Wie viel ist ${frac(0, a, d)} + ${frac(0, b, d)}?`, `¿Cuánto es ${frac(0, a, d)} + ${frac(0, b, d)}?`),
    [
      L('Same denominator: add the numerators and keep the denominator.', 'Gleicher Nenner: addiere die Zähler und behalte den Nenner.', 'Mismo denominador: suma los numeradores y conserva el denominador.'),
      L(`${frac(0, a, d)} + ${frac(0, b, d)} = ${frac(0, a + b, d)}.`, `${frac(0, a, d)} + ${frac(0, b, d)} = ${frac(0, a + b, d)}.`, `${frac(0, a, d)} + ${frac(0, b, d)} = ${frac(0, a + b, d)}.`),
    ],
  )
}

export function g4nfC(ctx: Ctx) {
  const hundred = ctx.difficulty >= 3
  const cells = hundred ? 100 : 10
  const count = ctx.rng.int(1, hundred ? 40 : 9)
  const value = count / cells
  const digits = hundred ? 2 : 1
  if (ctx.mode === 'shade') {
    const target = hundred ? ctx.rng.int(5, 40) : ctx.rng.int(1, 9)
    return ask(
      ctx,
      L(
        `Shade ${n(target / cells, digits).en} of the grid.`,
        `Färbe ${n(target / cells, digits).de} des Gitters.`,
        `Sombrea ${n(target / cells, digits).es} de la cuadrícula.`,
      ),
      { type: 'shade', rows: hundred ? 10 : 1, cols: hundred ? 10 : 10 },
      { kind: 'shade', count: target },
      [
        L(hundred ? 'Each small square is one hundredth.' : 'Each part is one tenth.', hundred ? 'Jedes kleine Quadrat ist ein Hundertstel.' : 'Jedes Teil ist ein Zehntel.', hundred ? 'Cada cuadradito es un centésimo.' : 'Cada parte es un décimo.'),
        L(`Shade ${n(target).en} parts.`, `Färbe ${n(target).de} Teile.`, `Sombrea ${n(target).es} partes.`),
      ],
    )
  }
  if (ctx.mode === 'compare') {
    const a = ctx.rng.int(1, 40) / (ctx.rng.chance(0.5) ? 10 : 100)
    let b = ctx.rng.int(1, 40) / (ctx.rng.chance(0.5) ? 10 : 100)
    if (a === b) b += 0.1
    const ar = roundTo(a, 2)
    const br = roundTo(b, 2)
    const sign = ar === br ? '=' : ar < br ? '<' : '>'
    return ask(
      ctx,
      L('Which sign is true?', 'Welches Zeichen stimmt?', '¿Qué signo es cierto?'),
      {
        type: 'compare',
        left: n(ar, 2),
        right: n(br, 2),
      },
      { kind: 'compare', sign },
      [
        L('Line up the decimal points and compare tenths before hundredths.', 'Richte die Kommas aus und vergleiche zuerst die Zehntel, dann die Hundertstel.', 'Alinea los puntos decimales y compara décimos antes que centésimos.'),
        L(`${n(ar, 2).en} ${sign} ${n(br, 2).en}.`, `${n(ar, 2).de} ${sign} ${n(br, 2).de}.`, `${n(ar, 2).es} ${sign} ${n(br, 2).es}.`),
      ],
    )
  }
  return ask(
    ctx,
    L('Write the shaded amount as a decimal.', 'Schreibe die gefärbte Menge als Dezimalzahl.', 'Escribe la cantidad sombreada como decimal.'),
    { type: 'number', allowDecimal: true },
    { kind: 'number', value, tolerance: 0.001 },
    [
      L(hundred ? `There are ${n(count).en} hundredths.` : `There are ${n(count).en} tenths.`, hundred ? `Es sind ${n(count).de} Hundertstel.` : `Es sind ${n(count).de} Zehntel.`, hundred ? `Hay ${n(count).es} centésimos.` : `Hay ${n(count).es} décimos.`),
      L(`As a decimal, that is ${n(value, digits).en}.`, `Als Dezimalzahl ist das ${n(value, digits).de}.`, `Como decimal, eso es ${n(value, digits).es}.`),
    ],
    { type: 'grid', rows: hundred ? 10 : 1, cols: hundred ? 10 : 10, shaded: count },
  )
}

const CONVERSIONS: { mode: string; from: Localized; to: Localized; factor: number; up: boolean }[] = [
  { mode: 'metric', from: L('kilometers', 'Kilometer', 'kilómetros'), to: L('meters', 'Meter', 'metros'), factor: 1000, up: true },
  { mode: 'metric', from: L('meters', 'Meter', 'metros'), to: L('centimeters', 'Zentimeter', 'centímetros'), factor: 100, up: true },
  { mode: 'metric', from: L('kilograms', 'Kilogramm', 'kilogramos'), to: L('grams', 'Gramm', 'gramos'), factor: 1000, up: true },
  { mode: 'metric', from: L('liters', 'Liter', 'litros'), to: L('milliliters', 'Milliliter', 'mililitros'), factor: 1000, up: true },
  { mode: 'time', from: L('hours', 'Stunden', 'horas'), to: L('minutes', 'Minuten', 'minutos'), factor: 60, up: true },
  { mode: 'time', from: L('minutes', 'Minuten', 'minutos'), to: L('seconds', 'Sekunden', 'segundos'), factor: 60, up: true },
  { mode: 'custom', from: L('feet', 'Fuß', 'pies'), to: L('inches', 'Zoll', 'pulgadas'), factor: 12, up: true },
  { mode: 'custom', from: L('pounds', 'Pfund', 'libras'), to: L('ounces', 'Unzen', 'onzas'), factor: 16, up: true },
  { mode: 'custom', from: L('yards', 'Yards', 'yardas'), to: L('feet', 'Fuß', 'pies'), factor: 3, up: true },
]

export function g4mdA(ctx: Ctx) {
  const pool = CONVERSIONS.filter((item) => item.mode === (ctx.mode || 'metric'))
  const row = ctx.rng.pick(pool.length ? pool : CONVERSIONS)
  const count = ctx.rng.int(2, 8)
  return ask(
    ctx,
    L(
      `How many ${row.to.en} are in ${n(count).en} ${row.from.en}?`,
      `Wie viele ${row.to.de} sind ${n(count).de} ${row.from.de}?`,
      `¿Cuántos ${row.to.es} hay en ${n(count).es} ${row.from.es}?`,
    ),
    { type: 'number' },
    { kind: 'number', value: count * row.factor },
    [
      L(`One ${row.from.en.replace(/s$/, '')} is ${n(row.factor).en} ${row.to.en}.`, `Ein ${row.from.de} entspricht ${n(row.factor).de} ${row.to.de}.`, `Un ${row.from.es.replace(/s$/, '')} equivale a ${n(row.factor).es} ${row.to.es}.`),
      L(`${n(count).en} × ${n(row.factor).en} = ${n(count * row.factor).en}.`, `${n(count).de} × ${n(row.factor).de} = ${n(count * row.factor).de}.`, `${n(count).es} × ${n(row.factor).es} = ${n(count * row.factor).es}.`),
    ],
  )
}

export function g4mdB(ctx: Ctx) {
  const labels = ['1/4', '2/4', '3/4', '1']
  const counts = [ctx.rng.int(0, 5), ctx.rng.int(1, 6), ctx.rng.int(0, 5), ctx.rng.int(1, 4)]
  const index = ctx.rng.int(0, 3)
  if (ctx.mode === 'sum') {
    const values = [0.25, 0.5, 0.75, 1]
    const total = roundTo(counts.reduce((sum, count, i) => sum + count * values[i], 0), 2)
    return ask(
      ctx,
      L('Each mark is one measurement in inches. What is the total length?', 'Jede Marke ist eine Messung in Zoll. Wie lang ist die Summe?', 'Cada marca es una medida en pulgadas. ¿Cuál es la longitud total?'),
      { type: 'number', allowDecimal: true },
      { kind: 'number', value: total, tolerance: 0.001 },
      [
        L('Multiply each value by how many marks sit on it, then add.', 'Multipliziere jeden Wert mit der Anzahl der Marken und addiere.', 'Multiplica cada valor por cuántas marcas tiene y suma.'),
        L(`The total is ${n(total, 2).en} inches.`, `Die Summe ist ${n(total, 2).de} Zoll.`, `El total es ${n(total, 2).es} pulgadas.`),
      ],
      { type: 'dots', labels, counts },
    )
  }
  return ask(
    ctx,
    L(`How many measurements are at ${labels[index]}?`, `Wie viele Messungen liegen bei ${labels[index]}?`, `¿Cuántas medidas hay en ${labels[index]}?`),
    { type: 'number' },
    { kind: 'number', value: counts[index] },
    [
      L('Count the dots stacked above that label.', 'Zähle die Punkte über dieser Beschriftung.', 'Cuenta los puntos apilados sobre esa etiqueta.'),
      L(`There are ${n(counts[index]).en}.`, `Es sind ${n(counts[index]).de}.`, `Hay ${n(counts[index]).es}.`),
    ],
    { type: 'dots', labels, counts },
  )
}

export function g4mdC(ctx: Ctx) {
  if (ctx.mode === 'make') {
    const degrees = ctx.rng.int(2, 17) * 10
    return ask(
      ctx,
      L(`Build a ${n(degrees).en}° angle.`, `Baue einen Winkel von ${n(degrees).de}°.`, `Construye un ángulo de ${n(degrees).es}°.`),
      { type: 'angle' },
      { kind: 'angle', degrees, tolerance: 0 },
      [
        L('One ray stays on zero. Open the other ray until the measure matches.', 'Ein Strahl bleibt auf null. Öffne den anderen, bis das Maß stimmt.', 'Un rayo se queda en cero. Abre el otro hasta que la medida coincida.'),
        L(`${n(degrees).en}° is the opening you want.`, `${n(degrees).de}° ist die gewünschte Öffnung.`, `${n(degrees).es}° es la abertura que buscas.`),
      ],
    )
  }
  if (ctx.mode === 'missing') {
    const straight = ctx.rng.chance(0.5)
    const whole = straight ? 180 : 90
    const known = ctx.rng.int(15, whole - 15)
    const missing = whole - known
    return ask(
      ctx,
      straight
        ? L(`Two angles form a straight line. One measures ${n(known).en}°. What is the other?`, `Zwei Winkel bilden eine Gerade. Einer misst ${n(known).de}°. Wie groß ist der andere?`, `Dos ángulos forman una línea recta. Uno mide ${n(known).es}°. ¿Cuánto mide el otro?`)
        : L(`Two angles are complementary. One measures ${n(known).en}°. What is the other?`, `Zwei Winkel ergänzen sich zu 90°. Einer misst ${n(known).de}°. Wie groß ist der andere?`, `Dos ángulos son complementarios. Uno mide ${n(known).es}°. ¿Cuánto mide el otro?`),
      { type: 'number' },
      { kind: 'number', value: missing },
      [
        L(straight ? 'A straight angle measures 180°.' : 'Complementary angles add to 90°.', straight ? 'Ein gestreckter Winkel misst 180°.' : 'Komplementärwinkel ergeben zusammen 90°.', straight ? 'Un ángulo llano mide 180°.' : 'Los ángulos complementarios suman 90°.'),
        L(`${n(whole).en} − ${n(known).en} = ${n(missing).en}.`, `${n(whole).de} − ${n(known).de} = ${n(missing).de}.`, `${n(whole).es} − ${n(known).es} = ${n(missing).es}.`),
      ],
      { type: 'angle', degrees: known },
    )
  }
  if (ctx.mode === 'read') {
    const degrees = 10 + ctx.rng.int(0, 16) * 10
    return ask(
      ctx,
      L('Read the angle on the protractor.', 'Lies den Winkel am Winkelmesser ab.', 'Lee el ángulo en el transportador.'),
      { type: 'number' },
      { kind: 'number', value: degrees },
      [
        L('Start at 0 on the baseline and follow the ray to the numbered tick.', 'Beginne bei 0 auf der Grundlinie und folge dem Strahl zur beschrifteten Marke.', 'Empieza en 0 sobre la base y sigue el rayo hasta la marca numerada.'),
        L(`The ray lands on ${n(degrees).en}°.`, `Der Strahl trifft ${n(degrees).de}°.`, `El rayo cae en ${n(degrees).es}°.`),
      ],
      { type: 'protractor', degrees },
    )
  }
  const degrees = ctx.rng.pick([30, 55, 90, 120, 180])
  const name = degrees < 90 ? 'acute' : degrees === 90 ? 'right' : degrees < 180 ? 'obtuse' : 'straight'
  const labels: Record<string, Localized> = {
    acute: L('acute', 'spitz', 'agudo'),
    right: L('right', 'recht', 'recto'),
    obtuse: L('obtuse', 'stumpf', 'obtuso'),
    straight: L('straight', 'gestreckt', 'llano'),
  }
  const pack = textChoice(
    labels[name],
    Object.entries(labels).filter(([key]) => key !== name).map(([, label]) => label),
    ctx.rng,
  )
  return ask(
    ctx,
    L('What kind of angle is this?', 'Welche Art von Winkel ist das?', '¿Qué tipo de ángulo es este?'),
    { type: 'choice', options: pack.options },
    pack.answer,
    [
      L('Right is exactly 90°. Acute is smaller. Obtuse is between 90° and 180°. Straight is 180°.', 'Recht ist genau 90°. Spitz ist kleiner. Stumpf liegt zwischen 90° und 180°. Gestreckt ist 180°.', 'Recto es exactamente 90°. Agudo es menor. Obtuso está entre 90° y 180°. Llano es 180°.'),
      L(`This opening is ${labels[name].en}.`, `Diese Öffnung ist ${labels[name].de}.`, `Esta abertura es ${labels[name].es}.`),
    ],
    { type: 'angle', degrees },
  )
}

export function g4g(ctx: Ctx) {
  if (ctx.mode === 'parallel') {
    const pack = textChoice(
      L('trapezoid', 'Trapez', 'trapecio'),
      [L('scalene triangle', 'ungleichseitiges Dreieck', 'triángulo escaleno'), L('The figure with no straight sides would not, but here choose the one with exactly one pair.', 'Ein Kreis hätte keine, hier aber das mit genau einem Paar.', 'Un círculo no tendría, pero aquí el de exactamente un par.')],
      ctx.rng,
    )
    const better = textChoice(
      L('It has exactly one pair of parallel sides.', 'Es hat genau ein Paar paralleler Seiten.', 'Tiene exactamente un par de lados paralelos.'),
      [
        L('It has no parallel sides.', 'Es hat keine parallelen Seiten.', 'No tiene lados paralelos.'),
        L('All of its sides are curved.', 'Alle Seiten sind gebogen.', 'Todos sus lados son curvos.'),
        L('It has three pairs of parallel sides.', 'Es hat drei Paare paralleler Seiten.', 'Tiene tres pares de lados paralelos.'),
      ],
      ctx.rng,
    )
    void pack
    return ask(
      ctx,
      L('Which sentence describes this trapezoid?', 'Welcher Satz beschreibt dieses Trapez?', '¿Cuál oración describe este trapecio?'),
      { type: 'choice', options: better.options },
      better.answer,
      [
        L('A trapezoid has exactly one pair of parallel sides.', 'Ein Trapez hat genau ein Paar paralleler Seiten.', 'Un trapecio tiene exactamente un par de lados paralelos.'),
        L('The other sentences describe different figures.', 'Die anderen Sätze beschreiben andere Figuren.', 'Las otras oraciones describen figuras distintas.'),
      ],
      { type: 'shape', shape: 'trapezoid' },
    )
  }
  if (ctx.mode === 'classify') {
    const pack = textChoice(
      L('rectangle', 'Rechteck', 'rectángulo'),
      [L('scalene triangle', 'ungleichseitiges Dreieck', 'triángulo escaleno'), L('pentagon', 'Fünfeck', 'pentágono'), L('A shape with no right angles', 'Eine Figur ohne rechte Winkel', 'Una figura sin ángulos rectos')],
      ctx.rng,
    )
    return ask(
      ctx,
      L('Which figure has four right angles?', 'Welche Figur hat vier rechte Winkel?', '¿Cuál figura tiene cuatro ángulos rectos?'),
      { type: 'choice', options: pack.options },
      pack.answer,
      [
        L('A rectangle’s corners are all right angles.', 'Die Ecken eines Rechtecks sind alle rechte Winkel.', 'Las esquinas de un rectángulo son todos ángulos rectos.'),
        L('A square is a special rectangle, and it also qualifies.', 'Ein Quadrat ist ein besonderes Rechteck und zählt ebenfalls.', 'Un cuadrado es un rectángulo especial y también cuenta.'),
      ],
    )
  }
  const pool = ctx.difficulty < 3 ? SYMMETRY.slice(0, 4) : SYMMETRY
  const item = ctx.rng.pick(pool)
  return ask(
    ctx,
    L('How many lines of symmetry does this figure have?', 'Wie viele Symmetrieachsen hat diese Figur?', '¿Cuántos ejes de simetría tiene esta figura?'),
    { type: 'number' },
    { kind: 'number', value: item.lines },
    [
      L('A line of symmetry folds the figure onto itself.', 'Eine Symmetrieachse faltet die Figur auf sich selbst.', 'Un eje de simetría dobla la figura sobre sí misma.'),
      L(`This figure has ${n(item.lines).en} line${item.lines === 1 ? '' : 's'} of symmetry.`, `Diese Figur hat ${n(item.lines).de} Symmetrieachse${item.lines === 1 ? '' : 'n'}.`, `Esta figura tiene ${n(item.lines).es} eje${item.lines === 1 ? '' : 's'} de simetría.`),
    ],
    { type: 'shape', shape: item.shape },
  )
}

