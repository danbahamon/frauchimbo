import { distractors, gcd, lcm, roundHalfUp, roundTo } from '../lib/math'
import type { Localized } from '../lib/types'
import { PALETTE } from '../lib/types'
import {
  ask,
  expression,
  familyOf,
  frac,
  knobBool,
  knobFlag,
  knobNum,
  L,
  n,
  pickedChoice,
  reduced,
  scene,
  simplify,
  textChoice,
  type Ctx,
} from './shared'

function timePair(ctx: Ctx) {
  const five = knobBool(ctx, 'fives', ctx.difficulty < 3)
  const h = ctx.rng.int(1, 12)
  const m = five ? ctx.rng.int(0, 11) * 5 : ctx.rng.int(0, 59)
  return { h, m }
}

function clockText(h: number, m: number): Localized {
  const label = `${h}:${String(m).padStart(2, '0')}`
  return L(label, label, label)
}

function addWithin(ctx: Ctx, digits: number, cap?: number) {
  const lo = 10 ** (digits - 1)
  const hi = 10 ** digits - 1
  let a = ctx.rng.int(lo, hi)
  let b = ctx.rng.int(lo, hi)
  if (cap) {
    // Both addends stay small enough that their sum is at or under the cap. A cap of 1,000 gives the classic 120 to 700 range.
    const low = Math.min(120, Math.floor(cap / 5))
    a = ctx.rng.int(low, Math.max(low, Math.min(700, cap - 80)))
    b = ctx.rng.int(Math.min(40, Math.floor(cap / 4)), Math.max(10, cap - a))
  }
  return { a, b, sum: a + b }
}

export function g3oaA(ctx: Ctx) {
  const max = knobNum(ctx, 'max', 9)
  const mode = ctx.mode === 'mixed' ? (ctx.rng.chance(0.5) ? 'mul' : 'div') : ctx.mode
  const b = ctx.rng.int(2, max)
  const a = ctx.rng.int(2, max)
  if (mode === 'div') {
    const total = a * b
    return ask(
      ctx,
      L(
        `Luma has ${n(total).en} sea-glass beads and shares them equally into ${n(a).en} tins. How many beads go in each tin?`,
        `Luma hat ${n(total).de} Meerglas-Perlen und verteilt sie gleichmäßig auf ${n(a).de} Dosen. Wie viele Perlen sind in jeder Dose?`,
        `Luma tiene ${n(total).es} cuentas de vidrio marino y las reparte en partes iguales en ${n(a).es} latas. ¿Cuántas cuentas van en cada lata?`,
      ),
      { type: 'number' },
      { kind: 'number', value: b },
      [
        L(
          `${n(total).en} shared into ${n(a).en} equal groups is ${n(total).en} ÷ ${n(a).en}.`,
          `${n(total).de} in ${n(a).de} gleiche Gruppen ist ${n(total).de} ÷ ${n(a).de}.`,
          `${n(total).es} en ${n(a).es} grupos iguales es ${n(total).es} ÷ ${n(a).es}.`,
        ),
        L(`${n(a).en} × ${n(b).en} = ${n(total).en}, so each tin gets ${n(b).en}.`, `${n(a).de} × ${n(b).de} = ${n(total).de}, also bekommt jede Dose ${n(b).de}.`, `${n(a).es} × ${n(b).es} = ${n(total).es}, así que cada lata recibe ${n(b).es}.`),
      ],
      scene('bay'),
    )
  }
  return ask(
    ctx,
    L(
      `Pico packs ${n(a).en} baskets with ${n(b).en} oranges in each. How many oranges is that?`,
      `Pico packt ${n(a).de} Körbe mit je ${n(b).de} Orangen. Wie viele Orangen sind das?`,
      `Pico empaca ${n(a).es} canastas con ${n(b).es} naranjas cada una. ¿Cuántas naranjas son?`,
    ),
    { type: 'number' },
    { kind: 'number', value: a * b },
    [
      L(`${n(a).en} groups of ${n(b).en} is ${n(a).en} × ${n(b).en}.`, `${n(a).de} Gruppen zu ${n(b).de} sind ${n(a).de} × ${n(b).de}.`, `${n(a).es} grupos de ${n(b).es} es ${n(a).es} × ${n(b).es}.`),
      L(`${n(a).en} × ${n(b).en} = ${n(a * b).en}.`, `${n(a).de} × ${n(b).de} = ${n(a * b).de}.`, `${n(a).es} × ${n(b).es} = ${n(a * b).es}.`),
    ],
    scene('market'),
  )
}

export function g3oaB(ctx: Ctx) {
  const top = knobNum(ctx, 'max', 9)
  const a = ctx.rng.int(3, top)
  const b = ctx.rng.int(3, top)
  if (ctx.mode === 'comm') {
    const pack = textChoice(
      L(`${n(a).en} × ${n(b).en} = ${n(b).en} × ${n(a).en}`, `${n(a).de} × ${n(b).de} = ${n(b).de} × ${n(a).de}`, `${n(a).es} × ${n(b).es} = ${n(b).es} × ${n(a).es}`),
      [
        L(`${n(a).en} × ${n(b).en} = ${n(a).en} + ${n(b).en}`, `${n(a).de} × ${n(b).de} = ${n(a).de} + ${n(b).de}`, `${n(a).es} × ${n(b).es} = ${n(a).es} + ${n(b).es}`),
        L(`${n(a).en} × ${n(b).en} = ${n(a + 1).en} × ${n(b).en}`, `${n(a).de} × ${n(b).de} = ${n(a + 1).de} × ${n(b).de}`, `${n(a).es} × ${n(b).es} = ${n(a + 1).es} × ${n(b).es}`),
        L(`${n(a).en} + ${n(b).en} = ${n(b).en} + ${n(a + 2).en}`, `${n(a).de} + ${n(b).de} = ${n(b).de} + ${n(a + 2).de}`, `${n(a).es} + ${n(b).es} = ${n(b).es} + ${n(a + 2).es}`),
      ],
      ctx.rng,
    )
    return ask(
      ctx,
      L('Which equation shows the commutative property?', 'Welche Gleichung zeigt das Kommutativgesetz?', '¿Cuál ecuación muestra la propiedad conmutativa?'),
      { type: 'choice', options: pack.options },
      pack.answer,
      [
        L('The commutative property lets the factors trade places. The product stays the same.', 'Das Kommutativgesetz lässt die Faktoren die Plätze tauschen. Das Produkt bleibt gleich.', 'La propiedad conmutativa deja que los factores cambien de lugar. El producto sigue igual.'),
        L(`${n(a).en} × ${n(b).en} and ${n(b).en} × ${n(a).en} are the same multiplication.`, `${n(a).de} × ${n(b).de} und ${n(b).de} × ${n(a).de} sind dieselbe Multiplikation.`, `${n(a).es} × ${n(b).es} y ${n(b).es} × ${n(a).es} son la misma multiplicación.`),
      ],
    )
  }
  if (ctx.mode === 'dist') {
    const split = ctx.rng.int(2, b - 1)
    const rest = b - split
    return ask(
      ctx,
      L(
        `${n(a).en} × ${n(b).en} = ${n(a).en} × (${n(split).en} + ${n(rest).en}) = (${n(a).en} × ${n(split).en}) + (${n(a).en} × ?). What is the missing factor?`,
        `${n(a).de} × ${n(b).de} = ${n(a).de} × (${n(split).de} + ${n(rest).de}) = (${n(a).de} × ${n(split).de}) + (${n(a).de} × ?). Welcher Faktor fehlt?`,
        `${n(a).es} × ${n(b).es} = ${n(a).es} × (${n(split).es} + ${n(rest).es}) = (${n(a).es} × ${n(split).es}) + (${n(a).es} × ?). ¿Cuál es el factor que falta?`,
      ),
      { type: 'number' },
      { kind: 'number', value: rest },
      [
        L(`${n(b).en} was split into ${n(split).en} + ${n(rest).en}.`, `${n(b).de} wurde in ${n(split).de} + ${n(rest).de} zerlegt.`, `${n(b).es} se partió en ${n(split).es} + ${n(rest).es}.`),
        L(`The missing factor is ${n(rest).en}. Check: ${n(a * split).en} + ${n(a * rest).en} = ${n(a * b).en}.`, `Der fehlende Faktor ist ${n(rest).de}. Probe: ${n(a * split).de} + ${n(a * rest).de} = ${n(a * b).de}.`, `El factor que falta es ${n(rest).es}. Prueba: ${n(a * split).es} + ${n(a * rest).es} = ${n(a * b).es}.`),
      ],
    )
  }
  return ask(
    ctx,
    L(`Find the missing factor: ${n(a).en} × ? = ${n(a * b).en}`, `Finde den fehlenden Faktor: ${n(a).de} × ? = ${n(a * b).de}`, `Halla el factor que falta: ${n(a).es} × ? = ${n(a * b).es}`),
    { type: 'number' },
    { kind: 'number', value: b },
    [
      L(`Ask: what times ${n(a).en} gives ${n(a * b).en}?`, `Frage: was mal ${n(a).de} ergibt ${n(a * b).de}?`, `Pregunta: ¿qué por ${n(a).es} da ${n(a * b).es}?`),
      L(`${n(a * b).en} ÷ ${n(a).en} = ${n(b).en}.`, `${n(a * b).de} ÷ ${n(a).de} = ${n(b).de}.`, `${n(a * b).es} ÷ ${n(a).es} = ${n(b).es}.`),
    ],
    expression([{ t: 'v', value: a }, { t: 'op', v: '×' }, { t: 'op', v: '?' }, { t: 'op', v: '=' }, { t: 'v', value: a * b }]),
  )
}

export function g3oaC(ctx: Ctx) {
  const max = knobNum(ctx, 'max', 10)
  const mode = ctx.mode === 'mixed' ? (ctx.rng.chance(0.5) ? 'mul' : 'div') : ctx.mode
  const a = ctx.rng.int(2, max)
  const b = ctx.rng.int(2, max)
  if (mode === 'div') {
    return ask(
      ctx,
      L(`What is ${n(a * b).en} ÷ ${n(a).en}?`, `Wie viel ist ${n(a * b).de} ÷ ${n(a).de}?`, `¿Cuánto es ${n(a * b).es} ÷ ${n(a).es}?`),
      { type: 'number' },
      { kind: 'number', value: b },
      [
        L(`${n(a).en} × ${n(b).en} = ${n(a * b).en}, so the quotient is ${n(b).en}.`, `${n(a).de} × ${n(b).de} = ${n(a * b).de}, also ist der Quotient ${n(b).de}.`, `${n(a).es} × ${n(b).es} = ${n(a * b).es}, así que el cociente es ${n(b).es}.`),
      ],
      expression([{ t: 'v', value: a * b }, { t: 'op', v: '÷' }, { t: 'v', value: a }]),
    )
  }
  return ask(
    ctx,
    L(`What is ${n(a).en} × ${n(b).en}?`, `Wie viel ist ${n(a).de} × ${n(b).de}?`, `¿Cuánto es ${n(a).es} × ${n(b).es}?`),
    { type: 'number' },
    { kind: 'number', value: a * b },
    [L(`${n(a).en} groups of ${n(b).en} make ${n(a * b).en}.`, `${n(a).de} Gruppen zu ${n(b).de} ergeben ${n(a * b).de}.`, `${n(a).es} grupos de ${n(b).es} hacen ${n(a * b).es}.`)],
    expression([{ t: 'v', value: a }, { t: 'op', v: '×' }, { t: 'v', value: b }]),
  )
}

export function g3oaD(ctx: Ctx) {
  if (ctx.mode === 'pattern') {
    const start = ctx.rng.int(2, 12)
    const step = ctx.rng.int(2, Math.max(2, knobNum(ctx, 'max', 9) - 1))
    const seq = [0, 1, 2, 3].map((i) => start + i * step)
    const next = start + 4 * step
    return ask(
      ctx,
      L(
        `The pattern is ${seq.map((v) => n(v).en).join(', ')}, …. What number comes next?`,
        `Das Muster ist ${seq.map((v) => n(v).de).join(', ')}, …. Welche Zahl kommt als Nächstes?`,
        `El patrón es ${seq.map((v) => n(v).es).join(', ')}, …. ¿Qué número sigue?`,
      ),
      { type: 'number' },
      { kind: 'number', value: next },
      [
        L(`Each term grows by ${n(step).en}.`, `Jedes Glied wächst um ${n(step).de}.`, `Cada término crece en ${n(step).es}.`),
        L(`${n(seq[3]).en} + ${n(step).en} = ${n(next).en}.`, `${n(seq[3]).de} + ${n(step).de} = ${n(next).de}.`, `${n(seq[3]).es} + ${n(step).es} = ${n(next).es}.`),
      ],
    )
  }
  const bags = ctx.rng.int(3, Math.max(3, knobNum(ctx, 'max', 9) - 1))
  const each = ctx.rng.int(3, knobNum(ctx, 'max', 9))
  const give = ctx.rng.int(2, bags * each - 2)
  const left = bags * each - give
  return ask(
    ctx,
    L(
      `Otto fills ${n(bags).en} jars with ${n(each).en} shells each, then gives away ${n(give).en}. How many shells remain?`,
      `Otto füllt ${n(bags).de} Gläser mit je ${n(each).de} Muscheln und verschenkt dann ${n(give).de}. Wie viele Muscheln bleiben?`,
      `Otto llena ${n(bags).es} frascos con ${n(each).es} conchas cada uno y luego regala ${n(give).es}. ¿Cuántas conchas quedan?`,
    ),
    { type: 'number' },
    { kind: 'number', value: left },
    [
      L(`First, ${n(bags).en} × ${n(each).en} = ${n(bags * each).en} shells.`, `Zuerst: ${n(bags).de} × ${n(each).de} = ${n(bags * each).de} Muscheln.`, `Primero, ${n(bags).es} × ${n(each).es} = ${n(bags * each).es} conchas.`),
      L(`Then ${n(bags * each).en} − ${n(give).en} = ${n(left).en}.`, `Dann ${n(bags * each).de} − ${n(give).de} = ${n(left).de}.`, `Luego ${n(bags * each).es} − ${n(give).es} = ${n(left).es}.`),
    ],
    scene('bay'),
  )
}

export function g3nbt(ctx: Ctx) {
  if (ctx.mode === 'round') {
    const cap = knobNum(ctx, 'within', 1000)
    // Hundreds need room, so below 300 the rounding is to the nearest ten.
    const place = cap >= 300 ? ctx.rng.pick([10, 100]) : 10
    let value = ctx.rng.int(Math.min(120, Math.floor(cap / 8)), cap - 20)
    const digit = Math.floor(value / (place / 10)) % 10
    if (digit === 5) value += 1
    const rounded = roundHalfUp(value, place)
    const placeName = place === 10
      ? L('ten', 'Zehner', 'decena')
      : L('hundred', 'Hunderter', 'centena')
    return ask(
      ctx,
      L(`Round ${n(value).en} to the nearest ${placeName.en}.`, `Runde ${n(value).de} auf den nächsten ${placeName.de}.`, `Redondea ${n(value).es} a la ${placeName.es} más cercana.`),
      { type: 'number' },
      { kind: 'number', value: rounded },
      [
        L(
          `Look at the digit just after the ${placeName.en}. It decides whether you stay or climb.`,
          `Schau auf die Ziffer direkt nach dem ${placeName.de}. Sie entscheidet, ob du bleibst oder aufsteigst.`,
          `Mira la cifra justo después de la ${placeName.es}. Ella decide si te quedas o subes.`,
        ),
        L(`${n(value).en} rounds to ${n(rounded).en}.`, `${n(value).de} wird zu ${n(rounded).de} gerundet.`, `${n(value).es} se redondea a ${n(rounded).es}.`),
      ],
    )
  }
  if (ctx.mode === 'times10') {
    const a = ctx.rng.int(2, 9)
    const tens = ctx.rng.int(1, 9) * 10
    return ask(
      ctx,
      L(`What is ${n(a).en} × ${n(tens).en}?`, `Wie viel ist ${n(a).de} × ${n(tens).de}?`, `¿Cuánto es ${n(a).es} × ${n(tens).es}?`),
      { type: 'number' },
      { kind: 'number', value: a * tens },
      [
        L(`${n(tens).en} is ${n(tens / 10).en} tens.`, `${n(tens).de} sind ${n(tens / 10).de} Zehner.`, `${n(tens).es} son ${n(tens / 10).es} decenas.`),
        L(`${n(a).en} × ${n(tens / 10).en} = ${n((a * tens) / 10).en}, then attach the ten: ${n(a * tens).en}.`, `${n(a).de} × ${n(tens / 10).de} = ${n((a * tens) / 10).de}, dann den Zehner anhängen: ${n(a * tens).de}.`, `${n(a).es} × ${n(tens / 10).es} = ${n((a * tens) / 10).es}, luego une la decena: ${n(a * tens).es}.`),
      ],
      expression([{ t: 'v', value: a }, { t: 'op', v: '×' }, { t: 'v', value: tens }]),
    )
  }
  const cap = knobNum(ctx, 'within', 1000)
  const pack = addWithin(ctx, 3, cap)
  if (ctx.mode === 'sub') {
    const top = Math.min(400, Math.floor(cap * 0.4))
    const a = ctx.rng.int(top, cap - 20)
    const b = ctx.rng.int(Math.min(120, Math.floor(top / 3)), a - 15)
    return ask(
      ctx,
      L(`Find the difference.`, `Bestimme die Differenz.`, `Halla la diferencia.`),
      { type: 'number' },
      { kind: 'number', value: a - b },
      [
        L(`Line up the ones, tens, and hundreds. Regroup when a column cannot spare the amount.`, `Richte Einer, Zehner und Hunderter aus. Bündle um, wenn eine Spalte nicht genug hergibt.`, `Alinea unidades, decenas y centenas. Reagrupa cuando una columna no alcanza.`),
        L(`${n(a).en} − ${n(b).en} = ${n(a - b).en}.`, `${n(a).de} − ${n(b).de} = ${n(a - b).de}.`, `${n(a).es} − ${n(b).es} = ${n(a - b).es}.`),
      ],
      expression([{ t: 'v', value: a }, { t: 'op', v: '−' }, { t: 'v', value: b }]),
    )
  }
  return ask(
    ctx,
    L('Find the sum.', 'Bestimme die Summe.', 'Halla la suma.'),
    { type: 'number' },
    { kind: 'number', value: pack.sum },
    [
      L('Add from the ones. If a column reaches 10 or more, carry one to the next place.', 'Addiere von den Einern. Erreicht eine Spalte 10 oder mehr, übertrage eins in die nächste Stelle.', 'Suma desde las unidades. Si una columna llega a 10 o más, lleva uno al lugar siguiente.'),
      L(`${n(pack.a).en} + ${n(pack.b).en} = ${n(pack.sum).en}.`, `${n(pack.a).de} + ${n(pack.b).de} = ${n(pack.sum).de}.`, `${n(pack.a).es} + ${n(pack.b).es} = ${n(pack.sum).es}.`),
    ],
    expression([{ t: 'v', value: pack.a }, { t: 'op', v: '+' }, { t: 'v', value: pack.b }]),
  )
}

function denom(ctx: Ctx) {
  const cap = knobNum(ctx, 'den', 6)
  const options = [2, 3, 4, 6, 8].filter((d) => d <= cap)
  return ctx.rng.pick(options.length ? options : [2, 4])
}

export function g3nf(ctx: Ctx) {
  const d = denom(ctx)
  const numer = ctx.rng.int(1, d - 1)
  if (ctx.mode === 'shade') {
    const cols = d
    return ask(
      ctx,
      L(`Shade ${frac(0, numer, d)} of the bar.`, `Färbe ${frac(0, numer, d)} des Streifens.`, `Sombrea ${frac(0, numer, d)} de la barra.`),
      { type: 'shade', rows: 1, cols },
      { kind: 'shade', count: numer },
      [
        L(`The bar has ${n(cols).en} equal parts. One part is ${frac(0, 1, d)}.`, `Der Streifen hat ${n(cols).de} gleiche Teile. Ein Teil ist ${frac(0, 1, d)}.`, `La barra tiene ${n(cols).es} partes iguales. Una parte es ${frac(0, 1, d)}.`),
        L(`Shade ${n(numer).en} of those parts.`, `Färbe ${n(numer).de} dieser Teile.`, `Sombrea ${n(numer).es} de esas partes.`),
      ],
    )
  }
  if (ctx.mode === 'name') {
    return ask(
      ctx,
      L('What fraction of the bar is shaded? Use simplest form if you can.', 'Welcher Bruch des Streifens ist gefärbt? Nimm die kürzeste Form, wenn du kannst.', '¿Qué fracción de la barra está sombreada? Usa la forma más simple si puedes.'),
      { type: 'fraction' },
      { kind: 'fraction', n: numer, d, simplified: false },
      [
        L(`${n(numer).en} of ${n(d).en} equal parts are shaded.`, `${n(numer).de} von ${n(d).de} gleichen Teilen sind gefärbt.`, `${n(numer).es} de ${n(d).es} partes iguales están sombreadas.`),
        L(`That fraction is ${frac(0, numer, d)}.`, `Dieser Bruch ist ${frac(0, numer, d)}.`, `Esa fracción es ${frac(0, numer, d)}.`),
      ],
      { type: 'grid', rows: 1, cols: d, shaded: numer },
    )
  }
  if (ctx.mode === 'line') {
    return ask(
      ctx,
      L(`Place ${frac(0, numer, d)} on the number line.`, `Setze ${frac(0, numer, d)} auf den Zahlenstrahl.`, `Ubica ${frac(0, numer, d)} en la recta numérica.`),
      { type: 'numberline', min: 0, max: 1, step: 1 / d, fraction: true },
      { kind: 'number', value: numer / d, tolerance: 0.001 },
      [
        L(`The segment from 0 to 1 is split into ${n(d).en} equal jumps.`, `Die Strecke von 0 bis 1 ist in ${n(d).de} gleiche Sprünge geteilt.`, `El tramo de 0 a 1 está partido en ${n(d).es} saltos iguales.`),
        L(`Count ${n(numer).en} jump${numer === 1 ? '' : 's'} from 0.`, `Zähle ${n(numer).de} Sprung von 0.`.replace('Sprung', numer === 1 ? 'Sprung' : 'Sprünge'), `Cuenta ${n(numer).es} salto${numer === 1 ? '' : 's'} desde 0.`),
      ],
    )
  }
  if (ctx.mode === 'equiv') {
    const k = ctx.rng.int(2, 3)
    return ask(
      ctx,
      L(
        `Write a fraction equal to ${frac(0, numer, d)} with denominator ${n(d * k).en}.`,
        `Schreibe einen Bruch gleich ${frac(0, numer, d)} mit dem Nenner ${n(d * k).de}.`,
        `Escribe una fracción igual a ${frac(0, numer, d)} con denominador ${n(d * k).es}.`,
      ),
      { type: 'fraction' },
      { kind: 'fraction', n: numer * k, d: d * k, simplified: false },
      [
        L(`Multiply the numerator and the denominator by ${n(k).en}.`, `Multipliziere Zähler und Nenner mit ${n(k).de}.`, `Multiplica el numerador y el denominador por ${n(k).es}.`),
        L(`${frac(0, numer, d)} = ${frac(0, numer * k, d * k)}.`, `${frac(0, numer, d)} = ${frac(0, numer * k, d * k)}.`, `${frac(0, numer, d)} = ${frac(0, numer * k, d * k)}.`),
      ],
    )
  }
  let d2 = denom(ctx)
  let guard = 0
  while (d2 === d && guard < 5) {
    d2 = denom(ctx)
    guard += 1
  }
  const n2 = ctx.rng.int(1, d2 - 1)
  const left = numer / d
  const right = n2 / d2
  const sign = left === right ? '=' : left < right ? '<' : '>'
  return ask(
    ctx,
    L('Choose the sign that makes the sentence true.', 'Wähle das Zeichen, das den Satz wahr macht.', 'Elige el signo que hace verdadera la oración.'),
    { type: 'compare', left: L(frac(0, numer, d), frac(0, numer, d), frac(0, numer, d)), right: L(frac(0, n2, d2), frac(0, n2, d2), frac(0, n2, d2)) },
    { kind: 'compare', sign },
    [
      L('Give the fractions a common denominator, or compare them to one half.', 'Gib den Brüchen einen gemeinsamen Nenner oder vergleiche sie mit einem Halben.', 'Dales un denominador común, o compáralas con un medio.'),
      L(`${frac(0, numer, d)} ${sign} ${frac(0, n2, d2)}.`, `${frac(0, numer, d)} ${sign} ${frac(0, n2, d2)}.`, `${frac(0, numer, d)} ${sign} ${frac(0, n2, d2)}.`),
    ],
  )
}

export function g3mdA(ctx: Ctx) {
  const clock = timePair(ctx)
  if (ctx.mode === 'set') {
    return ask(
      ctx,
      L(`Set the clock to ${clockText(clock.h, clock.m).en}.`, `Stelle die Uhr auf ${clockText(clock.h, clock.m).de}.`, `Pon el reloj en ${clockText(clock.h, clock.m).es}.`),
      { type: 'clock' },
      { kind: 'clock', h: clock.h, m: clock.m },
      [
        L('The short hand is the hour hand. It moves as the minutes pass.', 'Der kurze Zeiger ist der Stundenzeiger. Er wandert mit den Minuten.', 'La manecilla corta es la de las horas. Se mueve con los minutos.'),
        L(`The long hand points at ${n(clock.m).en} minutes.`, `Der lange Zeiger zeigt auf ${n(clock.m).de} Minuten.`, `La manecilla larga marca ${n(clock.m).es} minutos.`),
      ],
    )
  }
  if (ctx.mode === 'elapsed') {
    const add = ctx.rng.int(10, 50)
    const total = clock.h * 60 + clock.m + add
    const h = Math.floor(total / 60) % 12 || 12
    const m = total % 60
    return ask(
      ctx,
      L(
        `Nia starts reading at ${clockText(clock.h, clock.m).en} and reads for ${n(add).en} minutes. What time does she finish?`,
        `Nia beginnt um ${clockText(clock.h, clock.m).de} zu lesen und liest ${n(add).de} Minuten. Um wie viel Uhr ist sie fertig?`,
        `Nia empieza a leer a las ${clockText(clock.h, clock.m).es} y lee durante ${n(add).es} minutos. ¿A qué hora termina?`,
      ),
      { type: 'clock' },
      { kind: 'clock', h, m },
      [
        L(`Add the minutes: ${n(clock.m).en} + ${n(add).en} = ${n(clock.m + add).en}.`, `Addiere die Minuten: ${n(clock.m).de} + ${n(add).de} = ${n(clock.m + add).de}.`, `Suma los minutos: ${n(clock.m).es} + ${n(add).es} = ${n(clock.m + add).es}.`),
        L(
          clock.m + add >= 60
            ? `That is more than 60, so the hour advances. The finish time is ${clockText(h, m).en}.`
            : `The hour stays. The finish time is ${clockText(h, m).en}.`,
          clock.m + add >= 60
            ? `Das ist mehr als 60, also rückt die Stunde vor. Die Endzeit ist ${clockText(h, m).de}.`
            : `Die Stunde bleibt. Die Endzeit ist ${clockText(h, m).de}.`,
          clock.m + add >= 60
            ? `Eso pasa de 60, así que la hora avanza. La hora final es ${clockText(h, m).es}.`
            : `La hora se queda. La hora final es ${clockText(h, m).es}.`,
        ),
      ],
      scene('sky'),
    )
  }
  if (ctx.mode === 'mass') {
    const pack = textChoice(
      L('4 kilograms', '4 Kilogramm', '4 kilogramos'),
      [L('4 grams', '4 Gramm', '4 gramos'), L('4 liters', '4 Liter', '4 litros'), L('400 kilograms', '400 Kilogramm', '400 kilogramos')],
      ctx.rng,
    )
    return ask(
      ctx,
      L('Which is the best estimate for the mass of a cat?', 'Was ist die beste Schätzung für die Masse einer Katze?', '¿Cuál es la mejor estimación para la masa de un gato?'),
      { type: 'choice', options: pack.options },
      pack.answer,
      [
        L('A gram is about a paperclip. A kilogram is about a pineapple.', 'Ein Gramm ist ungefähr eine Büroklammer. Ein Kilogramm ist ungefähr eine Ananas.', 'Un gramo es como un clip. Un kilogramo es como una piña.'),
        L('A cat is several kilograms, not grams, and mass is not measured in liters.', 'Eine Katze wiegt einige Kilogramm, nicht Gramm, und Masse wird nicht in Litern gemessen.', 'Un gato pesa varios kilogramos, no gramos, y la masa no se mide en litros.'),
      ],
    )
  }
  return ask(
    ctx,
    L('What time does the clock show? Enter the hour and the minute.', 'Welche Zeit zeigt die Uhr? Gib Stunde und Minute ein.', '¿Qué hora marca el reloj? Escribe la hora y el minuto.'),
    {
      type: 'multi',
      fields: [
        { id: 'h', label: L('Hour', 'Stunde', 'Hora') },
        { id: 'm', label: L('Minute', 'Minute', 'Minuto') },
      ],
    },
    { kind: 'multi', parts: { h: clock.h, m: clock.m } },
    [
      L('The short hand tells the hour. If it is between two numbers, the hour is the one it already passed.', 'Der kurze Zeiger nennt die Stunde. Steht er zwischen zwei Zahlen, ist die Stunde die, die er schon verlassen hat.', 'La manecilla corta dice la hora. Si está entre dos números, la hora es el que ya pasó.'),
      L(`The long hand shows ${n(clock.m).en} minutes, so the time is ${clockText(clock.h, clock.m).en}.`, `Der lange Zeiger zeigt ${n(clock.m).de} Minuten, also ist es ${clockText(clock.h, clock.m).de}.`, `La manecilla larga marca ${n(clock.m).es} minutos, así que son las ${clockText(clock.h, clock.m).es}.`),
    ],
    { type: 'clock', h: clock.h, m: clock.m },
  )
}

const CHART_LABELS: Localized[][] = [
  [L('Snails', 'Schnecken', 'Caracoles'), L('Birds', 'Vögel', 'Pájaros'), L('Otters', 'Otter', 'Nutrias')],
  [L('Shells', 'Muscheln', 'Conchas'), L('Stones', 'Steine', 'Piedras'), L('Leaves', 'Blätter', 'Hojas')],
  [L('Bread', 'Brot', 'Pan'), L('Pears', 'Birnen', 'Peras'), L('Honey', 'Honig', 'Miel')],
]

export function g3mdB(ctx: Ctx) {
  const labels = ctx.rng.pick(CHART_LABELS)
  const values = [ctx.rng.int(2, 8), ctx.rng.int(1, 9), ctx.rng.int(2, 7)]
  const axisMax = values.some((v) => v > 8) ? 10 : 8
  if (ctx.mode === 'build') {
    const teal = PALETTE.find((color) => color.id === 'teal')?.hex ?? '#0f766e'
    const tallest = Math.max(...values)
    const fit = [5, 8, 10, 12].find((axis) => axis >= tallest) ?? 12
    return ask(
      ctx,
      L(
        `${labels.map((label, index) => `${label.en}: ${n(values[index]).en}`).join(' · ')}. Build the bar graph. Color the middle bar teal, and choose a scale that fits.`,
        `${labels.map((label, index) => `${label.de}: ${n(values[index]).de}`).join(' · ')}. Baue das Säulendiagramm. Färbe die mittlere Säule petrol und wähle eine passende Skala.`,
        `${labels.map((label, index) => `${label.es}: ${n(values[index]).es}`).join(' · ')}. Construye la gráfica. Colorea la barra del medio verde azulado y elige una escala que quepa.`,
      ),
      { type: 'chart-build', labels, axisChoices: [5, 8, 10, 12], maxValue: 12 },
      { kind: 'chart', values, colors: [null, teal, null], axisMax: fit, axisAtLeast: tallest },
      [
        L('Each bar’s height is the count in the table. The scale must reach the tallest bar.', 'Die Höhe jeder Säule ist die Anzahl in der Tabelle. Die Skala muss die höchste Säule erreichen.', 'La altura de cada barra es la cantidad de la tabla. La escala debe alcanzar la barra más alta.'),
        L(`The values are ${values.map((v) => n(v).en).join(', ')}.`, `Die Werte sind ${values.map((v) => n(v).de).join(', ')}.`, `Los valores son ${values.map((v) => n(v).es).join(', ')}.`),
      ],
      undefined,
    )
  }
  let i = 0
  let j = 1
  if (values[1] > values[i]) i = 1
  if (values[2] > values[i]) i = 2
  j = [0, 1, 2].find((index) => index !== i) ?? 0
  const diff = values[i] - values[j]
  const askMore = ctx.rng.chance(0.5)
  if (askMore) {
    return ask(
      ctx,
      L(
        `How many more ${labels[i].en} than ${labels[j].en}?`,
        `Um wie viele gibt es mehr ${labels[i].de} als ${labels[j].de}?`,
        `¿Cuántos ${labels[i].es} más hay que ${labels[j].es}?`,
      ),
      { type: 'number' },
      { kind: 'number', value: Math.abs(diff) },
      [
        L(`Read the two bars: ${n(values[i]).en} and ${n(values[j]).en}.`, `Lies die beiden Säulen: ${n(values[i]).de} und ${n(values[j]).de}.`, `Lee las dos barras: ${n(values[i]).es} y ${n(values[j]).es}.`),
        L(`The difference is ${n(Math.abs(diff)).en}.`, `Die Differenz ist ${n(Math.abs(diff)).de}.`, `La diferencia es ${n(Math.abs(diff)).es}.`),
      ],
      { type: 'chart', labels, values, colors: ['#e25b45', '#0f766e', '#e0a100'], axisMax, unit: L('count', 'Anzahl', 'cantidad') },
    )
  }
  return ask(
    ctx,
    L(`How many ${labels[i].en} are shown?`, `Wie viele ${labels[i].de} sind gezeigt?`, `¿Cuántos ${labels[i].es} se muestran?`),
    { type: 'number' },
    { kind: 'number', value: values[i] },
    [
      L('Match the bar to its label, then read the height against the axis.', 'Ordne die Säule ihrer Beschriftung zu und lies die Höhe an der Achse ab.', 'Empareja la barra con su etiqueta y lee la altura en el eje.'),
      L(`The bar reaches ${n(values[i]).en}.`, `Die Säule reicht bis ${n(values[i]).de}.`, `La barra llega a ${n(values[i]).es}.`),
    ],
    { type: 'chart', labels, values, colors: ['#e25b45', '#0f766e', '#e0a100'], axisMax, unit: L('count', 'Anzahl', 'cantidad') },
  )
}

export function g3mdC(ctx: Ctx) {
  const top = knobNum(ctx, 'max', 9)
  const w = ctx.rng.int(2, top)
  const h = ctx.rng.int(2, top - 1)
  if (ctx.mode === 'missing') {
    return ask(
      ctx,
      L(
        `A rectangle has area ${n(w * h).en} square units and width ${n(w).en}. What is the height?`,
        `Ein Rechteck hat den Flächeninhalt ${n(w * h).de} Quadrateinheiten und die Breite ${n(w).de}. Wie groß ist die Höhe?`,
        `Un rectángulo tiene área ${n(w * h).es} unidades cuadradas y ancho ${n(w).es}. ¿Cuál es la altura?`,
      ),
      { type: 'number' },
      { kind: 'number', value: h },
      [
        L('Area = width × height, so height = area ÷ width.', 'Fläche = Breite × Höhe, also Höhe = Fläche ÷ Breite.', 'Área = ancho × altura, así que altura = área ÷ ancho.'),
        L(`${n(w * h).en} ÷ ${n(w).en} = ${n(h).en}.`, `${n(w * h).de} ÷ ${n(w).de} = ${n(h).de}.`, `${n(w * h).es} ÷ ${n(w).es} = ${n(h).es}.`),
      ],
      { type: 'rect', w, h, unit: 'u' },
    )
  }
  return ask(
    ctx,
    L('What is the area of this rectangle in square units?', 'Wie groß ist der Flächeninhalt dieses Rechtecks in Quadrateinheiten?', '¿Cuál es el área de este rectángulo en unidades cuadradas?'),
    { type: 'number' },
    { kind: 'number', value: w * h },
    [
      L(`There are ${n(h).en} rows of ${n(w).en} squares.`, `Es gibt ${n(h).de} Reihen zu ${n(w).de} Quadraten.`, `Hay ${n(h).es} filas de ${n(w).es} cuadrados.`),
      L(`${n(w).en} × ${n(h).en} = ${n(w * h).en}.`, `${n(w).de} × ${n(h).de} = ${n(w * h).de}.`, `${n(w).es} × ${n(h).es} = ${n(w * h).es}.`),
    ],
    { type: 'rect', w, h, unit: 'u' },
  )
}

export function g3mdD(ctx: Ctx) {
  const top = knobNum(ctx, 'max', 12)
  const w = ctx.rng.int(3, top)
  const h = ctx.rng.int(2, top - 3)
  const peri = 2 * (w + h)
  if (ctx.mode === 'missing') {
    return ask(
      ctx,
      L(
        `A rectangle has perimeter ${n(peri).en} units and width ${n(w).en}. What is the height?`,
        `Ein Rechteck hat den Umfang ${n(peri).de} Einheiten und die Breite ${n(w).de}. Wie groß ist die Höhe?`,
        `Un rectángulo tiene perímetro ${n(peri).es} unidades y ancho ${n(w).es}. ¿Cuál es la altura?`,
      ),
      { type: 'number' },
      { kind: 'number', value: h },
      [
        L(`The two widths use ${n(2 * w).en}. The two heights share the rest: ${n(peri - 2 * w).en}.`, `Die zwei Breiten verbrauchen ${n(2 * w).de}. Die zwei Höhen teilen den Rest: ${n(peri - 2 * w).de}.`, `Los dos anchos usan ${n(2 * w).es}. Las dos alturas comparten el resto: ${n(peri - 2 * w).es}.`),
        L(`${n(peri - 2 * w).en} ÷ 2 = ${n(h).en}.`, `${n(peri - 2 * w).de} ÷ 2 = ${n(h).de}.`, `${n(peri - 2 * w).es} ÷ 2 = ${n(h).es}.`),
      ],
      { type: 'rect', w, h, unit: 'u' },
    )
  }
  return ask(
    ctx,
    L('What is the perimeter?', 'Wie groß ist der Umfang?', '¿Cuál es el perímetro?'),
    { type: 'number' },
    { kind: 'number', value: peri },
    [
      L('Add all four sides, or double the sum of length and width.', 'Addiere alle vier Seiten oder verdopple die Summe aus Länge und Breite.', 'Suma los cuatro lados, o duplica la suma del largo y el ancho.'),
      L(`${n(w).en} + ${n(h).en} + ${n(w).en} + ${n(h).en} = ${n(peri).en}.`, `${n(w).de} + ${n(h).de} + ${n(w).de} + ${n(h).de} = ${n(peri).de}.`, `${n(w).es} + ${n(h).es} + ${n(w).es} + ${n(h).es} = ${n(peri).es}.`),
    ],
    { type: 'rect', w, h, unit: 'u' },
  )
}

const SHAPE_LABEL = {
  square: L('square', 'Quadrat', 'cuadrado'),
  rectangle: L('rectangle', 'Rechteck', 'rectángulo'),
  rhombus: L('rhombus', 'Raute', 'rombo'),
  triangle: L('triangle', 'Dreieck', 'triángulo'),
  pentagon: L('pentagon', 'Fünfeck', 'pentágono'),
  hexagon: L('hexagon', 'Sechseck', 'hexágono'),
  trapezoid: L('trapezoid', 'Trapez', 'trapecio'),
} as const

export function g3g(ctx: Ctx) {
  if (ctx.mode === 'partition') {
    const good = { id: 'ok', label: L('Four equal parts', 'Vier gleiche Teile', 'Cuatro partes iguales'), shape: 'square' as const, parts: 4, shaded: 1 }
    const bad = [
      { id: 'a', label: L('Four unequal parts', 'Vier ungleiche Teile', 'Cuatro partes desiguales'), shape: 'square' as const, parts: 4, shaded: 1, uneven: true },
      { id: 'b', label: L('Three equal parts', 'Drei gleiche Teile', 'Tres partes iguales'), shape: 'square' as const, parts: 3, shaded: 1 },
      { id: 'c', label: L('Two equal parts', 'Zwei gleiche Teile', 'Dos partes iguales'), shape: 'rectangle' as const, parts: 2, shaded: 1 },
    ]
    const pack = pickedChoice(good, bad, ctx.rng)
    return ask(
      ctx,
      L('Which figure shows fourths?', 'Welche Figur zeigt Viertel?', '¿Cuál figura muestra cuartos?'),
      { type: 'choice', options: pack.options },
      pack.answer,
      [
        L('Fourths means four parts of the same size.', 'Viertel bedeutet vier Teile derselben Größe.', 'Cuartos significa cuatro partes del mismo tamaño.'),
        L('Equal area matters more than the number of cuts.', 'Gleicher Flächeninhalt zählt mehr als die Anzahl der Schnitte.', 'El área igual importa más que el número de cortes.'),
      ],
    )
  }
  if (ctx.mode === 'attribute') {
    const pack = textChoice(
      L('It has 4 right angles.', 'Es hat 4 rechte Winkel.', 'Tiene 4 ángulos rectos.'),
      [
        L('It has exactly 3 sides.', 'Es hat genau 3 Seiten.', 'Tiene exactamente 3 lados.'),
        L('It has no straight sides.', 'Es hat keine geraden Seiten.', 'No tiene lados rectos.'),
        L('It has 5 vertices.', 'Es hat 5 Ecken.', 'Tiene 5 vértices.'),
      ],
      ctx.rng,
    )
    return ask(
      ctx,
      L('Which sentence is true for every rectangle?', 'Welcher Satz stimmt für jedes Rechteck?', '¿Cuál oración es cierta para todo rectángulo?'),
      { type: 'choice', options: pack.options },
      pack.answer,
      [
        L('A rectangle has four sides and four right angles.', 'Ein Rechteck hat vier Seiten und vier rechte Winkel.', 'Un rectángulo tiene cuatro lados y cuatro ángulos rectos.'),
        L('Squares are rectangles, and they also have four right angles.', 'Quadrate sind Rechtecke, und auch sie haben vier rechte Winkel.', 'Los cuadrados son rectángulos, y también tienen cuatro ángulos rectos.'),
      ],
      { type: 'shape', shape: 'rectangle' },
    )
  }
  // Pentagons and hexagons join the names only when the advanced toggle is on.
  const basic: (keyof typeof SHAPE_LABEL)[] = ['square', 'rectangle', 'triangle']
  const pool: (keyof typeof SHAPE_LABEL)[] = knobBool(ctx, 'advanced', true) ? [...basic, 'pentagon', 'hexagon'] : basic
  const shape = ctx.rng.pick(pool)
  const names = pool.filter((item) => item !== shape).slice(0, 3)
  const pack = textChoice(SHAPE_LABEL[shape], names.map((item) => SHAPE_LABEL[item]), ctx.rng)
  return ask(
    ctx,
    L('What is the name of this shape?', 'Wie heißt diese Figur?', '¿Cómo se llama esta figura?'),
    { type: 'choice', options: pack.options },
    pack.answer,
    [
      L('Count the sides, then match the name.', 'Zähle die Seiten und ordne den Namen zu.', 'Cuenta los lados y empareja el nombre.'),
      L(`This figure is a ${SHAPE_LABEL[shape].en}.`, `Diese Figur ist ein ${SHAPE_LABEL[shape].de}.`, `Esta figura es un ${SHAPE_LABEL[shape].es}.`),
    ],
    { type: 'shape', shape },
  )
}

export function factorPair(ctx: Ctx) {
  const a = ctx.rng.int(12, 36)
  const factors: number[] = []
  for (let i = 1; i <= a; i++) if (a % i === 0) factors.push(i)
  const good = ctx.rng.pick(factors)
  const wrongs: number[] = []
  let guard = 0
  while (wrongs.length < 3 && guard < 20) {
    const candidate = ctx.rng.int(2, a)
    if (!factors.includes(candidate) && !wrongs.includes(candidate)) wrongs.push(candidate)
    guard += 1
  }
  const pack = textChoice(L(String(good), String(good), String(good)), wrongs.map((w) => L(String(w), String(w), String(w))), ctx.rng)
  return { a, pack, good }
}

export function gcfOf(a: number, b: number) {
  return gcd(a, b)
}

export function lcmOf(a: number, b: number) {
  return lcm(a, b)
}

export function decimalGrid(count: number, cells: number) {
  return { type: 'grid' as const, rows: cells === 100 ? 10 : 1, cols: cells === 100 ? 10 : cells, shaded: count }
}

export function avoidTie(value: number, place: number) {
  const digit = Math.floor(Math.abs(value) / (place / 10)) % 10
  if (digit === 5) return value + place / 10
  return value
}

export function powerShift(value: number, power: number) {
  return roundTo(value * 10 ** power, 6)
}

void distractors
void reduced
void simplify
void familyOf
void knobFlag
