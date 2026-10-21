import { gcd, lcm, roundTo } from '../lib/math'
import { ask, expression, frac, knobNum, L, n, scene, shuffleNotSorted, textChoice, type Ctx } from './shared'
import { fractionQuestion } from './bank4'
import { equation } from './algebra'

export function g6rp(ctx: Ctx) {
  const top = knobNum(ctx, 'max', 8)
  const a = ctx.rng.int(2, top - 2)
  const b = ctx.rng.int(2, top)
  if (ctx.mode === 'build') {
    return ask(ctx, L(`Build a ratio equal to ${n(a).en}:${n(b).en}.`, `Baue ein Verhältnis gleich ${n(a).de}:${n(b).de}.`, `Arma una razón igual a ${n(a).es}:${n(b).es}.`), { type: 'ratio', max: 16 }, { kind: 'ratio', a, b }, [
      L('Multiply both parts by the same number.', 'Multipliziere beide Teile mit derselben Zahl.', 'Multiplica ambas partes por el mismo número.'),
      L(`${n(a).en}:${n(b).en} is the simplest pair. Any equivalent pair counts.`, `${n(a).de}:${n(b).de} ist das kürzeste Paar. Jedes gleichwertige Paar zählt.`, `${n(a).es}:${n(b).es} es el par más simple. Cualquier par equivalente vale.`),
    ])
  }
  if (ctx.mode === 'unit') {
    const hours = ctx.rng.int(2, 6)
    const per = ctx.rng.int(8, 20)
    return ask(ctx, L(`Pico flies ${n(per * hours).en} km in ${n(hours).en} hours. What is the speed in km per hour?`, `Pico fliegt ${n(per * hours).de} km in ${n(hours).de} Stunden. Wie groß ist die Geschwindigkeit in km pro Stunde?`, `Pico vuela ${n(per * hours).es} km en ${n(hours).es} horas. ¿Cuál es la velocidad en km por hora?`), { type: 'number' }, { kind: 'number', value: per }, [
      L('Divide distance by time.', 'Teile Strecke durch Zeit.', 'Divide la distancia entre el tiempo.'),
      L(`${n(per * hours).en} ÷ ${n(hours).en} = ${n(per).en}.`, `${n(per * hours).de} ÷ ${n(hours).de} = ${n(per).de}.`, `${n(per * hours).es} ÷ ${n(hours).es} = ${n(per).es}.`),
    ], scene('sky'))
  }
  if (ctx.mode === 'percent') {
    const percent = ctx.rng.pick([10, 20, 25, 50])
    const base = ctx.rng.pick([20, 40, 60, 80, 120])
    return ask(ctx, L(`What is ${n(percent).en}% of ${n(base).en}?`, `Wie viel sind ${n(percent).de} % von ${n(base).de}?`, `¿Cuánto es el ${n(percent).es} % de ${n(base).es}?`), { type: 'number', allowDecimal: true }, { kind: 'number', value: (percent * base) / 100, tolerance: 0.001 }, [
      L(`${n(percent).en}% = ${frac(0, percent, 100)}.`, `${n(percent).de} % = ${frac(0, percent, 100)}.`, `${n(percent).es} % = ${frac(0, percent, 100)}.`),
      L(`${frac(0, percent, 100)} × ${n(base).en} = ${n((percent * base) / 100).en}.`, `${frac(0, percent, 100)} × ${n(base).de} = ${n((percent * base) / 100).de}.`, `${frac(0, percent, 100)} × ${n(base).es} = ${n((percent * base) / 100).es}.`),
    ])
  }
  const k = ctx.rng.int(2, 6)
  return ask(ctx, L(`Snails to stones are ${n(a).en}:${n(b).en}. There are ${n(a * k).en} snails. How many stones?`, `Schnecken zu Steinen sind ${n(a).de}:${n(b).de}. Es gibt ${n(a * k).de} Schnecken. Wie viele Steine?`, `Caracoles a piedras son ${n(a).es}:${n(b).es}. Hay ${n(a * k).es} caracoles. ¿Cuántas piedras?`), { type: 'number' }, { kind: 'number', value: b * k }, [
    L(`The snails are ${n(k).en} times the first term.`, `Die Schnecken sind das ${n(k).de}-Fache des ersten Glieds.`, `Los caracoles son ${n(k).es} veces el primer término.`),
    L(`${n(b).en} × ${n(k).en} = ${n(b * k).en}.`, `${n(b).de} × ${n(k).de} = ${n(b * k).de}.`, `${n(b).es} × ${n(k).es} = ${n(b * k).es}.`),
  ], scene('bay'))
}

export function g6nsA(ctx: Ctx) {
  const cap = knobNum(ctx, 'den', 8)
  if (ctx.mode === 'word') {
    const pieces = ctx.rng.int(2, 5)
    const each = ctx.rng.pick([2, 3, 4])
    return ask(ctx, L(`A ribbon is ${n(pieces).en} m long. Each bow uses ${frac(0, 1, each)} m. How many bows?`, `Ein Band ist ${n(pieces).de} m lang. Jede Schleife braucht ${frac(0, 1, each)} m. Wie viele Schleifen?`, `Una cinta mide ${n(pieces).es} m. Cada lazo usa ${frac(0, 1, each)} m. ¿Cuántos lazos?`), { type: 'number' }, { kind: 'number', value: pieces * each }, [
      L(`${n(pieces).en} ÷ ${frac(0, 1, each)} = ${n(pieces).en} × ${n(each).en}.`, `${n(pieces).de} ÷ ${frac(0, 1, each)} = ${n(pieces).de} × ${n(each).de}.`, `${n(pieces).es} ÷ ${frac(0, 1, each)} = ${n(pieces).es} × ${n(each).es}.`),
      L(`That makes ${n(pieces * each).en} bows.`, `Das ergibt ${n(pieces * each).de} Schleifen.`, `Eso da ${n(pieces * each).es} lazos.`),
    ], scene('market'))
  }
  if (ctx.mode === 'whole') {
    const whole = ctx.rng.int(2, 7)
    const den = ctx.rng.pick([2, 3, 4, 5, 6, 8, 10, 12].filter((d) => d <= cap))
    const numer = ctx.rng.int(1, den - 1)
    return fractionQuestion(ctx, whole * den, numer, L(`What is ${n(whole).en} ÷ ${frac(0, numer, den)}?`, `Wie viel ist ${n(whole).de} ÷ ${frac(0, numer, den)}?`, `¿Cuánto es ${n(whole).es} ÷ ${frac(0, numer, den)}?`), [
      L('Multiply by the reciprocal.', 'Multipliziere mit dem Kehrwert.', 'Multiplica por el recíproco.'),
      L(`${n(whole).en} × ${frac(0, den, numer)} = ${frac(0, whole * den, numer)}.`, `${n(whole).de} × ${frac(0, den, numer)} = ${frac(0, whole * den, numer)}.`, `${n(whole).es} × ${frac(0, den, numer)} = ${frac(0, whole * den, numer)}.`),
    ])
  }
  // Numerators stay below their denominators, whatever the largest denominator is.
  const n1 = ctx.rng.int(1, Math.min(5, cap - 1))
  const d1 = ctx.rng.int(n1 + 1, cap)
  const n2 = ctx.rng.int(1, Math.min(4, cap - 2))
  const d2 = ctx.rng.int(n2 + 1, cap - 1)
  return fractionQuestion(ctx, n1 * d2, d1 * n2, L(`What is ${frac(0, n1, d1)} ÷ ${frac(0, n2, d2)}?`, `Wie viel ist ${frac(0, n1, d1)} ÷ ${frac(0, n2, d2)}?`, `¿Cuánto es ${frac(0, n1, d1)} ÷ ${frac(0, n2, d2)}?`), [
    L(`Multiply by ${frac(0, d2, n2)}.`, `Multipliziere mit ${frac(0, d2, n2)}.`, `Multiplica por ${frac(0, d2, n2)}.`),
    L(`${frac(0, n1, d1)} × ${frac(0, d2, n2)} = ${frac(0, n1 * d2, d1 * n2)}.`, `${frac(0, n1, d1)} × ${frac(0, d2, n2)} = ${frac(0, n1 * d2, d1 * n2)}.`, `${frac(0, n1, d1)} × ${frac(0, d2, n2)} = ${frac(0, n1 * d2, d1 * n2)}.`),
  ])
}

export function g6nsB(ctx: Ctx) {
  const top = knobNum(ctx, 'max', 36)
  if (ctx.mode === 'gcf' || ctx.mode === 'lcm') {
    const a = ctx.rng.int(8, top)
    const b = ctx.rng.int(8, top + 4)
    const value = ctx.mode === 'gcf' ? gcd(a, b) : lcm(a, b)
    return ask(ctx, ctx.mode === 'gcf' ? L(`Greatest common factor of ${n(a).en} and ${n(b).en}?`, `Größter gemeinsamer Faktor von ${n(a).de} und ${n(b).de}?`, `¿Máximo común divisor de ${n(a).es} y ${n(b).es}?`) : L(`Least common multiple of ${n(a).en} and ${n(b).en}?`, `Kleinstes gemeinsames Vielfaches von ${n(a).de} und ${n(b).de}?`, `¿Mínimo común múltiplo de ${n(a).es} y ${n(b).es}?`), { type: 'number' }, { kind: 'number', value }, [
      L(ctx.mode === 'gcf' ? 'It is the greatest factor shared by both numbers.' : 'It is the smallest positive multiple shared by both numbers.', ctx.mode === 'gcf' ? 'Es ist der größte Faktor, den beide Zahlen teilen.' : 'Es ist das kleinste positive Vielfache, das beide Zahlen teilen.', ctx.mode === 'gcf' ? 'Es el mayor factor que comparten ambos números.' : 'Es el menor múltiplo positivo que comparten ambos números.'),
      L(`The result is ${n(value).en}.`, `Das Ergebnis ist ${n(value).de}.`, `El resultado es ${n(value).es}.`),
    ])
  }
  const tenths = ctx.rng.int(12, 48)
  const b = ctx.rng.int(2, 9)
  if (ctx.mode === 'div') {
    const dividend = roundTo((tenths / 10) * b, 1)
    return ask(ctx, L('Find the quotient.', 'Bestimme den Quotienten.', 'Halla el cociente.'), { type: 'number', allowDecimal: true }, { kind: 'number', value: tenths / 10, tolerance: 0.001 }, [
      L(`${n(dividend, 1).en} ÷ ${n(b).en}.`, `${n(dividend, 1).de} ÷ ${n(b).de}.`, `${n(dividend, 1).es} ÷ ${n(b).es}.`),
      L(`The quotient is ${n(tenths / 10, 1).en}.`, `Der Quotient ist ${n(tenths / 10, 1).de}.`, `El cociente es ${n(tenths / 10, 1).es}.`),
    ], expression([{ t: 'v', value: dividend, digits: 1 }, { t: 'op', v: '÷' }, { t: 'v', value: b }]))
  }
  const product = roundTo((tenths / 10) * b, 1)
  return ask(ctx, L('Find the product.', 'Bestimme das Produkt.', 'Halla el producto.'), { type: 'number', allowDecimal: true }, { kind: 'number', value: product, tolerance: 0.001 }, [
    L('Give the product one decimal place, matching the decimal factor.', 'Gib dem Produkt eine Dezimalstelle, passend zum Dezimalfaktor.', 'Dale al producto un decimal, como el factor decimal.'),
    L(`${n(tenths / 10, 1).en} × ${n(b).en} = ${n(product, 1).en}.`, `${n(tenths / 10, 1).de} × ${n(b).de} = ${n(product, 1).de}.`, `${n(tenths / 10, 1).es} × ${n(b).es} = ${n(product, 1).es}.`),
  ], expression([{ t: 'v', value: tenths / 10, digits: 1 }, { t: 'op', v: '×' }, { t: 'v', value: b }]))
}

export function g6nsC(ctx: Ctx) {
  // The largest distance from zero any number in this set can reach.
  const span = knobNum(ctx, 'span', 5)
  if (ctx.mode === 'abs') {
    const value = ctx.rng.int(-span, -1)
    return ask(ctx, L(`What is |${n(value).en}|?`, `Wie groß ist |${n(value).de}|?`, `¿Cuánto es |${n(value).es}|?`), { type: 'number' }, { kind: 'number', value: -value }, [
      L('Absolute value is the distance from zero.', 'Der Betrag ist der Abstand von null.', 'El valor absoluto es la distancia desde cero.'),
      L(`|${n(value).en}| = ${n(-value).en}.`, `|${n(value).de}| = ${n(-value).de}.`, `|${n(value).es}| = ${n(-value).es}.`),
    ])
  }
  if (ctx.mode === 'plot') {
    const x = ctx.rng.int(-span, span)
    const y = ctx.rng.int(-span, span)
    const edge = span + 1
    return ask(ctx, L(`Plot (${n(x).en}, ${n(y).en}).`, `Setze (${n(x).de}, ${n(y).de}).`, `Marca (${n(x).es}, ${n(y).es}).`), { type: 'coordinate', xMin: -edge, xMax: edge, yMin: -edge, yMax: edge }, { kind: 'points', points: [{ x, y }] }, [
      L('Negative x goes left. Negative y goes down.', 'Negatives x geht nach links. Negatives y geht nach unten.', 'Una x negativa va a la izquierda. Una y negativa va hacia abajo.'),
      L(`The point is (${n(x).en}, ${n(y).en}).`, `Der Punkt ist (${n(x).de}, ${n(y).de}).`, `El punto es (${n(x).es}, ${n(y).es}).`),
    ])
  }
  if (ctx.mode === 'order') {
    const values = [-6, -1, 0, 4].map((base, index) => base + (index === 2 ? 0 : ctx.rng.int(0, 1)))
    const ids = values.map((value, index) => `${value}:${index}`)
    const correct = [...values].map((value, index) => ({ value, id: ids[index] })).sort((p, q) => p.value - q.value).map((item) => item.id)
    const shown = shuffleNotSorted(ids, correct, ctx.rng)
    return ask(ctx, L('Order from least to greatest.', 'Ordne vom kleinsten zum größten.', 'Ordena de menor a mayor.'), { type: 'order', items: shown.map((id) => ({ id, label: n(Number(id.split(':')[0])) })) }, { kind: 'order', ids: correct }, [
      L('Farther left on the number line means smaller.', 'Weiter links auf dem Zahlenstrahl bedeutet kleiner.', 'Más a la izquierda en la recta significa menor.'),
      L(`The order is ${[...values].sort((a, b) => a - b).map((value) => n(value).en).join(', ')}.`, `Die Reihenfolge ist ${[...values].sort((a, b) => a - b).map((value) => n(value).de).join(', ')}.`, `El orden es ${[...values].sort((a, b) => a - b).map((value) => n(value).es).join(', ')}.`),
    ])
  }
  const a = ctx.rng.int(-(span + 4), span)
  const b = a + ctx.rng.int(1, 5)
  return ask(ctx, L('Which sign is true?', 'Welches Zeichen stimmt?', '¿Qué signo es cierto?'), { type: 'compare', left: n(a), right: n(b) }, { kind: 'compare', sign: '<' }, [
    L('The number farther left is smaller.', 'Die weiter links stehende Zahl ist kleiner.', 'El número más a la izquierda es menor.'),
    L(`${n(a).en} < ${n(b).en}.`, `${n(a).de} < ${n(b).de}.`, `${n(a).es} < ${n(b).es}.`),
  ])
}

export function g6eeA(ctx: Ctx) {
  const x = ctx.rng.int(2, 8)
  const a = ctx.rng.int(2, 6)
  const b = ctx.rng.int(1, 9)
  if (ctx.mode === 'write') {
    const pack = textChoice(L(`${n(a).en}x + ${n(b).en}`, `${n(a).de}x + ${n(b).de}`, `${n(a).es}x + ${n(b).es}`), [
      L(`${n(a).en} + x + ${n(b).en}`, `${n(a).de} + x + ${n(b).de}`, `${n(a).es} + x + ${n(b).es}`),
      L(`${n(a + b).en}x`, `${n(a + b).de}x`, `${n(a + b).es}x`),
    ], ctx.rng)
    return ask(ctx, L(`Which expression means ${n(a).en} times a number, then add ${n(b).en}?`, `Welcher Term bedeutet ${n(a).de} mal eine Zahl, dann ${n(b).de} addieren?`, `¿Cuál expresión significa ${n(a).es} por un número y luego sumar ${n(b).es}?`), { type: 'choice', options: pack.options }, pack.answer, [
      L('The multiplication belongs with the variable. The addition comes after.', 'Die Multiplikation gehört zur Variablen. Die Addition kommt danach.', 'La multiplicación va con la variable. La suma viene después.'),
      L(`That is ${n(a).en}x + ${n(b).en}.`, `Das ist ${n(a).de}x + ${n(b).de}.`, `Eso es ${n(a).es}x + ${n(b).es}.`),
    ])
  }
  if (ctx.mode === 'dist') {
    const pack = textChoice(L(`${n(a).en}x + ${n(a * b).en}`, `${n(a).de}x + ${n(a * b).de}`, `${n(a).es}x + ${n(a * b).es}`), [
      L(`${n(a).en}x + ${n(b).en}`, `${n(a).de}x + ${n(b).de}`, `${n(a).es}x + ${n(b).es}`),
      L(`${n(a + b).en}x`, `${n(a + b).de}x`, `${n(a + b).es}x`),
    ], ctx.rng)
    return ask(ctx, L(`Which expression equals ${n(a).en}(x + ${n(b).en})?`, `Welcher Term ist gleich ${n(a).de}(x + ${n(b).de})?`, `¿Cuál expresión equivale a ${n(a).es}(x + ${n(b).es})?`), { type: 'choice', options: pack.options }, pack.answer, [
      L('Distribute the outside factor to each term inside.', 'Verteile den äußeren Faktor auf jedes Glied innen.', 'Distribuye el factor de afuera a cada término de adentro.'),
      L(`${n(a).en}(x + ${n(b).en}) = ${n(a).en}x + ${n(a * b).en}.`, `${n(a).de}(x + ${n(b).de}) = ${n(a).de}x + ${n(a * b).de}.`, `${n(a).es}(x + ${n(b).es}) = ${n(a).es}x + ${n(a * b).es}.`),
    ])
  }
  return ask(ctx, L(`If x = ${n(x).en}, what is ${n(a).en}x + ${n(b).en}?`, `Wenn x = ${n(x).de}, wie viel ist ${n(a).de}x + ${n(b).de}?`, `Si x = ${n(x).es}, ¿cuánto es ${n(a).es}x + ${n(b).es}?`), { type: 'number' }, { kind: 'number', value: a * x + b }, [
    L(`${n(a).en} × ${n(x).en} = ${n(a * x).en}.`, `${n(a).de} × ${n(x).de} = ${n(a * x).de}.`, `${n(a).es} × ${n(x).es} = ${n(a * x).es}.`),
    L(`${n(a * x).en} + ${n(b).en} = ${n(a * x + b).en}.`, `${n(a * x).de} + ${n(b).de} = ${n(a * x + b).de}.`, `${n(a * x).es} + ${n(b).es} = ${n(a * x + b).es}.`),
  ], { type: 'balance', left: L(`${n(a).en}x + ${n(b).en}`, `${n(a).de}x + ${n(b).de}`, `${n(a).es}x + ${n(b).es}`), right: L(`x = ${n(x).en}`, `x = ${n(x).de}`, `x = ${n(x).es}`) })
}

export function g6eeB(ctx: Ctx) {
  if (ctx.mode === 'ineq') {
    const boundary = ctx.rng.int(2, knobNum(ctx, 'max', 9) + 1)
    const good = boundary + ctx.rng.int(1, 4)
    const pack = textChoice(n(good), [n(boundary - 2), n(boundary - 1), n(boundary)], ctx.rng)
    return ask(ctx, L(`Which value makes x > ${n(boundary).en} true?`, `Welcher Wert macht x > ${n(boundary).de} wahr?`, `¿Qué valor hace verdadera x > ${n(boundary).es}?`), { type: 'choice', options: pack.options }, pack.answer, [
      L('The value must sit strictly to the right of the boundary.', 'Der Wert muss echt rechts von der Grenze liegen.', 'El valor debe quedar estrictamente a la derecha del límite.'),
      L(`${n(good).en} > ${n(boundary).en}.`, `${n(good).de} > ${n(boundary).de}.`, `${n(good).es} > ${n(boundary).es}.`),
    ])
  }
  return equation(ctx, ctx.mode === 'two' ? 'two' : 'one')
}

export function g6eeC(ctx: Ctx) {
  const m = ctx.rng.int(2, knobNum(ctx, 'slope', 5))
  const b = ctx.rng.int(0, 4)
  const x = ctx.rng.int(1, 6)
  const y = m * x + b
  if (ctx.mode === 'pair') {
    const pack = textChoice(L(`(${n(x).en}, ${n(y).en})`, `(${n(x).de}, ${n(y).de})`, `(${n(x).es}, ${n(y).es})`), [
      L(`(${n(x).en}, ${n(y + 2).en})`, `(${n(x).de}, ${n(y + 2).de})`, `(${n(x).es}, ${n(y + 2).es})`),
      L(`(${n(y).en}, ${n(x).en})`, `(${n(y).de}, ${n(x).de})`, `(${n(y).es}, ${n(x).es})`),
    ], ctx.rng)
    return ask(ctx, L(`Which pair fits y = ${n(m).en}x + ${n(b).en}?`, `Welches Paar passt zu y = ${n(m).de}x + ${n(b).de}?`, `¿Qué par encaja en y = ${n(m).es}x + ${n(b).es}?`), { type: 'choice', options: pack.options }, pack.answer, [
      L(`Substitute x = ${n(x).en}.`, `Setze x = ${n(x).de} ein.`, `Sustituye x = ${n(x).es}.`),
      L(`y = ${n(y).en}.`, `y = ${n(y).de}.`, `y = ${n(y).es}.`),
    ])
  }
  return ask(ctx, L(`y = ${n(m).en}x + ${n(b).en}. When x = ${n(x).en}, what is y?`, `y = ${n(m).de}x + ${n(b).de}. Wenn x = ${n(x).de}, wie groß ist y?`, `y = ${n(m).es}x + ${n(b).es}. Cuando x = ${n(x).es}, ¿cuánto vale y?`), { type: 'number' }, { kind: 'number', value: y }, [
    L(`${n(m).en} × ${n(x).en} = ${n(m * x).en}.`, `${n(m).de} × ${n(x).de} = ${n(m * x).de}.`, `${n(m).es} × ${n(x).es} = ${n(m * x).es}.`),
    L(`${n(m * x).en} + ${n(b).en} = ${n(y).en}.`, `${n(m * x).de} + ${n(b).de} = ${n(y).de}.`, `${n(m * x).es} + ${n(b).es} = ${n(y).es}.`),
  ])
}

export function g6g(ctx: Ctx) {
  const top = knobNum(ctx, 'max', 12)
  if (ctx.mode === 'triangle') {
    const base = ctx.rng.int(4, top)
    const height = ctx.rng.int(2, top - 2)
    const area = (base * height) / 2
    return ask(ctx, L('What is the area of the triangle?', 'Wie groß ist der Flächeninhalt des Dreiecks?', '¿Cuál es el área del triángulo?'), { type: 'number', allowDecimal: true }, { kind: 'number', value: area, tolerance: 0.001 }, [
      L('Half of base times height.', 'Die Hälfte von Grundseite mal Höhe.', 'La mitad de base por altura.'),
      L(`${n(base).en} × ${n(height).en} ÷ 2 = ${n(area).en}.`, `${n(base).de} × ${n(height).de} ÷ 2 = ${n(area).de}.`, `${n(base).es} × ${n(height).es} ÷ 2 = ${n(area).es}.`),
    ], { type: 'triangle', b: base, h: height })
  }
  if (ctx.mode === 'para') {
    const base = ctx.rng.int(4, top)
    const height = ctx.rng.int(3, top - 3)
    return ask(ctx, L('What is the area of the parallelogram?', 'Wie groß ist der Flächeninhalt des Parallelogramms?', '¿Cuál es el área del paralelogramo?'), { type: 'number' }, { kind: 'number', value: base * height }, [
      L('Use base × perpendicular height.', 'Nimm Grundseite × senkrechte Höhe.', 'Usa base × altura perpendicular.'),
      L(`${n(base).en} × ${n(height).en} = ${n(base * height).en}.`, `${n(base).de} × ${n(height).de} = ${n(base * height).de}.`, `${n(base).es} × ${n(height).es} = ${n(base * height).es}.`),
    ], { type: 'shape', shape: 'parallelogram' })
  }
  const l = ctx.rng.int(2, top - 4)
  const w = ctx.rng.int(2, top - 6)
  const h = ctx.rng.int(2, top - 7)
  if (ctx.mode === 'volume') {
    return ask(ctx, L('What is the volume?', 'Wie groß ist das Volumen?', '¿Cuál es el volumen?'), { type: 'number' }, { kind: 'number', value: l * w * h }, [
      L('Length × width × height.', 'Länge × Breite × Höhe.', 'Largo × ancho × alto.'),
      L(`${n(l).en} × ${n(w).en} × ${n(h).en} = ${n(l * w * h).en}.`, `${n(l).de} × ${n(w).de} × ${n(h).de} = ${n(l * w * h).de}.`, `${n(l).es} × ${n(w).es} × ${n(h).es} = ${n(l * w * h).es}.`),
    ], { type: 'prism', l, w, h })
  }
  const area = 2 * (l * w + l * h + w * h)
  return ask(ctx, L('What is the surface area?', 'Wie groß ist die Oberfläche?', '¿Cuál es el área de superficie?'), { type: 'number' }, { kind: 'number', value: area }, [
    L('Three pairs of faces: 2(lw + lh + wh).', 'Drei Flächenpaare: 2(lb + lh + bh).', 'Tres pares de caras: 2(la + lh + ah).'),
    L(`2(${n(l * w).en} + ${n(l * h).en} + ${n(w * h).en}) = ${n(area).en}.`, `2(${n(l * w).de} + ${n(l * h).de} + ${n(w * h).de}) = ${n(area).de}.`, `2(${n(l * w).es} + ${n(l * h).es} + ${n(w * h).es}) = ${n(area).es}.`),
  ], { type: 'prism', l, w, h })
}

export function g6spA(ctx: Ctx) {
  if (ctx.mode === 'spread') {
    const pack = textChoice(L('1, 2, 8, 9', '1, 2, 8, 9', '1, 2, 8, 9'), [L('4, 5, 5, 6', '4, 5, 5, 6', '4, 5, 5, 6')], ctx.rng)
    return ask(ctx, L('Which set varies more?', 'Welche Menge streut stärker?', '¿Cuál conjunto varía más?'), { type: 'choice', options: pack.options }, pack.answer, [
      L('Compare the ranges.', 'Vergleiche die Spannweiten.', 'Compara los rangos.'),
      L('From 1 to 9 the range is 8. From 4 to 6 the range is 2.', 'Von 1 bis 9 ist die Spannweite 8. Von 4 bis 6 ist sie 2.', 'De 1 a 9 el rango es 8. De 4 a 6 es 2.'),
    ])
  }
  const pack = textChoice(
    L('How many minutes did students in our class read last night?', 'Wie viele Minuten haben die Schülerinnen und Schüler unserer Klasse gestern Abend gelesen?', '¿Cuántos minutos leyeron anoche las estudiantes de nuestra clase?'),
    [
      L('How many tentacles are drawn on this snail?', 'Wie viele Fühler sind auf dieser Schnecke gezeichnet?', '¿Cuántos tentáculos tiene dibujados este caracol?'),
      L('What is 8 × 7?', 'Wie viel ist 8 × 7?', '¿Cuánto es 8 × 7?'),
    ],
    ctx.rng,
  )
  return ask(ctx, L('Which is a statistical question?', 'Welche Frage ist statistisch?', '¿Cuál es una pregunta estadística?'), { type: 'choice', options: pack.options }, pack.answer, [
    L('A statistical question expects answers that vary.', 'Eine statistische Frage erwartet Antworten, die sich unterscheiden.', 'Una pregunta estadística espera respuestas que varían.'),
    L('Reading times differ from student to student.', 'Lesezeiten unterscheiden sich von Person zu Person.', 'Los tiempos de lectura cambian de estudiante a estudiante.'),
  ])
}

export function dataSet(ctx: Ctx, size: number, mean: number) {
  const values = Array.from({ length: size }, () => mean)
  for (let i = 0; i < Math.floor(size / 2); i++) {
    const delta = ctx.rng.int(1, 3)
    values[i] -= delta
    values[size - 1 - i] += delta
  }
  return values
}

export function g6spB(ctx: Ctx) {
  const mean = ctx.rng.int(6, 14)
  const values = dataSet(ctx, knobNum(ctx, 'size', 5), mean)
  if (ctx.mode === 'median') {
    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return ask(ctx, L(`What is the median of ${values.map((v) => n(v).en).join(', ')}?`, `Was ist der Median von ${values.map((v) => n(v).de).join(', ')}?`, `¿Cuál es la mediana de ${values.map((v) => n(v).es).join(', ')}?`), { type: 'number' }, { kind: 'number', value: sorted[middle] }, [
      L(`In order: ${sorted.map((v) => n(v).en).join(', ')}.`, `Der Reihe nach: ${sorted.map((v) => n(v).de).join(', ')}.`, `En orden: ${sorted.map((v) => n(v).es).join(', ')}.`),
      L(`The middle value is ${n(sorted[middle]).en}.`, `Der mittlere Wert ist ${n(sorted[middle]).de}.`, `El valor del medio es ${n(sorted[middle]).es}.`),
    ])
  }
  if (ctx.mode === 'range') {
    const range = Math.max(...values) - Math.min(...values)
    return ask(ctx, L(`What is the range of ${values.map((v) => n(v).en).join(', ')}?`, `Was ist die Spannweite von ${values.map((v) => n(v).de).join(', ')}?`, `¿Cuál es el rango de ${values.map((v) => n(v).es).join(', ')}?`), { type: 'number' }, { kind: 'number', value: range }, [
      L('Greatest minus least.', 'Größter minus kleinster.', 'El mayor menos el menor.'),
      L(`${n(Math.max(...values)).en} − ${n(Math.min(...values)).en} = ${n(range).en}.`, `${n(Math.max(...values)).de} − ${n(Math.min(...values)).de} = ${n(range).de}.`, `${n(Math.max(...values)).es} − ${n(Math.min(...values)).es} = ${n(range).es}.`),
    ])
  }
  return ask(ctx, L(`What is the mean of ${values.map((v) => n(v).en).join(', ')}?`, `Was ist der Mittelwert von ${values.map((v) => n(v).de).join(', ')}?`, `¿Cuál es la media de ${values.map((v) => n(v).es).join(', ')}?`), { type: 'number' }, { kind: 'number', value: mean }, [
    L(`The numbers add to ${n(mean * values.length).en}.`, `Die Zahlen ergeben zusammen ${n(mean * values.length).de}.`, `Los números suman ${n(mean * values.length).es}.`),
    L(`Divide by ${n(values.length).en} to get ${n(mean).en}.`, `Teile durch ${n(values.length).de} und erhalte ${n(mean).de}.`, `Divide entre ${n(values.length).es} y obtén ${n(mean).es}.`),
  ])
}
