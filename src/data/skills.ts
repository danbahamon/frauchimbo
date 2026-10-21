import { L } from '../lib/math'
import type { DomainId, Knob, KnobOption, KnobValues, Localized, Skill } from '../lib/types'

const kind = L('Kind of problem', 'Art der Aufgabe', 'Tipo de problema')

function range(
  id: string,
  label: Localized,
  min: number,
  max: number,
  vals: [number, number, number, number, number],
  step = 1,
): Knob {
  return { id, kind: 'range', label, min, max, step, byDifficulty: vals }
}

function toggle(id: string, label: Localized, vals: [boolean, boolean, boolean, boolean, boolean]): Knob {
  return { id, kind: 'toggle', label, byDifficulty: vals }
}

function select(options: KnobOption[], vals: [string, string, string, string, string]): Knob {
  return { id: 'mode', kind: 'select', label: kind, options, byDifficulty: vals }
}

function opt(value: string, en: string, de: string, es: string): KnobOption {
  return { value, label: L(en, de, es) }
}

function skill(partial: Omit<Skill, 'knobs'> & { knobs?: Knob[] }): Skill {
  return { knobs: [], ...partial }
}

const digits = range('digits', L('Digits', 'Stellen', 'Cifras'), 1, 4, [2, 2, 3, 3, 4])
const simple = toggle('simple', L('Require simplest form', 'Kürzen verlangen', 'Exigir la forma simple'), [
  false,
  false,
  true,
  true,
  true,
])

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

export const SKILLS: Skill[] = [
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
      select(
        [opt('mul', 'Multiply', 'Multiplizieren', 'Multiplicar'), opt('div', 'Divide', 'Dividieren', 'Dividir'), opt('mixed', 'Mixed', 'Gemischt', 'Mixto')],
        ['mul', 'mul', 'mixed', 'div', 'mixed'],
      ),
      range('max', L('Largest factor', 'Größter Faktor', 'Mayor factor'), 2, 12, [5, 6, 9, 10, 12]),
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
      select(
        [
          opt('comm', 'Commutative', 'Kommutativ', 'Conmutativa'),
          opt('missing', 'Missing factor', 'Fehlender Faktor', 'Factor faltante'),
          opt('dist', 'Distributive', 'Distributiv', 'Distributiva'),
        ],
        ['comm', 'missing', 'missing', 'dist', 'dist'],
      ),
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
      select(
        [opt('mul', 'Multiply', 'Multiplizieren', 'Multiplicar'), opt('div', 'Divide', 'Dividieren', 'Dividir'), opt('mixed', 'Mixed', 'Gemischt', 'Mixto')],
        ['mul', 'mul', 'mixed', 'mixed', 'div'],
      ),
      range('max', L('Largest factor', 'Größter Faktor', 'Mayor factor'), 2, 12, [5, 7, 9, 10, 12]),
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
      select(
        [opt('twostep', 'Two-step story', 'Zweistufige Geschichte', 'Historia de dos pasos'), opt('pattern', 'Pattern', 'Muster', 'Patrón')],
        ['twostep', 'twostep', 'pattern', 'twostep', 'pattern'],
      ),
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
      select(
        [
          opt('add', 'Add', 'Addieren', 'Sumar'),
          opt('sub', 'Subtract', 'Subtrahieren', 'Restar'),
          opt('round', 'Round', 'Runden', 'Redondear'),
          opt('times10', 'Times 10, 20…', 'Mal 10, 20…', 'Por 10, 20…'),
        ],
        ['add', 'add', 'sub', 'round', 'times10'],
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
      select(
        [
          opt('shade', 'Shade', 'Färben', 'Sombrear'),
          opt('name', 'Name', 'Benennen', 'Nombrar'),
          opt('line', 'Number line', 'Zahlenstrahl', 'Recta numérica'),
          opt('compare', 'Compare', 'Vergleichen', 'Comparar'),
          opt('equiv', 'Equivalent', 'Gleichwertig', 'Equivalente'),
        ],
        ['shade', 'name', 'line', 'compare', 'equiv'],
      ),
      range('den', L('Denominator up to', 'Nenner bis', 'Denominador hasta'), 2, 8, [4, 4, 6, 8, 8]),
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
      select(
        [
          opt('read', 'Read a clock', 'Uhr lesen', 'Leer un reloj'),
          opt('set', 'Set a clock', 'Uhr stellen', 'Poner un reloj'),
          opt('elapsed', 'Elapsed time', 'Verstrichene Zeit', 'Tiempo transcurrido'),
          opt('mass', 'Estimate', 'Schätzen', 'Estimar'),
        ],
        ['read', 'set', 'read', 'elapsed', 'mass'],
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
      select(
        [opt('read', 'Read', 'Lesen', 'Leer'), opt('build', 'Build', 'Bauen', 'Construir')],
        ['read', 'read', 'read', 'build', 'build'],
      ),
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
      select(
        [opt('area', 'Find area', 'Fläche finden', 'Hallar el área'), opt('missing', 'Missing side', 'Fehlende Seite', 'Lado faltante')],
        ['area', 'area', 'area', 'missing', 'missing'],
      ),
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
      select(
        [opt('peri', 'Find perimeter', 'Umfang finden', 'Hallar el perímetro'), opt('missing', 'Missing side', 'Fehlende Seite', 'Lado faltante')],
        ['peri', 'peri', 'peri', 'missing', 'missing'],
      ),
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
      select(
        [
          opt('name', 'Name', 'Benennen', 'Nombrar'),
          opt('partition', 'Equal parts', 'Gleiche Teile', 'Partes iguales'),
          opt('attribute', 'Attribute', 'Eigenschaft', 'Atributo'),
        ],
        ['name', 'name', 'partition', 'attribute', 'partition'],
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
      select(
        [opt('two', 'Two steps', 'Zwei Schritte', 'Dos pasos'), opt('three', 'Three steps', 'Drei Schritte', 'Tres pasos')],
        ['two', 'two', 'two', 'three', 'three'],
      ),
      toggle('remain', L('Include a remainder', 'Mit Rest', 'Con residuo'), [false, false, true, true, true]),
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
      select(
        [
          opt('factor', 'Choose a factor', 'Faktor wählen', 'Elegir un factor'),
          opt('multiple', 'Choose a multiple', 'Vielfaches wählen', 'Elegir un múltiplo'),
          opt('gcf', 'Greatest common factor', 'Größter gemeinsamer Faktor', 'Máximo común divisor'),
          opt('lcm', 'Least common multiple', 'Kleinstes gemeinsames Vielfaches', 'Mínimo común múltiplo'),
        ],
        ['factor', 'multiple', 'gcf', 'lcm', 'gcf'],
      ),
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
      select(
        [opt('next', 'Next terms', 'Nächste Glieder', 'Siguientes términos'), opt('rule', 'Name the rule', 'Regel benennen', 'Nombrar la regla')],
        ['next', 'next', 'rule', 'next', 'rule'],
      ),
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
      select(
        [
          opt('value', 'Digit value', 'Ziffernwert', 'Valor de la cifra'),
          opt('round', 'Round', 'Runden', 'Redondear'),
          opt('build', 'Build the number', 'Zahl bauen', 'Armar el número'),
          opt('times', 'Times as much', 'Wie viel mal', 'Cuántas veces'),
        ],
        ['value', 'round', 'build', 'times', 'times'],
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
      select(
        [
          opt('add', 'Add', 'Addieren', 'Sumar'),
          opt('sub', 'Subtract', 'Subtrahieren', 'Restar'),
          opt('mul', 'Multiply', 'Multiplizieren', 'Multiplicar'),
          opt('div', 'Divide', 'Dividieren', 'Dividir'),
        ],
        ['add', 'sub', 'mul', 'div', 'mul'],
      ),
      digits,
      toggle('remain', L('Remainders in division', 'Reste bei der Division', 'Residuos en la división'), [false, false, true, true, true]),
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
    knobs: [select(
      [
        opt('equiv', 'Equivalent', 'Gleichwertig', 'Equivalente'),
        opt('compare', 'Compare', 'Vergleichen', 'Comparar'),
        opt('order', 'Order', 'Ordnen', 'Ordenar'),
      ],
      ['equiv', 'equiv', 'compare', 'order', 'compare'],
    ), simple],
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
      select(
        [
          opt('add', 'Add', 'Addieren', 'Sumar'),
          opt('sub', 'Subtract', 'Subtrahieren', 'Restar'),
          opt('mixed', 'Mixed numbers', 'Gemischte Zahlen', 'Números mixtos'),
          opt('mulwhole', 'Times a whole', 'Mal eine ganze Zahl', 'Por un entero'),
        ],
        ['add', 'add', 'sub', 'mixed', 'mulwhole'],
      ),
      simple,
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
      select(
        [
          opt('write', 'Write the decimal', 'Dezimalzahl schreiben', 'Escribir el decimal'),
          opt('compare', 'Compare', 'Vergleichen', 'Comparar'),
          opt('shade', 'Shade', 'Färben', 'Sombrear'),
        ],
        ['write', 'write', 'compare', 'shade', 'compare'],
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
      select(
        [
          opt('metric', 'Metric', 'Metrisch', 'Métrico'),
          opt('time', 'Time', 'Zeit', 'Tiempo'),
          opt('custom', 'Customary', 'Angloamerikanisch', 'Sistema usual'),
        ],
        ['metric', 'metric', 'time', 'custom', 'metric'],
      ),
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
      select(
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
      select(
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
      select(
        [
          opt('symmetry', 'Lines of symmetry', 'Symmetrieachsen', 'Ejes de simetría'),
          opt('classify', 'Right angles', 'Rechte Winkel', 'Ángulos rectos'),
          opt('parallel', 'Parallel sides', 'Parallele Seiten', 'Lados paralelos'),
        ],
        ['symmetry', 'symmetry', 'classify', 'parallel', 'symmetry'],
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
      select(
        [opt('eval', 'Evaluate', 'Ausrechnen', 'Calcular'), opt('words', 'Match the words', 'Worte zuordnen', 'Emparejar palabras')],
        ['eval', 'eval', 'words', 'eval', 'words'],
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
    knobs: [select([opt('ask', 'Corresponding term', 'Zugehöriges Glied', 'Término correspondiente')], ['ask', 'ask', 'ask', 'ask', 'ask'])],
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
      select(
        [
          opt('compare', 'Compare', 'Vergleichen', 'Comparar'),
          opt('round', 'Round', 'Runden', 'Redondear'),
          opt('times', 'Powers of ten', 'Zehnerpotenzen', 'Potencias de diez'),
          opt('expand', 'Expanded form', 'Erweiterte Form', 'Forma desarrollada'),
        ],
        ['compare', 'round', 'times', 'expand', 'times'],
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
      select(
        [
          opt('mul', 'Multiply wholes', 'Ganze Zahlen mal', 'Multiplicar enteros'),
          opt('div', 'Divide wholes', 'Ganze Zahlen geteilt', 'Dividir enteros'),
          opt('adddec', 'Add decimals', 'Dezimalzahlen addieren', 'Sumar decimales'),
          opt('subdec', 'Subtract decimals', 'Dezimalzahlen subtrahieren', 'Restar decimales'),
          opt('muldec', 'Multiply decimals', 'Dezimalzahlen mal', 'Multiplicar decimales'),
          opt('divdec', 'Divide decimals', 'Dezimalzahlen geteilt', 'Dividir decimales'),
        ],
        ['adddec', 'mul', 'muldec', 'div', 'divdec'],
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
      select(
        [
          opt('add', 'Add', 'Addieren', 'Sumar'),
          opt('sub', 'Subtract', 'Subtrahieren', 'Restar'),
          opt('mixed', 'Mixed numbers', 'Gemischte Zahlen', 'Números mixtos'),
        ],
        ['add', 'add', 'sub', 'mixed', 'sub'],
      ),
      simple,
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
      select(
        [
          opt('mul', 'Multiply fractions', 'Brüche mal', 'Multiplicar fracciones'),
          opt('mulwhole', 'Fraction of a whole', 'Bruch von einer Ganzen', 'Fracción de un entero'),
          opt('divunit', 'Divide unit fractions', 'Stammbrüche teilen', 'Dividir fracciones unitarias'),
          opt('divwhole', 'Whole ÷ unit fraction', 'Ganze ÷ Stammbruch', 'Entero ÷ fracción unitaria'),
        ],
        ['mulwhole', 'mul', 'divunit', 'divwhole', 'mul'],
      ),
      simple,
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
      select(
        [opt('metric', 'Single unit', 'Eine Einheit', 'Una unidad'), opt('compound', 'Compound', 'Zusammengesetzt', 'Compuesta')],
        ['metric', 'metric', 'compound', 'metric', 'compound'],
      ),
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
      select(
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
      select(
        [
          opt('volume', 'Find volume', 'Volumen finden', 'Hallar el volumen'),
          opt('missing', 'Missing edge', 'Fehlende Kante', 'Arista faltante'),
          opt('layers', 'Count cubes', 'Würfel zählen', 'Contar cubos'),
        ],
        ['layers', 'volume', 'volume', 'missing', 'volume'],
      ),
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
      select(
        [
          opt('plot', 'Plot', 'Setzen', 'Marcar'),
          opt('read', 'Read', 'Ablesen', 'Leer'),
          opt('distance', 'Distance', 'Abstand', 'Distancia'),
        ],
        ['plot', 'plot', 'read', 'distance', 'plot'],
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
      select(
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
      select(
        [
          opt('build', 'Build a ratio', 'Verhältnis bauen', 'Armar una razón'),
          opt('missing', 'Missing term', 'Fehlendes Glied', 'Término faltante'),
          opt('unit', 'Unit rate', 'Einheitsrate', 'Tasa unitaria'),
          opt('percent', 'Percent of', 'Prozent von', 'Porcentaje de'),
        ],
        ['build', 'missing', 'unit', 'percent', 'missing'],
      ),
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
      select(
        [
          opt('frac', 'Fraction ÷ fraction', 'Bruch ÷ Bruch', 'Fracción ÷ fracción'),
          opt('whole', 'Whole ÷ fraction', 'Ganze ÷ Bruch', 'Entero ÷ fracción'),
          opt('word', 'Story', 'Geschichte', 'Historia'),
        ],
        ['whole', 'frac', 'frac', 'word', 'frac'],
      ),
      simple,
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
      select(
        [
          opt('gcf', 'GCF', 'ggT', 'MCD'),
          opt('lcm', 'LCM', 'kgV', 'mcm'),
          opt('mul', 'Multiply decimals', 'Dezimalzahlen mal', 'Multiplicar decimales'),
          opt('div', 'Divide decimals', 'Dezimalzahlen geteilt', 'Dividir decimales'),
        ],
        ['gcf', 'lcm', 'mul', 'div', 'gcf'],
      ),
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
      select(
        [
          opt('compare', 'Compare', 'Vergleichen', 'Comparar'),
          opt('order', 'Order', 'Ordnen', 'Ordenar'),
          opt('plot', 'Plot', 'Setzen', 'Marcar'),
          opt('abs', 'Absolute value', 'Betrag', 'Valor absoluto'),
        ],
        ['abs', 'compare', 'order', 'plot', 'plot'],
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
      select(
        [
          opt('eval', 'Evaluate', 'Einsetzen', 'Evaluar'),
          opt('write', 'Match words', 'Worte zuordnen', 'Emparejar palabras'),
          opt('dist', 'Which expansion', 'Welche Ausmultiplikation', 'Cuál desarrollo'),
        ],
        ['eval', 'eval', 'write', 'dist', 'eval'],
      ),
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
      select(
        [
          opt('one', 'One step', 'Ein Schritt', 'Un paso'),
          opt('two', 'Two steps', 'Zwei Schritte', 'Dos pasos'),
          opt('ineq', 'Inequality', 'Ungleichung', 'Desigualdad'),
        ],
        ['one', 'one', 'two', 'ineq', 'two'],
      ),
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
      select(
        [opt('y', 'Find y', 'y finden', 'Hallar y'), opt('pair', 'Which pair', 'Welches Paar', 'Cuál par')],
        ['y', 'y', 'pair', 'y', 'pair'],
      ),
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
      select(
        [
          opt('triangle', 'Triangle area', 'Dreiecksfläche', 'Área del triángulo'),
          opt('para', 'Parallelogram', 'Parallelogramm', 'Paralelogramo'),
          opt('volume', 'Volume', 'Volumen', 'Volumen'),
          opt('surface', 'Surface area', 'Oberfläche', 'Área de superficie'),
        ],
        ['triangle', 'para', 'volume', 'surface', 'triangle'],
      ),
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
      select(
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
      select(
        [
          opt('mean', 'Mean', 'Mittelwert', 'Media'),
          opt('median', 'Median', 'Median', 'Mediana'),
          opt('range', 'Range', 'Spannweite', 'Rango'),
        ],
        ['mean', 'median', 'range', 'mean', 'median'],
      ),
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
      select(
        [
          opt('proportion', 'Proportion', 'Proportion', 'Proporción'),
          opt('percent', 'Percent of', 'Prozent von', 'Porcentaje de'),
          opt('change', 'Percent change', 'Prozentuale Änderung', 'Cambio porcentual'),
          opt('tax', 'Tax or tip', 'Steuer oder Trinkgeld', 'Impuesto o propina'),
        ],
        ['proportion', 'percent', 'change', 'tax', 'percent'],
      ),
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
      select(
        [
          opt('add', 'Add', 'Addieren', 'Sumar'),
          opt('sub', 'Subtract', 'Subtrahieren', 'Restar'),
          opt('mul', 'Multiply', 'Multiplizieren', 'Multiplicar'),
          opt('div', 'Divide', 'Dividieren', 'Dividir'),
        ],
        ['add', 'sub', 'mul', 'div', 'mul'],
      ),
      select(
        [opt('int', 'Integers', 'Ganze Zahlen', 'Enteros'), opt('frac', 'Fractions', 'Brüche', 'Fracciones')],
        ['int', 'int', 'int', 'frac', 'frac'],
      ) && { ...select([opt('int', 'Integers', 'Ganze Zahlen', 'Enteros'), opt('frac', 'Fractions', 'Brüche', 'Fracciones')], ['int', 'int', 'int', 'frac', 'frac']), id: 'family' },
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
      select(
        [opt('expand', 'Expand', 'Ausmultiplizieren', 'Desarrollar'), opt('factor', 'Factor', 'Faktorisieren', 'Factorizar')],
        ['expand', 'expand', 'factor', 'expand', 'factor'],
      ),
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
      select(
        [
          opt('two', 'Two steps', 'Zwei Schritte', 'Dos pasos'),
          opt('dist', 'With parentheses', 'Mit Klammern', 'Con paréntesis'),
          opt('ineq', 'Inequality', 'Ungleichung', 'Desigualdad'),
        ],
        ['two', 'two', 'dist', 'ineq', 'dist'],
      ),
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
      select(
        [
          opt('scale', 'Scale up', 'Vergrößern', 'Ampliar'),
          opt('down', 'Scale down', 'Verkleinern', 'Reducir'),
          opt('area', 'Scale the area', 'Fläche skalieren', 'Escalar el área'),
        ],
        ['scale', 'scale', 'down', 'area', 'area'],
      ),
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
      select(
        [
          opt('circ', 'Circumference', 'Umfang', 'Circunferencia'),
          opt('area', 'Circle area', 'Kreisfläche', 'Área del círculo'),
          opt('complement', 'Complement or supplement', 'Komplement oder Supplement', 'Complemento o suplemento'),
          opt('triangle', 'Triangle angle', 'Dreieckswinkel', 'Ángulo del triángulo'),
          opt('surface', 'Surface area', 'Oberfläche', 'Área de superficie'),
        ],
        ['circ', 'area', 'complement', 'triangle', 'surface'],
      ),
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
    knobs: [select([opt('sample', 'Which sample', 'Welche Stichprobe', 'Cuál muestra')], ['sample', 'sample', 'sample', 'sample', 'sample'])],
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
    knobs: [select([opt('mean', 'Which mean is greater', 'Welcher Mittelwert ist größer', 'Cuál media es mayor')], ['mean', 'mean', 'mean', 'mean', 'mean'])],
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
      select(
        [
          opt('simple', 'Simple', 'Einfach', 'Simple'),
          opt('complement', 'Complement', 'Gegenereignis', 'Complemento'),
          opt('compound', 'Two events', 'Zwei Ereignisse', 'Dos eventos'),
        ],
        ['simple', 'simple', 'complement', 'compound', 'simple'],
      ),
      simple,
    ],
  }),
]

const broken = SKILLS.find((item) => item.knobs.some((knob) => knob.kind === 'select' && knob.id !== 'mode' && item.id === '7.ns.a'))
if (broken) {
  const family = broken.knobs[1]
  if (family && family.kind === 'select') family.id = 'family'
}

export function getSkill(id: string) {
  return SKILLS.find((item) => item.id === id)
}

export function defaultKnobs(item: Skill, difficulty: number): KnobValues {
  const index = Math.min(4, Math.max(0, Math.round(difficulty) - 1))
  const values: KnobValues = {}
  for (const knob of item.knobs) values[knob.id] = knob.byDifficulty[index]
  return values
}

export function skillsForGrade(grade: number) {
  return SKILLS.filter((item) => item.grade === grade)
}
