import { defaultKnobs } from '../data/skills'
import type { KnobValues, Skill } from './types'

// Level numbers still set the starting values. They are shown as words only, never as a row of choices.
export function levelKey(level: number) {
  if (level <= 2) return 'lvl.easy'
  if (level === 3) return 'lvl.base'
  return 'lvl.hard'
}

// The name for a set of settings: the level's name while untouched, otherwise "Custom".
// `skip` leaves out choices that identify the card, such as which kind of problem it is.
export function settingsKey(skill: Skill, level: number, values: KnobValues, skip: readonly string[] = []) {
  const base = defaultKnobs(skill, level)
  const untouched = skill.knobs.every((knob) => skip.includes(knob.id) || values[knob.id] === base[knob.id])
  return untouched ? levelKey(level) : 'lvl.custom'
}
