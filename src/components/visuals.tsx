import type { Locale, Question, ShapeKind, Stimulus } from '../lib/types'
import { tx } from '../lib/i18n'
import { Expr, MathText, Tx } from './MathText'

export function ShapeFig({ shape, parts, shaded, uneven }: { shape: ShapeKind; parts?: number; shaded?: number; uneven?: boolean }) {
  const cuts = parts ?? 0
  return (
    <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true">
      {shape === 'square' ? <rect x="32" y="18" width="56" height="56" fill="#f0d7a4" stroke="#1c1712" strokeWidth="3" /> : null}
      {shape === 'rectangle' ? <rect x="18" y="28" width="84" height="40" fill="#d7f3ef" stroke="#1c1712" strokeWidth="3" /> : null}
      {shape === 'triangle' || shape === 'scalene' ? <polygon points={shape === 'scalene' ? '18,74 96,74 70,16' : '60,14 104,76 16,76'} fill="#fde8e4" stroke="#1c1712" strokeWidth="3" /> : null}
      {shape === 'right-triangle' ? <polygon points="22,74 98,74 22,20" fill="#fde8e4" stroke="#1c1712" strokeWidth="3" /> : null}
      {shape === 'rhombus' ? <polygon points="60,12 100,46 60,80 20,46" fill="#fff1c4" stroke="#1c1712" strokeWidth="3" /> : null}
      {shape === 'parallelogram' ? <polygon points="28,70 92,70 108,22 44,22" fill="#e6e9f8" stroke="#1c1712" strokeWidth="3" /> : null}
      {shape === 'trapezoid' ? <polygon points="28,72 92,72 78,22 42,22" fill="#e7f0df" stroke="#1c1712" strokeWidth="3" /> : null}
      {shape === 'pentagon' ? <polygon points="60,12 102,40 86,78 34,78 18,40" fill="#f0d7a4" stroke="#1c1712" strokeWidth="3" /> : null}
      {shape === 'hexagon' ? <polygon points="38,18 82,18 104,46 82,74 38,74 16,46" fill="#d7f3ef" stroke="#1c1712" strokeWidth="3" /> : null}
      {cuts > 0 && shape === 'square'
        ? Array.from({ length: cuts }, (_, index) => {
            const w = uneven ? 56 * ((index + 1.4) / cuts) * 0.55 : 56 / cuts
            const x = 32 + (uneven ? index * (56 / cuts) * 0.85 : index * (56 / cuts))
            return <rect key={index} x={x} y="18" width={Math.max(6, w)} height="56" fill={index < (shaded ?? 0) ? '#e25b45' : 'transparent'} opacity="0.85" />
          })
        : null}
      {cuts > 0 && shape === 'rectangle'
        ? Array.from({ length: cuts }, (_, index) => (
            <rect key={index} x={18 + (index * 84) / cuts} y="28" width={84 / cuts} height="40" fill={index < (shaded ?? 0) ? '#e25b45' : 'transparent'} />
          ))
        : null}
    </svg>
  )
}

export function ClockFace({ h, m, interactive = false }: { h: number; m: number; interactive?: boolean }) {
  const minute = m * 6
  const hour = (h % 12) * 30 + m * 0.5
  return (
    <svg viewBox="0 0 200 200" width={interactive ? 220 : 180} aria-hidden="true">
      <circle cx="100" cy="100" r="86" fill="#fffaf3" stroke="#1c1712" strokeWidth="4" />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = ((index + 1) * 30 * Math.PI) / 180
        const x = 100 + Math.sin(angle) * 70
        const y = 100 - Math.cos(angle) * 70
        return (
          <text key={index} x={x} y={y + 4} textAnchor="middle" fontSize="13" fontFamily="Fraunces, serif">
            {index + 1}
          </text>
        )
      })}
      <line x1="100" y1="100" x2={100 + Math.sin((hour * Math.PI) / 180) * 46} y2={100 - Math.cos((hour * Math.PI) / 180) * 46} stroke="#1c1712" strokeWidth="6" strokeLinecap="round" />
      <line x1="100" y1="100" x2={100 + Math.sin((minute * Math.PI) / 180) * 68} y2={100 - Math.cos((minute * Math.PI) / 180) * 68} stroke="#e25b45" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="5" fill="#0f766e" />
    </svg>
  )
}

function ChartFig({ labels, values, colors, axisMax, locale }: Extract<Stimulus, { type: 'chart' }> & { locale: Locale }) {
  const height = 160
  return (
    <div className="chart-frame">
      <div className="y-axis" style={{ height }} aria-hidden="true">
        <span>{axisMax}</span>
        <span>{Math.round(axisMax / 2)}</span>
        <span>0</span>
      </div>
      <div className="chart" style={{ ['--chart-h' as string]: `${height}px` }}>
        {values.map((value, index) => (
          <div className="bar-col" key={index}>
            <div className="bar-hit">
              <div className="bar-fill" style={{ height: `${axisMax ? (value / axisMax) * 100 : 0}%`, background: colors[index] ?? '#0f766e' }} />
            </div>
            <small>{tx(locale, labels[index])}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StimulusView({ stimulus, locale }: { stimulus?: Stimulus; locale: Locale }) {
  if (!stimulus) return null
  if (stimulus.type === 'expression') return <div className="figure"><Expr parts={stimulus[locale]} /></div>
  if (stimulus.type === 'scene') {
    return (
      <div className="scene" data-tone={stimulus.tone}>
        <span>{stimulus.tone === 'bay' ? '∼' : stimulus.tone === 'sky' ? '↑' : stimulus.tone === 'kitchen' ? '⌘' : '•'}</span>
        <span className="fine">{stimulus.tone}</span>
      </div>
    )
  }
  if (stimulus.type === 'clock') return <div className="figure" style={{ textAlign: 'center' }}><ClockFace h={stimulus.h} m={stimulus.m} /></div>
  if (stimulus.type === 'chart') return <div className="figure"><ChartFig {...stimulus} locale={locale} /></div>
  if (stimulus.type === 'grid') {
    return (
      <div className="figure">
        <div className="grid-shade" style={{ gridTemplateColumns: `repeat(${stimulus.cols}, 1fr)` }}>
          {Array.from({ length: stimulus.rows * stimulus.cols }, (_, index) => (
            <div key={index} className={index < stimulus.shaded ? 'cell on' : 'cell'} />
          ))}
        </div>
      </div>
    )
  }
  if (stimulus.type === 'shape') return <div className="figure" style={{ textAlign: 'center' }}><ShapeFig shape={stimulus.shape} parts={stimulus.parts} shaded={stimulus.shadedParts} /></div>
  if (stimulus.type === 'rect') {
    return (
      <div className="figure" style={{ textAlign: 'center' }}>
        <svg viewBox="0 0 220 120" width="220">
          <rect x="30" y="20" width={Math.min(160, stimulus.w * 16)} height={Math.min(80, stimulus.h * 14)} fill="#d7f3ef" stroke="#1c1712" strokeWidth="3" />
          <text x="40" y="16" fontSize="12">{stimulus.w}</text>
          <text x="8" y="50" fontSize="12">{stimulus.h}</text>
        </svg>
      </div>
    )
  }
  if (stimulus.type === 'triangle') {
    return (
      <div className="figure" style={{ textAlign: 'center' }}>
        <svg viewBox="0 0 220 120" width="220">
          <polygon points="30,100 190,100 110,24" fill="#fde8e4" stroke="#1c1712" strokeWidth="3" />
          <text x="96" y="116" fontSize="12">{stimulus.b}</text>
          <text x="118" y="64" fontSize="12">{stimulus.h}</text>
        </svg>
      </div>
    )
  }
  if (stimulus.type === 'prism') {
    return (
      <div className="figure" style={{ textAlign: 'center' }}>
        <svg viewBox="0 0 220 140" width="220">
          <polygon points="40,70 120,40 180,70 100,100" fill="#e6e9f8" stroke="#1c1712" strokeWidth="3" />
          <polygon points="40,70 100,100 100,130 40,100" fill="#d7f3ef" stroke="#1c1712" strokeWidth="3" />
          <polygon points="100,100 180,70 180,100 100,130" fill="#f0d7a4" stroke="#1c1712" strokeWidth="3" />
          <text x="70" y="78" fontSize="12">{stimulus.l}×{stimulus.w}×{stimulus.h}</text>
        </svg>
      </div>
    )
  }
  if (stimulus.type === 'circle') {
    return (
      <div className="figure" style={{ textAlign: 'center' }}>
        <svg viewBox="0 0 180 140" width="180">
          <circle cx="90" cy="74" r="48" fill="none" stroke="#1c1712" strokeWidth="3" />
          <line x1="90" y1="74" x2="138" y2="74" stroke="#e25b45" strokeWidth="3" />
          <text x="100" y="68" fontSize="13">r={stimulus.r}</text>
        </svg>
      </div>
    )
  }
  if (stimulus.type === 'angle' || stimulus.type === 'protractor') {
    const deg = stimulus.degrees
    const rad = (deg * Math.PI) / 180
    return (
      <div className="figure" style={{ textAlign: 'center' }}>
        <svg viewBox="0 0 240 140" width="240">
          {stimulus.type === 'protractor' ? <path d="M30 110 A90 90 0 0 1 210 110" fill="none" stroke="#cbbba8" strokeWidth="18" /> : null}
          <line x1="30" y1="110" x2="210" y2="110" stroke="#1c1712" strokeWidth="3" />
          <line x1="30" y1="110" x2={30 + Math.cos(rad) * 120} y2={110 - Math.sin(rad) * 120} stroke="#e25b45" strokeWidth="3" />
          {stimulus.type === 'protractor'
            ? [0, 30, 60, 90, 120, 150, 180].map((mark) => {
                const a = (mark * Math.PI) / 180
                return <text key={mark} x={30 + Math.cos(a) * 78} y={110 - Math.sin(a) * 78} fontSize="10">{mark}</text>
              })
            : null}
        </svg>
      </div>
    )
  }
  if (stimulus.type === 'dots') {
    return (
      <div className="figure">
        <div className="chart" style={{ alignItems: 'end', height: 140 }}>
          {stimulus.counts.map((count, index) => (
            <div key={index} className="bar-col">
              <div>{Array.from({ length: count }, (_, dot) => <div key={dot} className="cell on" style={{ width: 16, height: 16, margin: 2 }} />)}</div>
              <small>{stimulus.labels[index]}</small>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (stimulus.type === 'coord') {
    return <CoordFig {...stimulus} />
  }
  if (stimulus.type === 'balance') {
    return (
      <div className="figure" style={{ textAlign: 'center' }}>
        <div className="expr"><Tx locale={locale} value={stimulus.left} /> <span>=</span> <Tx locale={locale} value={stimulus.right} /></div>
      </div>
    )
  }
  if (stimulus.type === 'numberline') {
    return (
      <div className="figure">
        <svg viewBox="0 0 320 70" width="100%">
          <line x1="20" y1="36" x2="300" y2="36" stroke="#1c1712" strokeWidth="3" />
          {stimulus.marks.map((mark) => {
            const x = 20 + ((mark.at - stimulus.min) / (stimulus.max - stimulus.min)) * 280
            return <g key={mark.label}><line x1={x} y1="28" x2={x} y2="44" stroke="#1c1712" /><text x={x} y="60" textAnchor="middle" fontSize="11">{mark.label}</text></g>
          })}
        </svg>
      </div>
    )
  }
  if (stimulus.type === 'pair-lists') {
    return (
      <div className="figure">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div><b><Tx locale={locale} value={stimulus.aTitle} /></b><div>{stimulus.a.join(', ')}</div></div>
          <div><b><Tx locale={locale} value={stimulus.bTitle} /></b><div>{stimulus.b.join(', ')}</div></div>
        </div>
      </div>
    )
  }
  if (stimulus.type === 'marbles' || stimulus.type === 'spinner') return null
  return null
}

function CoordFig({ xMin, xMax, yMin, yMax, points }: Extract<Stimulus, { type: 'coord' }>) {
  const w = 240
  const h = 240
  const sx = (x: number) => 24 + ((x - xMin) / (xMax - xMin)) * (w - 48)
  const sy = (y: number) => h - 24 - ((y - yMin) / (yMax - yMin)) * (h - 48)
  const lines = []
  for (let x = xMin; x <= xMax; x++) lines.push(<line key={`x${x}`} x1={sx(x)} y1={20} x2={sx(x)} y2={h - 20} stroke="#eadfce" />)
  for (let y = yMin; y <= yMax; y++) lines.push(<line key={`y${y}`} x1={20} y1={sy(y)} x2={w - 20} y2={sy(y)} stroke="#eadfce" />)
  const labels = []
  const step = Math.max(xMax - xMin, yMax - yMin) > 12 ? 2 : 1
  for (let x = xMin; x <= xMax; x += step) labels.push(<text key={`lx${x}`} x={sx(x)} y={Math.min(h - 3, sy(0) + 13)} textAnchor="middle" fontSize="10" fill="#1c1712">{x}</text>)
  for (let y = yMin; y <= yMax; y += step) {
    if (y === 0) continue
    labels.push(<text key={`ly${y}`} x={Math.max(9, sx(0) - 6)} y={sy(y) + 3} textAnchor="end" fontSize="10" fill="#1c1712">{y}</text>)
  }
  return (
    <div className="figure" style={{ textAlign: 'center' }}>
      <svg className="plane" viewBox={`0 0 ${w} ${h}`}>
        {lines}
        <line x1={sx(0)} y1="16" x2={sx(0)} y2={h - 16} stroke="#1c1712" strokeWidth="2" />
        <line x1="16" y1={sy(0)} x2={w - 16} y2={sy(0)} stroke="#1c1712" strokeWidth="2" />
        {labels}
        {points.map((point, index) => <circle key={index} cx={sx(point.x)} cy={sy(point.y)} r="6" fill="#e25b45" />)}
      </svg>
    </div>
  )
}

export function AnswerFace({ question, answer, locale, blank }: { question: Question; answer: Question['answer'] | null; locale: Locale; blank: string }) {
  if (!answer) return <div className="entry">{blank}</div>
  if (answer.kind === 'number') return <div className="entry">{answer.value}</div>
  if (answer.kind === 'fraction') {
    return (
      <div className="entry fraction-entry">
        {answer.whole ? <b>{answer.whole}</b> : null}
        <span className="frac"><b>{answer.n}</b><i>{answer.d}</i></span>
      </div>
    )
  }
  if (answer.kind === 'choice' && question.response.type === 'choice') {
    const option = question.response.options.find((item) => item.id === answer.id)
    return <div className="entry" style={{ fontSize: '1.1rem' }}>{option ? <MathText text={tx(locale, option.label)} /> : answer.id}</div>
  }
  if (answer.kind === 'compare') return <div className="entry">{answer.sign}</div>
  if (answer.kind === 'order' && question.response.type === 'order') {
    return (
      <div className="stack">
        {answer.ids.map((id) => {
          const item = question.response.type === 'order' ? question.response.items.find((entry) => entry.id === id) : undefined
          return <div key={id} className="order-item"><MathText text={item ? tx(locale, item.label) : id} /></div>
        })}
      </div>
    )
  }
  if (answer.kind === 'points') return <div className="entry">{answer.points.map((point) => `(${point.x}, ${point.y})`).join(' ')}</div>
  if (answer.kind === 'shade' && question.response.type === 'shade') {
    const total = question.response.rows * question.response.cols
    return (
      <div className="grid-shade" style={{ gridTemplateColumns: `repeat(${question.response.cols}, 1fr)` }}>
        {Array.from({ length: total }, (_, index) => <div key={index} className={index < answer.count ? 'cell on' : 'cell'} />)}
      </div>
    )
  }
  if (answer.kind === 'clock') return <ClockFace h={answer.h} m={answer.m} />
  if (answer.kind === 'chart') {
    const labels = question.response.type === 'chart-build' ? question.response.labels : []
    const axis = Math.max(answer.axisMax, ...answer.values, 1)
    return <ChartFig type="chart" labels={labels} values={answer.values} colors={answer.colors?.map((color) => color || '#0f766e') ?? []} axisMax={axis} unit={{ en: '', de: '', es: '' }} locale={locale} />
  }
  if (answer.kind === 'angle') return <StimulusView locale={locale} stimulus={{ type: 'angle', degrees: answer.degrees }} />
  if (answer.kind === 'ratio') return <div className="entry">{answer.a} : {answer.b}</div>
  if (answer.kind === 'digits') return <div className="entry">{answer.digits.join(' ')}</div>
  if (answer.kind === 'multi') {
    return (
      <div className="entry" style={{ fontSize: '1.4rem', gap: 12 }}>
        {Object.entries(answer.parts).map(([key, value]) => <span key={key}>{key}={value}</span>)}
      </div>
    )
  }
  return null
}
