import { ask, knobNum, L, n, type Ctx } from './shared'

export function equation(ctx: Ctx, steps: 'one' | 'two' | 'dist') {
  // The largest number the hidden x can take. The default of 9 is the classic range.
  const cap = knobNum(ctx, 'max', 9)
  const x = ctx.rng.int(2, cap)
  if (steps === 'one') {
    if (ctx.rng.chance(0.5)) {
      const b = ctx.rng.int(2, cap + 3)
      return ask(
        ctx,
        L('Solve for x.', 'Löse nach x.', 'Resuelve para x.'),
        { type: 'number', allowNegative: true },
        { kind: 'number', value: x },
        [
          L(`Subtract ${n(b).en} from both sides.`, `Subtrahiere ${n(b).de} von beiden Seiten.`, `Resta ${n(b).es} de ambos lados.`),
          L(`x = ${n(x).en}. Check: ${n(x).en} + ${n(b).en} = ${n(x + b).en}.`, `x = ${n(x).de}. Probe: ${n(x).de} + ${n(b).de} = ${n(x + b).de}.`, `x = ${n(x).es}. Prueba: ${n(x).es} + ${n(b).es} = ${n(x + b).es}.`),
        ],
        { type: 'balance', left: L(`x + ${n(b).en}`, `x + ${n(b).de}`, `x + ${n(b).es}`), right: n(x + b) },
      )
    }
    const a = ctx.rng.int(2, cap - 1)
    return ask(
      ctx,
      L('Solve for x.', 'Löse nach x.', 'Resuelve para x.'),
      { type: 'number', allowNegative: true },
      { kind: 'number', value: x },
      [
        L(`Divide both sides by ${n(a).en}.`, `Teile beide Seiten durch ${n(a).de}.`, `Divide ambos lados entre ${n(a).es}.`),
        L(`x = ${n(x).en}. Check: ${n(a).en} × ${n(x).en} = ${n(a * x).en}.`, `x = ${n(x).de}. Probe: ${n(a).de} × ${n(x).de} = ${n(a * x).de}.`, `x = ${n(x).es}. Prueba: ${n(a).es} × ${n(x).es} = ${n(a * x).es}.`),
      ],
      { type: 'balance', left: L(`${n(a).en}x`, `${n(a).de}x`, `${n(a).es}x`), right: n(a * x) },
    )
  }
  if (steps === 'dist') {
    const a = ctx.rng.int(2, 5)
    const b = ctx.rng.int(1, 6)
    return ask(
      ctx,
      L('Solve for x.', 'Löse nach x.', 'Resuelve para x.'),
      { type: 'number', allowNegative: true },
      { kind: 'number', value: x },
      [
        L(`Distribute: ${n(a).en}(x + ${n(b).en}) = ${n(a).en}x + ${n(a * b).en}.`, `Ausmultiplizieren: ${n(a).de}(x + ${n(b).de}) = ${n(a).de}x + ${n(a * b).de}.`, `Distribuye: ${n(a).es}(x + ${n(b).es}) = ${n(a).es}x + ${n(a * b).es}.`),
        L(`Subtract ${n(a * b).en}, then divide by ${n(a).en}. x = ${n(x).en}.`, `Subtrahiere ${n(a * b).de} und teile durch ${n(a).de}. x = ${n(x).de}.`, `Resta ${n(a * b).es} y divide entre ${n(a).es}. x = ${n(x).es}.`),
      ],
      { type: 'balance', left: L(`${n(a).en}(x + ${n(b).en})`, `${n(a).de}(x + ${n(b).de})`, `${n(a).es}(x + ${n(b).es})`), right: n(a * (x + b)) },
    )
  }
  const a = ctx.rng.int(2, cap - 1)
  const b = ctx.rng.int(-(cap - 1), cap - 1) || 3
  const c = a * x + b
  return ask(
    ctx,
    L('Solve for x.', 'Löse nach x.', 'Resuelve para x.'),
    { type: 'number', allowNegative: true },
    { kind: 'number', value: x },
    [
      L(
        b >= 0 ? `Subtract ${n(b).en} from both sides.` : `Add ${n(Math.abs(b)).en} to both sides.`,
        b >= 0 ? `Subtrahiere ${n(b).de} von beiden Seiten.` : `Addiere ${n(Math.abs(b)).de} auf beiden Seiten.`,
        b >= 0 ? `Resta ${n(b).es} de ambos lados.` : `Suma ${n(Math.abs(b)).es} a ambos lados.`,
      ),
      L(`Then divide by ${n(a).en}. x = ${n(x).en}.`, `Dann teile durch ${n(a).de}. x = ${n(x).de}.`, `Luego divide entre ${n(a).es}. x = ${n(x).es}.`),
    ],
    {
      type: 'balance',
      left: L(
        `${n(a).en}x ${b < 0 ? '−' : '+'} ${n(Math.abs(b)).en}`,
        `${n(a).de}x ${b < 0 ? '−' : '+'} ${n(Math.abs(b)).de}`,
        `${n(a).es}x ${b < 0 ? '−' : '+'} ${n(Math.abs(b)).es}`,
      ),
      right: n(c),
    },
  )
}
