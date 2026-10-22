import { getSkill } from '../data/skills'
import type { Attempt, Blueprint, BlueprintItem } from './types'
import { L } from './math'
import { knobsFromVariant, unitKey } from './units'

// The last incorrect attempts, turned into fresh questions of those same kinds.
export function mistakeBlueprint(attempts: Attempt[], count: number): Blueprint | null {
  const wanted = Math.max(0, Math.min(36, Math.round(count)))
  if (!wanted) return null
  const misses = attempts.filter((item) => !item.correct).slice(-wanted).reverse()
  const items: BlueprintItem[] = []
  const indexByKey = new Map<string, number>()
  for (const miss of misses) {
    const skill = getSkill(miss.skillId)
    if (!skill) continue
    const difficulty = Math.min(5, Math.max(1, Math.round(miss.difficulty) || 3))
    const knobs = knobsFromVariant(skill, difficulty, miss.variant)
    const key = `${unitKey(miss.skillId, knobs, skill)}|${difficulty}`
    const existing = indexByKey.get(key)
    if (existing !== undefined) {
      const row = items[existing]
      if (row) row.count += 1
      continue
    }
    indexByKey.set(key, items.length)
    items.push({ skillId: miss.skillId, count: 1, difficulty, knobs })
  }
  if (!items.length) return null
  const total = items.reduce((sum, item) => sum + item.count, 0)
  return {
    v: 1,
    title: L(`Last ${total} mistakes`, `Die letzten ${total} Fehler`, `Los últimos ${total} errores`),
    items,
  }
}
