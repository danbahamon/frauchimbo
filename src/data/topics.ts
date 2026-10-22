import { L } from '../lib/math'
import type { Blueprint, BlueprintItem, DomainId, KnobValues, Localized } from '../lib/types'
import { TEST_CAP } from './pacing'
import { getSkill, knobsForKind, problemKinds } from './skills'

interface TopicSkill {
  id: string
  modes?: string[]
  pin?: KnobValues
}

export interface Topic {
  id: string
  domain: DomainId
  title: Localized
  note: Localized
  skills: TopicSkill[]
}

function topic(id: string, domain: DomainId, en: string, de: string, es: string, noteEn: string, noteDe: string, noteEs: string, skills: TopicSkill[]): Topic {
  return { id, domain, title: L(en, de, es), note: L(noteEn, noteDe, noteEs), skills }
}

// Major ideas that keep going after the domain code changes.
// Fractions, for example, leave NF and continue in later number-system work.
export const TOPICS: Topic[] = [
  topic('fractions', 'NF', 'Fractions', 'Brüche', 'Fracciones', 'Naming, comparing, operating, and the later work that still uses fractions.', 'Benennen, vergleichen, rechnen, und die spätere Arbeit, die weiter mit Brüchen rechnet.', 'Nombrar, comparar, operar, y el trabajo posterior que sigue usando fracciones.', [
    { id: '3.nf.a' },
    { id: '3.g.a', modes: ['partition'] },
    { id: '4.nf.a' },
    { id: '4.nf.b' },
    { id: '5.nf.a' },
    { id: '5.nf.b' },
    { id: '5.md.b' },
    { id: '6.ns.a' },
    { id: '7.ns.a', pin: { family: 'frac' } },
  ]),
  topic('decimals', 'NBT', 'Decimals', 'Dezimalzahlen', 'Decimales', 'Tenths and hundredths, then place value and the four decimal operations.', 'Zehntel und Hundertstel, dann Stellenwerte und die vier Dezimalrechnungen.', 'Décimos y centésimos, luego el valor posicional y las cuatro operaciones decimales.', [
    { id: '4.nf.c' },
    { id: '5.nbt.a' },
    { id: '5.nbt.b', modes: ['adddec', 'subdec', 'muldec', 'divdec'] },
    { id: '6.ns.b', modes: ['mul', 'div'] },
  ]),
  topic('place', 'NBT', 'Place value', 'Stellenwerte', 'Valor posicional', 'From hundreds through the hundred trillions.', 'Von den Hundertern bis zu den hundert Billionen.', 'De las centenas hasta los cien billones.', [
    { id: '3.nbt.a' },
    { id: '4.nbt.a' },
    { id: '5.nbt.c' },
  ]),
  topic('operations', 'OA', 'Operations', 'Rechenverfahren', 'Operaciones', 'Stories, facts, factors, and multi-digit work across the grades.', 'Geschichten, Aufgaben, Faktoren und mehrstelliges Rechnen über die Klassen.', 'Historias, operaciones, factores y trabajo de varios dígitos a lo largo de los grados.', [
    { id: '3.oa.a' },
    { id: '3.oa.b' },
    { id: '3.oa.c' },
    { id: '3.oa.d' },
    { id: '4.oa.a' },
    { id: '4.oa.b' },
    { id: '4.oa.c' },
    { id: '4.nbt.b' },
    { id: '5.nbt.b', modes: ['head', 'mul', 'div'] },
    { id: '6.ns.b', modes: ['gcf', 'lcm'] },
  ]),
  topic('measure', 'MD', 'Measurement', 'Messen', 'Medición', 'Clocks, units, area, perimeter, and volume.', 'Uhren, Einheiten, Fläche, Umfang und Volumen.', 'Relojes, unidades, área, perímetro y volumen.', [
    { id: '3.md.a' },
    { id: '3.md.c' },
    { id: '3.md.d' },
    { id: '4.md.a' },
    { id: '5.md.a' },
    { id: '5.md.c' },
  ]),
  topic('geometry', 'G', 'Geometry', 'Geometrie', 'Geometría', 'Shapes, angles, coordinates, and the measures that belong to figures.', 'Figuren, Winkel, Koordinaten und die Maße, die zu Figuren gehören.', 'Figuras, ángulos, coordenadas y las medidas que pertenecen a las figuras.', [
    { id: '3.g.a' },
    { id: '4.g.a' },
    { id: '4.md.c' },
    { id: '5.g.a' },
    { id: '5.g.b' },
    { id: '6.g.a' },
    { id: '7.g.a' },
    { id: '7.g.b' },
  ]),
  topic('data', 'SP', 'Data and chance', 'Daten und Zufall', 'Datos y azar', 'Graphs, summaries, samples, and probability.', 'Diagramme, Kennzahlen, Stichproben und Wahrscheinlichkeit.', 'Gráficas, resúmenes, muestras y probabilidad.', [
    { id: '3.md.b' },
    { id: '4.md.b' },
    { id: '5.md.b' },
    { id: '5.md.d' },
    { id: '6.sp.a' },
    { id: '6.sp.b' },
    { id: '7.sp.a' },
    { id: '7.sp.b' },
    { id: '7.sp.c' },
  ]),
  topic('ratios', 'RP', 'Ratios and percent', 'Verhältnisse und Prozent', 'Razones y porcentaje', 'From a first ratio to percent change and tax.', 'Vom ersten Verhältnis bis zu prozentualer Änderung und Steuer.', 'Desde una primera razón hasta el cambio porcentual y el impuesto.', [
    { id: '6.rp.a' },
    { id: '7.rp.a' },
  ]),
  topic('algebra', 'EE', 'Expressions and equations', 'Terme und Gleichungen', 'Expresiones y ecuaciones', 'Grouping, patterns, variables, and equations that take more than one step.', 'Klammern, Muster, Variablen und Gleichungen, die mehr als einen Schritt brauchen.', 'Agrupación, patrones, variables y ecuaciones que piden más de un paso.', [
    { id: '5.oa.a' },
    { id: '5.oa.b' },
    { id: '6.ee.a' },
    { id: '6.ee.b' },
    { id: '6.ee.c' },
    { id: '7.ee.a' },
    { id: '7.ee.b' },
  ]),
  topic('signed', 'NS', 'Signed numbers', 'Zahlen mit Vorzeichen', 'Números con signo', 'Order, absolute value, the four quadrants, and operations with negatives.', 'Ordnung, Betrag, die vier Quadranten und Rechnen mit negativen Zahlen.', 'Orden, valor absoluto, los cuatro cuadrantes y operaciones con negativos.', [
    { id: '6.ns.c' },
    { id: '7.ns.a', pin: { family: 'int' } },
    { id: '7.ns.a', pin: { family: 'frac' } },
  ]),
]

export function topicById(id: string) {
  return TOPICS.find((item) => item.id === id) ?? null
}

function spread(items: BlueprintItem[], cap: number): BlueprintItem[] {
  if (items.length <= cap) {
    const each = Math.max(1, Math.min(3, Math.floor(cap / Math.max(1, items.length))))
    return items.map((item) => ({ ...item, count: each }))
  }
  const byGrade = new Map<number, BlueprintItem[]>()
  for (const item of items) {
    const grade = getSkill(item.skillId)?.grade ?? 0
    const list = byGrade.get(grade) ?? []
    list.push(item)
    byGrade.set(grade, list)
  }
  const grades = [...byGrade.keys()].sort((left, right) => left - right)
  const picked: BlueprintItem[] = []
  let guard = 0
  while (picked.length < cap && guard < cap * 4) {
    let added = false
    for (const grade of grades) {
      const next = byGrade.get(grade)?.shift()
      if (!next) continue
      picked.push(next)
      added = true
      if (picked.length >= cap) break
    }
    if (!added) break
    guard += 1
  }
  return picked.map((item) => ({ ...item, count: 1 }))
}

// One question for every problem kind in the topic, from every grade that teaches it.
// Small topics repeat a kind a couple of times. Large ones stay inside the test cap.
export function topicBlueprint(topic: Topic): Blueprint {
  const items: BlueprintItem[] = []
  for (const spec of topic.skills) {
    const skill = getSkill(spec.id)
    if (!skill) continue
    const kinds = problemKinds(skill).map((kind) => kind.value).filter((mode) => !spec.modes || spec.modes.includes(mode))
    for (const mode of kinds) {
      items.push({
        skillId: skill.id,
        count: 1,
        difficulty: 3,
        knobs: { ...knobsForKind(skill, 3, mode), ...spec.pin },
      })
    }
  }
  return {
    v: 1,
    title: topic.title,
    presetId: `topic-${topic.id}`,
    items: spread(items, TEST_CAP),
  }
}
