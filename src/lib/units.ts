import { defaultKnobs } from '../data/skills'
import type { Attempt, KnobOption, KnobValues, Localized, Skill } from './types'

export interface Layer {
  id: string
  label: KnobOption['label']
  options: KnobOption[]
}

function isSquare(skill: Skill, id: string) {
  const knob = skill.knobs.find((item) => item.id === id)
  return Boolean(knob && knob.kind === 'select' && knob.id !== 'place' && knob.options.length >= 2 && knob.options.length <= 8)
}

export function branchIds(skill: Skill) {
  return skill.knobs.filter((knob) => knob.kind === 'select' && knob.id !== 'mode' && knob.id !== 'place' && knob.options.length >= 2 && knob.options.length <= 8).map((knob) => knob.id)
}

// Every square choice, hidden inside the difficulty list because the square already chose it.
export function squareIds(skill: Skill) {
  const ids = ['mode', ...branchIds(skill)]
  return ids.filter((id, index) => ids.indexOf(id) === index && skill.knobs.some((knob) => knob.id === id))
}

function shown(skill: Skill, id: string, values: KnobValues) {
  const knob = skill.knobs.find((item) => item.id === id)
  if (!knob?.when) return true
  return knob.when.in.includes(String(values[knob.when.id] ?? ''))
}

// Squares that define this unit, skipping a list that the current path hides.
export function identityIds(skill: Skill, knobs: KnobValues = {}) {
  return squareIds(skill).filter((id) => shown(skill, id, knobs))
}

export function layerOf(skill: Skill, id: string): Layer | null {
  const knob = skill.knobs.find((item) => item.id === id)
  if (!knob || knob.kind !== 'select' || !isSquare(skill, id)) return null
  return { id, label: knob.label, options: knob.options }
}

// The next row of squares. Null means this path is a unit that can be selected.
export function nextLayer(skill: Skill, path: Record<string, string>): Layer | null {
  const values: KnobValues = { ...path }
  if (isSquare(skill, 'mode') && path.mode == null) return layerOf(skill, 'mode')
  for (const id of branchIds(skill)) {
    if (path[id] != null) continue
    if (!shown(skill, id, values)) continue
    const layer = layerOf(skill, id)
    if (layer) return layer
  }
  return null
}

export function knobsForPath(skill: Skill, difficulty: number, path: Record<string, string>): KnobValues {
  const values = defaultKnobs(skill, difficulty)
  for (const [id, value] of Object.entries(path)) values[id] = value
  return values
}

// Rebuild the squares that were stored on an attempt, such as "div|frac".
// Hidden squares are skipped in the same order they were recorded.
export function knobsFromVariant(skill: Skill, difficulty: number, variant?: string): KnobValues {
  const values = defaultKnobs(skill, difficulty)
  if (!variant) return values
  const parts = variant.split('|')
  let index = 0
  for (const id of squareIds(skill)) {
    const knob = skill.knobs.find((item) => item.id === id)
    if (!knob) continue
    if (knob.when && !knob.when.in.includes(String(values[knob.when.id] ?? ''))) continue
    const part = parts[index]
    index += 1
    if (part) values[id] = part
  }
  return values
}

export function identityPath(skill: Skill, knobs: KnobValues): Record<string, string> {
  const path: Record<string, string> = {}
  for (const id of identityIds(skill, knobs)) {
    const value = knobs[id]
    if (typeof value === 'string') path[id] = value
  }
  return path
}

export function identityKnobs(skill: Skill, knobs: KnobValues): KnobValues {
  const values: KnobValues = {}
  for (const id of identityIds(skill, knobs)) {
    if (knobs[id] != null) values[id] = knobs[id]
  }
  return values
}

export function unitKey(skillId: string, knobs: KnobValues, skill?: Skill) {
  const ids = skill ? identityIds(skill, knobs) : ['mode']
  const parts = ids.filter((id) => knobs[id] != null).map((id) => `${id}:${String(knobs[id])}`)
  return `${skillId}|${parts.join('|')}`
}

export function unitVariant(skill: Skill, knobs: KnobValues) {
  return identityIds(skill, knobs).map((id) => String(knobs[id] ?? '')).filter(Boolean).join('|')
}

export function unitTitle(skill: Skill, knobs: KnobValues): Localized | null {
  const labels: Localized[] = []
  for (const id of identityIds(skill, knobs)) {
    const knob = skill.knobs.find((item) => item.id === id)
    if (!knob || knob.kind !== 'select') continue
    const option = knob.options.find((item) => item.value === knobs[id])
    if (option) labels.push(option.label)
  }
  if (!labels.length) return null
  return {
    en: labels.map((item) => item.en).join(' · '),
    de: labels.map((item) => item.de).join(' · '),
    es: labels.map((item) => item.es).join(' · '),
  }
}

export function matchesPath(knobs: KnobValues, path: Record<string, string>) {
  return Object.entries(path).every(([id, value]) => knobs[id] === value)
}

export type Heat = 'green' | 'yellow' | 'red' | 'none'

export function heatFor(attempts: Attempt[], skillId: string, variant: string) {
  const recent = attempts.filter((item) => item.skillId === skillId && item.variant === variant).slice(-10)
  if (!recent.length) return { heat: 'none' as Heat, rate: null as number | null, seen: 0 }
  const rate = recent.filter((item) => item.correct).length / recent.length
  const heat: Heat = rate > 0.9 ? 'green' : rate >= 0.7 ? 'yellow' : 'red'
  return { heat, rate, seen: recent.length }
}
