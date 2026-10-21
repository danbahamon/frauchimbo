import { monthIndex } from '../lib/math'
import { getSkill, SKILLS } from '../data/skills'
import type { Attempt, Grade } from '../lib/types'

export interface SkillStat {
  skillId: string
  attempts: number
  correct: number
  accuracy: number
  recent: number
  avgMs: number
}

export interface Recommendation {
  skillId: string
  difficulty: number
  reason: 'season' | 'grow' | 'harder' | 'prereq'
}

export function statsBySkill(attempts: Attempt[]): SkillStat[] {
  const map = new Map<string, Attempt[]>()
  for (const attempt of attempts) {
    const list = map.get(attempt.skillId) ?? []
    list.push(attempt)
    map.set(attempt.skillId, list)
  }
  return [...map.entries()].map(([skillId, list]) => {
    const recentList = list.slice(-8)
    const correct = list.filter((item) => item.correct).length
    const recentCorrect = recentList.filter((item) => item.correct).length
    const time = list.reduce((sum, item) => sum + item.timeMs, 0)
    return {
      skillId,
      attempts: list.length,
      correct,
      accuracy: correct / list.length,
      recent: recentCorrect / recentList.length,
      avgMs: time / list.length,
    }
  })
}

export function suggest(attempts: Attempt[], grade: Grade): Recommendation[] {
  const stats = new Map(statsBySkill(attempts).map((item) => [item.skillId, item]))
  const month = monthIndex()
  const school = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8]
  const reached = [9, 11, 1, 3, 5, 6].filter((item) => school.indexOf(item) <= school.indexOf(month)).at(-1) ?? 9
  const mine = SKILLS.filter((skill) => skill.grade === grade)
  const inSeason = mine.filter((skill) => skill.months.includes(month) || skill.months.includes(reached))
  const pool = inSeason.length ? inSeason : mine
  const recs: Recommendation[] = []
  const used = new Set<string>()

  const growth = [...stats.values()]
    .filter((item) => item.attempts >= 3 && item.recent < 0.7)
    .sort((a, b) => a.recent - b.recent)
  for (const item of growth) {
    const skill = getSkill(item.skillId)
    if (!skill || used.has(skill.id)) continue
    const weakPrereq = skill.prereq.find((id) => {
      const pre = stats.get(id)
      return !pre || pre.recent < 0.75
    })
    if (weakPrereq && !used.has(weakPrereq)) {
      recs.push({ skillId: weakPrereq, difficulty: 2, reason: 'prereq' })
      used.add(weakPrereq)
    }
    recs.push({ skillId: skill.id, difficulty: Math.max(1, 3 - (item.recent < 0.45 ? 1 : 0)), reason: 'grow' })
    used.add(skill.id)
    if (recs.length >= 3) return recs.slice(0, 3)
  }

  const strong = [...stats.values()].filter((item) => item.attempts >= 5 && item.recent >= 0.85)
  for (const item of strong) {
    if (used.has(item.skillId)) continue
    const last = attempts.filter((attempt) => attempt.skillId === item.skillId).at(-1)
    const difficulty = Math.min(5, (last?.difficulty ?? 3) + 1)
    recs.push({ skillId: item.skillId, difficulty, reason: 'harder' })
    used.add(item.skillId)
    if (recs.length >= 3) return recs.slice(0, 3)
  }

  for (const skill of pool) {
    if (used.has(skill.id)) continue
    recs.push({ skillId: skill.id, difficulty: 3, reason: 'season' })
    used.add(skill.id)
    if (recs.length >= 3) break
  }
  return recs.slice(0, 3)
}

export function strandAccuracy(attempts: Attempt[]) {
  const buckets = new Map<string, { correct: number; total: number }>()
  for (const attempt of attempts) {
    const skill = getSkill(attempt.skillId)
    if (!skill) continue
    const bucket = buckets.get(skill.domain) ?? { correct: 0, total: 0 }
    bucket.total += 1
    if (attempt.correct) bucket.correct += 1
    buckets.set(skill.domain, bucket)
  }
  return [...buckets.entries()].map(([domain, bucket]) => ({
    domain,
    accuracy: bucket.total ? bucket.correct / bucket.total : 0,
    total: bucket.total,
  }))
}
