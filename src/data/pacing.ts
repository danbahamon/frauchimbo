import { L } from '../lib/math'
import { defaultKnobs, getSkill } from './skills'
import type { Blueprint, Grade, KnobValues, Preset, PresetItem } from '../lib/types'

type Row = [string, number, number, KnobValues?]

function preset(grade: Grade, month: number, en: string, de: string, es: string, noteEn: string, noteDe: string, noteEs: string, rows: Row[]): Preset {
  return {
    id: `g${grade}m${month}`,
    grade,
    month,
    title: L(en, de, es),
    note: L(noteEn, noteDe, noteEs),
    items: rows.map(([skillId, count, difficulty, knobs]) => ({ skillId, count, difficulty, knobs })),
  }
}

export const CHECK_MONTHS = [9, 11, 1, 3, 5, 6]

export const PRESETS: Preset[] = [
  preset(3, 9, 'Grade 3 · September', 'Klasse 3 · September', 'Grado 3 · septiembre', 'Place value, sums, and a first look at groups.', 'Stellenwerte, Summen und ein erster Blick auf Gruppen.', 'Valor posicional, sumas y una primera mirada a los grupos.', [
    ['3.nbt.a', 3, 2, { mode: 'add' }],
    ['3.nbt.a', 2, 2, { mode: 'round' }],
    ['3.oa.a', 2, 1, { mode: 'mul' }],
    ['3.md.a', 1, 1, { mode: 'mass' }],
  ]),
  preset(3, 11, 'Grade 3 · November', 'Klasse 3 · November', 'Grado 3 · noviembre', 'Multiplication and division stories, plus tens.', 'Mal- und Geteilt-Geschichten, dazu Zehner.', 'Historias de multiplicar y dividir, y las decenas.', [
    ['3.oa.c', 3, 3, { mode: 'mixed' }],
    ['3.oa.a', 2, 3, { mode: 'div' }],
    ['3.oa.b', 2, 2, { mode: 'missing' }],
    ['3.nbt.a', 2, 2, { mode: 'times10' }],
  ]),
  preset(3, 1, 'Grade 3 · January', 'Klasse 3 · Januar', 'Grado 3 · enero', 'Area, perimeter, and two-step stories.', 'Fläche, Umfang und zweistufige Geschichten.', 'Área, perímetro e historias de dos pasos.', [
    ['3.md.c', 2, 3, { mode: 'area' }],
    ['3.md.d', 2, 3, { mode: 'peri' }],
    ['3.oa.d', 2, 3, { mode: 'twostep' }],
    ['3.oa.d', 2, 2, { mode: 'pattern' }],
    ['3.g.a', 2, 2, { mode: 'name' }],
  ]),
  preset(3, 3, 'Grade 3 · March', 'Klasse 3 · März', 'Grado 3 · marzo', 'Fractions: name them, place them, compare them.', 'Brüche: benennen, setzen, vergleichen.', 'Fracciones: nombrarlas, ubicarlas, compararlas.', [
    ['3.nf.a', 2, 2, { mode: 'shade' }],
    ['3.nf.a', 2, 3, { mode: 'name' }],
    ['3.nf.a', 2, 3, { mode: 'line' }],
    ['3.nf.a', 2, 4, { mode: 'compare' }],
    ['3.g.a', 2, 3, { mode: 'partition' }],
  ]),
  preset(3, 5, 'Grade 3 · May', 'Klasse 3 · Mai', 'Grado 3 · mayo', 'Clocks, graphs, and measurement.', 'Uhren, Diagramme und Messen.', 'Relojes, gráficas y medición.', [
    ['3.md.a', 2, 3, { mode: 'read' }],
    ['3.md.a', 2, 4, { mode: 'elapsed' }],
    ['3.md.b', 2, 3, { mode: 'read' }],
    ['3.md.c', 2, 3, { mode: 'missing' }],
    ['3.nf.a', 2, 3, { mode: 'equiv' }],
  ]),
  preset(3, 6, 'Grade 3 · June', 'Klasse 3 · Juni', 'Grado 3 · junio', 'A full spiral of the year.', 'Eine ganze Spirale des Jahres.', 'Una espiral completa del año.', [
    ['3.oa.c', 2, 3, { mode: 'mixed' }],
    ['3.nbt.a', 2, 3, { mode: 'sub' }],
    ['3.nf.a', 2, 3, { mode: 'compare' }],
    ['3.md.b', 2, 3, { mode: 'read' }],
    ['3.md.c', 2, 3, { mode: 'area' }],
    ['3.g.a', 2, 3, { mode: 'attribute' }],
  ]),
  preset(4, 9, 'Grade 4 · September', 'Klasse 4 · September', 'Grado 4 · septiembre', 'Large place value and steady addition.', 'Große Stellenwerte und ruhiges Addieren.', 'Valor posicional grande y suma firme.', [
    ['4.nbt.a', 2, 3, { mode: 'value' }],
    ['4.nbt.a', 2, 3, { mode: 'round' }],
    ['4.nbt.b', 2, 2, { mode: 'add' }],
    ['4.oa.b', 2, 2, { mode: 'factor' }],
  ]),
  preset(4, 11, 'Grade 4 · November', 'Klasse 4 · November', 'Grado 4 · noviembre', 'Multi-digit operations and factors.', 'Schriftliches Rechnen und Faktoren.', 'Operaciones de varios dígitos y factores.', [
    ['4.nbt.b', 2, 3, { mode: 'mul' }],
    ['4.nbt.b', 2, 3, { mode: 'div' }],
    ['4.oa.b', 2, 3, { mode: 'gcf' }],
    ['4.oa.b', 2, 3, { mode: 'lcm' }],
    ['4.oa.a', 2, 3, { mode: 'two' }],
  ]),
  preset(4, 1, 'Grade 4 · January', 'Klasse 4 · Januar', 'Grado 4 · enero', 'Equivalent fractions and order.', 'Gleichwertige Brüche und Reihenfolge.', 'Fracciones equivalentes y orden.', [
    ['4.nf.a', 2, 3, { mode: 'equiv' }],
    ['4.nf.a', 2, 3, { mode: 'compare' }],
    ['4.nf.a', 2, 4, { mode: 'order' }],
    ['4.oa.c', 2, 3, { mode: 'rule' }],
  ]),
  preset(4, 3, 'Grade 4 · March', 'Klasse 4 · März', 'Grado 4 · marzo', 'Fraction operations and first decimals.', 'Bruchrechnung und erste Dezimalzahlen.', 'Operaciones con fracciones y primeros decimales.', [
    ['4.nf.b', 2, 3, { mode: 'add' }],
    ['4.nf.b', 2, 3, { mode: 'sub' }],
    ['4.nf.b', 2, 3, { mode: 'mulwhole' }],
    ['4.nf.c', 2, 3, { mode: 'write' }],
    ['4.nf.c', 2, 3, { mode: 'compare' }],
  ]),
  preset(4, 5, 'Grade 4 · May', 'Klasse 4 · Mai', 'Grado 4 · mayo', 'Conversions, angles, and symmetry.', 'Umwandlungen, Winkel und Symmetrie.', 'Conversiones, ángulos y simetría.', [
    ['4.md.a', 2, 3, { mode: 'metric' }],
    ['4.md.a', 2, 3, { mode: 'time' }],
    ['4.md.c', 2, 2, { mode: 'classify' }],
    ['4.md.c', 2, 4, { mode: 'missing' }],
    ['4.g.a', 2, 3, { mode: 'symmetry' }],
    ['4.md.b', 2, 3, { mode: 'count' }],
  ]),
  preset(4, 6, 'Grade 4 · June', 'Klasse 4 · Juni', 'Grado 4 · junio', 'A June review across the strands.', 'Eine Juni-Wiederholung über die Bereiche.', 'Un repaso de junio por todas las áreas.', [
    ['4.nbt.b', 2, 3, { mode: 'mul' }],
    ['4.nf.b', 2, 3, { mode: 'add' }],
    ['4.nf.c', 2, 3, { mode: 'compare' }],
    ['4.md.a', 2, 3, { mode: 'metric' }],
    ['4.md.c', 2, 3, { mode: 'read' }],
    ['4.oa.b', 2, 3, { mode: 'gcf' }],
  ]),
  preset(5, 9, 'Grade 5 · September', 'Klasse 5 · September', 'Grado 5 · septiembre', 'Decimal place value and a first expression.', 'Dezimale Stellenwerte und ein erster Term.', 'Valor posicional decimal y una primera expresión.', [
    ['5.nbt.a', 2, 3, { mode: 'compare' }],
    ['5.nbt.a', 2, 3, { mode: 'round' }],
    ['5.nbt.a', 2, 3, { mode: 'times' }],
    ['5.nbt.b', 2, 2, { mode: 'adddec' }],
    ['5.oa.a', 2, 2, { mode: 'eval' }],
  ]),
  preset(5, 11, 'Grade 5 · November', 'Klasse 5 · November', 'Grado 5 · noviembre', 'Whole-number power and decimal products.', 'Kraft mit ganzen Zahlen und Dezimalprodukten.', 'Fuerza con enteros y productos decimales.', [
    ['5.nbt.b', 2, 3, { mode: 'mul' }],
    ['5.nbt.b', 2, 4, { mode: 'div' }],
    ['5.nbt.b', 2, 3, { mode: 'muldec' }],
    ['5.oa.a', 2, 4, { mode: 'words' }],
    ['5.oa.b', 2, 3, { mode: 'ask' }],
  ]),
  preset(5, 1, 'Grade 5 · January', 'Klasse 5 · Januar', 'Grado 5 · enero', 'Unlike denominators.', 'Ungleiche Nenner.', 'Denominadores distintos.', [
    ['5.nf.a', 2, 3, { mode: 'add' }],
    ['5.nf.a', 2, 3, { mode: 'sub' }],
    ['5.nf.a', 2, 4, { mode: 'mixed' }],
    ['5.md.a', 2, 3, { mode: 'compound' }],
    ['5.nbt.b', 2, 3, { mode: 'subdec' }],
  ]),
  preset(5, 3, 'Grade 5 · March', 'Klasse 5 · März', 'Grado 5 · marzo', 'Multiplying and dividing fractions, then volume.', 'Brüche mal und geteilt, dann Volumen.', 'Multiplicar y dividir fracciones, y luego volumen.', [
    ['5.nf.b', 2, 3, { mode: 'mul' }],
    ['5.nf.b', 2, 4, { mode: 'divunit' }],
    ['5.nf.b', 2, 3, { mode: 'divwhole' }],
    ['5.md.c', 2, 3, { mode: 'volume' }],
    ['5.g.a', 2, 3, { mode: 'plot' }],
  ]),
  preset(5, 5, 'Grade 5 · May', 'Klasse 5 · Mai', 'Grado 5 · mayo', 'Volume, coordinates, and categories of figures.', 'Volumen, Koordinaten und Figurenklassen.', 'Volumen, coordenadas y categorías de figuras.', [
    ['5.md.c', 2, 3, { mode: 'layers' }],
    ['5.md.c', 2, 4, { mode: 'missing' }],
    ['5.g.a', 2, 3, { mode: 'read' }],
    ['5.g.a', 2, 4, { mode: 'distance' }],
    ['5.g.b', 2, 3, { mode: 'statement' }],
    ['5.md.b', 2, 3, { mode: 'greater' }],
  ]),
  preset(5, 6, 'Grade 5 · June', 'Klasse 5 · Juni', 'Grado 5 · junio', 'The year’s spiral, mixed on purpose.', 'Die Spirale des Jahres, absichtlich gemischt.', 'La espiral del año, mezclada a propósito.', [
    ['5.nf.a', 2, 3, { mode: 'add' }],
    ['5.nf.b', 2, 3, { mode: 'mul' }],
    ['5.nbt.b', 2, 4, { mode: 'divdec' }],
    ['5.md.c', 2, 3, { mode: 'volume' }],
    ['5.g.a', 2, 3, { mode: 'plot' }],
    ['5.oa.a', 2, 3, { mode: 'eval' }],
  ]),
  preset(6, 9, 'Grade 6 · September', 'Klasse 6 · September', 'Grado 6 · septiembre', 'Ratios and common factors.', 'Verhältnisse und gemeinsame Faktoren.', 'Razones y factores comunes.', [
    ['6.rp.a', 2, 2, { mode: 'build' }],
    ['6.rp.a', 2, 3, { mode: 'missing' }],
    ['6.rp.a', 2, 3, { mode: 'unit' }],
    ['6.ns.b', 2, 3, { mode: 'gcf' }],
    ['6.ns.b', 2, 3, { mode: 'lcm' }],
  ]),
  preset(6, 11, 'Grade 6 · November', 'Klasse 6 · November', 'Grado 6 · noviembre', 'Dividing fractions and percent.', 'Brüche teilen und Prozent.', 'Dividir fracciones y porcentaje.', [
    ['6.ns.a', 2, 3, { mode: 'frac' }],
    ['6.ns.a', 2, 4, { mode: 'word' }],
    ['6.ns.b', 2, 3, { mode: 'div' }],
    ['6.rp.a', 2, 3, { mode: 'percent' }],
    ['6.ee.a', 2, 3, { mode: 'eval' }],
  ]),
  preset(6, 1, 'Grade 6 · January', 'Klasse 6 · Januar', 'Grado 6 · enero', 'Negatives, order, and the four quadrants.', 'Negative Zahlen, Ordnung und vier Quadranten.', 'Negativos, orden y los cuatro cuadrantes.', [
    ['6.ns.c', 2, 3, { mode: 'compare' }],
    ['6.ns.c', 2, 3, { mode: 'order' }],
    ['6.ns.c', 2, 4, { mode: 'plot' }],
    ['6.ns.c', 2, 2, { mode: 'abs' }],
    ['6.ee.b', 2, 3, { mode: 'one' }],
  ]),
  preset(6, 3, 'Grade 6 · March', 'Klasse 6 · März', 'Grado 6 · marzo', 'Expressions and two-step equations.', 'Terme und zweistufige Gleichungen.', 'Expresiones y ecuaciones de dos pasos.', [
    ['6.ee.a', 2, 3, { mode: 'write' }],
    ['6.ee.a', 2, 3, { mode: 'dist' }],
    ['6.ee.b', 2, 4, { mode: 'two' }],
    ['6.ee.c', 2, 3, { mode: 'y' }],
    ['6.ee.b', 2, 3, { mode: 'ineq' }],
  ]),
  preset(6, 5, 'Grade 6 · May', 'Klasse 6 · Mai', 'Grado 6 · mayo', 'Area, volume, and the center of a data set.', 'Fläche, Volumen und die Mitte einer Datenmenge.', 'Área, volumen y el centro de un conjunto.', [
    ['6.g.a', 2, 3, { mode: 'triangle' }],
    ['6.g.a', 2, 4, { mode: 'surface' }],
    ['6.g.a', 2, 3, { mode: 'volume' }],
    ['6.sp.b', 2, 3, { mode: 'mean' }],
    ['6.sp.b', 2, 3, { mode: 'median' }],
    ['6.sp.a', 1, 2, { mode: 'question' }],
  ]),
  preset(6, 6, 'Grade 6 · June', 'Klasse 6 · Juni', 'Grado 6 · junio', 'Ratio, division, equations, and a graph point.', 'Verhältnis, Division, Gleichungen und ein Punkt.', 'Razón, división, ecuaciones y un punto.', [
    ['6.rp.a', 2, 3, { mode: 'unit' }],
    ['6.ns.a', 2, 3, { mode: 'frac' }],
    ['6.ee.b', 2, 4, { mode: 'two' }],
    ['6.ns.c', 2, 3, { mode: 'plot' }],
    ['6.g.a', 2, 3, { mode: 'triangle' }],
    ['6.sp.b', 2, 3, { mode: 'mean' }],
  ]),
  preset(7, 9, 'Grade 7 · September', 'Klasse 7 · September', 'Grado 7 · septiembre', 'Proportions, percent, and signed addition.', 'Proportionen, Prozent und Addition mit Vorzeichen.', 'Proporciones, porcentaje y suma con signo.', [
    ['7.rp.a', 2, 3, { mode: 'proportion' }],
    ['7.rp.a', 2, 3, { mode: 'percent' }],
    ['7.rp.a', 2, 4, { mode: 'tax' }],
    ['7.ns.a', 2, 3, { mode: 'add', family: 'int' }],
    ['7.ee.a', 2, 3, { mode: 'expand' }],
  ]),
  preset(7, 11, 'Grade 7 · November', 'Klasse 7 · November', 'Grado 7 · noviembre', 'The four operations with rational numbers.', 'Die vier Rechenarten mit rationalen Zahlen.', 'Las cuatro operaciones con números racionales.', [
    ['7.ns.a', 2, 3, { mode: 'add', family: 'int' }],
    ['7.ns.a', 2, 4, { mode: 'sub', family: 'int' }],
    ['7.ns.a', 2, 3, { mode: 'mul', family: 'int' }],
    ['7.ns.a', 2, 4, { mode: 'div', family: 'frac' }],
    ['7.ee.b', 2, 3, { mode: 'two' }],
  ]),
  preset(7, 1, 'Grade 7 · January', 'Klasse 7 · Januar', 'Grado 7 · enero', 'Equations that need more than one move.', 'Gleichungen, die mehr als einen Schritt brauchen.', 'Ecuaciones que piden más de un movimiento.', [
    ['7.ee.b', 2, 4, { mode: 'two' }],
    ['7.ee.b', 2, 4, { mode: 'dist' }],
    ['7.ee.a', 2, 3, { mode: 'factor' }],
    ['7.ee.b', 2, 4, { mode: 'ineq' }],
    ['7.rp.a', 2, 3, { mode: 'change' }],
  ]),
  preset(7, 3, 'Grade 7 · March', 'Klasse 7 · März', 'Grado 7 · marzo', 'Circles, angles, and scale.', 'Kreise, Winkel und Maßstab.', 'Círculos, ángulos y escala.', [
    ['7.g.b', 2, 3, { mode: 'circ' }],
    ['7.g.b', 2, 3, { mode: 'area' }],
    ['7.g.b', 2, 3, { mode: 'triangle' }],
    ['7.g.a', 2, 3, { mode: 'scale' }],
    ['7.g.a', 2, 4, { mode: 'area' }],
    ['7.g.b', 1, 4, { mode: 'surface' }],
  ]),
  preset(7, 5, 'Grade 7 · May', 'Klasse 7 · Mai', 'Grado 7 · mayo', 'Chance, samples, and a comparison of means.', 'Zufall, Stichproben und ein Vergleich der Mittelwerte.', 'Azar, muestras y una comparación de medias.', [
    ['7.sp.c', 2, 3, { mode: 'simple' }],
    ['7.sp.c', 2, 4, { mode: 'compound' }],
    ['7.sp.b', 2, 3, { mode: 'mean' }],
    ['7.sp.a', 2, 2, { mode: 'sample' }],
    ['7.rp.a', 2, 4, { mode: 'tax' }],
  ]),
  preset(7, 6, 'Grade 7 · June', 'Klasse 7 · Juni', 'Grado 7 · junio', 'A closing spiral: number, algebra, geometry, chance.', 'Eine schließende Spirale: Zahl, Algebra, Geometrie, Zufall.', 'Una espiral de cierre: número, álgebra, geometría, azar.', [
    ['7.ns.a', 2, 4, { mode: 'mul', family: 'int' }],
    ['7.ee.b', 2, 4, { mode: 'two' }],
    ['7.rp.a', 2, 3, { mode: 'percent' }],
    ['7.g.b', 2, 3, { mode: 'area' }],
    ['7.sp.c', 2, 3, { mode: 'simple' }],
    ['7.g.a', 2, 3, { mode: 'scale' }],
  ]),
]

export function presetFor(grade: Grade, month: number) {
  return PRESETS.find((item) => item.grade === grade && item.month === month) ?? null
}

export function materialize(item: Preset): Blueprint {
  const items: PresetItem[] = item.items
  return {
    v: 1,
    title: item.title,
    presetId: item.id,
    items: items.map((row) => {
      const skill = getSkill(row.skillId)
      const base = skill ? defaultKnobs(skill, row.difficulty) : {}
      return {
        skillId: row.skillId,
        count: row.count,
        difficulty: row.difficulty,
        knobs: { ...base, ...(row.knobs ?? {}) },
      }
    }),
  }
}
