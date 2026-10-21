import { roundHalfUp } from '../lib/math'
import type { Ctx } from './shared'

export function avoidTie(value: number, place: number) {
  const probe = Math.floor(Math.abs(value) / (place / 10)) % 10
  if (probe === 5) return value + Math.max(1, place / 10)
  return value
}

export function addWithin(span: number) {
  const digits = String(span).length
  const lo = 10 ** (digits - 1)
  const hi = span
  const a = lo + Math.floor(Math.random() * (hi - lo))
  const b = lo + Math.floor(Math.random() * (hi - lo))
  return { a, b }
}

export function complement(ctx: Ctx, whole: number) {
  const known = ctx.rng.int(15, whole - 15)
  return { known, missing: whole - known }
}

void roundHalfUp
