import { roundHalfUp } from '../lib/math'
import type { Ctx } from './shared'

export function avoidTie(value: number, place: number) {
  const step = place / 10
  if (!(step > 0) || !Number.isFinite(value)) return value
  const abs = Math.abs(value)
  let probe: number
  if (Number.isSafeInteger(abs) && Number.isInteger(place) && place >= 10) {
    const text = String(abs)
    const fromEnd = Math.round(Math.log10(place)) - 1
    probe = fromEnd >= 0 && fromEnd < text.length ? Number(text[text.length - 1 - fromEnd]) : 0
  } else {
    probe = Math.floor(abs / step) % 10
  }
  if (probe !== 5) return value
  const bump = Number.isInteger(step) && step >= 1 ? step : Math.max(1, step)
  return value + bump
}

export function complement(ctx: Ctx, whole: number) {
  const known = ctx.rng.int(15, whole - 15)
  return { known, missing: whole - known }
}

void roundHalfUp
