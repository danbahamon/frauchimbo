import { gcd, roundTo, simplify } from '../lib/math'
import { ask, expression, familyOf, frac, knobBool, knobNum, L, n, textChoice, type Ctx } from './shared'
import { fractionQuestion } from './bank4'
import { equation } from './algebra'
import { dataSet } from './bank6'

function priced(ctx: Ctx) {
  const price = Math.max(20, knobNum(ctx, 'price', 80))
  const rateCap = Math.max(5, knobNum(ctx, 'rate', 25))
  const rates = [5, 10, 15, 20, 25, 40, 50].filter((rate) => rate <= rateCap)
  const rate = ctx.rng.pick(rates.length ? rates : [10])
  const unit = 100 / gcd(rate, 100)
  const steps = Math.max(1, Math.floor(price / unit))
  const start = unit * ctx.rng.int(1, steps)
  return { rate, start, price }
}

export function g7rp(ctx: Ctx) {
  if (ctx.mode === 'change') {
    const deal = priced(ctx)
    const start = deal.start
    const up = ctx.rng.chance(0.5)
    const percent = deal.rate
    const next = up ? start + (start * percent) / 100 : start - (start * percent) / 100
    return ask(
      ctx,
      up
        ? L(`A shell cost $${n(start).en} and now costs $${n(next).en}. What is the percent increase?`, `Eine Muschel kostete ${n(start).de} € und kostet jetzt ${n(next).de} €. Wie groß ist die prozentuale Steigerung?`, `Una concha costaba $${n(start).es} y ahora cuesta $${n(next).es}. ¿Cuál es el aumento porcentual?`)
        : L(`A ticket cost $${n(start).en} and now costs $${n(next).en}. What is the percent decrease?`, `Eine Karte kostete ${n(start).de} € und kostet jetzt ${n(next).de} €. Wie groß ist die prozentuale Senkung?`, `Un boleto costaba $${n(start).es} y ahora cuesta $${n(next).es}. ¿Cuál es la disminución porcentual?`),
      { type: 'number' },
      { kind: 'number', value: percent },
      [
        L('Percent change = amount of change ÷ original × 100.', 'Prozentuale Änderung = Änderung ÷ Ausgangswert × 100.', 'Cambio porcentual = cambio ÷ original × 100.'),
        L(`${n(Math.abs(next - start)).en} ÷ ${n(start).en} = ${n(percent).en}%.`, `${n(Math.abs(next - start)).de} ÷ ${n(start).de} = ${n(percent).de} %.`, `${n(Math.abs(next - start)).es} ÷ ${n(start).es} = ${n(percent).es} %.`),
      ],
    )
  }
  if (ctx.mode === 'tax') {
    const deal = priced(ctx)
    const price = deal.start
    const rate = deal.rate
    const extra = roundTo((price * rate) / 100, 2)
    return ask(
      ctx,
      L(`A meal costs $${n(price).en}. A ${n(rate).en}% tip is added. What is the total?`, `Ein Essen kostet ${n(price).de} €. ${n(rate).de} % Trinkgeld kommen dazu. Wie hoch ist die Summe?`, `Una comida cuesta $${n(price).es}. Se añade ${n(rate).es} % de propina. ¿Cuál es el total?`),
      { type: 'number', allowDecimal: true },
      { kind: 'number', value: roundTo(price + extra, 2), tolerance: 0.011 },
      [
        L(`${n(rate).en}% of ${n(price).en} is ${n(extra, 2).en}.`, `${n(rate).de} % von ${n(price).de} sind ${n(extra, 2).de}.`, `El ${n(rate).es} % de ${n(price).es} es ${n(extra, 2).es}.`),
        L(`${n(price).en} + ${n(extra, 2).en} = ${n(price + extra, 2).en}.`, `${n(price).de} + ${n(extra, 2).de} = ${n(price + extra, 2).de}.`, `${n(price).es} + ${n(extra, 2).es} = ${n(price + extra, 2).es}.`),
      ],
    )
  }
  if (ctx.mode === 'proportion') {
    const kMax = Math.max(2, Math.min(20, Math.round(knobNum(ctx, 'price', 40) / 10)))
    const a = ctx.rng.int(2, 12)
    const b = ctx.rng.int(2, 12)
    const k = ctx.rng.int(2, kMax)
    return ask(
      ctx,
      L(`${n(a).en} / ${n(b).en} = ${n(a * k).en} / x. What is x?`, `${n(a).de} / ${n(b).de} = ${n(a * k).de} / x. Wie groß ist x?`, `${n(a).es} / ${n(b).es} = ${n(a * k).es} / x. ¿Cuánto vale x?`),
      { type: 'number' },
      { kind: 'number', value: b * k },
      [
        L(`The numerators are multiplied by ${n(k).en}. Do the same to the denominator.`, `Die Zähler sind mit ${n(k).de} multipliziert. Mach dasselbe mit dem Nenner.`, `Los numeradores están multiplicados por ${n(k).es}. Haz lo mismo con el denominador.`),
        L(`x = ${n(b).en} × ${n(k).en} = ${n(b * k).en}.`, `x = ${n(b).de} × ${n(k).de} = ${n(b * k).de}.`, `x = ${n(b).es} × ${n(k).es} = ${n(b * k).es}.`),
      ],
    )
  }
  const deal = priced(ctx)
  const percent = deal.rate
  const base = deal.start
  return ask(
    ctx,
    L(`What is ${n(percent).en}% of ${n(base).en}?`, `Wie viel sind ${n(percent).de} % von ${n(base).de}?`, `¿Cuánto es el ${n(percent).es} % de ${n(base).es}?`),
    { type: 'number', allowDecimal: true },
    { kind: 'number', value: (percent * base) / 100, tolerance: 0.001 },
    [
      L(`${n(percent).en} per 100, applied to ${n(base).en}.`, `${n(percent).de} von 100, angewandt auf ${n(base).de}.`, `${n(percent).es} de cada 100, aplicado a ${n(base).es}.`),
      L(`${n(percent / 100, 2).en} × ${n(base).en} = ${n((percent * base) / 100).en}.`, `${n(percent / 100, 2).de} × ${n(base).de} = ${n((percent * base) / 100).de}.`, `${n(percent / 100, 2).es} × ${n(base).es} = ${n((percent * base) / 100).es}.`),
    ],
  )
}

export function g7ns(ctx: Ctx) {
  if (familyOf(ctx) === 'frac') {
    const d = ctx.rng.pick([2, 3, 4, 5])
    const a = ctx.rng.int(1, d - 1) * (ctx.rng.chance(0.5) ? -1 : 1)
    const b = ctx.rng.int(1, d - 1) * (ctx.rng.chance(0.5) ? -1 : 1)
    if (ctx.mode === 'mul') {
      const n2 = ctx.rng.int(1, 3) * (ctx.rng.chance(0.5) ? -1 : 1)
      const d2 = ctx.rng.pick([2, 3, 4])
      return fractionQuestion(ctx, a * n2, d * d2, L(`What is ${frac(0, a, d)} × ${frac(0, n2, d2)}?`, `Wie viel ist ${frac(0, a, d)} × ${frac(0, n2, d2)}?`, `¿Cuánto es ${frac(0, a, d)} × ${frac(0, n2, d2)}?`), [
        L('Multiply numerators and denominators. Different signs make a negative product.', 'Multipliziere Zähler und Nenner. Verschiedene Vorzeichen ergeben ein negatives Produkt.', 'Multiplica numeradores y denominadores. Signos distintos dan un producto negativo.'),
        L(`${frac(0, a, d)} × ${frac(0, n2, d2)} = ${frac(0, a * n2, d * d2)}.`, `${frac(0, a, d)} × ${frac(0, n2, d2)} = ${frac(0, a * n2, d * d2)}.`, `${frac(0, a, d)} × ${frac(0, n2, d2)} = ${frac(0, a * n2, d * d2)}.`),
      ])
    }
    if (ctx.mode === 'div') {
      const n2 = ctx.rng.int(1, 3) * (ctx.rng.chance(0.5) ? -1 : 1)
      const d2 = ctx.rng.pick([2, 3, 4])
      const numer = a * d2
      const den = d * n2
      const signed = den < 0 ? -numer : numer
      return fractionQuestion(ctx, signed, Math.abs(den), L(`What is ${frac(0, a, d)} ÷ ${frac(0, n2, d2)}?`, `Wie viel ist ${frac(0, a, d)} ÷ ${frac(0, n2, d2)}?`, `¿Cuánto es ${frac(0, a, d)} ÷ ${frac(0, n2, d2)}?`), [
        L('Multiply by the reciprocal and keep track of the sign.', 'Multipliziere mit dem Kehrwert und behalte das Vorzeichen im Blick.', 'Multiplica por el recíproco y cuida el signo.'),
        L(`${frac(0, a, d)} × ${frac(0, d2, n2)} gives the quotient.`, `${frac(0, a, d)} × ${frac(0, d2, n2)} ergibt den Quotienten.`, `${frac(0, a, d)} × ${frac(0, d2, n2)} da el cociente.`),
      ])
    }
    const value = ctx.mode === 'sub' ? a - b : a + b
    const [sn, sd] = simplify(value, d)
    return fractionQuestion(ctx, sn, sd, L(
      ctx.mode === 'sub' ? `What is ${frac(0, a, d)} − ${frac(0, b, d)}?` : `What is ${frac(0, a, d)} + ${frac(0, b, d)}?`,
      ctx.mode === 'sub' ? `Wie viel ist ${frac(0, a, d)} − ${frac(0, b, d)}?` : `Wie viel ist ${frac(0, a, d)} + ${frac(0, b, d)}?`,
      ctx.mode === 'sub' ? `¿Cuánto es ${frac(0, a, d)} − ${frac(0, b, d)}?` : `¿Cuánto es ${frac(0, a, d)} + ${frac(0, b, d)}?`,
    ), [
      L('Keep the common denominator. Combine the signed numerators.', 'Behalte den gemeinsamen Nenner. Verrechne die Zähler mit Vorzeichen.', 'Conserva el denominador común. Combina los numeradores con signo.'),
      L(`The numerator becomes ${n(value).en}, over ${n(d).en}.`, `Der Zähler wird ${n(value).de}, der Nenner bleibt ${n(d).de}.`, `El numerador queda en ${n(value).es}, sobre ${n(d).es}.`),
    ])
  }
  const top = knobNum(ctx, 'max', 12)
  const a = ctx.rng.int(-top, top) || 4
  const b = ctx.rng.int(-(top - 3), top - 3) || -3
  if (ctx.mode === 'mul') {
    return ask(ctx, L('Find the product.', 'Bestimme das Produkt.', 'Halla el producto.'), { type: 'number', allowNegative: true }, { kind: 'number', value: a * b }, [
      L('Same signs give a positive product. Different signs give a negative product.', 'Gleiche Vorzeichen ergeben ein positives Produkt. Verschiedene ein negatives.', 'Signos iguales dan un producto positivo. Signos distintos, uno negativo.'),
      L(`${n(a).en} × ${n(b).en} = ${n(a * b).en}.`, `${n(a).de} × ${n(b).de} = ${n(a * b).de}.`, `${n(a).es} × ${n(b).es} = ${n(a * b).es}.`),
    ], expression([{ t: 'v', value: a }, { t: 'op', v: '×' }, { t: 'v', value: b }]))
  }
  if (ctx.mode === 'div') {
    const divisor = ctx.rng.int(-(top - 4), top - 4) || 4
    const quotient = ctx.rng.int(-(top - 4), top - 4) || -3
    return ask(ctx, L('Find the quotient.', 'Bestimme den Quotienten.', 'Halla el cociente.'), { type: 'number', allowNegative: true }, { kind: 'number', value: quotient }, [
      L('Division uses the same sign rules as multiplication.', 'Die Division nutzt dieselben Vorzeichenregeln wie die Multiplikation.', 'La división usa las mismas reglas de signo que la multiplicación.'),
      L(`${n(divisor * quotient).en} ÷ ${n(divisor).en} = ${n(quotient).en}.`, `${n(divisor * quotient).de} ÷ ${n(divisor).de} = ${n(quotient).de}.`, `${n(divisor * quotient).es} ÷ ${n(divisor).es} = ${n(quotient).es}.`),
    ], expression([{ t: 'v', value: divisor * quotient }, { t: 'op', v: '÷' }, { t: 'v', value: divisor }]))
  }
  if (ctx.mode === 'sub') {
    return ask(ctx, L('Find the difference.', 'Bestimme die Differenz.', 'Halla la diferencia.'), { type: 'number', allowNegative: true }, { kind: 'number', value: a - b }, [
      L(`Subtracting ${n(b).en} is adding ${n(-b).en}.`, `${n(b).de} zu subtrahieren heißt ${n(-b).de} zu addieren.`, `Restar ${n(b).es} es sumar ${n(-b).es}.`),
      L(`${n(a).en} − (${n(b).en}) = ${n(a - b).en}.`, `${n(a).de} − (${n(b).de}) = ${n(a - b).de}.`, `${n(a).es} − (${n(b).es}) = ${n(a - b).es}.`),
    ], expression([{ t: 'v', value: a }, { t: 'op', v: '−' }, { t: 'v', value: b }]))
  }
  return ask(ctx, L('Find the sum.', 'Bestimme die Summe.', 'Halla la suma.'), { type: 'number', allowNegative: true }, { kind: 'number', value: a + b }, [
    L('If the signs differ, subtract the distances from zero and keep the sign of the farther number.', 'Bei verschiedenen Vorzeichen subtrahiere die Abstände von null und behalte das Vorzeichen der entfernteren Zahl.', 'Si los signos difieren, resta las distancias a cero y conserva el signo del número más alejado.'),
    L(`${n(a).en} + ${n(b).en} = ${n(a + b).en}.`, `${n(a).de} + ${n(b).de} = ${n(a + b).de}.`, `${n(a).es} + ${n(b).es} = ${n(a + b).es}.`),
  ], expression([{ t: 'v', value: a }, { t: 'op', v: '+' }, { t: 'v', value: b }]))
}

export function g7eeA(ctx: Ctx) {
  const top = knobNum(ctx, 'max', 8)
  const a = ctx.rng.int(2, Math.max(2, top - 2))
  const b = ctx.rng.int(2, Math.max(2, top))
  if (ctx.mode === 'factor') {
    const pack = textChoice(L(`${n(a).en}(x + ${n(b).en})`, `${n(a).de}(x + ${n(b).de})`, `${n(a).es}(x + ${n(b).es})`), [
      L(`${n(a).en}(x + ${n(a * b).en})`, `${n(a).de}(x + ${n(a * b).de})`, `${n(a).es}(x + ${n(a * b).es})`),
      L(`${n(b).en}(x + ${n(a).en})`, `${n(b).de}(x + ${n(a).de})`, `${n(b).es}(x + ${n(a).es})`),
    ], ctx.rng)
    return ask(ctx, L(`Which expression is the factored form of ${n(a).en}x + ${n(a * b).en}?`, `Welcher Term ist die faktorisierte Form von ${n(a).de}x + ${n(a * b).de}?`, `¿Cuál expresión es la forma factorizada de ${n(a).es}x + ${n(a * b).es}?`), { type: 'choice', options: pack.options }, pack.answer, [
      L(`Both terms share ${n(a).en}.`, `Beide Glieder haben ${n(a).de} gemeinsam.`, `Ambos términos comparten ${n(a).es}.`),
      L(`${n(a).en}x + ${n(a * b).en} = ${n(a).en}(x + ${n(b).en}).`, `${n(a).de}x + ${n(a * b).de} = ${n(a).de}(x + ${n(b).de}).`, `${n(a).es}x + ${n(a * b).es} = ${n(a).es}(x + ${n(b).es}).`),
    ])
  }
  const pack = textChoice(L(`${n(a).en}x + ${n(a * b).en}`, `${n(a).de}x + ${n(a * b).de}`, `${n(a).es}x + ${n(a * b).es}`), [
    L(`${n(a).en}x + ${n(b).en}`, `${n(a).de}x + ${n(b).de}`, `${n(a).es}x + ${n(b).es}`),
    L(`${n(a + b).en}x`, `${n(a + b).de}x`, `${n(a + b).es}x`),
  ], ctx.rng)
  return ask(ctx, L(`Which expression equals ${n(a).en}(x + ${n(b).en})?`, `Welcher Term ist gleich ${n(a).de}(x + ${n(b).de})?`, `¿Cuál expresión equivale a ${n(a).es}(x + ${n(b).es})?`), { type: 'choice', options: pack.options }, pack.answer, [
    L('Distribute.', 'Ausmultiplizieren.', 'Distribuye.'),
    L(`${n(a).en}(x + ${n(b).en}) = ${n(a).en}x + ${n(a * b).en}.`, `${n(a).de}(x + ${n(b).de}) = ${n(a).de}x + ${n(a * b).de}.`, `${n(a).es}(x + ${n(b).es}) = ${n(a).es}x + ${n(a * b).es}.`),
  ])
}

export function g7eeB(ctx: Ctx) {
  if (ctx.mode === 'ineq') {
    const cap = Math.max(4, knobNum(ctx, 'max', 8))
    const boundary = ctx.rng.int(3, cap)
    const pack = textChoice(n(boundary + 2), [n(boundary), n(boundary - 1), n(0)], ctx.rng)
    return ask(ctx, L(`Which value solves x − 2 > ${n(boundary - 2).en}?`, `Welcher Wert löst x − 2 > ${n(boundary - 2).de}?`, `¿Qué valor resuelve x − 2 > ${n(boundary - 2).es}?`), { type: 'choice', options: pack.options }, pack.answer, [
      L(`Add 2: x > ${n(boundary).en}.`, `Addiere 2: x > ${n(boundary).de}.`, `Suma 2: x > ${n(boundary).es}.`),
      L(`${n(boundary + 2).en} is greater than ${n(boundary).en}.`, `${n(boundary + 2).de} ist größer als ${n(boundary).de}.`, `${n(boundary + 2).es} es mayor que ${n(boundary).es}.`),
    ])
  }
  return equation(ctx, ctx.mode === 'dist' ? 'dist' : 'two')
}

export function g7gA(ctx: Ctx) {
  const scale = ctx.rng.int(2, knobNum(ctx, 'factor', 5))
  const drawing = ctx.rng.int(3, 9)
  if (ctx.mode === 'area') {
    const area = ctx.rng.int(4, 12)
    return ask(ctx, L(`A scale factor of ${n(scale).en} meets a figure of area ${n(area).en}. What is the new area?`, `Ein Maßstab von ${n(scale).de} trifft eine Figur mit Fläche ${n(area).de}. Wie groß ist die neue Fläche?`, `Un factor de escala de ${n(scale).es} encuentra una figura de área ${n(area).es}. ¿Cuál es la nueva área?`), { type: 'number' }, { kind: 'number', value: area * scale * scale }, [
      L('Areas scale by the square of the factor.', 'Flächen skalieren mit dem Quadrat des Faktors.', 'Las áreas escalan con el cuadrado del factor.'),
      L(`${n(area).en} × ${n(scale).en}² = ${n(area * scale * scale).en}.`, `${n(area).de} × ${n(scale).de}² = ${n(area * scale * scale).de}.`, `${n(area).es} × ${n(scale).es}² = ${n(area * scale * scale).es}.`),
    ])
  }
  if (ctx.mode === 'down') {
    return ask(ctx, L(`The actual length is ${n(drawing * scale).en} m. The scale is 1 cm : ${n(scale).en} m. How long is the drawing, in centimeters?`, `Die wirkliche Länge ist ${n(drawing * scale).de} m. Der Maßstab ist 1 cm : ${n(scale).de} m. Wie viele Zentimeter ist die Zeichnung?`, `La longitud real es ${n(drawing * scale).es} m. La escala es 1 cm : ${n(scale).es} m. ¿Cuántos centímetros mide el dibujo?`), { type: 'number' }, { kind: 'number', value: drawing }, [
      L(`Divide by the scale factor ${n(scale).en}.`, `Teile durch den Faktor ${n(scale).de}.`, `Divide entre el factor ${n(scale).es}.`),
      L(`${n(drawing * scale).en} ÷ ${n(scale).en} = ${n(drawing).en}.`, `${n(drawing * scale).de} ÷ ${n(scale).de} = ${n(drawing).de}.`, `${n(drawing * scale).es} ÷ ${n(scale).es} = ${n(drawing).es}.`),
    ])
  }
  return ask(ctx, L(`The scale is 1 cm : ${n(scale).en} m. The drawing is ${n(drawing).en} cm. What is the actual length in meters?`, `Der Maßstab ist 1 cm : ${n(scale).de} m. Die Zeichnung ist ${n(drawing).de} cm. Wie lang ist das Original in Metern?`, `La escala es 1 cm : ${n(scale).es} m. El dibujo mide ${n(drawing).es} cm. ¿Cuál es la longitud real en metros?`), { type: 'number' }, { kind: 'number', value: drawing * scale }, [
    L(`Each drawing centimeter stands for ${n(scale).en} meters.`, `Jeder Zentimeter der Zeichnung steht für ${n(scale).de} Meter.`, `Cada centímetro del dibujo representa ${n(scale).es} metros.`),
    L(`${n(drawing).en} × ${n(scale).en} = ${n(drawing * scale).en}.`, `${n(drawing).de} × ${n(scale).de} = ${n(drawing * scale).de}.`, `${n(drawing).es} × ${n(scale).es} = ${n(drawing * scale).es}.`),
  ])
}

export function g7gB(ctx: Ctx) {
  if (ctx.mode === 'circ' || ctx.mode === 'area') {
    const r = ctx.rng.int(2, knobNum(ctx, 'radius', 10))
    const value = ctx.mode === 'circ' ? roundTo(2 * 3.14 * r, 2) : roundTo(3.14 * r * r, 2)
    return ask(
      ctx,
      ctx.mode === 'circ'
        ? L(`Radius ${n(r).en}. Use 3.14 for π. What is the circumference?`, `Radius ${n(r).de}. Nimm 3,14 für π. Wie groß ist der Umfang?`, `Radio ${n(r).es}. Usa 3.14 para π. ¿Cuál es la circunferencia?`)
        : L(`Radius ${n(r).en}. Use 3.14 for π. What is the area?`, `Radius ${n(r).de}. Nimm 3,14 für π. Wie groß ist der Flächeninhalt?`, `Radio ${n(r).es}. Usa 3.14 para π. ¿Cuál es el área?`),
      { type: 'number', allowDecimal: true },
      { kind: 'number', value, tolerance: 0.02 },
      ctx.mode === 'circ'
        ? [L('C = 2πr.', 'U = 2πr.', 'C = 2πr.'), L(`2 × 3.14 × ${n(r).en} = ${n(value, 2).en}.`, `2 × 3,14 × ${n(r).de} = ${n(value, 2).de}.`, `2 × 3.14 × ${n(r).es} = ${n(value, 2).es}.`)]
        : [L('A = πr².', 'A = πr².', 'A = πr².'), L(`3.14 × ${n(r * r).en} = ${n(value, 2).en}.`, `3,14 × ${n(r * r).de} = ${n(value, 2).de}.`, `3.14 × ${n(r * r).es} = ${n(value, 2).es}.`)],
      { type: 'circle', r },
    )
  }
  if (ctx.mode === 'triangle') {
    const a = ctx.rng.int(35, 70)
    const b = ctx.rng.int(30, 70)
    const c = 180 - a - b
    return ask(ctx, L(`Two angles measure ${n(a).en}° and ${n(b).en}°. What is the third?`, `Zwei Winkel messen ${n(a).de}° und ${n(b).de}°. Wie groß ist der dritte?`, `Dos ángulos miden ${n(a).es}° y ${n(b).es}°. ¿Cuánto mide el tercero?`), { type: 'number' }, { kind: 'number', value: c }, [
      L('A triangle’s angles add to 180°.', 'Die Winkel eines Dreiecks ergeben 180°.', 'Los ángulos de un triángulo suman 180°.'),
      L(`180 − ${n(a).en} − ${n(b).en} = ${n(c).en}.`, `180 − ${n(a).de} − ${n(b).de} = ${n(c).de}.`, `180 − ${n(a).es} − ${n(b).es} = ${n(c).es}.`),
    ])
  }
  if (ctx.mode === 'surface') {
    const l = ctx.rng.int(2, 8)
    const w = ctx.rng.int(2, 6)
    const h = ctx.rng.int(2, 5)
    const area = 2 * (l * w + l * h + w * h)
    return ask(ctx, L('What is the surface area?', 'Wie groß ist die Oberfläche?', '¿Cuál es el área de superficie?'), { type: 'number' }, { kind: 'number', value: area }, [
      L('2(lw + lh + wh).', '2(lb + lh + bh).', '2(la + lh + ah).'),
      L(`The surface area is ${n(area).en}.`, `Die Oberfläche ist ${n(area).de}.`, `El área de superficie es ${n(area).es}.`),
    ], { type: 'prism', l, w, h })
  }
  const known = ctx.rng.int(20, 70)
  const complement = ctx.rng.chance(0.5)
  const whole = complement ? 90 : 180
  return ask(
    ctx,
    complement
      ? L(`An angle measures ${n(known).en}°. What is its complement?`, `Ein Winkel misst ${n(known).de}°. Wie groß ist sein Komplement?`, `Un ángulo mide ${n(known).es}°. ¿Cuánto mide su complemento?`)
      : L(`An angle measures ${n(known).en}°. What is its supplement?`, `Ein Winkel misst ${n(known).de}°. Wie groß ist sein Supplement?`, `Un ángulo mide ${n(known).es}°. ¿Cuánto mide su suplemento?`),
    { type: 'number' },
    { kind: 'number', value: whole - known },
    [
      L(complement ? 'Complements add to 90°.' : 'Supplements add to 180°.', complement ? 'Komplemente ergeben 90°.' : 'Supplemente ergeben 180°.', complement ? 'Los complementos suman 90°.' : 'Los suplementos suman 180°.'),
      L(`${n(whole).en} − ${n(known).en} = ${n(whole - known).en}.`, `${n(whole).de} − ${n(known).de} = ${n(whole - known).de}.`, `${n(whole).es} − ${n(known).es} = ${n(whole - known).es}.`),
    ],
  )
}

export function g7spA(ctx: Ctx) {
  const every = Math.max(2, knobNum(ctx, 'qty', 10))
  const groups = Math.max(1, knobNum(ctx, 'charts', 2))
  const pack = textChoice(
    L(`Ask every ${every}th customer, across ${groups === 1 ? 'the whole day' : `${groups} different hours`}.`, `Frage ${groups === 1 ? 'den ganzen Tag' : `in ${groups} verschiedenen Stunden`} jede ${every}. Person.`, `Pregunta a cada ${every}.ª persona, durante ${groups === 1 ? 'todo el día' : `${groups} horas distintas`}.`),
    [
      L('Ask only your four closest friends.', 'Frage nur deine vier engsten Freundinnen und Freunde.', 'Pregunta solo a tus cuatro amigos más cercanos.'),
      L('Ask people already buying honey cake.', 'Frage Leute, die schon Honigkuchen kaufen.', 'Pregunta a quienes ya compran pastel de miel.'),
    ],
    ctx.rng,
  )
  return ask(ctx, L('Which sample can speak most fairly for the town’s favorite bread?', 'Welche Stichprobe spricht am fairsten für das Lieblingsbrot der Stadt?', '¿Cuál muestra habla con más justicia del pan favorito del pueblo?'), { type: 'choice', options: pack.options }, pack.answer, [
    L('A fair sample gives many different people a chance.', 'Eine faire Stichprobe gibt vielen verschiedenen Menschen eine Chance.', 'Una muestra justa da oportunidad a personas distintas.'),
    L('Every tenth customer across a day is less biased than a circle of friends.', 'Jede zehnte Person über einen Tag ist weniger verzerrt als ein Freundeskreis.', 'Cada décima persona durante un día tiene menos sesgo que un círculo de amigos.'),
  ])
}

export function g7spB(ctx: Ctx) {
  const size = Math.max(4, knobNum(ctx, 'qty', 6))
  const low = 4 + knobNum(ctx, 'charts', 1)
  const high = low + (knobBool(ctx, 'twist', false) ? 6 : 4)
  const a = dataSet(ctx, size, high)
  const b = dataSet(ctx, size, low)
  const pack = textChoice(L('Group A', 'Gruppe A', 'Grupo A'), [L('Group B', 'Gruppe B', 'Grupo B'), L('The means are equal', 'Die Mittelwerte sind gleich', 'Las medias son iguales')], ctx.rng)
  return ask(ctx, L('Which group has the greater mean?', 'Welche Gruppe hat den größeren Mittelwert?', '¿Qué grupo tiene la media mayor?'), { type: 'choice', options: pack.options }, pack.answer, [
    L(`Group A averages ${n(high).en}. Group B averages ${n(low).en}.`, `Gruppe A hat den Mittelwert ${n(high).de}. Gruppe B hat den Mittelwert ${n(low).de}.`, `El grupo A promedia ${n(high).es}. El grupo B promedia ${n(low).es}.`),
    L(`${n(high).en} is greater than ${n(low).en}, so Group A has the greater mean.`, `${n(high).de} ist größer als ${n(low).de}, also hat Gruppe A den größeren Mittelwert.`, `${n(high).es} es mayor que ${n(low).es}, así que el grupo A tiene la media mayor.`),
  ], { type: 'pair-lists', aTitle: L('Group A', 'Gruppe A', 'Grupo A'), bTitle: L('Group B', 'Gruppe B', 'Grupo B'), a, b })
}

export function g7spC(ctx: Ctx) {
  if (ctx.mode === 'compound') {
    return fractionQuestion(ctx, 1, 9, L('A fair spinner has 3 equal sectors and exactly 1 is teal. You spin twice. What is the probability both spins are teal?', 'Ein faires Glücksrad hat 3 gleiche Felder, genau 1 ist petrol. Du drehst zweimal. Wie groß ist die Wahrscheinlichkeit, dass beide Drehungen petrol sind?', 'Una ruleta justa tiene 3 sectores iguales y exactamente 1 es verde azulado. Giras dos veces. ¿Cuál es la probabilidad de que ambos giros sean verde azulado?'), [
      L(`One teal spin has probability ${frac(0, 1, 3)}.`, `Eine petrolfarbene Drehung hat die Wahrscheinlichkeit ${frac(0, 1, 3)}.`, `Un giro verde azulado tiene probabilidad ${frac(0, 1, 3)}.`),
      L(`Independent spins multiply: ${frac(0, 1, 3)} × ${frac(0, 1, 3)} = ${frac(0, 1, 9)}.`, `Unabhängige Drehungen werden multipliziert: ${frac(0, 1, 3)} × ${frac(0, 1, 3)} = ${frac(0, 1, 9)}.`, `Los giros independientes se multiplican: ${frac(0, 1, 3)} × ${frac(0, 1, 3)} = ${frac(0, 1, 9)}.`),
    ])
  }
  if (ctx.mode === 'complement') {
    return fractionQuestion(ctx, 1, 3, L('A spinner has 3 equal sectors: 2 coral and 1 teal. What is the probability of not landing on coral?', 'Ein Glücksrad hat 3 gleiche Felder: 2 koralle und 1 petrol. Wie groß ist die Wahrscheinlichkeit, nicht auf Koralle zu landen?', 'Una ruleta tiene 3 sectores iguales: 2 coral y 1 verde azulado. ¿Cuál es la probabilidad de no caer en coral?'), [
      L(`Coral has probability ${frac(0, 2, 3)}.`, `Koralle hat die Wahrscheinlichkeit ${frac(0, 2, 3)}.`, `Coral tiene probabilidad ${frac(0, 2, 3)}.`),
      L(`The complement is 1 − ${frac(0, 2, 3)} = ${frac(0, 1, 3)}.`, `Das Gegenereignis ist 1 − ${frac(0, 2, 3)} = ${frac(0, 1, 3)}.`, `El complemento es 1 − ${frac(0, 2, 3)} = ${frac(0, 1, 3)}.`),
    ])
  }
  const favorable = ctx.rng.int(1, 2)
  return fractionQuestion(ctx, favorable, 3, L(`A spinner has 3 equal sectors and ${n(favorable).en} are coral. What is the probability of coral?`, `Ein Glücksrad hat 3 gleiche Felder, ${n(favorable).de} sind koralle. Wie groß ist die Wahrscheinlichkeit für Koralle?`, `Una ruleta tiene 3 sectores iguales y ${n(favorable).es} son coral. ¿Cuál es la probabilidad de coral?`), [
    L('Favorable outcomes divided by equally likely outcomes.', 'Günstige Ergebnisse geteilt durch gleich wahrscheinliche Ergebnisse.', 'Resultados favorables divididos entre resultados igualmente posibles.'),
    L(`${n(favorable).en} / ${n(3).en} = ${frac(0, favorable, 3)}.`, `${n(favorable).de} / ${n(3).de} = ${frac(0, favorable, 3)}.`, `${n(favorable).es} / ${n(3).es} = ${frac(0, favorable, 3)}.`),
  ])
}
