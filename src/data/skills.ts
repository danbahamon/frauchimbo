import { L } from '../lib/math'
import type { DomainId, Knob, KnobOption, KnobValues, KnobWhen, Localized, Skill } from '../lib/types'

// One value per level, from 1 (warm-up) to 5 (spiral).
type Levels<T> = [T, T, T, T, T]

const PROBLEM = L('Kind of problem', 'Art der Aufgabe', 'Tipo de problema')
const PROBLEM_HINT = L('The kind of question this skill asks.', 'Die Art der Frage in dieser Fertigkeit.', 'El tipo de pregunta de esta destreza.')
const DIGITS = L('Digits', 'Stellen', 'Cifras')
const MAX_NUMBER = L('Largest number', 'Größte Zahl', 'Número mayor')
const FACTOR_HINT = L('The biggest factor or group size in a problem.', 'Der größte Faktor oder die größte Gruppengröße.', 'El mayor factor o tamaño de grupo en un problema.')
const MAX_HINT = L('The biggest number a question can use.', 'Die größte Zahl, die eine Aufgabe nutzt.', 'El número más grande que usa una pregunta.')
const DEN_LABEL = L('Denominator up to', 'Nenner bis', 'Denominador hasta')
const DEN_HINT = L('The biggest denominator the fractions can use.', 'Der größte Nenner, den die Brüche verwenden.', 'El mayor denominador que pueden usar las fracciones.')
const SIMPLE_LABEL = L('Require simplest form', 'Kürzen verlangen', 'Exigir la forma simple')
const SIMPLE_HINT = L('Answers must be reduced to lowest terms.', 'Antworten müssen vollständig gekürzt sein.', 'Las respuestas deben quedar en su mínima expresión.')

// A variable is a setting a teacher or student can change. Each one lists its value at every level.
function range(id: string, label: Localized, hint: Localized, min: number, max: number, levels: Levels<number>, step = 1, when?: KnobWhen): Knob {
  return { id, kind: 'range', label, hint, min, max, step, byDifficulty: levels, ...(when ? { when } : {}) }
}

function toggle(id: string, label: Localized, hint: Localized, levels: Levels<boolean>, when?: KnobWhen): Knob {
  return { id, kind: 'toggle', label, hint, byDifficulty: levels, ...(when ? { when } : {}) }
}

function choose(id: string, label: Localized, hint: Localized, options: KnobOption[], levels: Levels<string>, when?: KnobWhen): Knob {
  return { id, kind: 'select', label, hint, options, byDifficulty: levels, ...(when ? { when } : {}) }
}

// The problem-type row. Every skill has one under the id `mode`, which presets and shared links refer to.
function mode(options: KnobOption[], levels: Levels<string>, label: Localized = PROBLEM, hint: Localized = PROBLEM_HINT): Knob {
  return choose('mode', label, hint, options, levels)
}

function den(min: number, max: number, levels: Levels<number>, when?: KnobWhen): Knob {
  return range('den', DEN_LABEL, DEN_HINT, min, max, levels, 1, when)
}

function simple(when?: KnobWhen): Knob {
  return toggle('simple', SIMPLE_LABEL, SIMPLE_HINT, [false, false, true, true, true], when)
}

// Shows a variable only when another variable has one of these values.
function showFor(id: string, ...values: string[]): KnobWhen {
  return { id, in: values }
}

function opt(value: string, en: string, de: string, es: string): KnobOption {
  return { value, label: L(en, de, es) }
}

// Places a rounding question can target, through the hundred trillions.
const ROUND_TO = [
  opt('any', 'Any place', 'Beliebig', 'Cualquiera'),
  opt('10', 'Tens', 'Zehner', 'Decenas'),
  opt('100', 'Hundreds', 'Hunderter', 'Centenas'),
  opt('1000', 'Thousands', 'Tausender', 'Millares'),
  opt('10000', 'Ten thousands', 'Zehntausender', 'Decenas de millar'),
  opt('100000', 'Hundred thousands', 'Hunderttausender', 'Centenas de millar'),
  opt('1000000', 'Millions', 'Millionen', 'Millones'),
  opt('10000000', 'Ten millions', 'Zehn Millionen', 'Diez millones'),
  opt('100000000', 'Hundred millions', 'Hundert Millionen', 'Cien millones'),
  opt('1000000000', 'Billions', 'Milliarden', 'Mil millones'),
  opt('10000000000', 'Ten billions', 'Zehn Milliarden', 'Diez mil millones'),
  opt('100000000000', 'Hundred billions', 'Hundert Milliarden', 'Cien mil millones'),
  opt('1000000000000', 'Trillions', 'Billionen', 'Billones'),
  opt('10000000000000', 'Ten trillions', 'Zehn Billionen', 'Diez billones'),
  opt('100000000000000', 'Hundred trillions', 'Hundert Billionen', 'Cien billones'),
]

function skill(partial: Omit<Skill, 'knobs'> & { knobs?: Knob[] }): Skill {
  return { knobs: [], ...partial }
}

export const DOMAIN_COLOR: Record<DomainId, string> = {
  OA: '#3c4c9a',
  NBT: '#0f766e',
  NF: '#e25b45',
  MD: '#c4841d',
  G: '#5f7d55',
  RP: '#7c4a7a',
  NS: '#0f766e',
  EE: '#3c4c9a',
  SP: '#b86e00',
}

function isSquare(knob: Knob) {
  return knob.kind === 'select' && knob.id !== 'mode' && knob.id !== 'place' && knob.options.length >= 2 && knob.options.length <= 8
}

// Every unit the student can select should have at least three settings that change the question.
function deepen(skill: Skill): Skill {
  const extras: Knob[] = []
  const has = (id: string) => skill.knobs.some((knob) => knob.id === id) || extras.some((knob) => knob.id === id)
  const sizeIds = ['max', 'digits', 'within', 'den', 'by', 'top', 'span', 'whole', 'radius', 'size', 'cells', 'sides', 'reach', 'charts', 'count']
  if (!skill.knobs.some((knob) => sizeIds.includes(knob.id))) {
    if (skill.domain === 'G') {
      extras.push(range('sides', L('Number of sides', 'Anzahl der Seiten', 'Número de lados'), L('How many sides the shape uses.', 'Wie viele Seiten die Figur hat.', 'Cuántos lados usa la figura.'), 3, 8, [3, 4, 4, 6, 8]))
    } else if (skill.domain === 'SP') {
      extras.push(range('charts', L('How many charts', 'Wie viele Diagramme', 'Cuántos gráficos'), L('How many charts or groups the question shows.', 'Wie viele Diagramme oder Gruppen die Aufgabe zeigt.', 'Cuántos gráficos o grupos muestra la pregunta.'), 1, 4, [1, 1, 2, 3, 4]))
    } else if (skill.domain === 'MD') {
      extras.push(range('reach', L('Largest measure', 'Größtes Maß', 'Medida mayor'), L('How large a measure in the question can be.', 'Wie groß ein Maß in der Aufgabe sein kann.', 'Qué tan grande puede ser una medida en la pregunta.'), 6, 60, [8, 12, 20, 36, 48]))
    } else {
      extras.push(range('reach', L('Largest number', 'Größte Zahl', 'Número mayor'), L('The biggest number a question can use.', 'Die größte Zahl, die eine Aufgabe nutzt.', 'El número más grande que usa una pregunta.'), 6, 80, [8, 12, 24, 40, 60]))
    }
  }
  if (!has('qty')) {
    const label = skill.domain === 'G'
      ? L('How many shapes', 'Wie viele Figuren', 'Cuántas figuras')
      : skill.domain === 'SP'
        ? L('How many values', 'Wie viele Werte', 'Cuántos datos')
        : skill.domain === 'NF'
          ? L('How many fractions', 'Wie viele Brüche', 'Cuántas fracciones')
          : skill.domain === 'MD'
            ? L('How many measures', 'Wie viele Maße', 'Cuántas medidas')
            : L('How many numbers', 'Wie viele Zahlen', 'Cuántos números')
    const min = skill.domain === 'SP' ? 4 : skill.domain === 'G' ? 1 : 2
    const max = skill.domain === 'SP' ? 12 : skill.domain === 'G' ? 4 : 6
    const levels: Levels<number> = skill.domain === 'SP' ? [4, 5, 6, 8, 10] : skill.domain === 'G' ? [1, 1, 2, 3, 4] : [2, 3, 3, 4, 5]
    extras.push(range('qty', label, L('How many numbers or pieces appear in one question.', 'Wie viele Zahlen oder Teile in einer Aufgabe stehen.', 'Cuántos números o partes aparecen en una pregunta.'), min, max, levels))
  }
  if (!has('twist')) {
    extras.push(toggle('twist', L('An extra step', 'Ein Schritt mehr', 'Un paso más'), L('The question takes one more step to finish.', 'Die Aufgabe braucht einen Schritt mehr.', 'La pregunta pide un paso más.'), [false, false, true, true, true]))
  }
  const all = [...skill.knobs, ...extras]
  const shown = (values: Record<string, string>) => all.filter((knob) => {
    if (knob.id === 'mode' || isSquare(knob)) return false
    if (!knob.when) return true
    return knob.when.in.includes(String(values[knob.when.id] ?? ''))
  }).length
  const modeKnob = skill.knobs.find((knob) => knob.id === 'mode' && knob.kind === 'select')
  const modes = modeKnob && modeKnob.kind === 'select' ? modeKnob.options.map((option) => option.value) : ['']
  const branches = skill.knobs.filter(isSquare)
  let short = false
  for (const mode of modes) {
    const active = branches.filter((knob) => !knob.when || knob.when.in.includes(mode))
    if (!active.length) {
      if (shown({ mode }) < 3) short = true
    } else {
      for (const item of active) {
        if (item.kind !== 'select') continue
        for (const option of item.options) {
          if (shown({ mode, [item.id]: option.value }) < 3) short = true
        }
      }
    }
  }
  if (short && !has('mix')) {
    extras.push(toggle('mix', L('A harder mix', 'Eine schwerere Mischung', 'Una mezcla más difícil'), L('Use a wider mix of the numbers in the question.', 'Nutze eine breitere Mischung der Zahlen.', 'Usa una mezcla más amplia de los números.'), [false, false, true, true, true]))
  }
  return extras.length ? { ...skill, knobs: [...skill.knobs, ...extras] } : skill
}

const RAW_SKILLS: Skill[] = [
  skill({
    id: '3.oa.a',
    grade: 3,
    domain: 'OA',
    code: '3.OA.A',
    title: L('Multiply and divide stories', 'Mal- und Geteilt-Geschichten', 'Historias de multiplicar y dividir'),
    blurb: L('Groups, sharing, and the question hiding in the story.', 'Gruppen, Teilen und die Frage in der Geschichte.', 'Grupos, repartos y la pregunta escondida en la historia.'),
    months: [10, 11, 6],
    prereq: [],
    knobs: [
      mode(
        [opt('mul', 'Multiply', 'Multiplizieren', 'Multiplicar'), opt('div', 'Divide', 'Dividieren', 'Dividir'), opt('mixed', 'Mixed', 'Gemischt', 'Mixto')],
        ['mul', 'mul', 'mixed', 'div', 'mixed'],
      ),
      range('max', L('Largest factor', 'Größter Faktor', 'Mayor factor'), FACTOR_HINT, 2, 25, [5, 8, 12, 16, 20]),
    ],
  }),
  skill({
    id: '3.oa.b',
    grade: 3,
    domain: 'OA',
    code: '3.OA.B',
    title: L('Properties and missing factors', 'Rechengesetze und fehlende Faktoren', 'Propiedades y factores faltantes'),
    blurb: L('Turn a fact around, or open it with the distributive property.', 'Eine Aufgabe umdrehen oder mit dem Distributivgesetz öffnen.', 'Dar la vuelta a un hecho o abrirlo con la propiedad distributiva.'),
    months: [10, 11],
    prereq: ['3.oa.a'],
    knobs: [
      mode(
        [
          opt('comm', 'Commutative', 'Kommutativ', 'Conmutativa'),
          opt('missing', 'Missing factor', 'Fehlender Faktor', 'Factor faltante'),
          opt('dist', 'Distributive', 'Distributiv', 'Distributiva'),
        ],
        ['comm', 'missing', 'missing', 'dist', 'dist'],
      ),
      range('max', L('Largest factor', 'Größter Faktor', 'Mayor factor'), FACTOR_HINT, 3, 25, [6, 9, 12, 16, 20]),
    ],
  }),
  skill({
    id: '3.oa.c',
    grade: 3,
    domain: 'OA',
    code: '3.OA.C',
    title: L('Facts within 100', 'Aufgaben bis 100', 'Operaciones hasta 100'),
    blurb: L('Fluent multiplication and division, answered on the keypad.', 'Flüssiges Mal und Geteilt, auf der Tastatur.', 'Multiplicación y división ágiles, en el teclado.'),
    months: [10, 11, 12, 6],
    prereq: ['3.oa.a'],
    knobs: [
      mode(
        [opt('mul', 'Multiply', 'Multiplizieren', 'Multiplicar'), opt('div', 'Divide', 'Dividieren', 'Dividir'), opt('mixed', 'Mixed', 'Gemischt', 'Mixto')],
        ['mul', 'mul', 'mixed', 'mixed', 'div'],
      ),
      range('max', L('Largest factor', 'Größter Faktor', 'Mayor factor'), FACTOR_HINT, 2, 25, [5, 8, 12, 16, 22]),
    ],
  }),
  skill({
    id: '3.oa.d',
    grade: 3,
    domain: 'OA',
    code: '3.OA.D',
    title: L('Two steps and patterns', 'Zwei Schritte und Muster', 'Dos pasos y patrones'),
    blurb: L('A story that needs two operations, or a pattern that keeps its rule.', 'Eine Geschichte mit zwei Rechnungen oder ein Muster mit fester Regel.', 'Una historia con dos operaciones, o un patrón fiel a su regla.'),
    months: [12, 1],
    prereq: ['3.oa.c'],
    knobs: [
      mode(
        [opt('twostep', 'Two-step story', 'Zweistufige Geschichte', 'Historia de dos pasos'), opt('pattern', 'Pattern', 'Muster', 'Patrón')],
        ['twostep', 'twostep', 'pattern', 'twostep', 'pattern'],
      ),
      range('max', MAX_NUMBER, L('The biggest group size or count, and the largest pattern step.', 'Die größte Gruppengröße oder Anzahl und der größte Musterschritt.', 'El mayor tamaño de grupo o cantidad, y el mayor paso del patrón.'), 5, 40, [6, 10, 16, 24, 32]),
    ],
  }),
  skill({
    id: '3.nbt.a',
    grade: 3,
    domain: 'NBT',
    code: '3.NBT.A',
    title: L('Place value within 1,000', 'Stellenwerte bis 1 000', 'Valor posicional hasta 1 000'),
    blurb: L('Add, subtract, round, or multiply by a ten.', 'Addieren, subtrahieren, runden oder mit einer Zehnerzahl malnehmen.', 'Sumar, restar, redondear o multiplicar por una decena.'),
    months: [9, 10, 6],
    prereq: [],
    knobs: [
      mode(
        [
          opt('add', 'Add', 'Addieren', 'Sumar'),
          opt('sub', 'Subtract', 'Subtrahieren', 'Restar'),
          opt('round', 'Round', 'Runden', 'Redondear'),
          opt('times10', 'Times 10, 20…', 'Mal 10, 20…', 'Por 10, 20…'),
        ],
        ['add', 'add', 'sub', 'round', 'times10'],
      ),
      range(
        'within',
        L('Numbers up to', 'Zahlen bis', 'Números hasta'),
        L('The largest number in sums, differences, and rounding.', 'Die größte Zahl in Summen, Differenzen und beim Runden.', 'El mayor número en sumas, restas y redondeos.'),
        100,
        100000,
        [300, 1000, 5000, 20000, 100000],
        100,
        showFor('mode', 'add', 'sub', 'round'),
      ),
      range(
        'by',
        L('Largest factor', 'Größter Faktor', 'Mayor factor'),
        L('The largest number multiplied by a ten.', 'Die größte Zahl, die mit einer Zehnerzahl malgenommen wird.', 'El mayor número que se multiplica por una decena.'),
        2,
        30,
        [5, 8, 12, 18, 25],
        1,
        showFor('mode', 'times10'),
      ),
    ],
  }),
  skill({
    id: '3.nf.a',
    grade: 3,
    domain: 'NF',
    code: '3.NF.A',
    title: L('Fractions as numbers', 'Brüche als Zahlen', 'Fracciones como números'),
    blurb: L('Shade, name, place, compare, or match an equivalent fraction.', 'Färben, benennen, einordnen, vergleichen oder gleichwertig schreiben.', 'Sombrear, nombrar, ubicar, comparar o escribir una equivalente.'),
    months: [2, 3, 4, 6],
    prereq: [],
    knobs: [
      mode(
        [
          opt('shade', 'Shade', 'Färben', 'Sombrear'),
          opt('name', 'Name', 'Benennen', 'Nombrar'),
          opt('line', 'Number line', 'Zahlenstrahl', 'Recta numérica'),
          opt('compare', 'Compare', 'Vergleichen', 'Comparar'),
          opt('equiv', 'Equivalent', 'Gleichwertig', 'Equivalente'),
        ],
        ['shade', 'name', 'line', 'compare', 'equiv'],
      ),
      den(2, 12, [4, 6, 8, 10, 12]),
    ],
  }),
  skill({
    id: '3.md.a',
    grade: 3,
    domain: 'MD',
    code: '3.MD.A',
    title: L('Time, mass, and volume', 'Zeit, Masse und Volumen', 'Tiempo, masa y volumen'),
    blurb: L('Read a clock, set one, find an end time, or choose a sensible measure.', 'Uhr lesen, Uhr stellen, Endzeit finden oder ein sinnvolles Maß wählen.', 'Leer un reloj, poner uno, hallar la hora final o elegir una medida sensata.'),
    months: [4, 5],
    prereq: [],
    knobs: [
      mode(
        [
          opt('read', 'Read a clock', 'Uhr lesen', 'Leer un reloj'),
          opt('set', 'Set a clock', 'Uhr stellen', 'Poner un reloj'),
          opt('elapsed', 'Elapsed time', 'Verstrichene Zeit', 'Tiempo transcurrido'),
          opt('mass', 'Estimate', 'Schätzen', 'Estimar'),
        ],
        ['read', 'set', 'read', 'elapsed', 'mass'],
      ),
      toggle(
        'fives',
        L('Five-minute marks only', 'Nur Fünf-Minuten-Marken', 'Solo marcas de cinco minutos'),
        L('Clock hands rest on the five-minute marks.', 'Die Zeiger stehen auf den Fünf-Minuten-Marken.', 'Las manecillas caen en las marcas de cinco minutos.'),
        [true, true, false, false, false],
        showFor('mode', 'read', 'set', 'elapsed'),
      ),
    ],
  }),
  skill({
    id: '3.md.b',
    grade: 3,
    domain: 'MD',
    code: '3.MD.B',
    title: L('Bar graphs', 'Säulendiagramme', 'Gráficas de barras'),
    blurb: L('Read a graph, or build one and choose its color, size, and scale.', 'Ein Diagramm lesen oder bauen und Farbe, Größe und Skala wählen.', 'Leer una gráfica, o construirla y elegir color, tamaño y escala.'),
    months: [4, 5, 6],
    prereq: [],
    knobs: [
      mode(
        [
          opt('read', 'Read', 'Lesen', 'Leer'),
          opt('build', 'Build', 'Bauen', 'Construir'),
          opt('most', 'Tallest or shortest', 'Höchste oder niedrigste', 'Más alta o más baja'),
          opt('match', 'Equal heights', 'Gleich hohe Säulen', 'Alturas iguales'),
        ],
        ['read', 'read', 'most', 'match', 'build'],
      ),
      range('top', L('Tallest bar', 'Höchste Säule', 'Barra más alta'), L('The largest count a bar can show.', 'Die größte Anzahl, die eine Säule zeigen kann.', 'La mayor cantidad que puede mostrar una barra.'), 4, 40, [6, 8, 12, 20, 30]),
    ],
  }),
  skill({
    id: '3.md.c',
    grade: 3,
    domain: 'MD',
    code: '3.MD.C',
    title: L('Area of rectangles', 'Flächeninhalt von Rechtecken', 'Área de rectángulos'),
    blurb: L('Tiles in rows, or the missing side when the area is known.', 'Kacheln in Reihen, oder die fehlende Seite bei bekanntem Flächeninhalt.', 'Baldosas en filas, o el lado que falta cuando el área se conoce.'),
    months: [1, 2, 5],
    prereq: ['3.oa.c'],
    knobs: [
      mode(
        [opt('area', 'Find area', 'Fläche finden', 'Hallar el área'), opt('missing', 'Missing side', 'Fehlende Seite', 'Lado faltante')],
        ['area', 'area', 'area', 'missing', 'missing'],
      ),
      range('max', L('Longest side', 'Längste Seite', 'Lado más largo'), L('The longest side a rectangle can have.', 'Die längste Seite eines Rechtecks.', 'El lado más largo que puede tener un rectángulo.'), 3, 40, [5, 8, 12, 20, 30]),
    ],
  }),
  skill({
    id: '3.md.d',
    grade: 3,
    domain: 'MD',
    code: '3.MD.D',
    title: L('Perimeter', 'Umfang', 'Perímetro'),
    blurb: L('Walk the edge of a rectangle, or find the side that was left out.', 'Die Kante eines Rechtecks abgehen oder die fehlende Seite finden.', 'Recorrer el borde de un rectángulo, o hallar el lado que falta.'),
    months: [1, 2],
    prereq: ['3.md.c'],
    knobs: [
      mode(
        [opt('peri', 'Find perimeter', 'Umfang finden', 'Hallar el perímetro'), opt('missing', 'Missing side', 'Fehlende Seite', 'Lado faltante')],
        ['peri', 'peri', 'peri', 'missing', 'missing'],
      ),
      range('max', L('Longest side', 'Längste Seite', 'Lado más largo'), L('The longest side a rectangle can have.', 'Die längste Seite eines Rechtecks.', 'El lado más largo que puede tener un rectángulo.'), 4, 60, [8, 12, 20, 36, 48]),
    ],
  }),
  skill({
    id: '3.g.a',
    grade: 3,
    domain: 'G',
    code: '3.G.A',
    title: L('Shapes and equal parts', 'Figuren und gleiche Teile', 'Figuras y partes iguales'),
    blurb: L('Name a shape, spot equal shares, or match an attribute.', 'Eine Figur benennen, gleiche Teile erkennen oder eine Eigenschaft treffen.', 'Nombrar una figura, ver partes iguales o acertar un atributo.'),
    months: [1, 3, 5],
    prereq: ['3.nf.a'],
    knobs: [
      mode(
        [
          opt('name', 'Name', 'Benennen', 'Nombrar'),
          opt('partition', 'Equal parts', 'Gleiche Teile', 'Partes iguales'),
          opt('attribute', 'Attribute', 'Eigenschaft', 'Atributo'),
        ],
        ['name', 'name', 'partition', 'attribute', 'partition'],
      ),
      toggle(
        'advanced',
        L('Pentagons and hexagons', 'Fünfecke und Sechsecke', 'Pentágonos y hexágonos'),
        L('Adds five- and six-sided shapes to the names.', 'Fügt Figuren mit fünf und sechs Seiten zu den Namen hinzu.', 'Añade figuras de cinco y seis lados a los nombres.'),
        [false, false, true, true, true],
        showFor('mode', 'name'),
      ),
    ],
  }),
  skill({
    id: '4.oa.a',
    grade: 4,
    domain: 'OA',
    code: '4.OA.A',
    title: L('Multi-step stories', 'Mehrstufige Geschichten', 'Historias de varios pasos'),
    blurb: L('Remainders, comparison, and two or three moves in one tale.', 'Rest, Vergleich und zwei oder drei Schritte in einer Geschichte.', 'Residuos, comparación y dos o tres pasos en un relato.'),
    months: [10, 11, 6],
    prereq: ['3.oa.d'],
    knobs: [
      choose(
        'mode',
        L('Number of steps', 'Anzahl der Schritte', 'Cantidad de pasos'),
        L('Two-step or three-step stories.', 'Geschichten mit zwei oder drei Schritten.', 'Historias de dos o tres pasos.'),
        [opt('two', 'Two steps', 'Zwei Schritte', 'Dos pasos'), opt('three', 'Three steps', 'Drei Schritte', 'Tres pasos')],
        ['two', 'two', 'two', 'three', 'three'],
      ),
      range('max', L('Items per box, up to', 'Stücke pro Kiste, höchstens', 'Objetos por caja, como máximo'), L('The most items that fit in one box or tray.', 'Die größte Anzahl an Stücken in einer Kiste.', 'La mayor cantidad de objetos en una caja o bandeja.'), 6, 100, [10, 15, 24, 40, 60]),
      toggle('remain', L('Include a remainder', 'Mit Rest', 'Con residuo'), L('Some items are left over at the end.', 'Am Ende bleiben einige Stücke übrig.', 'Al final sobran algunos objetos.'), [false, false, true, true, true]),
    ],
  }),
  skill({
    id: '4.oa.b',
    grade: 4,
    domain: 'OA',
    code: '4.OA.B',
    title: L('Factors and multiples', 'Faktoren und Vielfache', 'Factores y múltiplos'),
    blurb: L('Factor pairs, multiples, greatest common factor, least common multiple.', 'Faktorpaare, Vielfache, größter gemeinsamer Faktor, kleinstes gemeinsames Vielfaches.', 'Pares de factores, múltiplos, máximo común divisor, mínimo común múltiplo.'),
    months: [9, 11, 6],
    prereq: ['3.oa.c'],
    knobs: [
      mode(
        [
          opt('factor', 'Choose a factor', 'Faktor wählen', 'Elegir un factor'),
          opt('multiple', 'Choose a multiple', 'Vielfaches wählen', 'Elegir un múltiplo'),
          opt('gcf', 'Greatest common factor', 'Größter gemeinsamer Faktor', 'Máximo común divisor'),
          opt('lcm', 'Least common multiple', 'Kleinstes gemeinsames Vielfaches', 'Mínimo común múltiplo'),
        ],
        ['factor', 'multiple', 'gcf', 'lcm', 'gcf'],
      ),
      range('max', MAX_NUMBER, MAX_HINT, 10, 150, [12, 24, 40, 80, 120]),
    ],
  }),
  skill({
    id: '4.oa.c',
    grade: 4,
    domain: 'OA',
    code: '4.OA.C',
    title: L('Number patterns', 'Zahlenmuster', 'Patrones numéricos'),
    blurb: L('Continue a pattern, or name the rule that builds it.', 'Ein Muster fortsetzen oder die Regel benennen.', 'Continuar un patrón, o nombrar la regla que lo arma.'),
    months: [12, 1],
    prereq: ['3.oa.d'],
    knobs: [
      mode(
        [opt('next', 'Next terms', 'Nächste Glieder', 'Siguientes términos'), opt('rule', 'Name the rule', 'Regel benennen', 'Nombrar la regla')],
        ['next', 'next', 'rule', 'next', 'rule'],
      ),
      range('jump', L('Biggest jump', 'Größter Sprung', 'Salto mayor'), L('The largest amount a pattern adds or takes away.', 'Der größte Betrag, den ein Muster addiert oder abzieht.', 'La mayor cantidad que un patrón suma o resta.'), 2, 80, [4, 8, 16, 32, 50]),
    ],
  }),
  skill({
    id: '4.nbt.a',
    grade: 4,
    domain: 'NBT',
    code: '4.NBT.A',
    title: L('Multi-digit place value', 'Große Stellenwerte', 'Valor posicional de varios dígitos'),
    blurb: L('The value of a digit, rounding, building a number, or times-as-much.', 'Der Wert einer Ziffer, Runden, eine Zahl bauen oder „wie viel mal so viel“.', 'El valor de un dígito, redondear, armar un número o cuántas veces más.'),
    months: [9, 10],
    prereq: ['3.nbt.a'],
    knobs: [
      mode(
        [
          opt('value', 'Digit value', 'Ziffernwert', 'Valor de la cifra'),
          opt('round', 'Round', 'Runden', 'Redondear'),
          opt('build', 'Build the number', 'Zahl bauen', 'Armar el número'),
          opt('times', 'Times as much', 'Wie viel mal', 'Cuántas veces'),
        ],
        ['value', 'round', 'build', 'times', 'times'],
      ),
      range('digits', DIGITS, L('How many places the number has.', 'Wie viele Stellen die Zahl hat.', 'Cuántos lugares tiene el número.'), 4, 15, [4, 6, 9, 12, 15]),
      choose(
        'place',
        L('Round to', 'Runden auf', 'Redondear a'),
        L('Which place the rounding uses. Any stays inside the number.', 'Welche Stelle das Runden nutzt. Beliebig bleibt innerhalb der Zahl.', 'Qué lugar usa el redondeo. Cualquiera se queda dentro del número.'),
        ROUND_TO,
        ['any', '100', '1000', '100000', 'any'],
        showFor('mode', 'round'),
      ),
    ],
  }),
  skill({
    id: '4.nbt.b',
    grade: 4,
    domain: 'NBT',
    code: '4.NBT.B',
    title: L('Multi-digit operations', 'Schriftliche Rechenverfahren', 'Operaciones con varios dígitos'),
    blurb: L('Add, subtract, multiply, or divide larger whole numbers.', 'Größere ganze Zahlen addieren, subtrahieren, multiplizieren oder dividieren.', 'Sumar, restar, multiplicar o dividir números enteros más grandes.'),
    months: [9, 10, 11, 6],
    prereq: ['4.nbt.a'],
    knobs: [
      mode(
        [
          opt('add', 'Add', 'Addieren', 'Sumar'),
          opt('sub', 'Subtract', 'Subtrahieren', 'Restar'),
          opt('mul', 'Multiply', 'Multiplizieren', 'Multiplicar'),
          opt('div', 'Divide', 'Dividieren', 'Dividir'),
        ],
        ['add', 'sub', 'mul', 'div', 'mul'],
      ),
      range('digits', DIGITS, L('How many digits each number has.', 'Wie viele Stellen jede Zahl hat.', 'Cuántas cifras tiene cada número.'), 2, 7, [2, 3, 4, 5, 6]),
      range(
        'factors',
        L('Multiplier digits', 'Stellen des Faktors', 'Cifras del factor'),
        L('How many digits the multiplier or divisor has.', 'Wie viele Stellen der Faktor oder der Divisor hat.', 'Cuántas cifras tiene el multiplicador o el divisor.'),
        1,
        3,
        [1, 1, 1, 2, 3],
        1,
        showFor('mode', 'mul', 'div'),
      ),
      toggle(
        'remain',
        L('Remainders in division', 'Reste bei der Division', 'Residuos en la división'),
        L('Some divisions leave a number over.', 'Manche Divisionen lassen einen Rest.', 'Algunas divisiones dejan un residuo.'),
        [false, false, true, true, true],
        showFor('mode', 'div'),
      ),
    ],
  }),
  skill({
    id: '4.nf.a',
    grade: 4,
    domain: 'NF',
    code: '4.NF.A',
    title: L('Equivalent fractions and order', 'Gleichwertige Brüche und Reihenfolge', 'Fracciones equivalentes y orden'),
    blurb: L('Rewrite a fraction, compare two, or sort three.', 'Einen Bruch umschreiben, zwei vergleichen oder drei sortieren.', 'Reescribir una fracción, comparar dos u ordenar tres.'),
    months: [1, 2],
    prereq: ['3.nf.a'],
    knobs: [
      mode(
        [
          opt('equiv', 'Equivalent', 'Gleichwertig', 'Equivalente'),
          opt('compare', 'Compare', 'Vergleichen', 'Comparar'),
          opt('order', 'Order', 'Ordnen', 'Ordenar'),
        ],
        ['equiv', 'equiv', 'compare', 'order', 'compare'],
      ),
      den(4, 24, [4, 6, 8, 12, 18]),
      simple(showFor('mode', 'equiv')),
    ],
  }),
  skill({
    id: '4.nf.b',
    grade: 4,
    domain: 'NF',
    code: '4.NF.B',
    title: L('Add, subtract, and scale fractions', 'Brüche addieren, subtrahieren, vervielfachen', 'Sumar, restar y escalar fracciones'),
    blurb: L('Same denominators, mixed numbers, or a whole number times a fraction.', 'Gleiche Nenner, gemischte Zahlen oder eine ganze Zahl mal ein Bruch.', 'Mismos denominadores, números mixtos, o un entero por una fracción.'),
    months: [2, 3, 6],
    prereq: ['4.nf.a'],
    knobs: [
      mode(
        [
          opt('add', 'Add', 'Addieren', 'Sumar'),
          opt('sub', 'Subtract', 'Subtrahieren', 'Restar'),
          opt('mixed', 'Mixed numbers', 'Gemischte Zahlen', 'Números mixtos'),
          opt('mulwhole', 'Times a whole', 'Mal eine ganze Zahl', 'Por un entero'),
        ],
        ['add', 'add', 'sub', 'mixed', 'mulwhole'],
      ),
      den(3, 24, [6, 8, 12, 16, 20]),
      simple(),
    ],
  }),
  skill({
    id: '4.nf.c',
    grade: 4,
    domain: 'NF',
    code: '4.NF.C',
    title: L('Decimals for tenths and hundredths', 'Dezimalzahlen für Zehntel und Hundertstel', 'Decimales para décimos y centésimos'),
    blurb: L('Write a decimal from a grid, compare two, or shade a decimal.', 'Eine Dezimalzahl aus einem Gitter schreiben, zwei vergleichen oder färben.', 'Escribir un decimal desde una cuadrícula, comparar dos o sombrear.'),
    months: [3, 4, 6],
    prereq: ['4.nf.a'],
    knobs: [
      mode(
        [
          opt('write', 'Write the decimal', 'Dezimalzahl schreiben', 'Escribir el decimal'),
          opt('compare', 'Compare', 'Vergleichen', 'Comparar'),
          opt('shade', 'Shade', 'Färben', 'Sombrear'),
        ],
        ['write', 'write', 'compare', 'shade', 'compare'],
      ),
      toggle(
        'hundredths',
        L('Hundredths', 'Hundertstel', 'Centésimos'),
        L('Use a 10 by 10 grid for hundredths.', 'Für Hundertstel ein 10-mal-10-Gitter nutzen.', 'Usa una cuadrícula de 10 por 10 para centésimos.'),
        [false, false, true, true, true],
      ),
    ],
  }),
  skill({
    id: '4.md.a',
    grade: 4,
    domain: 'MD',
    code: '4.MD.A',
    title: L('Measurement conversions', 'Maßumwandlungen', 'Conversiones de medida'),
    blurb: L('Metric length and mass, time, or customary units.', 'Metrische Längen und Massen, Zeit oder angloamerikanische Einheiten.', 'Longitud y masa métricas, tiempo, o unidades usuales.'),
    months: [4, 5, 6],
    prereq: ['4.nbt.a'],
    knobs: [
      mode(
        [
          opt('metric', 'Metric', 'Metrisch', 'Métrico'),
          opt('time', 'Time', 'Zeit', 'Tiempo'),
          opt('custom', 'Customary', 'Angloamerikanisch', 'Sistema usual'),
        ],
        ['metric', 'metric', 'time', 'custom', 'metric'],
      ),
      range('max', L('Largest amount', 'Größte Menge', 'Cantidad mayor'), L('The biggest count of units a question can use.', 'Die größte Anzahl an Einheiten in einer Aufgabe.', 'La mayor cantidad de unidades que usa una pregunta.'), 2, 250, [6, 12, 30, 80, 160]),
    ],
  }),
  skill({
    id: '4.md.b',
    grade: 4,
    domain: 'MD',
    code: '4.MD.B',
    title: L('Line plots', 'Linienplots', 'Diagramas de puntos'),
    blurb: L('Read how many marks sit on a value, or add the measurements.', 'Lesen, wie viele Marken auf einem Wert sitzen, oder die Messwerte addieren.', 'Leer cuántas marcas hay en un valor, o sumar las medidas.'),
    months: [4, 5],
    prereq: ['3.md.b'],
    knobs: [
      mode(
        [opt('count', 'How many', 'Wie viele', 'Cuántos'), opt('sum', 'Total', 'Summe', 'Total')],
        ['count', 'count', 'sum', 'count', 'sum'],
      ),
    ],
  }),
  skill({
    id: '4.md.c',
    grade: 4,
    domain: 'MD',
    code: '4.MD.C',
    title: L('Angles', 'Winkel', 'Ángulos'),
    blurb: L('Classify, read a protractor, build an angle, or find a missing one.', 'Einteilen, Winkelmesser lesen, einen Winkel bauen oder einen fehlenden finden.', 'Clasificar, leer un transportador, construir un ángulo o hallar el que falta.'),
    months: [5, 6],
    prereq: [],
    knobs: [
      mode(
        [
          opt('classify', 'Classify', 'Einteilen', 'Clasificar'),
          opt('read', 'Read protractor', 'Winkelmesser lesen', 'Leer el transportador'),
          opt('make', 'Build an angle', 'Winkel bauen', 'Construir un ángulo'),
          opt('missing', 'Missing angle', 'Fehlender Winkel', 'Ángulo faltante'),
        ],
        ['classify', 'classify', 'read', 'missing', 'make'],
      ),
    ],
  }),
  skill({
    id: '4.g.a',
    grade: 4,
    domain: 'G',
    code: '4.G.A',
    title: L('Lines, angles, and symmetry', 'Linien, Winkel und Symmetrie', 'Rectas, ángulos y simetría'),
    blurb: L('Lines of symmetry, right angles, or a pair of parallel sides.', 'Symmetrieachsen, rechte Winkel oder ein Paar paralleler Seiten.', 'Ejes de simetría, ángulos rectos o un par de lados paralelos.'),
    months: [5, 6],
    prereq: ['3.g.a'],
    knobs: [
      mode(
        [
          opt('symmetry', 'Lines of symmetry', 'Symmetrieachsen', 'Ejes de simetría'),
          opt('classify', 'Right angles', 'Rechte Winkel', 'Ángulos rectos'),
          opt('parallel', 'Parallel sides', 'Parallele Seiten', 'Lados paralelos'),
        ],
        ['symmetry', 'symmetry', 'classify', 'parallel', 'symmetry'],
      ),
      toggle(
        'allShapes',
        L('All shapes', 'Alle Figuren', 'Todas las figuras'),
        L('Adds pentagons, rhombuses, trapezoids, and more.', 'Fügt Fünfecke, Rauten, Trapeze und mehr hinzu.', 'Añade pentágonos, rombos, trapecios y más.'),
        [false, false, true, true, true],
        showFor('mode', 'symmetry'),
      ),
    ],
  }),
  skill({
    id: '5.oa.a',
    grade: 5,
    domain: 'OA',
    code: '5.OA.A',
    title: L('Expressions with grouping', 'Terme mit Klammern', 'Expresiones con agrupación'),
    blurb: L('Evaluate, or match words to the expression that respects the grouping.', 'Ausrechnen oder Worte dem Term zuordnen, der die Klammern achtet.', 'Calcular, o emparejar palabras con la expresión que respeta el agrupamiento.'),
    months: [9, 11, 6],
    prereq: ['4.oa.a'],
    knobs: [
      mode(
        [opt('eval', 'Evaluate', 'Ausrechnen', 'Calcular'), opt('words', 'Match the words', 'Worte zuordnen', 'Emparejar palabras')],
        ['eval', 'eval', 'words', 'eval', 'words'],
      ),
      range('max', MAX_NUMBER, L('The biggest number inside an expression.', 'Die größte Zahl in einem Term.', 'El mayor número dentro de una expresión.'), 4, 100, [8, 12, 24, 48, 80]),
      choose(
        'shape',
        L('Expression shape', 'Form des Terms', 'Forma de la expresión'),
        L('Which operations the expression uses.', 'Welche Rechenarten der Term nutzt.', 'Qué operaciones usa la expresión.'),
        [
          opt('sumprod', 'Add and multiply', 'Addieren und malnehmen', 'Sumar y multiplicar'),
          opt('diff', 'Subtract in the mix', 'Mit Subtraktion', 'Con resta'),
          opt('three', 'Three operations', 'Drei Rechenarten', 'Tres operaciones'),
          opt('div', 'With division', 'Mit Division', 'Con división'),
        ],
        ['sumprod', 'sumprod', 'diff', 'three', 'div'],
      ),
    ],
  }),
  skill({
    id: '5.oa.b',
    grade: 5,
    domain: 'OA',
    code: '5.OA.B',
    title: L('Two related patterns', 'Zwei verwandte Muster', 'Dos patrones relacionados'),
    blurb: L('When one pattern reaches a term, find the partner pattern.', 'Wenn ein Muster ein Glied erreicht, das Partner-Muster finden.', 'Cuando un patrón llega a un término, hallar el patrón compañero.'),
    months: [11, 12],
    prereq: ['4.oa.c'],
    knobs: [
      mode(
        [opt('ask', 'Corresponding term', 'Zugehöriges Glied', 'Término correspondiente')],
        ['ask', 'ask', 'ask', 'ask', 'ask'],
      ),
      range('max', L('Largest first step', 'Größter erster Schritt', 'Primer paso mayor'), L('The biggest step in the first pattern.', 'Der größte Schritt im ersten Muster.', 'El mayor paso del primer patrón.'), 2, 40, [3, 6, 10, 18, 28]),
      range('term', L('Term number, up to', 'Gliednummer, höchstens', 'Número de término, como máximo'), L('How far along the pattern the question can ask.', 'Wie weit hinten im Muster die Frage fragen kann.', 'Qué tan adelante del patrón puede preguntar.'), 3, 20, [4, 6, 8, 12, 16]),
    ],
  }),
  skill({
    id: '5.nbt.a',
    grade: 5,
    domain: 'NBT',
    code: '5.NBT.A',
    title: L('Decimal place value', 'Dezimale Stellenwerte', 'Valor posicional decimal'),
    blurb: L('Compare, round, shift by powers of ten, or read expanded form.', 'Vergleichen, runden, mit Zehnerpotenzen verschieben oder die erweiterte Schreibweise lesen.', 'Comparar, redondear, mover con potencias de diez o leer la forma desarrollada.'),
    months: [9, 10],
    prereq: ['4.nf.c', '4.nbt.a'],
    knobs: [
      mode(
        [
          opt('compare', 'Compare', 'Vergleichen', 'Comparar'),
          opt('round', 'Round', 'Runden', 'Redondear'),
          opt('times', 'Powers of ten', 'Zehnerpotenzen', 'Potencias de diez'),
          opt('expand', 'Expanded form', 'Erweiterte Form', 'Forma desarrollada'),
        ],
        ['compare', 'round', 'times', 'expand', 'times'],
      ),
      range(
        'decimals',
        L('Decimal places', 'Dezimalstellen', 'Cifras decimales'),
        L('Digits after the point in the numbers compared.', 'Stellen nach dem Komma in den verglichenen Zahlen.', 'Cifras después del punto en los números comparados.'),
        1,
        4,
        [1, 2, 2, 3, 4],
        1,
        showFor('mode', 'compare', 'round'),
      ),
    ],
  }),
  skill({
    id: '5.nbt.b',
    grade: 5,
    domain: 'NBT',
    code: '5.NBT.B',
    title: L('Whole numbers and decimals', 'Ganze Zahlen und Dezimalzahlen', 'Enteros y decimales'),
    blurb: L('Multi-digit multiplication and division, then the four decimal operations.', 'Mehrstellige Multiplikation und Division, dann die vier Dezimalrechnungen.', 'Multiplicación y división de varios dígitos, y las cuatro operaciones decimales.'),
    months: [9, 10, 11, 6],
    prereq: ['5.nbt.a', '4.nbt.b'],
    knobs: [
      mode(
        [
          opt('head', 'Mental math', 'Im Kopf', 'Cálculo mental'),
          opt('mul', 'Multiply wholes', 'Ganze Zahlen mal', 'Multiplicar enteros'),
          opt('div', 'Divide wholes', 'Ganze Zahlen geteilt', 'Dividir enteros'),
          opt('adddec', 'Add decimals', 'Dezimalzahlen addieren', 'Sumar decimales'),
          opt('subdec', 'Subtract decimals', 'Dezimalzahlen subtrahieren', 'Restar decimales'),
          opt('muldec', 'Multiply decimals', 'Dezimalzahlen mal', 'Multiplicar decimales'),
          opt('divdec', 'Divide decimals', 'Dezimalzahlen geteilt', 'Dividir decimales'),
        ],
        ['adddec', 'mul', 'muldec', 'div', 'divdec'],
      ),
      range('digits', DIGITS, L('Digits in each whole number.', 'Stellen jeder ganzen Zahl.', 'Cifras de cada entero.'), 2, 6, [2, 3, 3, 4, 5], 1, showFor('mode', 'mul', 'div', 'head')),
      range(
        'places',
        L('Decimal places', 'Dezimalstellen', 'Cifras decimales'),
        L('How many digits follow the decimal point.', 'Wie viele Stellen nach dem Komma stehen.', 'Cuántas cifras siguen al punto decimal.'),
        1,
        3,
        [1, 1, 2, 2, 3],
        1,
        showFor('mode', 'adddec', 'subdec', 'muldec', 'divdec'),
      ),
    ],
  }),
  skill({
    id: '5.nbt.c',
    grade: 5,
    domain: 'NBT',
    code: '5.NBT.C',
    title: L('Large whole numbers', 'Große ganze Zahlen', 'Números enteros grandes'),
    blurb: L(
      'Place value through the hundred trillions, neighbors, comparisons, order, rounding, and the number line.',
      'Stellenwerte bis zu hundert Billionen, Nachbarn, Vergleiche, Reihenfolge, Runden und der Zahlenstrahl.',
      'Valor posicional hasta cien billones, vecinos, comparaciones, orden, redondeo y la recta numérica.',
    ),
    months: [9, 10, 6],
    prereq: ['4.nbt.a'],
    knobs: [
      mode(
        [
          opt('chart', 'Place-value chart', 'Stellenwerttafel', 'Tablero de valor'),
          opt('neighbor', 'Predecessor and successor', 'Vorgänger und Nachfolger', 'Anterior y siguiente'),
          opt('compare', 'Compare', 'Vergleichen', 'Comparar'),
          opt('order', 'Order', 'Ordnen', 'Ordenar'),
          opt('round', 'Round', 'Runden', 'Redondear'),
          opt('line', 'Number line', 'Zahlenstrahl', 'Recta numérica'),
        ],
        ['chart', 'compare', 'order', 'round', 'line'],
      ),
      range('digits', DIGITS, L('How many places the number has.', 'Wie viele Stellen die Zahl hat.', 'Cuántos lugares tiene el número.'), 3, 15, [4, 6, 9, 12, 15]),
      toggle(
        'words',
        L('Numbers in words', 'Zahlen in Worten', 'Números en palabras'),
        L('Show a number as trillions, billions, millions, and thousands.', 'Zeige eine Zahl als Billionen, Milliarden, Millionen und Tausend.', 'Muestra un número como billones, mil millones, millones y miles.'),
        [false, false, true, true, true],
        showFor('mode', 'chart', 'compare'),
      ),
      range(
        'count',
        L('How many numbers', 'Wie viele Zahlen', 'Cuántos números'),
        L('How many numbers to put in order.', 'Wie viele Zahlen zu ordnen sind.', 'Cuántos números hay que ordenar.'),
        3,
        6,
        [3, 4, 4, 5, 6],
        1,
        showFor('mode', 'order'),
      ),
      choose(
        'place',
        L('Round to', 'Runden auf', 'Redondear a'),
        L('Which place the rounding uses. Any stays inside the number.', 'Welche Stelle das Runden nutzt. Beliebig bleibt innerhalb der Zahl.', 'Qué lugar usa el redondeo. Cualquiera se queda dentro del número.'),
        ROUND_TO,
        ['any', '1000', '10000', '100000', 'any'],
        showFor('mode', 'round'),
      ),
    ],
  }),
  skill({
    id: '5.nf.a',
    grade: 5,
    domain: 'NF',
    code: '5.NF.A',
    title: L('Unlike denominators', 'Ungleiche Nenner', 'Denominadores distintos'),
    blurb: L('Add or subtract by building a common denominator, including mixed numbers.', 'Addieren oder subtrahieren über einen gemeinsamen Nenner, auch gemischt.', 'Sumar o restar con un denominador común, también números mixtos.'),
    months: [1, 2, 6],
    prereq: ['4.nf.b'],
    knobs: [
      mode(
        [
          opt('add', 'Add', 'Addieren', 'Sumar'),
          opt('sub', 'Subtract', 'Subtrahieren', 'Restar'),
          opt('mixed', 'Mixed numbers', 'Gemischte Zahlen', 'Números mixtos'),
        ],
        ['add', 'add', 'sub', 'mixed', 'sub'],
      ),
      den(4, 24, [6, 8, 12, 16, 20]),
      simple(),
    ],
  }),
  skill({
    id: '5.nf.b',
    grade: 5,
    domain: 'NF',
    code: '5.NF.B',
    title: L('Multiply and divide fractions', 'Brüche multiplizieren und dividieren', 'Multiplicar y dividir fracciones'),
    blurb: L('Fraction times fraction, or division with a unit fraction.', 'Bruch mal Bruch, oder Division mit einem Stammbruch.', 'Fracción por fracción, o división con una fracción unitaria.'),
    months: [3, 4, 6],
    prereq: ['5.nf.a', '4.nf.b'],
    knobs: [
      mode(
        [
          opt('mul', 'Multiply fractions', 'Brüche mal', 'Multiplicar fracciones'),
          opt('mulwhole', 'Fraction of a whole', 'Bruch von einer Ganzen', 'Fracción de un entero'),
          opt('divunit', 'Divide unit fractions', 'Stammbrüche teilen', 'Dividir fracciones unitarias'),
          opt('divwhole', 'Whole ÷ unit fraction', 'Ganze ÷ Stammbruch', 'Entero ÷ fracción unitaria'),
        ],
        ['mulwhole', 'mul', 'divunit', 'divwhole', 'mul'],
      ),
      den(4, 24, [6, 8, 12, 16, 20]),
      simple(),
    ],
  }),
  skill({
    id: '5.md.a',
    grade: 5,
    domain: 'MD',
    code: '5.MD.A',
    title: L('Convert measurement units', 'Maßeinheiten umwandeln', 'Convertir unidades'),
    blurb: L('A single conversion, or a compound length such as meters and centimeters.', 'Eine einfache Umwandlung oder eine zusammengesetzte Länge aus Metern und Zentimetern.', 'Una conversión simple, o una longitud compuesta de metros y centímetros.'),
    months: [1, 2],
    prereq: ['4.md.a'],
    knobs: [
      mode(
        [opt('metric', 'Single unit', 'Eine Einheit', 'Una unidad'), opt('compound', 'Compound', 'Zusammengesetzt', 'Compuesta')],
        ['metric', 'metric', 'compound', 'metric', 'compound'],
      ),
      range('max', L('Largest amount', 'Größte Menge', 'Cantidad mayor'), L('The biggest count of meters in a compound length.', 'Die größte Meterzahl in einer zusammengesetzten Länge.', 'La mayor cantidad de metros en una longitud compuesta.'), 1, 40, [2, 4, 8, 16, 30], 1, showFor('mode', 'compound')),
    ],
  }),
  skill({
    id: '5.md.b',
    grade: 5,
    domain: 'MD',
    code: '5.MD.B',
    title: L('Fraction line plots', 'Bruch-Linienplots', 'Diagramas con fracciones'),
    blurb: L('Measurements in halves, fourths, or eighths, read from a line plot.', 'Messwerte in Hälften, Vierteln oder Achteln, von einem Linienplot gelesen.', 'Medidas en medios, cuartos u octavos, leídas en un diagrama de puntos.'),
    months: [4, 5],
    prereq: ['4.md.b', '4.nf.b'],
    knobs: [
      mode(
        [opt('count', 'How many', 'Wie viele', 'Cuántos'), opt('greater', 'Greater than', 'Größer als', 'Mayor que')],
        ['count', 'count', 'greater', 'count', 'greater'],
      ),
    ],
  }),
  skill({
    id: '5.md.c',
    grade: 5,
    domain: 'MD',
    code: '5.MD.C',
    title: L('Volume', 'Volumen', 'Volumen'),
    blurb: L('Count cubic layers, use l × w × h, or find a missing edge.', 'Kubische Schichten zählen, l × b × h nutzen oder eine Kante finden.', 'Contar capas cúbicas, usar l × a × h, o hallar una arista.'),
    months: [3, 5, 6],
    prereq: ['3.md.c', '5.nbt.b'],
    knobs: [
      mode(
        [
          opt('volume', 'Find volume', 'Volumen finden', 'Hallar el volumen'),
          opt('missing', 'Missing edge', 'Fehlende Kante', 'Arista faltante'),
          opt('layers', 'Count cubes', 'Würfel zählen', 'Contar cubos'),
        ],
        ['layers', 'volume', 'volume', 'missing', 'volume'],
      ),
      range('max', L('Largest edge', 'Größte Kante', 'Arista mayor'), L('The longest edge of a box.', 'Die längste Kante eines Quaders.', 'La arista más larga de una caja.'), 4, 30, [5, 8, 12, 18, 24]),
    ],
  }),
  skill({
    id: '5.md.d',
    grade: 5,
    domain: 'MD',
    code: '5.MD.D',
    title: L('Bar graphs and equal heights', 'Säulen und gleiche Höhen', 'Barras y alturas iguales'),
    blurb: L(
      'Read a tall graph, name the tallest or shortest, or find which bar can grow until two match.',
      'Ein hohes Diagramm lesen, die höchste oder niedrigste nennen, oder finden, welche Säule wachsen kann, bis zwei gleich hoch sind.',
      'Leer una gráfica alta, nombrar la más alta o la más baja, o hallar qué barra puede crecer hasta que dos queden iguales.',
    ),
    months: [4, 5, 6],
    prereq: ['3.md.b'],
    knobs: [
      mode(
        [
          opt('read', 'Read', 'Lesen', 'Leer'),
          opt('most', 'Tallest or shortest', 'Höchste oder niedrigste', 'Más alta o más baja'),
          opt('match', 'Equal heights', 'Gleich hohe Säulen', 'Alturas iguales'),
          opt('build', 'Build', 'Bauen', 'Construir'),
        ],
        ['read', 'most', 'match', 'build', 'match'],
      ),
      range('top', L('Tallest bar', 'Höchste Säule', 'Barra más alta'), L('The largest count a bar can show. One square can stand for many.', 'Die größte Anzahl, die eine Säule zeigen kann. Ein Kästchen kann für viele stehen.', 'La mayor cantidad que puede mostrar una barra. Un cuadrado puede valer por muchos.'), 20, 400, [40, 80, 120, 200, 320], 10),
    ],
  }),
  skill({
    id: '5.g.a',
    grade: 5,
    domain: 'G',
    code: '5.G.A',
    title: L('The coordinate plane', 'Das Koordinatensystem', 'El plano de coordenadas'),
    blurb: L('Plot a point, read one, or find the distance between two.', 'Einen Punkt setzen, einen ablesen oder den Abstand zwischen zweien finden.', 'Marcar un punto, leer uno, o hallar la distancia entre dos.'),
    months: [3, 5, 6],
    prereq: [],
    knobs: [
      mode(
        [
          opt('plot', 'Plot', 'Setzen', 'Marcar'),
          opt('read', 'Read', 'Ablesen', 'Leer'),
          opt('distance', 'Distance', 'Abstand', 'Distancia'),
        ],
        ['plot', 'plot', 'read', 'distance', 'plot'],
      ),
      range('max', L('Largest coordinate', 'Größte Koordinate', 'Coordenada mayor'), L('The biggest coordinate on the grid.', 'Die größte Koordinate im Gitter.', 'La mayor coordenada en la cuadrícula.'), 4, 24, [6, 8, 12, 16, 20]),
      toggle(
        'quadrants',
        L('All four quadrants', 'Alle vier Quadranten', 'Los cuatro cuadrantes'),
        L('Points can sit left of zero or below it.', 'Punkte dürfen links von null oder unter null liegen.', 'Los puntos pueden quedar a la izquierda del cero o debajo.'),
        [false, false, false, true, true],
      ),
    ],
  }),
  skill({
    id: '5.g.b',
    grade: 5,
    domain: 'G',
    code: '5.G.B',
    title: L('Hierarchy of figures', 'Hierarchie der Figuren', 'Jerarquía de figuras'),
    blurb: L('True statements about categories, or a figure that fits a description.', 'Wahre Sätze über Kategorien oder eine Figur, die zur Beschreibung passt.', 'Afirmaciones verdaderas sobre categorías, o una figura que encaja.'),
    months: [5, 6],
    prereq: ['4.g.a'],
    knobs: [
      mode(
        [opt('statement', 'Which is true', 'Was stimmt', 'Cuál es cierta'), opt('figure', 'Which figure', 'Welche Figur', 'Cuál figura')],
        ['statement', 'statement', 'figure', 'statement', 'figure'],
      ),
    ],
  }),
  skill({
    id: '6.rp.a',
    grade: 6,
    domain: 'RP',
    code: '6.RP.A',
    title: L('Ratios, rates, and percent', 'Verhältnisse, Raten und Prozent', 'Razones, tasas y porcentaje'),
    blurb: L('Build an equivalent ratio, find a missing term, a unit rate, or a percent.', 'Ein gleichwertiges Verhältnis bauen, ein Glied, eine Rate oder einen Prozentsatz finden.', 'Armar una razón equivalente, hallar un término, una tasa o un porcentaje.'),
    months: [9, 10, 11, 6],
    prereq: ['5.nf.b'],
    knobs: [
      mode(
        [
          opt('build', 'Build a ratio', 'Verhältnis bauen', 'Armar una razón'),
          opt('missing', 'Missing term', 'Fehlendes Glied', 'Término faltante'),
          opt('unit', 'Unit rate', 'Einheitsrate', 'Tasa unitaria'),
          opt('percent', 'Percent of', 'Prozent von', 'Porcentaje de'),
        ],
        ['build', 'missing', 'unit', 'percent', 'missing'],
      ),
      range('max', L('Largest ratio term', 'Größtes Verhältnisglied', 'Término mayor de la razón'), L('The biggest number in a ratio.', 'Die größte Zahl in einem Verhältnis.', 'El mayor número de una razón.'), 4, 48, [6, 10, 16, 24, 36], 1, showFor('mode', 'build', 'missing')),
      range('whole', L('Largest whole number', 'Größte ganze Zahl', 'Entero mayor'), L('The biggest whole number in a rate or a percent.', 'Die größte ganze Zahl in einer Rate oder einem Prozentsatz.', 'El mayor entero en una tasa o un porcentaje.'), 20, 400, [40, 60, 100, 160, 240], 10, showFor('mode', 'unit', 'percent')),
    ],
  }),
  skill({
    id: '6.ns.a',
    grade: 6,
    domain: 'NS',
    code: '6.NS.A',
    title: L('Divide fractions by fractions', 'Brüche durch Brüche teilen', 'Dividir fracciones entre fracciones'),
    blurb: L('Invert and multiply, including a short story about sharing.', 'Kehrbruch malnehmen, auch in einer kurzen Teilungsgeschichte.', 'Invertir y multiplicar, también en una historia breve de reparto.'),
    months: [11, 12, 6],
    prereq: ['5.nf.b'],
    knobs: [
      mode(
        [
          opt('frac', 'Fraction ÷ fraction', 'Bruch ÷ Bruch', 'Fracción ÷ fracción'),
          opt('whole', 'Whole ÷ fraction', 'Ganze ÷ Bruch', 'Entero ÷ fracción'),
          opt('word', 'Story', 'Geschichte', 'Historia'),
        ],
        ['whole', 'frac', 'frac', 'word', 'frac'],
      ),
      den(4, 24, [6, 8, 12, 16, 20], showFor('mode', 'frac', 'whole')),
      simple(showFor('mode', 'frac', 'whole')),
    ],
  }),
  skill({
    id: '6.ns.b',
    grade: 6,
    domain: 'NS',
    code: '6.NS.B',
    title: L('Factors and decimal fluency', 'Faktoren und Dezimal-Geläufigkeit', 'Factores y fluidez decimal'),
    blurb: L('GCF, LCM, and crisp decimal multiplication or division.', 'ggT, kgV und klare Dezimal-Multiplikation oder Division.', 'MCD, mcm y una multiplicación o división decimal precisa.'),
    months: [9, 11],
    prereq: ['4.oa.b', '5.nbt.b'],
    knobs: [
      mode(
        [
          opt('gcf', 'GCF', 'ggT', 'MCD'),
          opt('lcm', 'LCM', 'kgV', 'mcm'),
          opt('mul', 'Multiply decimals', 'Dezimalzahlen mal', 'Multiplicar decimales'),
          opt('div', 'Divide decimals', 'Dezimalzahlen geteilt', 'Dividir decimales'),
        ],
        ['gcf', 'lcm', 'mul', 'div', 'gcf'],
      ),
      range('max', MAX_NUMBER, L('The biggest number used for GCF or LCM.', 'Die größte Zahl für ggT oder kgV.', 'El mayor número para el MCD o el mcm.'), 12, 240, [24, 40, 72, 120, 180], 1, showFor('mode', 'gcf', 'lcm')),
    ],
  }),
  skill({
    id: '6.ns.c',
    grade: 6,
    domain: 'NS',
    code: '6.NS.C',
    title: L('Rational numbers', 'Rationale Zahlen', 'Números racionales'),
    blurb: L('Compare, order, plot in four quadrants, or take an absolute value.', 'Vergleichen, ordnen, in vier Quadranten setzen oder den Betrag nehmen.', 'Comparar, ordenar, marcar en cuatro cuadrantes, o tomar el valor absoluto.'),
    months: [1, 2, 6],
    prereq: ['5.g.a'],
    knobs: [
      mode(
        [
          opt('compare', 'Compare', 'Vergleichen', 'Comparar'),
          opt('order', 'Order', 'Ordnen', 'Ordenar'),
          opt('plot', 'Plot', 'Setzen', 'Marcar'),
          opt('abs', 'Absolute value', 'Betrag', 'Valor absoluto'),
        ],
        ['abs', 'compare', 'order', 'plot', 'plot'],
      ),
      range(
        'span',
        L('Largest distance from zero', 'Größter Abstand von null', 'Distancia máxima desde cero'),
        L('The biggest absolute value a number can have.', 'Der größte Betrag, den eine Zahl haben kann.', 'El mayor valor absoluto que puede tener un número.'),
        3,
        50,
        [4, 8, 12, 24, 40],
        1,
      ),
    ],
  }),
  skill({
    id: '6.ee.a',
    grade: 6,
    domain: 'EE',
    code: '6.EE.A',
    title: L('Expressions with variables', 'Terme mit Variablen', 'Expresiones con variables'),
    blurb: L('Evaluate, match words, or expand with the distributive property.', 'Einsetzen, Worte zuordnen oder mit dem Distributivgesetz ausmultiplizieren.', 'Evaluar, emparejar palabras o desarrollar con la propiedad distributiva.'),
    months: [11, 3],
    prereq: ['5.oa.a'],
    knobs: [
      mode(
        [
          opt('eval', 'Evaluate', 'Einsetzen', 'Evaluar'),
          opt('write', 'Match words', 'Worte zuordnen', 'Emparejar palabras'),
          opt('dist', 'Which expansion', 'Welche Ausmultiplikation', 'Cuál desarrollo'),
        ],
        ['eval', 'eval', 'write', 'dist', 'eval'],
      ),
      range('max', MAX_NUMBER, L('The biggest number in the expression.', 'Die größte Zahl im Term.', 'El mayor número de la expresión.'), 2, 30, [4, 6, 9, 15, 24]),
    ],
  }),
  skill({
    id: '6.ee.b',
    grade: 6,
    domain: 'EE',
    code: '6.EE.B',
    title: L('Equations and inequalities', 'Gleichungen und Ungleichungen', 'Ecuaciones y desigualdades'),
    blurb: L('One-step, two-step, or a value that makes an inequality true.', 'Ein Schritt, zwei Schritte oder ein Wert, der eine Ungleichung wahr macht.', 'Un paso, dos pasos, o un valor que hace verdadera una desigualdad.'),
    months: [1, 3, 4, 6],
    prereq: ['6.ee.a'],
    knobs: [
      mode(
        [
          opt('one', 'One step', 'Ein Schritt', 'Un paso'),
          opt('two', 'Two steps', 'Zwei Schritte', 'Dos pasos'),
          opt('ineq', 'Inequality', 'Ungleichung', 'Desigualdad'),
        ],
        ['one', 'one', 'two', 'ineq', 'two'],
      ),
      range('max', MAX_NUMBER, L('The biggest number in an equation.', 'Die größte Zahl in einer Gleichung.', 'El mayor número en una ecuación.'), 5, 40, [6, 10, 15, 24, 36]),
    ],
  }),
  skill({
    id: '6.ee.c',
    grade: 6,
    domain: 'EE',
    code: '6.EE.C',
    title: L('Two variables', 'Zwei Variablen', 'Dos variables'),
    blurb: L('Find y from an equation, or choose the pair that fits.', 'y aus einer Gleichung finden oder das passende Paar wählen.', 'Hallar y desde una ecuación, o elegir el par que encaja.'),
    months: [3, 4],
    prereq: ['6.ee.b'],
    knobs: [
      mode(
        [opt('y', 'Find y', 'y finden', 'Hallar y'), opt('pair', 'Which pair', 'Welches Paar', 'Cuál par')],
        ['y', 'y', 'pair', 'y', 'pair'],
      ),
      range('slope', L('Largest slope', 'Größte Steigung', 'Pendiente mayor'), L('The biggest multiplier m in y = mx + b.', 'Der größte Faktor m in y = mx + b.', 'El mayor multiplicador m en y = mx + b.'), 1, 20, [2, 4, 6, 10, 15]),
      range('intercept', L('Largest intercept', 'Größter y-Achsenabschnitt', 'Intercepto mayor'), L('The biggest b in y = mx + b.', 'Das größte b in y = mx + b.', 'La mayor b en y = mx + b.'), 0, 30, [2, 4, 8, 12, 20]),
      range('xup', L('Largest x', 'Größtes x', 'x mayor'), L('The biggest x-value substituted into the equation.', 'Der größte x-Wert, der eingesetzt wird.', 'El mayor valor de x que se sustituye.'), 1, 20, [3, 4, 6, 10, 15]),
    ],
  }),
  skill({
    id: '6.g.a',
    grade: 6,
    domain: 'G',
    code: '6.G.A',
    title: L('Area, surface, and volume', 'Fläche, Oberfläche und Volumen', 'Área, superficie y volumen'),
    blurb: L('Triangles, parallelograms, rectangular prisms, and surface area.', 'Dreiecke, Parallelogramme, Quader und Oberfläche.', 'Triángulos, paralelogramos, prismas rectangulares y área de superficie.'),
    months: [5, 6],
    prereq: ['5.md.c'],
    knobs: [
      mode(
        [
          opt('triangle', 'Triangle area', 'Dreiecksfläche', 'Área del triángulo'),
          opt('para', 'Parallelogram', 'Parallelogramm', 'Paralelogramo'),
          opt('volume', 'Volume', 'Volumen', 'Volumen'),
          opt('surface', 'Surface area', 'Oberfläche', 'Área de superficie'),
        ],
        ['triangle', 'para', 'volume', 'surface', 'triangle'],
      ),
      range('max', L('Largest measure', 'Größtes Maß', 'Medida mayor'), L('The biggest base, height, or edge.', 'Die größte Grundlinie, Höhe oder Kante.', 'La mayor base, altura o arista.'), 4, 40, [6, 10, 16, 24, 36]),
    ],
  }),
  skill({
    id: '6.sp.a',
    grade: 6,
    domain: 'SP',
    code: '6.SP.A',
    title: L('Statistical questions', 'Statistische Fragen', 'Preguntas estadísticas'),
    blurb: L('Spot a question that expects variability, or the more spread-out set.', 'Eine Frage erkennen, die Streuung erwartet, oder die stärker gestreute Menge.', 'Reconocer una pregunta que espera variabilidad, o el conjunto más disperso.'),
    months: [5],
    prereq: [],
    knobs: [
      mode(
        [opt('question', 'Statistical question', 'Statistische Frage', 'Pregunta estadística'), opt('spread', 'Which varies more', 'Was streut mehr', 'Cuál varía más')],
        ['question', 'question', 'spread', 'question', 'spread'],
      ),
    ],
  }),
  skill({
    id: '6.sp.b',
    grade: 6,
    domain: 'SP',
    code: '6.SP.B',
    title: L('Mean, median, and range', 'Mittelwert, Median und Spannweite', 'Media, mediana y rango'),
    blurb: L('Summarize a small data set three different ways.', 'Eine kleine Datenmenge auf drei Arten zusammenfassen.', 'Resumir un conjunto pequeño de tres maneras.'),
    months: [5, 6],
    prereq: ['6.sp.a'],
    knobs: [
      mode(
        [
          opt('mean', 'Mean', 'Mittelwert', 'Media'),
          opt('median', 'Median', 'Median', 'Mediana'),
          opt('range', 'Range', 'Spannweite', 'Rango'),
        ],
        ['mean', 'median', 'range', 'mean', 'median'],
      ),
      range('size', L('How many numbers', 'Wie viele Zahlen', 'Cuántos números'), L('How many values each data set has.', 'Wie viele Werte jede Datenmenge hat.', 'Cuántos valores tiene cada conjunto de datos.'), 3, 15, [3, 5, 7, 11, 15], 2),
    ],
  }),
  skill({
    id: '7.rp.a',
    grade: 7,
    domain: 'RP',
    code: '7.RP.A',
    title: L('Proportions and percent', 'Proportionen und Prozent', 'Proporciones y porcentaje'),
    blurb: L('Solve a proportion, a percent, a percent change, or tax on a price.', 'Eine Proportion, einen Prozentsatz, eine Änderung oder Steuer auf einen Preis lösen.', 'Resolver una proporción, un porcentaje, un cambio porcentual o un impuesto.'),
    months: [9, 10, 1, 6],
    prereq: ['6.rp.a'],
    knobs: [
      mode(
        [
          opt('proportion', 'Proportion', 'Proportion', 'Proporción'),
          opt('percent', 'Percent of', 'Prozent von', 'Porcentaje de'),
          opt('change', 'Percent change', 'Prozentuale Änderung', 'Cambio porcentual'),
          opt('tax', 'Tax or tip', 'Steuer oder Trinkgeld', 'Impuesto o propina'),
        ],
        ['proportion', 'percent', 'change', 'tax', 'percent'],
      ),
      range('price', L('Largest price', 'Höchster Preis', 'Precio mayor'), L('The biggest starting price or whole number.', 'Der größte Ausgangspreis oder die größte ganze Zahl.', 'El mayor precio inicial o entero.'), 20, 400, [40, 80, 120, 200, 320], 10),
      range('rate', L('Largest percent', 'Größter Prozentsatz', 'Porcentaje mayor'), L('The biggest percent used for change, tax, or a part of a whole.', 'Der größte Prozentsatz für Änderung, Steuer oder einen Anteil.', 'El mayor porcentaje para un cambio, un impuesto o una parte.'), 5, 50, [10, 15, 20, 25, 40], 5, showFor('mode', 'percent', 'change', 'tax')),
    ],
  }),
  skill({
    id: '7.ns.a',
    grade: 7,
    domain: 'NS',
    code: '7.NS.A',
    title: L('Operations with rational numbers', 'Rechnen mit rationalen Zahlen', 'Operaciones con racionales'),
    blurb: L('Add, subtract, multiply, or divide, with negatives in the mix.', 'Addieren, subtrahieren, multiplizieren oder dividieren, mit negativen Zahlen.', 'Sumar, restar, multiplicar o dividir, con negativos en la mezcla.'),
    months: [9, 11, 6],
    prereq: ['6.ns.c', '6.ns.a'],
    knobs: [
      mode(
        [
          opt('add', 'Add', 'Addieren', 'Sumar'),
          opt('sub', 'Subtract', 'Subtrahieren', 'Restar'),
          opt('mul', 'Multiply', 'Multiplizieren', 'Multiplicar'),
          opt('div', 'Divide', 'Dividieren', 'Dividir'),
        ],
        ['add', 'sub', 'mul', 'div', 'mul'],
      ),
      choose(
        'family',
        L('Numbers', 'Zahlen', 'Números'),
        L('Whole numbers with negatives, or fractions.', 'Ganze Zahlen mit negativen Zahlen, oder Brüche.', 'Enteros con negativos, o fracciones.'),
        [opt('int', 'Integers', 'Ganze Zahlen', 'Enteros'), opt('frac', 'Fractions', 'Brüche', 'Fracciones')],
        ['int', 'int', 'int', 'frac', 'frac'],
      ),
      range('max', L('Largest integer', 'Größte ganze Zahl', 'Entero mayor'), L('The biggest absolute value the integers can reach.', 'Der größte Betrag, den die ganzen Zahlen erreichen.', 'El mayor valor absoluto que pueden alcanzar los enteros.'), 5, 80, [9, 15, 24, 40, 60], 1, showFor('family', 'int')),
      simple(showFor('family', 'frac')),
    ],
  }),
  skill({
    id: '7.ee.a',
    grade: 7,
    domain: 'EE',
    code: '7.EE.A',
    title: L('Equivalent expressions', 'Äquivalente Terme', 'Expresiones equivalentes'),
    blurb: L('Expand or factor a linear expression and recognize its twin.', 'Einen linearen Term ausmultiplizieren oder faktorisieren und den Zwilling erkennen.', 'Desarrollar o factorizar una expresión lineal y reconocer su gemela.'),
    months: [9, 1],
    prereq: ['6.ee.a'],
    knobs: [
      mode(
        [opt('expand', 'Expand', 'Ausmultiplizieren', 'Desarrollar'), opt('factor', 'Factor', 'Faktorisieren', 'Factorizar')],
        ['expand', 'expand', 'factor', 'expand', 'factor'],
      ),
      range('max', L('Largest coefficient', 'Größter Koeffizient', 'Coeficiente mayor'), L('The biggest number inside a linear expression.', 'Die größte Zahl in einem linearen Term.', 'El mayor número dentro de una expresión lineal.'), 4, 30, [4, 6, 10, 16, 24]),
    ],
  }),
  skill({
    id: '7.ee.b',
    grade: 7,
    domain: 'EE',
    code: '7.EE.B',
    title: L('Solve equations', 'Gleichungen lösen', 'Resolver ecuaciones'),
    blurb: L('Two steps, a distributive opening, or an inequality.', 'Zwei Schritte, ein distributives Öffnen oder eine Ungleichung.', 'Dos pasos, una apertura distributiva, o una desigualdad.'),
    months: [11, 1, 6],
    prereq: ['7.ee.a', '6.ee.b'],
    knobs: [
      mode(
        [
          opt('two', 'Two steps', 'Zwei Schritte', 'Dos pasos'),
          opt('dist', 'With parentheses', 'Mit Klammern', 'Con paréntesis'),
          opt('ineq', 'Inequality', 'Ungleichung', 'Desigualdad'),
        ],
        ['two', 'two', 'dist', 'ineq', 'dist'],
      ),
      range('max', MAX_NUMBER, L('The biggest number in the equation.', 'Die größte Zahl in der Gleichung.', 'El mayor número de la ecuación.'), 5, 40, [6, 10, 16, 24, 36]),
    ],
  }),
  skill({
    id: '7.g.a',
    grade: 7,
    domain: 'G',
    code: '7.G.A',
    title: L('Scale drawings', 'Maßstäbliche Zeichnungen', 'Dibujos a escala'),
    blurb: L('Scale a length up or down, or scale an area by the square of the factor.', 'Eine Länge vergrößern oder verkleinern, oder eine Fläche mit dem Quadrat des Faktors.', 'Ampliar o reducir una longitud, o escalar un área con el cuadrado del factor.'),
    months: [3, 6],
    prereq: ['6.rp.a', '6.g.a'],
    knobs: [
      mode(
        [
          opt('scale', 'Scale up', 'Vergrößern', 'Ampliar'),
          opt('down', 'Scale down', 'Verkleinern', 'Reducir'),
          opt('area', 'Scale the area', 'Fläche skalieren', 'Escalar el área'),
        ],
        ['scale', 'scale', 'down', 'area', 'area'],
      ),
      range('factor', L('Largest scale factor', 'Größter Maßstabsfaktor', 'Factor de escala mayor'), L('The biggest multiplier used when scaling.', 'Der größte Faktor beim Maßstab.', 'El mayor factor al escalar.'), 2, 20, [3, 4, 6, 10, 16]),
    ],
  }),
  skill({
    id: '7.g.b',
    grade: 7,
    domain: 'G',
    code: '7.G.B',
    title: L('Circles, angles, and surface', 'Kreise, Winkel und Oberfläche', 'Círculos, ángulos y superficie'),
    blurb: L('Circumference and area with 3.14, angle relationships, and surface area.', 'Umfang und Fläche mit 3,14, Winkelbeziehungen und Oberfläche.', 'Circunferencia y área con 3.14, relaciones de ángulos y área de superficie.'),
    months: [3, 4],
    prereq: ['6.g.a', '4.md.c'],
    knobs: [
      mode(
        [
          opt('circ', 'Circumference', 'Umfang', 'Circunferencia'),
          opt('area', 'Circle area', 'Kreisfläche', 'Área del círculo'),
          opt('complement', 'Complement or supplement', 'Komplement oder Supplement', 'Complemento o suplemento'),
          opt('triangle', 'Triangle angle', 'Dreieckswinkel', 'Ángulo del triángulo'),
          opt('surface', 'Surface area', 'Oberfläche', 'Área de superficie'),
        ],
        ['circ', 'area', 'complement', 'triangle', 'surface'],
      ),
      range('radius', L('Largest radius', 'Größter Radius', 'Radio mayor'), L('The biggest radius in a circle question.', 'Der größte Radius in einer Kreisaufgabe.', 'El mayor radio en una pregunta de círculos.'), 2, 40, [6, 10, 16, 24, 36], 1, showFor('mode', 'circ', 'area')),
    ],
  }),
  skill({
    id: '7.sp.a',
    grade: 7,
    domain: 'SP',
    code: '7.SP.A',
    title: L('Fair samples', 'Faire Stichproben', 'Muestras justas'),
    blurb: L('Choose the sample that can actually speak for the population.', 'Die Stichprobe wählen, die wirklich für die Gesamtheit sprechen kann.', 'Elegir la muestra que de verdad puede hablar por la población.'),
    months: [5],
    prereq: ['6.sp.a'],
    knobs: [
      mode([opt('sample', 'Which sample', 'Welche Stichprobe', 'Cuál muestra')], ['sample', 'sample', 'sample', 'sample', 'sample']),
    ],
  }),
  skill({
    id: '7.sp.b',
    grade: 7,
    domain: 'SP',
    code: '7.SP.B',
    title: L('Compare two groups', 'Zwei Gruppen vergleichen', 'Comparar dos grupos'),
    blurb: L('Two short lists, and a judgment about their means.', 'Zwei kurze Listen und ein Urteil über ihre Mittelwerte.', 'Dos listas cortas y un juicio sobre sus medias.'),
    months: [5],
    prereq: ['6.sp.b'],
    knobs: [
      mode([opt('mean', 'Which mean is greater', 'Welcher Mittelwert ist größer', 'Cuál media es mayor')], ['mean', 'mean', 'mean', 'mean', 'mean']),
    ],
  }),
  skill({
    id: '7.sp.c',
    grade: 7,
    domain: 'SP',
    code: '7.SP.C',
    title: L('Probability', 'Wahrscheinlichkeit', 'Probabilidad'),
    blurb: L('A simple chance, its complement, or two independent events.', 'Eine einfache Chance, ihr Gegenereignis oder zwei unabhängige Ereignisse.', 'Una probabilidad simple, su complemento, o dos eventos independientes.'),
    months: [5, 6],
    prereq: ['5.nf.b'],
    knobs: [
      mode(
        [
          opt('simple', 'Simple', 'Einfach', 'Simple'),
          opt('complement', 'Complement', 'Gegenereignis', 'Complemento'),
          opt('compound', 'Two events', 'Zwei Ereignisse', 'Dos eventos'),
        ],
        ['simple', 'simple', 'complement', 'compound', 'simple'],
      ),
      simple(),
    ],
  }),
]

export const SKILLS: Skill[] = RAW_SKILLS.map(deepen)

export function getSkill(id: string) {
  return SKILLS.find((item) => item.id === id)
}

export function defaultKnobs(item: Skill, difficulty: number): KnobValues {
  const index = Math.min(4, Math.max(0, Math.round(difficulty) - 1))
  const values: KnobValues = {}
  for (const knob of item.knobs) values[knob.id] = knob.byDifficulty[index]
  return values
}

// The choices under "Kind of problem". A category opens onto these, one card each.
export function problemKinds(item: Skill): KnobOption[] {
  for (const knob of item.knobs) {
    if (knob.id === 'mode' && knob.kind === 'select') return knob.options
  }
  return []
}

// Usual settings for a level, with the chosen kind kept in place.
export function knobsForKind(item: Skill, difficulty: number, mode?: string): KnobValues {
  const values = defaultKnobs(item, difficulty)
  if (typeof mode === 'string') values.mode = mode
  return values
}

export function skillsForGrade(grade: number) {
  return SKILLS.filter((item) => item.grade === grade)
}
