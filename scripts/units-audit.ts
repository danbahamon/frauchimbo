import { SKILLS } from '../src/data/skills.ts'

function visible(skill: (typeof SKILLS)[number], fixed: Record<string, string>) {
  return skill.knobs.filter((knob) => {
    if (knob.id === 'mode') return false
    if (knob.kind === 'select' && knob.id !== 'place' && knob.options.length <= 8) return false
    if (!knob.when) return true
    return knob.when.in.includes(String(fixed[knob.when.id] ?? ''))
  })
}

let short = 0
let total = 0
for (const skill of SKILLS) {
  const mode = skill.knobs.find((knob) => knob.id === 'mode' && knob.kind === 'select')
  const modes = mode && mode.kind === 'select' ? mode.options : [{ value: '' }]
  const branches = skill.knobs.filter((knob) => knob.kind === 'select' && knob.id !== 'mode' && knob.id !== 'place' && knob.options.length <= 8)
  for (const item of modes) {
    const sets = branches.length
      ? branches.flatMap((branch) => branch.options.map((option) => ({ mode: item.value, [branch.id]: option.value })))
      : [{ mode: item.value }]
    for (const fixed of sets) {
      const knobs = visible(skill, fixed)
      total += 1
      if (knobs.length < 3) {
        short += 1
        console.log(`${skill.id} ${Object.values(fixed).join('/')} (${knobs.length}) ${knobs.map((knob) => knob.id).join(',') || '-'}`)
      }
    }
  }
}
console.log(`--- ${short} of ${total}`)
