import type { Skill } from './types'

// Accents fold away, and ä/ö/ü/ß also match the spellings ae/oe/ue/ss.
function looseForms(value: string) {
  const lower = value.toLowerCase().replace(/ß/g, 'ss')
  const stripped = lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const expanded = lower
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  return stripped === expanded ? [stripped] : [stripped, expanded]
}

export function skillMatches(skill: Skill, query: string) {
  const needle = query.trim()
  if (!needle) return true
  const hay = [
    skill.code,
    skill.title.en,
    skill.title.de,
    skill.title.es,
    skill.blurb.en,
    skill.blurb.de,
    skill.blurb.es,
  ].join('\n')
  const needles = looseForms(needle)
  const hays = looseForms(hay)
  return needles.some((item) => hays.some((text) => text.includes(item)))
}
