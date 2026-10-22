import type { ReactElement, ReactNode } from 'react'
import { SKILLS } from '../data/skills'

// Numerals and math marks only, so the same picture reads in every language.
const pen = {
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Art({ children }: { children: ReactNode }) {
  return (
    <svg className="skill-art" viewBox="0 0 200 84" preserveAspectRatio="xMidYMid meet">
      {children}
    </svg>
  )
}

function T({
  x,
  y,
  children,
  size = 15,
  fill = 'currentColor',
  anchor = 'middle',
  weight,
}: {
  x: number | string
  y: number | string
  children: ReactNode
  size?: number | string
  fill?: string
  anchor?: 'middle' | 'start' | 'end'
  weight?: number
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fontSize={size} fill={fill} fontWeight={weight}>
      {children}
    </text>
  )
}

function Arrow({ x1, y1, x2, y2, color = 'currentColor' }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const len = 7
  const wing = 0.45
  const lx = x2 - Math.cos(ang - wing) * len
  const ly = y2 - Math.sin(ang - wing) * len
  const rx = x2 - Math.cos(ang + wing) * len
  const ry = y2 - Math.sin(ang + wing) * len
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeLinecap="round" />
      <polyline points={`${lx},${ly} ${x2},${y2} ${rx},${ry}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

function ArcArrow({ x1, y1, cx, cy, x2, y2, color = 'var(--coral)' }: { x1: number; y1: number; cx: number; cy: number; x2: number; y2: number; color?: string }) {
  const ang = Math.atan2(y2 - cy, x2 - cx)
  const len = 8
  const wing = 0.45
  const lx = x2 - Math.cos(ang - wing) * len
  const ly = y2 - Math.sin(ang - wing) * len
  const rx = x2 - Math.cos(ang + wing) * len
  const ry = y2 - Math.sin(ang + wing) * len
  return (
    <g>
      <path d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <polyline points={`${lx},${ly} ${x2},${y2} ${rx},${ry}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

function Frac({ x, y, n, d, size = 13 }: { x: number; y: number; n: string; d: string; size?: number }) {
  const w = Math.max(n.length, d.length) * size * 0.62 + 4
  return (
    <g>
      <T x={x} y={y - size * 0.62} size={size}>{n}</T>
      <line x1={x - w / 2} y1={y} x2={x + w / 2} y2={y} stroke="currentColor" strokeWidth="1.5" />
      <T x={x} y={y + size * 0.62} size={size}>{d}</T>
    </g>
  )
}

function SplitBar({ x, y, w, h, parts, shaded, fill = 'var(--coral)' }: { x: number; y: number; w: number; h: number; parts: number; shaded: number; fill?: string }) {
  const pw = w / parts
  return (
    <g>
      {Array.from({ length: parts }, (_, index) => (
        <rect key={index} x={x + index * pw} y={y} width={pw} height={h} fill={index < shaded ? fill : 'var(--paper)'} />
      ))}
      <rect x={x} y={y} width={w} height={h} fill="none" {...pen} />
      {Array.from({ length: parts - 1 }, (_, index) => (
        <line key={index} x1={x + (index + 1) * pw} y1={y} x2={x + (index + 1) * pw} y2={y + h} stroke="currentColor" strokeWidth="1.6" />
      ))}
    </g>
  )
}

function Dots({ x, y, cols, rows, gap = 12, r = 4.5, fill = 'var(--coral)' }: { x: number; y: number; cols: number; rows: number; gap?: number; r?: number; fill?: string }) {
  return (
    <g>
      {Array.from({ length: rows * cols }, (_, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        return <circle key={index} cx={x + col * gap} cy={y + row * gap} r={r} fill={fill} />
      })}
    </g>
  )
}

function GridRect({ x, y, cols, rows, cell, fill = 'var(--teal-soft)' }: { x: number; y: number; cols: number; rows: number; cell: number; fill?: string }) {
  return (
    <g>
      {Array.from({ length: rows * cols }, (_, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        return <rect key={index} x={x + col * cell} y={y + row * cell} width={cell} height={cell} fill={fill} stroke="currentColor" strokeWidth="1.5" />
      })}
    </g>
  )
}

function Axes({ x0, y0, u, n }: { x0: number; y0: number; u: number; n: number }) {
  return (
    <g>
      <g opacity="0.28">
        {Array.from({ length: n + 1 }, (_, i) => (
          <g key={i}>
            <line x1={x0 + i * u} y1={y0} x2={x0 + i * u} y2={y0 - n * u} stroke="currentColor" />
            <line x1={x0} y1={y0 - i * u} x2={x0 + n * u} y2={y0 - i * u} stroke="currentColor" />
          </g>
        ))}
      </g>
      <line x1={x0 - 2} y1={y0} x2={x0 + n * u + 8} y2={y0} stroke="currentColor" strokeWidth="2" />
      <line x1={x0} y1={y0 + 2} x2={x0} y2={y0 - n * u - 8} stroke="currentColor" strokeWidth="2" />
    </g>
  )
}

function wedge(cx: number, cy: number, r: number, a0: number, a1: number) {
  const at = (angle: number) => [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]
  const [x0, y0] = at(a0)
  const [x1, y1] = at(a1)
  const large = a1 - a0 > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const angle = (deg * Math.PI) / 180
  return [cx + Math.cos(angle) * r, cy - Math.sin(angle) * r] as const
}

function Groups() {
  return (
    <Art>
      {[8, 70, 132].map((x) => (
        <g key={x}>
          <rect x={x} y={14} width={58} height={56} rx={14} fill="var(--gold-soft)" {...pen} />
          <Dots x={x + 16} y={28} cols={2} rows={2} gap={22} r={6} />
        </g>
      ))}
    </Art>
  )
}

function TurnAround() {
  return (
    <Art>
      <Dots x={16} y={22} cols={4} rows={3} gap={11} />
      <Arrow x1={78} y1={28} x2={128} y2={28} color="var(--teal)" />
      <Arrow x1={128} y1={46} x2={78} y2={46} color="var(--teal)" />
      <Dots x={152} y={16} cols={3} rows={4} gap={11} />
      <T x={32} y={70} size={13}>3×4</T>
      <T x={163} y={70} size={13}>4×3</T>
    </Art>
  )
}

function Keypad() {
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3']
  return (
    <Art>
      {keys.map((key, index) => {
        const col = index % 3
        const row = Math.floor(index / 3)
        const x = 8 + col * 28
        const y = 8 + row * 24
        const hot = key === '8' || key === '7'
        return (
          <g key={key}>
            <rect x={x} y={y} width={24} height={20} rx={6} fill={hot ? 'var(--gold-soft)' : 'var(--paper)'} stroke={hot ? 'var(--coral)' : 'currentColor'} strokeWidth="1.7" />
            <T x={x + 12} y={y + 10} size={13}>{key}</T>
          </g>
        )
      })}
      <rect x={100} y={16} width={90} height={52} rx={12} fill="var(--paper)" {...pen} />
      <T x={145} y={34} size={16}>8 × 7</T>
      <T x={145} y={54} size={20} fill="var(--teal)" weight={680}>56</T>
    </Art>
  )
}

function TwoSteps() {
  const chips = [
    { x: 8, w: 36, n: '6' },
    { x: 78, w: 36, n: '9' },
    { x: 148, w: 46, n: '18' },
  ]
  return (
    <Art>
      <T x={58} y={16} size={13} fill="var(--coral)">+3</T>
      <T x={128} y={16} size={13} fill="var(--coral)">×2</T>
      <Arrow x1={46} y1={46} x2={74} y2={46} color="var(--coral)" />
      <Arrow x1={116} y1={46} x2={144} y2={46} color="var(--coral)" />
      {chips.map((chip) => (
        <g key={chip.n}>
          <rect x={chip.x} y={28} width={chip.w} height={36} rx={10} fill="var(--paper)" {...pen} />
          <T x={chip.x + chip.w / 2} y={46} size={20}>{chip.n}</T>
        </g>
      ))}
    </Art>
  )
}

function Places() {
  const cols = [
    { h: '100', d: '2' },
    { h: '10', d: '4' },
    { h: '1', d: '3' },
  ]
  return (
    <Art>
      {cols.map((col, index) => {
        const x = 16 + index * 60
        return (
          <g key={col.h}>
            <T x={x + 24} y={12} size={13} fill="var(--ink-soft)">{col.h}</T>
            <rect x={x} y={24} width={48} height={42} rx={10} fill="var(--paper)" {...pen} />
            <T x={x + 24} y={45} size={24}>{col.d}</T>
          </g>
        )
      })}
    </Art>
  )
}

function FractionNumber() {
  return (
    <Art>
      <SplitBar x={24} y={10} w={152} h={16} parts={4} shaded={3} />
      <line x1={24} y1={50} x2={176} y2={50} stroke="currentColor" strokeWidth="2" />
      {[0, 0.25, 0.5, 0.75, 1].map((mark) => {
        const x = 24 + mark * 152
        return <line key={mark} x1={x} y1={44} x2={x} y2={56} stroke="currentColor" strokeWidth="2" />
      })}
      <circle cx={24 + 0.75 * 152} cy={50} r={5} fill="var(--coral)" />
      <T x={24} y={70} size={13}>0</T>
      <T x={176} y={70} size={13}>1</T>
    </Art>
  )
}

function Measures() {
  const cx = 32
  const cy = 42
  const r = 26
  return (
    <Art>
      <circle cx={cx} cy={cy} r={r} fill="var(--paper)" {...pen} />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index * Math.PI) / 6
        const inner = index % 3 === 0 ? r - 7 : r - 4
        return (
          <line
            key={index}
            x1={cx + Math.sin(angle) * inner}
            y1={cy - Math.cos(angle) * inner}
            x2={cx + Math.sin(angle) * (r - 2)}
            y2={cy - Math.cos(angle) * (r - 2)}
            stroke="currentColor"
            strokeWidth={index % 3 === 0 ? 2 : 1.2}
          />
        )
      })}
      <line x1={cx} y1={cy} x2={cx + Math.sin((305 * Math.PI) / 180) * 13} y2={cy - Math.cos((305 * Math.PI) / 180) * 13} stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + Math.sin((60 * Math.PI) / 180) * 18} y2={cy - Math.cos((60 * Math.PI) / 180) * 18} stroke="var(--coral)" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="2.5" fill="var(--teal)" />
      <polygon points="96,26 118,26 126,62 88,62" fill="var(--indigo-soft)" {...pen} />
      <rect x="100" y="14" width="14" height="14" rx="3" fill="var(--indigo-soft)" {...pen} />
      <path d="M150 20 H180 L176 64 H154 Z" fill="var(--teal-soft)" {...pen} />
      <ellipse cx="165" cy="20" rx="15" ry="4.5" fill="var(--paper)" {...pen} />
      <path d="M153 42 H177 L175 64 H155 Z" fill="var(--teal)" opacity="0.45" />
    </Art>
  )
}

function Bars() {
  const bars = [
    { h: 26, fill: 'var(--coral)' },
    { h: 48, fill: 'var(--teal)' },
    { h: 34, fill: 'var(--gold)' },
    { h: 18, fill: 'var(--indigo)' },
  ]
  return (
    <Art>
      <line x1="28" y1="14" x2="28" y2="66" stroke="currentColor" strokeWidth="2" />
      <line x1="28" y1="66" x2="186" y2="66" stroke="currentColor" strokeWidth="2" />
      {bars.map((bar, index) => (
        <rect key={index} x={42 + index * 36} y={66 - bar.h} width="22" height={bar.h} rx="5" fill={bar.fill} />
      ))}
    </Art>
  )
}

function AreaTiles() {
  return (
    <Art>
      <GridRect x={62} y={8} cols={4} rows={3} cell={16} />
      <T x={46} y={32} size={14}>3</T>
      <T x={94} y={70} size={14}>4</T>
    </Art>
  )
}

function Perimeter() {
  return (
    <Art>
      <rect x="52" y="16" width="96" height="46" rx="3" fill="none" {...pen} stroke="var(--coral)" strokeWidth="3" />
      <polyline points="78,16 88,11 88,21" fill="none" stroke="var(--coral)" strokeWidth="2" strokeLinejoin="round" />
      <polyline points="148,32 153,42 143,42" fill="none" stroke="var(--coral)" strokeWidth="2" strokeLinejoin="round" />
      <polyline points="120,62 110,57 110,67" fill="none" stroke="var(--coral)" strokeWidth="2" strokeLinejoin="round" />
      <polyline points="52,46 47,36 57,36" fill="none" stroke="var(--coral)" strokeWidth="2" strokeLinejoin="round" />
      <T x="100" y="10" size="13">8</T>
      <T x="168" y="40" size="13">5</T>
    </Art>
  )
}

function Shapes() {
  const hex = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 180) * (-90 + index * 60)
    return `${148 + Math.cos(angle) * 28},${42 + Math.sin(angle) * 28}`
  }).join(' ')
  return (
    <Art>
      <rect x="18" y="16" width="52" height="52" fill="var(--paper)" {...pen} />
      <rect x="18" y="16" width="26" height="26" fill="var(--coral)" />
      <rect x="18" y="16" width="52" height="52" fill="none" {...pen} />
      <line x1="44" y1="16" x2="44" y2="68" stroke="currentColor" strokeWidth="2" />
      <line x1="18" y1="42" x2="70" y2="42" stroke="currentColor" strokeWidth="2" />
      <polygon points={hex} fill="var(--teal-soft)" {...pen} />
    </Art>
  )
}

function Remainder() {
  return (
    <Art>
      {[6, 52, 98].map((x) => (
        <g key={x}>
          <rect x={x} y={16} width={42} height={50} rx={12} fill="var(--gold-soft)" {...pen} />
          <Dots x={x + 11} y={28} cols={2} rows={2} gap={16} r={4.5} />
        </g>
      ))}
      <circle cx="172" cy="42" r="16" fill="var(--paper)" stroke="var(--gold)" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="172" cy="42" r="5" fill="var(--coral)" />
    </Art>
  )
}

function FactorRainbow() {
  const labels = [
    { t: '1', x: 16 },
    { t: '2', x: 44 },
    { t: '3', x: 72 },
    { t: '4', x: 104 },
    { t: '6', x: 142 },
    { t: '12', x: 184 },
  ]
  const arcs = [
    { a: 16, b: 184, peak: 16, color: 'var(--coral)' },
    { a: 44, b: 142, peak: 32, color: 'var(--teal)' },
    { a: 72, b: 104, peak: 46, color: 'var(--indigo)' },
  ]
  return (
    <Art>
      {arcs.map((arc) => {
        const y = 58
        const control = 2 * arc.peak - y
        return <path key={arc.a} d={`M ${arc.a} ${y} Q ${(arc.a + arc.b) / 2} ${control} ${arc.b} ${y}`} fill="none" stroke={arc.color} strokeWidth="2.4" strokeLinecap="round" />
      })}
      {labels.map((label) => (
        <T key={label.t + label.x} x={label.x} y={74} size={14}>{label.t}</T>
      ))}
    </Art>
  )
}

function PatternRule() {
  const terms = [6, 10, 14, 18]
  return (
    <Art>
      <rect x="76" y="6" width="48" height="22" rx="11" fill="var(--teal-soft)" {...pen} stroke="var(--teal)" />
      <T x="100" y="17" size="14" fill="var(--teal-deep)">+4</T>
      {terms.map((term, index) => {
        const x = 18 + index * 48
        return (
          <g key={term}>
            {index > 0 ? <Arrow x1={x - 16} y1={54} x2={x - 4} y2={54} color="var(--teal)" /> : null}
            <T x={x} y={54} size={20}>{term}</T>
          </g>
        )
      })}
    </Art>
  )
}

function DigitValue() {
  const digits = ['3', '5', '4', '8', '2']
  return (
    <Art>
      {digits.map((digit, index) => {
        const x = 8 + index * 38
        const hot = index === 1
        return (
          <g key={digit + index}>
            <rect x={x} y={8} width={32} height={40} rx={8} fill={hot ? 'var(--gold-soft)' : 'var(--paper)'} stroke={hot ? 'var(--coral)' : 'currentColor'} strokeWidth={hot ? 2.4 : 1.7} />
            <T x={x + 16} y={28} size={20} fill={hot ? 'var(--coral)' : 'currentColor'}>{digit}</T>
          </g>
        )
      })}
      <T x={65} y={66} size={15} fill="var(--coral)" weight={680}>5,000</T>
    </Art>
  )
}

function WholeAlgorithm() {
  const col = [108, 132, 156]
  return (
    <Art>
      <T x={84} y={48} size={20}>×</T>
      <T x={col[0]} y={26} size={20}>4</T>
      <T x={col[1]} y={26} size={20}>8</T>
      <T x={col[2]} y={26} size={20}>6</T>
      <T x={col[1]} y={48} size={20}>2</T>
      <T x={col[2]} y={48} size={20}>3</T>
      <line x1="96" y1="62" x2="170" y2="62" stroke="currentColor" strokeWidth="2" />
    </Art>
  )
}

function EquivalentFractions() {
  return (
    <Art>
      <T x={18} y={40} size={22}>=</T>
      <SplitBar x={36} y={14} w={148} h={18} parts={2} shaded={1} />
      <SplitBar x={36} y={50} w={148} h={18} parts={4} shaded={2} />
    </Art>
  )
}

function AddFractions() {
  return (
    <Art>
      <SplitBar x={8} y={32} w={48} h={20} parts={4} shaded={1} />
      <T x={66} y={42} size={18}>+</T>
      <SplitBar x={76} y={32} w={48} h={20} parts={4} shaded={2} />
      <T x={134} y={42} size={18}>=</T>
      <SplitBar x={144} y={32} w={48} h={20} parts={4} shaded={3} />
    </Art>
  )
}

function DecimalGrid() {
  const cell = 6
  const origin = 12
  return (
    <Art>
      {Array.from({ length: 100 }, (_, index) => {
        const col = index % 10
        const row = Math.floor(index / 10)
        return <rect key={index} x={origin + col * cell} y={origin + row * cell} width={cell - 1} height={cell - 1} rx="1" fill={index < 34 ? 'var(--coral)' : 'var(--paper)'} />
      })}
      <rect x={origin - 1} y={origin - 1} width={60} height={60} fill="none" {...pen} />
      <T x={138} y={42} size={26} weight={680}>0.34</T>
    </Art>
  )
}

function ConvertUnits() {
  return (
    <Art>
      <T x="78" y="14" size="14">1 m</T>
      <rect x="16" y="26" width="124" height="26" rx="4" fill="var(--gold-soft)" {...pen} />
      {Array.from({ length: 13 }, (_, index) => (
        <line key={index} x1={24 + index * 9} y1="26" x2={24 + index * 9} y2={index % 4 === 0 ? 40 : 34} stroke="currentColor" strokeWidth="1.4" />
      ))}
      <T x="78" y="68" size="16" fill="var(--teal)" weight={680}>100 cm</T>
    </Art>
  )
}

function LinePlot() {
  const counts = [2, 4, 1, 3, 2]
  const xs = [24, 60, 96, 132, 168]
  return (
    <Art>
      <line x1="12" y1="58" x2="188" y2="58" stroke="currentColor" strokeWidth="2" />
      {counts.map((count, index) => (
        <g key={xs[index]}>
          <line x1={xs[index]} y1="52" x2={xs[index]} y2="64" stroke="currentColor" strokeWidth="2" />
          {Array.from({ length: count }, (_, mark) => (
            <T key={mark} x={xs[index]} y={46 - mark * 12} size={13} fill="var(--coral)">×</T>
          ))}
          <T x={xs[index]} y={74} size={12}>{index + 1}</T>
        </g>
      ))}
    </Art>
  )
}

function Protractor() {
  const cx = 100
  const cy = 68
  const radius = 50
  const [x0, y0] = polar(cx, cy, 44, 0)
  const [x1, y1] = polar(cx, cy, 44, 60)
  return (
    <Art>
      <path d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`} fill="var(--gold-soft)" {...pen} />
      <line x1={cx - radius} y1={cy} x2={cx + radius} y2={cy} stroke="currentColor" strokeWidth="2" />
      <path d={`M ${cx} ${cy} L ${x0} ${y0} A 44 44 0 0 0 ${x1} ${y1} Z`} fill="var(--coral)" opacity="0.85" />
      {Array.from({ length: 13 }, (_, index) => {
        const deg = index * 15
        const outer = polar(cx, cy, radius - 1, deg)
        const inner = polar(cx, cy, deg % 30 === 0 ? radius - 8 : radius - 5, deg)
        return <line key={deg} x1={inner[0]} y1={inner[1]} x2={outer[0]} y2={outer[1]} stroke="currentColor" strokeWidth="1.3" />
      })}
      <T x={cx + 30} y={cy - 8} size={11}>0</T>
      <T x={cx} y={cy - 30} size={11}>90</T>
      <T x={cx - 30} y={cy - 8} size={11}>180</T>
    </Art>
  )
}

function Symmetry() {
  return (
    <Art>
      <polygon points="100,8 36,42 100,76" fill="var(--coral)" opacity="0.8" {...pen} />
      <polygon points="100,8 164,42 100,76" fill="var(--teal)" opacity="0.75" {...pen} />
      <line x1="100" y1="10" x2="100" y2="74" stroke="var(--paper)" strokeWidth="2" strokeDasharray="4 3" />
    </Art>
  )
}

function Grouping() {
  return (
    <Art>
      <T x={22} y={34} size={28} fill="var(--coral)">(</T>
      <T x={62} y={34} size={24}>2 + 5</T>
      <T x={104} y={34} size={28} fill="var(--coral)">)</T>
      <T x={148} y={34} size={24}>× 3</T>
      <path d="M 40 50 Q 62 70 84 50" fill="none" stroke="var(--teal)" strokeWidth="2" />
      <line x1="62" y1="66" x2="62" y2="74" stroke="var(--teal)" strokeWidth="2" />
    </Art>
  )
}

function PartnerPatterns() {
  const xs = [70, 108, 146, 184]
  const top = [2, 4, 6, 8]
  const bottom = [6, 12, 18, 24]
  return (
    <Art>
      <T x={24} y={42} size={18} fill="var(--teal)">×3</T>
      <rect x="90" y="8" width="36" height="68" rx="8" fill="var(--gold-soft)" />
      {xs.map((x, index) => (
        <g key={x}>
          <T x={x} y={26} size={18}>{top[index]}</T>
          <T x={x} y={60} size={18}>{bottom[index]}</T>
        </g>
      ))}
    </Art>
  )
}

function DecimalPlaces() {
  const boxes = [
    { x: 12, d: '3', sub: '1', hot: false },
    { x: 86, d: '4', sub: '0.1', hot: true },
    { x: 142, d: '2', sub: '0.01', hot: false },
  ]
  return (
    <Art>
      <circle cx="70" cy="30" r="4" fill="var(--gold)" />
      {boxes.map((box) => (
        <g key={box.sub}>
          <rect x={box.x} y={10} width={46} height={40} rx={10} fill={box.hot ? 'var(--gold-soft)' : 'var(--paper)'} stroke={box.hot ? 'var(--coral)' : 'currentColor'} strokeWidth={box.hot ? 2.4 : 2} />
          <T x={box.x + 23} y={30} size={22} fill={box.hot ? 'var(--coral)' : 'currentColor'}>{box.d}</T>
          <T x={box.x + 23} y={66} size={13} fill="var(--ink-soft)">{box.sub}</T>
        </g>
      ))}
    </Art>
  )
}

function DecimalAlgorithm() {
  return (
    <Art>
      <T x={78} y={48} size={20}>×</T>
      <T x={112} y={26} size={20}>2</T>
      <T x={128} y={26} size={20} fill="var(--gold)">.</T>
      <T x={146} y={26} size={20}>4</T>
      <T x={112} y={48} size={20}>1</T>
      <T x={128} y={48} size={20} fill="var(--gold)">.</T>
      <T x={146} y={48} size={20}>5</T>
      <line x1="96" y1="62" x2="162" y2="62" stroke="currentColor" strokeWidth="2" />
    </Art>
  )
}

function Unlike() {
  return (
    <Art>
      <SplitBar x={28} y={6} w={120} h={16} parts={2} shaded={1} />
      <T x={14} y={36} size={16}>+</T>
      <SplitBar x={28} y={28} w={120} h={16} parts={3} shaded={1} fill="var(--teal)" />
      <T x={14} y={64} size={16}>=</T>
      <SplitBar x={28} y={56} w={120} h={16} parts={6} shaded={5} fill="var(--indigo)" />
    </Art>
  )
}

function FractionProduct() {
  const x = 58
  const y = 8
  const w = 84
  const h = 56
  return (
    <Art>
      <Frac x={28} y={36} n="3" d="4" size={12} />
      {Array.from({ length: 12 }, (_, index) => {
        const col = index % 3
        const row = Math.floor(index / 3)
        const across = col < 2
        const down = row < 3
        const fill = across && down ? 'var(--coral)' : across ? 'var(--teal-soft)' : down ? 'var(--gold-soft)' : 'var(--paper)'
        return <rect key={index} x={x + col * (w / 3)} y={y + row * (h / 4)} width={w / 3} height={h / 4} fill={fill} stroke="currentColor" strokeWidth="1.3" />
      })}
      <Frac x={100} y={74} n="2" d="3" size={12} />
    </Art>
  )
}

function CompoundMeasure() {
  return (
    <Art>
      <rect x="16" y="18" width="168" height="26" fill="var(--teal-soft)" />
      <rect x="108" y="18" width="76" height="26" fill="var(--gold-soft)" />
      <rect x="16" y="18" width="168" height="26" fill="none" {...pen} />
      <line x1="108" y1="18" x2="108" y2="44" stroke="currentColor" strokeWidth="1.6" />
      <T x="62" y="31" size="14">2 m</T>
      <T x="146" y="31" size="13">40 cm</T>
      <Arrow x1={100} y1={48} x2={100} y2={58} color="var(--teal)" />
      <T x="100" y="70" size="16" fill="var(--teal)" weight={680}>240 cm</T>
    </Art>
  )
}

function FractionPlot() {
  const labels = ['0', '¼', '½', '¾', '1']
  const counts = [1, 3, 2, 0, 2]
  const xs = [22, 60, 98, 136, 174]
  return (
    <Art>
      <line x1="10" y1="56" x2="190" y2="56" stroke="currentColor" strokeWidth="2" />
      {labels.map((label, index) => (
        <g key={label}>
          <line x1={xs[index]} y1="50" x2={xs[index]} y2="62" stroke="currentColor" strokeWidth="2" />
          {Array.from({ length: counts[index] }, (_, mark) => (
            <T key={mark} x={xs[index]} y={44 - mark * 12} size={12} fill="var(--coral)">×</T>
          ))}
          <T x={xs[index]} y={72} size={12}>{label}</T>
        </g>
      ))}
    </Art>
  )
}

function VolumeBox() {
  const x = 48
  const y = 30
  const w = 84
  const h = 38
  const dx = 26
  const dy = -15
  return (
    <Art>
      <polygon points={`${x},${y} ${x + w},${y} ${x + w + dx},${y + dy} ${x + dx},${y + dy}`} fill="var(--indigo-soft)" {...pen} />
      <polygon points={`${x + w},${y} ${x + w + dx},${y + dy} ${x + w + dx},${y + h + dy} ${x + w},${y + h}`} fill="var(--gold-soft)" {...pen} />
      <polygon points={`${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`} fill="var(--teal-soft)" {...pen} />
      <line x1={x + w / 3} y1={y} x2={x + w / 3} y2={y + h} stroke="currentColor" strokeWidth="1.4" />
      <line x1={x + (2 * w) / 3} y1={y} x2={x + (2 * w) / 3} y2={y + h} stroke="currentColor" strokeWidth="1.4" />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="currentColor" strokeWidth="1.4" />
      <line x1={x + w / 3} y1={y} x2={x + w / 3 + dx} y2={y + dy} stroke="currentColor" strokeWidth="1.4" />
      <line x1={x + (2 * w) / 3} y1={y} x2={x + (2 * w) / 3 + dx} y2={y + dy} stroke="currentColor" strokeWidth="1.4" />
      <line x1={x + dx / 2} y1={y + dy / 2} x2={x + w + dx / 2} y2={y + dy / 2} stroke="currentColor" strokeWidth="1.4" />
      <line x1={x + w} y1={y + h / 2} x2={x + w + dx} y2={y + h / 2 + dy} stroke="currentColor" strokeWidth="1.4" />
    </Art>
  )
}

function LargeWholes() {
  return (
    <Art>
      <T x="100" y="24" size="17" weight={680}>4,820,000,000</T>
      <Arrow x1={100} y1={36} x2={100} y2={50} color="var(--teal)" />
      <T x="100" y="66" size="17" fill="var(--teal)" weight={680}>5,000,000,000</T>
    </Art>
  )
}

function EqualHeights() {
  return (
    <Art>
      <line x1="28" y1="16" x2="28" y2="66" stroke="currentColor" strokeWidth="2" />
      <line x1="28" y1="66" x2="150" y2="66" stroke="currentColor" strokeWidth="2" />
      <rect x="44" y="22" width="22" height="44" rx="4" fill="var(--teal)" />
      <rect x="78" y="40" width="22" height="26" rx="4" fill="var(--coral)" />
      <rect x="78" y="22" width="22" height="18" rx="4" fill="none" stroke="var(--coral)" strokeWidth="1.6" strokeDasharray="3 2" />
      <rect x="112" y="34" width="22" height="32" rx="4" fill="var(--gold)" />
      <rect x="156" y="28" width="12" height="12" fill="var(--indigo)" />
      <T x={172} y={34} size={13} anchor="start">= 10</T>
    </Art>
  )
}

function CoordinatePoint() {
  const x0 = 62
  const y0 = 72
  const u = 14
  return (
    <Art>
      <Axes x0={x0} y0={y0} u={u} n={4} />
      <circle cx={x0 + 3 * u} cy={y0 - 2 * u} r="5" fill="var(--coral)" />
      <T x={x0 + 3 * u + 28} y={y0 - 2 * u - 12} size={13}>(3, 2)</T>
    </Art>
  )
}

function Hierarchy() {
  return (
    <Art>
      <polygon points="52,6 140,6 154,26 66,26" fill="var(--indigo-soft)" {...pen} />
      <line x1="100" y1="26" x2="100" y2="34" stroke="currentColor" strokeWidth="2" />
      <rect x="64" y="34" width="72" height="20" fill="var(--teal-soft)" {...pen} />
      <line x1="100" y1="54" x2="100" y2="58" stroke="currentColor" strokeWidth="2" />
      <rect x="88" y="58" width="24" height="24" fill="var(--coral)" {...pen} />
    </Art>
  )
}

function RatioTiles() {
  return (
    <Art>
      {[0, 1, 2].map((index) => (
        <rect key={index} x={16 + index * 28} y={28} width="22" height="22" rx="5" fill="var(--coral)" />
      ))}
      <T x="108" y="40" size="28">:</T>
      {[0, 1].map((index) => (
        <rect key={index} x={128 + index * 28} y={28} width="22" height="22" rx="5" fill="var(--teal)" />
      ))}
    </Art>
  )
}

function DivideFractions() {
  return (
    <Art>
      <SplitBar x={20} y={6} w={160} h={18} parts={4} shaded={2} />
      <Frac x={34} y={52} n="1" d="2" size={15} />
      <T x={68} y={52} size={20}>÷</T>
      <Frac x={102} y={52} n="1" d="4" size={15} />
      <T x={136} y={52} size={20}>=</T>
      <T x={166} y={52} size={26} fill="var(--teal)" weight={680}>2</T>
    </Art>
  )
}

function CommonFactor() {
  return (
    <Art>
      <circle cx="74" cy="40" r="30" fill="var(--coral)" opacity="0.28" {...pen} />
      <circle cx="126" cy="40" r="30" fill="var(--teal)" opacity="0.28" {...pen} />
      <T x="56" y="40" size="14">12</T>
      <T x="144" y="40" size="14">18</T>
      <T x="100" y="40" size="16" weight={680}>6</T>
    </Art>
  )
}

function RationalLine() {
  const xAt = (value: number) => 16 + ((value + 4) / 8) * 168
  return (
    <Art>
      <line x1="12" y1="58" x2="188" y2="58" stroke="currentColor" strokeWidth="2" />
      {[-4, -2, 0, 2, 4].map((tick) => (
        <line key={tick} x1={xAt(tick)} y1="52" x2={xAt(tick)} y2="64" stroke="currentColor" strokeWidth="2" />
      ))}
      <line x1={xAt(-2)} y1="30" x2={xAt(2)} y2="30" stroke="var(--teal)" strokeWidth="1.6" strokeDasharray="3 3" />
      <circle cx={xAt(-2)} cy="58" r="5" fill="var(--coral)" />
      <circle cx={xAt(2)} cy="58" r="5" fill="var(--paper)" {...pen} stroke="var(--teal)" />
      <T x={xAt(-4)} y={74} size={12}>−4</T>
      <T x={xAt(0)} y={74} size={12}>0</T>
      <T x={xAt(4)} y={74} size={12}>4</T>
      <T x={xAt(-2)} y={18} size={13}>|−2|</T>
      <T x={xAt(2)} y={18} size={13} fill="var(--teal)">2</T>
    </Art>
  )
}

function VariableExpr() {
  return (
    <Art>
      <T x={18} y={42} size={26} anchor="start">3(</T>
      <rect x="62" y="22" width="36" height="40" rx="8" fill="var(--gold-soft)" {...pen} stroke="var(--gold)" />
      <T x="80" y="42" size="24">x</T>
      <T x="106" y={42} size={26} anchor="start">+ 2)</T>
    </Art>
  )
}

function Balance() {
  return (
    <Art>
      <polygon points="100,34 88,74 112,74" fill="currentColor" />
      <line x1="24" y1="36" x2="176" y2="36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="46" y1="36" x2="46" y2="50" stroke="currentColor" strokeWidth="2" />
      <line x1="154" y1="36" x2="154" y2="50" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="46" cy="56" rx="28" ry="10" fill="var(--gold-soft)" {...pen} />
      <ellipse cx="154" cy="56" rx="24" ry="10" fill="var(--teal-soft)" {...pen} />
      <T x="46" y="56" size="13">x+3</T>
      <T x="154" y="56" size="16">7</T>
    </Art>
  )
}

function RelatedLine() {
  const x0 = 58
  const y0 = 70
  const u = 14
  return (
    <Art>
      <Axes x0={x0} y0={y0} u={u} n={4} />
      <line x1={x0 + u} y1={y0 - u} x2={x0 + 4 * u} y2={y0 - 3 * u} stroke="var(--coral)" strokeWidth="2.4" />
      <circle cx={x0 + u} cy={y0 - u} r="4" fill="var(--coral)" />
      <circle cx={x0 + 4 * u} cy={y0 - 3 * u} r="4" fill="var(--coral)" />
      <T x={x0 + 4 * u + 12} y={y0 + 2} size={13} fill="var(--ink-soft)">x</T>
      <T x={x0 - 10} y={y0 - 4 * u - 2} size={13} fill="var(--ink-soft)">y</T>
    </Art>
  )
}

function TriangleArea() {
  return (
    <Art>
      <polygon points="24,64 176,64 100,14" fill="var(--gold-soft)" {...pen} />
      <line x1="100" y1="14" x2="100" y2="64" stroke="var(--coral)" strokeWidth="2" strokeDasharray="4 3" />
      <polyline points="94,64 94,58 100,58" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <T x="100" y="76" size="13">8</T>
      <T x="114" y="40" size="13" fill="var(--coral)">5</T>
    </Art>
  )
}

function Spread() {
  return (
    <Art>
      {[58, 46, 34, 22].map((y) => (
        <circle key={y} cx="40" cy={y} r="5" fill="var(--indigo)" />
      ))}
      {[96, 122, 146, 170, 194].map((x) => (
        <circle key={x} cx={x} cy="58" r="5" fill="var(--coral)" />
      ))}
      <line x1="96" y1="74" x2="194" y2="74" stroke="var(--coral)" strokeWidth="1.6" />
      <polyline points="102,70 96,74 102,78" fill="none" stroke="var(--coral)" strokeWidth="1.6" />
      <polyline points="188,70 194,74 188,78" fill="none" stroke="var(--coral)" strokeWidth="1.6" />
    </Art>
  )
}

function DataSummary() {
  const xs = [20, 46, 74, 108, 180]
  return (
    <Art>
      <line x1="12" y1="48" x2="190" y2="48" stroke="currentColor" strokeWidth="2" />
      {xs.map((x, index) => (
        <circle key={x} cx={x} cy="48" r={index === 2 ? 7 : 5} fill={index === 2 ? 'var(--coral)' : 'var(--indigo)'} />
      ))}
      <polygon points="88,24 82,34 94,34" fill="var(--teal)" />
      <line x1="20" y1="66" x2="180" y2="66" stroke="currentColor" strokeWidth="1.6" />
      <line x1="20" y1="60" x2="20" y2="72" stroke="currentColor" strokeWidth="1.6" />
      <line x1="180" y1="60" x2="180" y2="72" stroke="currentColor" strokeWidth="1.6" />
    </Art>
  )
}

function PercentBar() {
  return (
    <Art>
      <rect x="12" y="30" width="120" height="24" rx="6" fill="var(--gold-soft)" />
      <rect x="12" y="30" width="72" height="24" rx="6" fill="var(--coral)" />
      <rect x="12" y="30" width="120" height="24" rx="6" fill="none" {...pen} />
      <T x="164" y="42" size="22" fill="var(--coral)" weight={680}>60%</T>
    </Art>
  )
}

function IntegerJump() {
  const xAt = (value: number) => 16 + ((value + 4) / 8) * 168
  return (
    <Art>
      <line x1="12" y1="62" x2="188" y2="62" stroke="currentColor" strokeWidth="2" />
      {[-4, 0, 4].map((tick) => (
        <g key={tick}>
          <line x1={xAt(tick)} y1="56" x2={xAt(tick)} y2="68" stroke="currentColor" strokeWidth="2" />
          <T x={xAt(tick)} y={76} size={12}>{tick === 0 ? '0' : tick}</T>
        </g>
      ))}
      <circle cx={xAt(-3)} cy="62" r="4" fill="var(--coral)" />
      <circle cx={xAt(2)} cy="62" r="4" fill="var(--teal)" />
      <ArcArrow x1={xAt(-3)} y1={52} cx={100} cy={4} x2={xAt(2)} y2={52} />
      <T x="100" y="22" size="14" fill="var(--coral)">+5</T>
    </Art>
  )
}

function EquivalentForms() {
  return (
    <Art>
      <T x="52" y="42" size="18">2(x + 4)</T>
      <Arrow x1={102} y1={42} x2={124} y2={42} color="var(--teal)" />
      <T x="162" y="42" size="18">2x + 8</T>
    </Art>
  )
}

function SolvedEquation() {
  return (
    <Art>
      <T x="100" y="24" size="20">2x + 4 = 10</T>
      <rect x="52" y="42" width="96" height="30" rx="15" fill="var(--teal-soft)" {...pen} stroke="var(--teal)" />
      <T x="100" y="57" size="18" fill="var(--teal-deep)" weight={680}>x = 3</T>
    </Art>
  )
}

function ScaleDrawing() {
  return (
    <Art>
      <GridRect x={8} y={32} cols={2} rows={1} cell={18} />
      <T x="62" y="24" size="13" fill="var(--teal)">×2</T>
      <Arrow x1={48} y1={42} x2={84} y2={42} color="var(--teal)" />
      <GridRect x={92} y={22} cols={4} rows={2} cell={18} fill="var(--gold-soft)" />
    </Art>
  )
}

function CircleMeasure() {
  return (
    <Art>
      <circle cx="86" cy="42" r="30" fill="var(--gold-soft)" {...pen} />
      <path d={wedge(86, 42, 30, -Math.PI / 2, 0)} fill="var(--coral)" />
      <circle cx="86" cy="42" r="30" fill="none" {...pen} />
      <line x1="86" y1="42" x2="116" y2="42" stroke="currentColor" strokeWidth="2" />
      <line x1="86" y1="42" x2="86" y2="12" stroke="currentColor" strokeWidth="2" />
      <circle cx="86" cy="42" r="2.5" fill="currentColor" />
      <T x="104" y="54" size="14">r</T>
    </Art>
  )
}

function Sample() {
  const picked = new Set(['1,0', '3,1', '4,2', '6,0', '2,2', '5,1'])
  return (
    <Art>
      <rect x="14" y="10" width="172" height="64" rx="14" fill="none" {...pen} strokeDasharray="4 3" />
      {Array.from({ length: 21 }, (_, index) => {
        const col = index % 7
        const row = Math.floor(index / 7)
        const on = picked.has(`${col},${row}`)
        return <circle key={index} cx={32 + col * 22} cy={24 + row * 18} r="4.5" fill={on ? 'var(--coral)' : 'currentColor'} opacity={on ? 1 : 0.28} />
      })}
    </Art>
  )
}

function CompareGroups() {
  const left = [
    [30, 20],
    [40, 28],
    [34, 34],
    [46, 24],
    [38, 16],
  ]
  const right = [
    [128, 40],
    [140, 52],
    [150, 46],
    [134, 58],
    [156, 50],
    [144, 36],
  ]
  return (
    <Art>
      {left.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="var(--coral)" />
      ))}
      {right.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="var(--teal)" />
      ))}
      <line x1="16" y1="24" x2="58" y2="24" stroke="var(--coral)" strokeWidth="2.2" strokeDasharray="3 2" />
      <polygon points="14,24 22,19 22,29" fill="var(--coral)" />
      <line x1="118" y1="47" x2="170" y2="47" stroke="var(--teal)" strokeWidth="2.2" strokeDasharray="3 2" />
      <polygon points="172,47 164,42 164,52" fill="var(--teal)" />
    </Art>
  )
}

function Spinner() {
  const cx = 100
  const cy = 42
  const r = 30
  const slices = [
    { a0: -Math.PI / 2, a1: Math.PI / 6, fill: 'var(--coral)' },
    { a0: Math.PI / 6, a1: Math.PI / 2, fill: 'var(--teal)' },
    { a0: Math.PI / 2, a1: Math.PI, fill: 'var(--gold)' },
    { a0: Math.PI, a1: (3 * Math.PI) / 2, fill: 'var(--indigo)' },
  ]
  return (
    <Art>
      {slices.map((slice) => (
        <path key={slice.a0} d={wedge(cx, cy, r, slice.a0, slice.a1)} fill={slice.fill} stroke="currentColor" strokeWidth="1.6" />
      ))}
      <polygon points="100,42 112,36 108,48" fill="var(--paper)" stroke="currentColor" strokeWidth="1.6" />
      <circle cx={cx} cy={cy} r="3" fill="currentColor" />
    </Art>
  )
}

const PICTURES: Record<string, ReactElement> = {
  '3.oa.a': <Groups />,
  '3.oa.b': <TurnAround />,
  '3.oa.c': <Keypad />,
  '3.oa.d': <TwoSteps />,
  '3.nbt.a': <Places />,
  '3.nf.a': <FractionNumber />,
  '3.md.a': <Measures />,
  '3.md.b': <Bars />,
  '3.md.c': <AreaTiles />,
  '3.md.d': <Perimeter />,
  '3.g.a': <Shapes />,
  '4.oa.a': <Remainder />,
  '4.oa.b': <FactorRainbow />,
  '4.oa.c': <PatternRule />,
  '4.nbt.a': <DigitValue />,
  '4.nbt.b': <WholeAlgorithm />,
  '4.nf.a': <EquivalentFractions />,
  '4.nf.b': <AddFractions />,
  '4.nf.c': <DecimalGrid />,
  '4.md.a': <ConvertUnits />,
  '4.md.b': <LinePlot />,
  '4.md.c': <Protractor />,
  '4.g.a': <Symmetry />,
  '5.oa.a': <Grouping />,
  '5.oa.b': <PartnerPatterns />,
  '5.nbt.a': <DecimalPlaces />,
  '5.nbt.b': <DecimalAlgorithm />,
  '5.nbt.c': <LargeWholes />,
  '5.nf.a': <Unlike />,
  '5.nf.b': <FractionProduct />,
  '5.md.a': <CompoundMeasure />,
  '5.md.b': <FractionPlot />,
  '5.md.c': <VolumeBox />,
  '5.md.d': <EqualHeights />,
  '5.g.a': <CoordinatePoint />,
  '5.g.b': <Hierarchy />,
  '6.rp.a': <RatioTiles />,
  '6.ns.a': <DivideFractions />,
  '6.ns.b': <CommonFactor />,
  '6.ns.c': <RationalLine />,
  '6.ee.a': <VariableExpr />,
  '6.ee.b': <Balance />,
  '6.ee.c': <RelatedLine />,
  '6.g.a': <TriangleArea />,
  '6.sp.a': <Spread />,
  '6.sp.b': <DataSummary />,
  '7.rp.a': <PercentBar />,
  '7.ns.a': <IntegerJump />,
  '7.ee.a': <EquivalentForms />,
  '7.ee.b': <SolvedEquation />,
  '7.g.a': <ScaleDrawing />,
  '7.g.b': <CircleMeasure />,
  '7.sp.a': <Sample />,
  '7.sp.b': <CompareGroups />,
  '7.sp.c': <Spinner />,
}

if (import.meta.env.DEV) {
  const missing = SKILLS.flatMap((skill) => (PICTURES[skill.id] ? [] : [skill.id]))
  if (missing.length) console.warn(`Missing skill pictures: ${missing.join(', ')}`)
}

export function skillPicture(id: string) {
  return PICTURES[id] ?? null
}
