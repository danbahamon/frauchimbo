export type Locale = 'en' | 'de' | 'es'

export type Localized = Record<Locale, string>

export type Grade = 3 | 4 | 5 | 6 | 7

export type DomainId = 'OA' | 'NBT' | 'NF' | 'MD' | 'G' | 'RP' | 'NS' | 'EE' | 'SP'

export type Position = 'review' | 'onlevel' | 'stretch'

// A variable is shown only when another variable has one of the listed values (for example, a problem type).
export interface KnobWhen {
  id: string
  in: string[]
}

export interface KnobRange {
  id: string
  kind: 'range'
  min: number
  max: number
  step: number
  label: Localized
  hint: Localized
  when?: KnobWhen
  byDifficulty: [number, number, number, number, number]
}

export interface KnobToggle {
  id: string
  kind: 'toggle'
  label: Localized
  hint: Localized
  when?: KnobWhen
  byDifficulty: [boolean, boolean, boolean, boolean, boolean]
}

export interface KnobOption {
  value: string
  label: Localized
}

export interface KnobSelect {
  id: string
  kind: 'select'
  label: Localized
  hint: Localized
  when?: KnobWhen
  options: KnobOption[]
  byDifficulty: [string, string, string, string, string]
}

export type Knob = KnobRange | KnobToggle | KnobSelect

export type KnobValues = Record<string, number | boolean | string>

export interface Skill {
  id: string
  grade: Grade
  domain: DomainId
  code: string
  title: Localized
  blurb: Localized
  knobs: Knob[]
  prereq: string[]
  months: number[]
}

export type Sign = '<' | '=' | '>'

export type ShapeKind =
  | 'square'
  | 'rectangle'
  | 'rhombus'
  | 'parallelogram'
  | 'trapezoid'
  | 'triangle'
  | 'right-triangle'
  | 'pentagon'
  | 'hexagon'
  | 'scalene'

export type MathPart =
  | { t: 'n'; v: string }
  | { t: 'op'; v: string }
  | { t: 'frac'; n: string; d: string }

export type Stimulus =
  | { type: 'rect'; w: number; h: number; unit: string }
  | { type: 'triangle'; b: number; h: number }
  | { type: 'prism'; l: number; w: number; h: number }
  | { type: 'circle'; r: number }
  | { type: 'angle'; degrees: number }
  | { type: 'protractor'; degrees: number }
  | { type: 'clock'; h: number; m: number }
  | {
      type: 'chart'
      labels: Localized[]
      values: number[]
      colors: string[]
      axisMax: number
      unit: Localized
    }
  | { type: 'grid'; rows: number; cols: number; shaded: number }
  | {
      type: 'numberline'
      min: number
      max: number
      step: number
      marks: { at: number; label: string }[]
      point?: number
    }
  | { type: 'shape'; shape: ShapeKind; shadedParts?: number; parts?: number }
  | { type: 'balance'; left: Localized; right: Localized }
  | { type: 'expression'; en: MathPart[]; de: MathPart[]; es: MathPart[] }
  | { type: 'marbles'; items: { color: string; count: number; name: Localized }[] }
  | { type: 'dots'; labels: string[]; counts: number[] }
  | { type: 'spinner'; sectors: { label: Localized; color: string }[] }
  | {
      type: 'coord'
      xMin: number
      xMax: number
      yMin: number
      yMax: number
      points: { x: number; y: number }[]
    }
  | { type: 'scene'; tone: 'bay' | 'market' | 'sky' | 'kitchen' }
  | { type: 'pair-lists'; aTitle: Localized; bTitle: Localized; a: number[]; b: number[] }

export interface ChoiceOption {
  id: string
  label: Localized
  shape?: ShapeKind
  parts?: number
  shaded?: number
  uneven?: boolean
}

export type Response =
  | { type: 'number'; allowNegative?: boolean; allowDecimal?: boolean }
  | { type: 'fraction'; allowWhole?: boolean; allowNegative?: boolean }
  | { type: 'choice'; options: ChoiceOption[] }
  | { type: 'compare'; left: Localized; right: Localized }
  | { type: 'order'; items: { id: string; label: Localized }[] }
  | { type: 'numberline'; min: number; max: number; step: number; fraction?: boolean }
  | { type: 'coordinate'; xMin: number; xMax: number; yMin: number; yMax: number }
  | { type: 'shade'; rows: number; cols: number }
  | { type: 'clock' }
  | {
      type: 'chart-build'
      labels: Localized[]
      axisChoices: number[]
      maxValue: number
      step?: number
    }
  | { type: 'angle' }
  | { type: 'ratio'; max: number }
  | { type: 'digits'; columns: Localized[] }
  | {
      type: 'multi'
      fields: { id: string; label: Localized; allowDecimal?: boolean; allowNegative?: boolean }[]
    }

export type Answer =
  | { kind: 'number'; value: number; tolerance?: number }
  | { kind: 'fraction'; n: number; d: number; whole?: number; simplified?: boolean }
  | { kind: 'choice'; id: string }
  | { kind: 'compare'; sign: Sign }
  | { kind: 'order'; ids: string[] }
  | { kind: 'points'; points: { x: number; y: number }[] }
  | { kind: 'shade'; count: number }
  | { kind: 'clock'; h: number; m: number }
  | { kind: 'chart'; values: number[]; colors?: (string | null)[]; axisMax: number; axisAtLeast: number }
  | { kind: 'angle'; degrees: number; tolerance?: number }
  | { kind: 'ratio'; a: number; b: number }
  | { kind: 'digits'; digits: number[] }
  | { kind: 'multi'; parts: Record<string, number>; tolerance?: number }

export interface Step {
  text: Localized
}

export interface Question {
  id: string
  skillId: string
  prompt: Localized
  stimulus?: Stimulus
  response: Response
  answer: Answer
  steps: Step[]
  difficulty: number
}

export interface Profile {
  name: string
  grade: Grade
  position: Position
  locale: Locale
  sound: boolean
  motion: boolean
  theme: 'day' | 'dusk'
  createdAt: number
}

// What kind of mistake a wrong answer was. Used by the stats deep dive.
export type MissKind = 'blank' | 'simplify' | 'sign' | 'place' | 'close' | 'pick' | 'order' | 'read' | 'method'

export interface Attempt {
  id: string
  skillId: string
  correct: boolean
  timeMs: number
  difficulty: number
  at: number
  mode: 'practice' | 'test'
  testId?: string
  // The problem type that produced the question, for example "compare" or "missing".
  variant?: string
  result?: 'correct' | 'unsimplified' | 'incorrect' | 'blank'
  miss?: MissKind
  // Readable detail for the "questions seen" list. Stored as text so the list stays useful after the bank changes.
  prompt?: string
  given?: string
  expected?: string
}

export interface BlueprintItem {
  skillId: string
  count: number
  difficulty: number
  knobs: KnobValues
}

export interface Blueprint {
  v: 1
  title?: Localized
  presetId?: string
  items: BlueprintItem[]
}

export interface TestRecord {
  id: string
  blueprint: Blueprint
  questions: Question[]
  responses: (Answer | null)[]
  times: number[]
  correct: boolean[]
  startedAt: number
  finishedAt: number
  investigate: { spotted: number; total: number } | null
}

export interface ActiveTest {
  blueprint: Blueprint
  questions: Question[]
  responses: (Answer | null)[]
  times: number[]
  index: number
  startedAt: number
  questionStartedAt: number
}

export interface Pin {
  skillId: string
  knobs: KnobValues
}

export type Route =
  | { name: 'home' }
  | { name: 'practice'; skillId?: string }
  | { name: 'play'; skillId: string; auto?: boolean; difficulty?: number; knobs?: KnobValues }
  | { name: 'play'; queue: BlueprintItem[] }
  | { name: 'workout' }
  | { name: 'test' }
  | { name: 'run' }
  | { name: 'choose'; id: string }
  | { name: 'investigate'; id: string }
  | { name: 'summary'; id: string }
  | { name: 'stats' }
  | { name: 'settings' }
  | { name: 'shared'; blueprint: Blueprint }

export interface PresetItem {
  skillId: string
  count: number
  difficulty: number
  knobs?: KnobValues
}

export interface Preset {
  id: string
  grade: Grade
  month: number
  title: Localized
  note: Localized
  items: PresetItem[]
}

export type GradeResult = 'correct' | 'unsimplified' | 'incorrect'

export const PALETTE = [
  { id: 'coral', hex: '#e25b45' },
  { id: 'teal', hex: '#0f766e' },
  { id: 'gold', hex: '#e0a100' },
  { id: 'indigo', hex: '#3c4c9a' },
  { id: 'plum', hex: '#7c4a7a' },
  { id: 'sage', hex: '#5f7d55' },
] as const

export const DOMAIN_ORDER: DomainId[] = ['OA', 'NBT', 'NF', 'MD', 'G', 'RP', 'NS', 'EE', 'SP']
