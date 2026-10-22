import { gradeAnswer, isCorrect } from '../src/lib/grade.ts'
import { defaultKnobs, SKILLS, getSkill } from '../src/data/skills.ts'
import { PRESETS, materialize, standardsBlueprint } from '../src/data/pacing.ts'
import { TOPICS, topicBlueprint } from '../src/data/topics.ts'
import { generateQuestion } from '../src/engine/index.ts'
import { mistakeBlueprint } from '../src/lib/mistakes.ts'
import { fractionValue } from '../src/lib/math.ts'
import { knobsForPath, knobsFromVariant, unitVariant } from '../src/lib/units.ts'
import type { Answer, BlueprintItem, Grade, KnobValues, Question, Response, Skill } from '../src/lib/types.ts'

function expectKind(response: Response, answer: Answer) {
  const map: Record<Response['type'], Answer['kind']> = {
    number: 'number',
    fraction: 'fraction',
    choice: 'choice',
    compare: 'compare',
    order: 'order',
    numberline: 'number',
    coordinate: 'points',
    shade: 'shade',
    clock: 'clock',
    'chart-build': 'chart',
    angle: 'angle',
    ratio: 'ratio',
    digits: 'digits',
    multi: 'multi',
  }
  if (map[response.type] !== answer.kind) {
    throw new Error(`${response.type} produced ${answer.kind}`)
  }
}

function mutate(answer: Answer): Answer | null {
  if (answer.kind === 'number') return { ...answer, value: answer.value + 9 }
  if (answer.kind === 'choice') return { kind: 'choice', id: 'not-the-answer' }
  if (answer.kind === 'fraction') return { ...answer, n: answer.n + 3 }
  return null
}

function structural(question: Question) {
  if (!question.prompt.en || !question.prompt.de || !question.prompt.es) throw new Error('prompt')
  if (question.steps.length < 1) throw new Error('steps')
  for (const step of question.steps) {
    if (!step.text.en || !step.text.de || !step.text.es) throw new Error('step text')
  }
  expectKind(question.response, question.answer)
  if (question.response.type === 'choice' && question.answer.kind === 'choice') {
    if (!question.response.options.some((option) => option.id === question.answer.kind && false)) {
      /* typed access below */
    }
    const answer = question.answer
    if (!question.response.options.some((option) => option.id === answer.id)) throw new Error('choice missing')
  }
  if (question.response.type === 'order' && question.answer.kind === 'order') {
    const ids = question.response.items.map((item) => item.id).sort().join()
    const ans = [...question.answer.ids].sort().join()
    if (ids !== ans) throw new Error('order permutation')
  }
  if (question.response.type === 'shade' && question.answer.kind === 'shade') {
    const cells = question.response.rows * question.response.cols
    if (question.answer.count < 0 || question.answer.count > cells) throw new Error('shade')
  }
  if (question.answer.kind === 'fraction' && question.answer.d <= 0) throw new Error('den')
  if (question.answer.kind === 'clock' && (question.answer.h < 1 || question.answer.h > 12 || question.answer.m < 0 || question.answer.m > 59)) {
    throw new Error('clock')
  }
  if (!isCorrect(question.answer, question.answer)) throw new Error('self grade')
  const wrong = mutate(question.answer)
  if (wrong && isCorrect(question.answer, wrong)) throw new Error('mutated still correct')
}

// Every skill is exercised at its default settings for each problem type, and each variable is pushed to
// its smallest and largest value (or both toggle states, or every choice) for each problem type it applies to.
interface Case {
  label: string
  difficulty: number
  knobs: KnobValues
}

function casesFor(skill: Skill): Case[] {
  const cases: Case[] = []
  const modeKnob = skill.knobs.find((knob) => knob.id === 'mode')
  const modes: (string | null)[] = modeKnob && modeKnob.kind === 'select' ? modeKnob.options.map((option) => option.value) : [null]
  for (const difficulty of [1, 3, 5]) {
    const base = defaultKnobs(skill, difficulty)
    for (const mode of modes) {
      cases.push({ label: `defaults d${difficulty} ${mode ?? ''}`.trim(), difficulty, knobs: mode ? { ...base, mode } : base })
    }
    for (const knob of skill.knobs) {
      if (knob.id === 'mode') continue
      const values: (number | boolean | string)[] =
        knob.kind === 'range' ? [knob.min, knob.max] : knob.kind === 'toggle' ? [true, false] : knob.options.map((option) => option.value)
      for (const value of values) {
        for (const mode of modes) {
          cases.push({
            label: `${knob.id}=${value} d${difficulty} ${mode ?? ''}`.trim(),
            difficulty,
            knobs: { ...base, ...(mode ? { mode } : {}), [knob.id]: value },
          })
        }
      }
    }
  }
  return cases
}

let failures = 0
for (const skill of SKILLS) {
  for (const testCase of casesFor(skill)) {
    for (let i = 0; i < 3; i++) {
      try {
        structural(generateQuestion(skill, testCase.difficulty, testCase.knobs))
      } catch (error) {
        failures += 1
        console.error(skill.id, testCase.label, error instanceof Error ? error.message : error)
        if (failures > 25) {
          console.error('too many failures')
          process.exit(1)
        }
      }
    }
  }
}

function assertKnobs(label: string, item: BlueprintItem) {
  const skill = SKILLS.find((candidate) => candidate.id === item.skillId)
  if (!skill) {
    console.error('unknown skill', label, item.skillId)
    failures += 1
    return
  }
  for (const [key, value] of Object.entries(item.knobs)) {
    const knob = skill.knobs.find((candidate) => candidate.id === key)
    const valid =
      knob !== undefined &&
      (knob.kind === 'range'
        ? typeof value === 'number' && value >= knob.min && value <= knob.max
        : knob.kind === 'toggle'
          ? typeof value === 'boolean'
          : knob.options.some((option) => option.value === value))
    if (!valid) {
      console.error('bad knob', label, item.skillId, key, String(value))
      failures += 1
    }
  }
}

for (const preset of PRESETS) {
  const blueprint = materialize(preset)
  if (!getKnown(blueprint.items.map((item) => item.skillId))) {
    console.error('bad preset', preset.id)
    failures += 1
  }
  for (const item of blueprint.items) assertKnobs(preset.id, item)
}

const grades: Grade[] = [3, 4, 5, 6, 7]
for (const grade of grades) {
  for (const span of ['half', 'year'] as const) {
    const blueprint = standardsBlueprint(grade, span)
    const total = blueprint.items.reduce((sum, item) => sum + item.count, 0)
    if (!blueprint.items.length || total > 36) {
      console.error('bad span size', grade, span, total)
      failures += 1
    }
    for (const item of blueprint.items) assertKnobs(`${grade}-${span}`, item)
  }
}

for (const topic of TOPICS) {
  const blueprint = topicBlueprint(topic)
  const total = blueprint.items.reduce((sum, item) => sum + item.count, 0)
  const gradesIn = new Set(blueprint.items.map((item) => getSkill(item.skillId)?.grade))
  if (!blueprint.items.length || total > 36 || gradesIn.size < 2) {
    console.error('bad topic', topic.id, total, [...gradesIn].join(','))
    failures += 1
  }
  for (const item of blueprint.items) {
    assertKnobs(topic.id, item)
    const skill = getSkill(item.skillId)
    if (!skill) continue
    try {
      structural(generateQuestion(skill, item.difficulty, item.knobs))
    } catch (error) {
      failures += 1
      console.error(topic.id, item.skillId, error instanceof Error ? error.message : error)
    }
  }
}

const signed = getSkill('7.ns.a')
const fractions = getSkill('3.nf.a')
if (signed && fractions) {
  const knobs = knobsForPath(signed, 4, { mode: 'div', family: 'frac' })
  const back = knobsFromVariant(signed, 4, unitVariant(signed, knobs))
  if (back.mode !== 'div' || back.family !== 'frac') {
    console.error('variant roundtrip', back.mode, back.family)
    failures += 1
  }
  const plain = knobsForPath(fractions, 3, { mode: 'compare' })
  if (knobsFromVariant(fractions, 3, unitVariant(fractions, plain)).mode !== 'compare') {
    console.error('variant mode')
    failures += 1
  }
}

const progress = mistakeBlueprint(
  [
    { id: '1', skillId: '3.nf.a', correct: false, timeMs: 1, difficulty: 3, at: 1, mode: 'practice', variant: 'compare' },
    { id: '2', skillId: '3.nf.a', correct: true, timeMs: 1, difficulty: 3, at: 2, mode: 'practice', variant: 'shade' },
    { id: '4.nf.b', skillId: '4.nf.b', correct: false, timeMs: 1, difficulty: 4, at: 3, mode: 'test', variant: 'add' },
    { id: '3', skillId: '3.nf.a', correct: false, timeMs: 1, difficulty: 3, at: 4, mode: 'practice', variant: 'compare' },
  ],
  10,
)
const progressModes = progress?.items.map((item) => `${item.skillId}:${String(item.knobs.mode)}x${item.count}`).join(',')
if (progressModes !== '3.nf.a:comparex2,4.nf.b:addx1') {
  console.error('mistake blueprint', progressModes)
  failures += 1
}

function getKnown(ids: string[]) {
  return ids.every((id) => SKILLS.some((skill) => skill.id === id))
}

if (fractionValue(-1, 1, 2) !== -1.5) {
  console.error('mixed negative')
  failures += 1
}
if (gradeAnswer({ kind: 'fraction', n: 1, d: 2, simplified: true }, { kind: 'fraction', n: 2, d: 4 }) !== 'unsimplified') {
  console.error('unsimplified')
  failures += 1
}

if (failures) {
  console.error(`FAILED ${failures}`)
  process.exit(1)
}
console.log(`OK ${SKILLS.length} skills, ${PRESETS.length} presets`)
