import type { KnobValues, Question, Skill } from '../lib/types'
import { getSkill } from '../data/skills'
import { makeCtx } from './shared'
import { g3g, g3mdA, g3mdB, g3mdC, g3mdD, g3nbt, g3nf, g3oaA, g3oaB, g3oaC, g3oaD } from './bank3'
import { g4g, g4mdA, g4mdB, g4mdC, g4nbtA, g4nbtB, g4nfA, g4nfB, g4nfC, g4oaA, g4oaB, g4oaC } from './bank4'
import { g5gA, g5gB, g5mdA, g5mdB, g5mdC, g5nbtA, g5nbtB, g5nfA, g5nfB, g5oaA, g5oaB } from './bank5'
import { g6eeA, g6eeB, g6eeC, g6g, g6nsA, g6nsB, g6nsC, g6rp, g6spA, g6spB } from './bank6'
import { g7eeA, g7eeB, g7gA, g7gB, g7ns, g7rp, g7spA, g7spB, g7spC } from './bank7'
import type { Ctx } from './shared'
import type { BlueprintItem } from '../lib/types'

const BANK: Record<string, (ctx: Ctx) => Question> = {
  '3.oa.a': g3oaA,
  '3.oa.b': g3oaB,
  '3.oa.c': g3oaC,
  '3.oa.d': g3oaD,
  '3.nbt.a': g3nbt,
  '3.nf.a': g3nf,
  '3.md.a': g3mdA,
  '3.md.b': g3mdB,
  '3.md.c': g3mdC,
  '3.md.d': g3mdD,
  '3.g.a': g3g,
  '4.oa.a': g4oaA,
  '4.oa.b': g4oaB,
  '4.oa.c': g4oaC,
  '4.nbt.a': g4nbtA,
  '4.nbt.b': g4nbtB,
  '4.nf.a': g4nfA,
  '4.nf.b': g4nfB,
  '4.nf.c': g4nfC,
  '4.md.a': g4mdA,
  '4.md.b': g4mdB,
  '4.md.c': g4mdC,
  '4.g.a': g4g,
  '5.oa.a': g5oaA,
  '5.oa.b': g5oaB,
  '5.nbt.a': g5nbtA,
  '5.nbt.b': g5nbtB,
  '5.nf.a': g5nfA,
  '5.nf.b': g5nfB,
  '5.md.a': g5mdA,
  '5.md.b': g5mdB,
  '5.md.c': g5mdC,
  '5.g.a': g5gA,
  '5.g.b': g5gB,
  '6.rp.a': g6rp,
  '6.ns.a': g6nsA,
  '6.ns.b': g6nsB,
  '6.ns.c': g6nsC,
  '6.ee.a': g6eeA,
  '6.ee.b': g6eeB,
  '6.ee.c': g6eeC,
  '6.g.a': g6g,
  '6.sp.a': g6spA,
  '6.sp.b': g6spB,
  '7.rp.a': g7rp,
  '7.ns.a': g7ns,
  '7.ee.a': g7eeA,
  '7.ee.b': g7eeB,
  '7.g.a': g7gA,
  '7.g.b': g7gB,
  '7.sp.a': g7spA,
  '7.sp.b': g7spB,
  '7.sp.c': g7spC,
}

export function generateQuestion(skill: Skill, difficulty: number, knobs: KnobValues): Question {
  const make = BANK[skill.id]
  if (!make) throw new Error(`Missing generator for ${skill.id}`)
  return make(makeCtx(skill, difficulty, knobs))
}

export function generateById(skillId: string, difficulty: number, knobs: KnobValues) {
  const skill = getSkill(skillId)
  if (!skill) throw new Error(`Unknown skill ${skillId}`)
  return generateQuestion(skill, difficulty, knobs)
}

export function generateTest(items: BlueprintItem[]) {
  return items.flatMap((item) =>
    Array.from({ length: item.count }, () => generateById(item.skillId, item.difficulty, item.knobs)),
  )
}
