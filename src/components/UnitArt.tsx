import type { ReactNode } from 'react'
import { skillPicture } from './SkillArt'

const pen = { stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Art({ children }: { children: ReactNode }) {
  return (
    <svg className="skill-art" viewBox="0 0 200 84" preserveAspectRatio="xMidYMid meet">
      {children}
    </svg>
  )
}

function T({ x, y, children, size = 18, fill = 'currentColor' }: { x: number | string; y: number | string; children: ReactNode; size?: number | string; fill?: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size} fill={fill} fontWeight={680}>
      {children}
    </text>
  )
}

const OPS = new Set(['×', '÷', '−', '+', '<', '>', '=', '(', ')', '→', ':'])

function MathLine({ text, y = 42, size }: { text: string; y?: number; size?: number }) {
  const computed = size ?? (text.length > 18 ? 15 : text.length > 13 ? 18 : text.length > 9 ? 22 : 26)
  const parts = text.split(/(\s+|×|÷|−|\+|<|>|=|\(|\)|→|:)/).filter((part) => part.length > 0)
  const equalAt = parts.findIndex((part) => part === '=')
  return (
    <text x="100" y={y} textAnchor="middle" dominantBaseline="central" fontSize={computed} fontWeight={680}>
      {parts.map((part, index) => (
        <tspan key={index} fill={part === '=' || (equalAt >= 0 && index > equalAt && part.trim()) ? 'var(--teal)' : OPS.has(part) ? 'var(--coral)' : 'currentColor'}>
          {part}
        </tspan>
      ))}
    </text>
  )
}

function Two({ a, b }: { a: string; b: string }) {
  return (
    <Art>
      <MathLine text={a} y={28} size={a.length > 14 ? 16 : 20} />
      <MathLine text={b} y={58} size={b.length > 14 ? 16 : 20} />
    </Art>
  )
}

function Bars({ heights }: { heights: number[] }) {
  const max = Math.max(...heights, 1)
  const gap = 10
  const w = 18
  const total = heights.length * w + (heights.length - 1) * gap
  const x0 = (200 - total) / 2
  const colors = ['var(--coral)', 'var(--teal)', 'var(--gold)', 'var(--indigo)']
  return (
    <Art>
      {heights.map((height, index) => {
        const h = 16 + (height / max) * 46
        return <rect key={index} x={x0 + index * (w + gap)} y={70 - h} width={w} height={h} rx="5" fill={colors[index % colors.length]} />
      })}
    </Art>
  )
}

function Clock({ hour, minute }: { hour: number; minute: number }) {
  const cx = 100
  const cy = 42
  const hand = (deg: number, len: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: cx + Math.cos(rad) * len, y: cy + Math.sin(rad) * len }
  }
  const h = hand(((hour % 12) + minute / 60) * 30, 14)
  const m = hand(minute * 6, 20)
  return (
    <Art>
      <circle cx={cx} cy={cy} r="28" fill="var(--paper)" {...pen} />
      <circle cx={cx} cy={cy} r="2.5" fill="currentColor" />
      <line x1={cx} y1={cy} x2={h.x} y2={h.y} stroke="var(--coral)" strokeWidth="3" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={m.x} y2={m.y} stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" />
    </Art>
  )
}

function SplitBar({ parts, shaded }: { parts: number; shaded: number }) {
  const w = 132
  const h = 26
  const x = 34
  const y = 29
  const pw = w / parts
  return (
    <Art>
      {Array.from({ length: parts }, (_, index) => (
        <rect key={index} x={x + index * pw} y={y} width={pw} height={h} fill={index < shaded ? 'var(--coral)' : 'var(--paper)'} />
      ))}
      <rect x={x} y={y} width={w} height={h} fill="none" rx="4" {...pen} />
      {Array.from({ length: parts - 1 }, (_, index) => (
        <line key={index} x1={x + (index + 1) * pw} y1={y} x2={x + (index + 1) * pw} y2={y + h} stroke="currentColor" strokeWidth="1.6" />
      ))}
    </Art>
  )
}

function NumLine({ at, label }: { at: number; label?: string }) {
  const x = 28 + Math.min(1, Math.max(0, at)) * 144
  return (
    <Art>
      <line x1="24" y1="50" x2="176" y2="50" {...pen} />
      <line x1="24" y1="44" x2="24" y2="56" stroke="currentColor" strokeWidth="2" />
      <line x1="176" y1="44" x2="176" y2="56" stroke="currentColor" strokeWidth="2" />
      <circle cx={x} cy="50" r="6" fill="var(--coral)" />
      {label ? <T x={x} y={26} size={16} fill="var(--teal)">{label}</T> : null}
    </Art>
  )
}

function Grid({ cols, rows, shaded }: { cols: number; rows: number; shaded: number }) {
  const cell = Math.min(16, Math.floor(150 / cols), Math.floor(64 / rows))
  const w = cols * cell
  const h = rows * cell
  const x0 = (200 - w) / 2
  const y0 = (84 - h) / 2
  return (
    <Art>
      {Array.from({ length: rows * cols }, (_, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        return <rect key={index} x={x0 + col * cell} y={y0 + row * cell} width={cell} height={cell} fill={index < shaded ? 'var(--coral)' : 'var(--paper)'} stroke="currentColor" strokeWidth="1.4" />
      })}
    </Art>
  )
}

function ngon(sides: number, cx = 100, cy = 42, r = 28) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / sides
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}

function Poly({ name }: { name: string }) {
  if (name === 'rect') {
    return (
      <Art>
        <rect x="62" y="18" width="76" height="48" rx="3" fill="var(--teal-soft)" {...pen} />
      </Art>
    )
  }
  if (name === 'para') {
    return (
      <Art>
        <polygon points="52,22 150,22 136,64 38,64" fill="var(--gold-soft)" {...pen} />
        <line x1="52" y1="22" x2="38" y2="64" stroke="var(--coral)" strokeWidth="3" />
        <line x1="150" y1="22" x2="136" y2="64" stroke="var(--coral)" strokeWidth="3" />
      </Art>
    )
  }
  if (name === 'circle') {
    return (
      <Art>
        <circle cx="100" cy="42" r="28" fill="var(--paper)" {...pen} />
        <line x1="100" y1="42" x2="128" y2="42" stroke="var(--coral)" strokeWidth="2" />
      </Art>
    )
  }
  if (name === 'disk') {
    return (
      <Art>
        <circle cx="100" cy="42" r="28" fill="var(--teal-soft)" {...pen} />
      </Art>
    )
  }
  const sides = name === 'tri' ? 3 : name === 'pent' ? 5 : name === 'hex' ? 6 : 4
  return (
    <Art>
      <polygon points={ngon(sides)} fill={sides === 3 ? 'var(--gold-soft)' : 'var(--teal-soft)'} {...pen} />
    </Art>
  )
}

function Angle({ deg }: { deg: number }) {
  const cx = 48
  const cy = 64
  const rad = (deg * Math.PI) / 180
  const x = cx + Math.cos(rad) * 86
  const y = cy - Math.sin(rad) * 86
  return (
    <Art>
      <line x1={cx} y1={cy} x2={cx + 100} y2={cy} {...pen} />
      <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--coral)" strokeWidth="2" strokeLinecap="round" />
      {deg === 90 ? <path d={`M ${cx + 14} ${cy} L ${cx + 14} ${cy - 14} L ${cx} ${cy - 14}`} fill="none" stroke="var(--teal)" strokeWidth="2" /> : null}
      <T x={cx + 36} y={cy - 18} size={14} fill="var(--teal)">{deg}°</T>
    </Art>
  )
}

function Pie({ parts, hot }: { parts: number; hot: number }) {
  const cx = 100
  const cy = 42
  const r = 28
  return (
    <Art>
      {Array.from({ length: parts }, (_, index) => {
        const a0 = -Math.PI / 2 + (index * 2 * Math.PI) / parts
        const a1 = -Math.PI / 2 + ((index + 1) * 2 * Math.PI) / parts
        const large = a1 - a0 > Math.PI ? 1 : 0
        const x0 = cx + r * Math.cos(a0)
        const y0 = cy + r * Math.sin(a0)
        const x1 = cx + r * Math.cos(a1)
        const y1 = cy + r * Math.sin(a1)
        const filled = hot >= parts ? index % 2 === 0 : index < hot
        return <path key={index} d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`} fill={filled ? 'var(--coral)' : 'var(--paper)'} stroke="currentColor" strokeWidth="1.5" />
      })}
    </Art>
  )
}

function Dots({ cols, rows, spread = false }: { cols: number; rows: number; spread?: boolean }) {
  if (spread) {
    return (
      <Art>
        {[0, 1, 2, 3, 4].map((index) => <circle key={index} cx={28 + index * 12} cy={42} r="5" fill="var(--teal)" />)}
        {[0, 1, 2, 3].map((index) => <circle key={index} cx={118 + index * 18} cy={42} r="5" fill="var(--coral)" />)}
      </Art>
    )
  }
  const gap = 14
  const x0 = (200 - (cols - 1) * gap) / 2
  const y0 = (84 - (rows - 1) * gap) / 2
  return (
    <Art>
      {Array.from({ length: rows * cols }, (_, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        return <circle key={index} cx={x0 + col * gap} cy={y0 + row * gap} r="5" fill={row === 0 ? 'var(--coral)' : 'var(--teal)'} />
      })}
    </Art>
  )
}

function Plane({ x, y, dist = false }: { x: number; y: number; dist?: boolean }) {
  const px = 40 + x * 22
  const py = 68 - y * 14
  return (
    <Art>
      <line x1="36" y1="70" x2="176" y2="70" {...pen} />
      <line x1="36" y1="70" x2="36" y2="12" {...pen} />
      <circle cx={px} cy={py} r="5" fill="var(--coral)" />
      {dist ? <circle cx={px + 44} cy={py + 18} r="5" fill="var(--teal)" /> : null}
      {dist ? <line x1={px} y1={py} x2={px + 44} y2={py + 18} stroke="var(--gold)" strokeWidth="2" strokeDasharray="3 3" /> : null}
    </Art>
  )
}

function Places({ digits, on }: { digits: string; on: number }) {
  const chars = digits.split('')
  const w = 28
  const gap = 6
  const total = chars.length * w + (chars.length - 1) * gap
  const x0 = (200 - total) / 2
  return (
    <Art>
      {chars.map((digit, index) => (
        <g key={index}>
          <rect x={x0 + index * (w + gap)} y="22" width={w} height="40" rx="8" fill={index === on ? 'var(--coral)' : 'var(--paper)'} {...pen} />
          <T x={x0 + index * (w + gap) + w / 2} y="42" size={20} fill={index === on ? 'white' : 'currentColor'}>{digit}</T>
        </g>
      ))}
    </Art>
  )
}

function Steps({ n }: { n: number }) {
  const gap = n === 2 ? 70 : 52
  const x0 = (200 - (n - 1) * gap) / 2
  return (
    <Art>
      {Array.from({ length: n }, (_, index) => (
        <g key={index}>
          <circle cx={x0 + index * gap} cy="42" r="16" fill={index === n - 1 ? 'var(--coral)' : 'var(--teal-soft)'} {...pen} />
          <T x={x0 + index * gap} y="42" size={16}>{index + 1}</T>
          {index < n - 1 ? <line x1={x0 + index * gap + 18} y1="42" x2={x0 + (index + 1) * gap - 18} y2="42" stroke="var(--gold)" strokeWidth="2" /> : null}
        </g>
      ))}
    </Art>
  )
}

function Box({ label }: { label: string }) {
  return (
    <Art>
      <polygon points="78,34 118,34 118,68 78,68" fill="var(--teal-soft)" {...pen} />
      <polygon points="78,34 98,18 138,18 118,34" fill="var(--gold-soft)" {...pen} />
      <polygon points="118,34 138,18 138,52 118,68" fill="var(--coral)" opacity="0.85" {...pen} />
      {label && label !== 'layers' ? <T x="98" y="52" size={label.length > 5 ? 12 : 14}>{label}</T> : null}
    </Art>
  )
}

function Net() {
  const cell = 16
  const cells = [
    [1, 0],
    [0, 1], [1, 1], [2, 1],
    [1, 2],
    [1, 3],
  ]
  const x0 = 76
  const y0 = 6
  return (
    <Art>
      {cells.map(([col, row], index) => (
        <rect key={index} x={x0 + col * cell} y={y0 + row * cell} width={cell} height={cell} fill={index === 2 ? 'var(--coral)' : 'var(--teal-soft)'} {...pen} />
      ))}
    </Art>
  )
}

function Scale({ dir }: { dir: 'up' | 'down' }) {
  const small = dir === 'up'
  return (
    <Art>
      <rect x="28" y={small ? 30 : 22} width={small ? 36 : 52} height={small ? 24 : 40} rx="3" fill="var(--teal-soft)" {...pen} />
      <line x1="96" y1="42" x2="124" y2="42" stroke="var(--coral)" strokeWidth="2" />
      <polyline points="116,36 124,42 116,48" fill="none" stroke="var(--coral)" strokeWidth="2" />
      <rect x="136" y={small ? 22 : 30} width={small ? 52 : 36} height={small ? 40 : 24} rx="3" fill="var(--gold-soft)" {...pen} />
    </Art>
  )
}

function Symmetry() {
  return (
    <Art>
      <polygon points={ngon(3, 100, 44, 30)} fill="var(--gold-soft)" {...pen} />
      <line x1="100" y1="8" x2="100" y2="76" stroke="var(--coral)" strokeWidth="2" strokeDasharray="4 3" />
    </Art>
  )
}

function RectMark({ mark }: { mark: 'miss' | 'peri' }) {
  return (
    <Art>
      <rect x="58" y="18" width="84" height="48" rx="2" fill="var(--paper)" {...pen} />
      {mark === 'peri' ? (
        <>
          <T x="100" y="12" size={12} fill="var(--teal)">4</T>
          <T x="150" y="42" size={12} fill="var(--teal)">3</T>
        </>
      ) : (
        <T x="150" y="42" size={16} fill="var(--coral)">?</T>
      )}
    </Art>
  )
}

function Group({ text }: { text: string }) {
  return (
    <Art>
      <MathLine text={text} y={32} size={text.length > 14 ? 18 : 22} />
      <path d="M 46 50 Q 78 70 110 50" fill="none" stroke="var(--teal)" strokeWidth="2" />
    </Art>
  )
}

function Words({ expr }: { expr: string }) {
  return (
    <Art>
      <rect x="12" y="18" width="72" height="48" rx="16" fill="var(--gold-soft)" {...pen} />
      <T x="48" y="42" size={16}>a + b</T>
      <line x1="92" y1="42" x2="114" y2="42" stroke="var(--coral)" strokeWidth="2" />
      <polyline points="106,36 114,42 106,48" fill="none" stroke="var(--coral)" strokeWidth="2" />
      <T x="156" y="42" size={expr.length > 8 ? 14 : 16}>{expr}</T>
    </Art>
  )
}

function Fracs({ text }: { text: string }) {
  const raw = text.split(/\s+/).filter(Boolean)
  const tokens: Array<{ kind: 'op' | 'n' | 'f' | 'm'; text?: string; n?: string; d?: string; whole?: string }> = []
  const op = /^(×|÷|−|\+|=|<|>|of)$/
  const frac = /^(−?\d+)\/(\d+|\?)$/
  const num = /^(−?\d+)$/
  for (let index = 0; index < raw.length; index += 1) {
    const token = raw[index]
    if (op.test(token)) {
      tokens.push({ kind: 'op', text: token })
      continue
    }
    const next = raw[index + 1]?.match(frac)
    if (num.test(token) && next && !next[1].startsWith('−')) {
      tokens.push({ kind: 'm', whole: token, n: next[1], d: next[2] })
      index += 1
      continue
    }
    const found = token.match(frac)
    if (found) tokens.push({ kind: 'f', n: found[1], d: found[2] })
    else tokens.push({ kind: 'n', text: token })
  }
  const size = tokens.length > 3 ? 14 : 16
  const width = (token: (typeof tokens)[number]) => {
    if (token.kind === 'op') return 18
    if (token.kind === 'n') return (token.text?.length ?? 1) * size * 0.62
    if (token.kind === 'f') return Math.max(token.n?.length ?? 1, token.d?.length ?? 1) * size * 0.62 + 8
    return (token.whole?.length ?? 1) * size * 0.62 + Math.max(token.n?.length ?? 1, token.d?.length ?? 1) * size * 0.62 + 10
  }
  const total = tokens.reduce((sum, token) => sum + width(token), 0) + (tokens.length - 1) * 8
  let x = (200 - total) / 2
  return (
    <Art>
      {tokens.map((token, index) => {
        const w = width(token)
        const cx = x + w / 2
        x += w + 8
        if (token.kind === 'op') return <T key={index} x={cx} y={42} size={size} fill="var(--coral)">{token.text}</T>
        if (token.kind === 'n') return <T key={index} x={cx} y={42} size={size}>{token.text}</T>
        if (token.kind === 'm') {
          return (
            <g key={index}>
              <T x={cx - w / 2 + (token.whole?.length ?? 1) * size * 0.31} y={42} size={size}>{token.whole}</T>
              <T x={cx + 8} y={42 - size * 0.7} size={size - 2}>{token.n}</T>
              <line x1={cx + 8 - w * 0.18} y1={42} x2={cx + 8 + w * 0.18} y2={42} stroke="currentColor" strokeWidth="1.5" />
              <T x={cx + 8} y={42 + size * 0.7} size={size - 2}>{token.d}</T>
            </g>
          )
        }
        return (
          <g key={index}>
            <T x={cx} y={42 - size * 0.75} size={size}>{token.n}</T>
            <line x1={cx - w / 2 + 2} y1={42} x2={cx + w / 2 - 2} y2={42} stroke="currentColor" strokeWidth="1.5" />
            <T x={cx} y={42 + size * 0.75} size={size}>{token.d}</T>
          </g>
        )
      })}
    </Art>
  )
}

function draw(spec: string) {
  const [kind, raw = ''] = spec.split('|')
  const bits = raw.split(';')
  if (kind === 'math') return <Art><MathLine text={bits[0]} /></Art>
  if (kind === 'two') return <Two a={bits[0]} b={bits[1]} />
  if (kind === 'bars') return <Bars heights={bits[0].split(',').map(Number)} />
  if (kind === 'clock') return <Clock hour={Number(bits[0])} minute={Number(bits[1])} />
  if (kind === 'fbar') return <SplitBar parts={Number(bits[0])} shaded={Number(bits[1])} />
  if (kind === 'line') return <NumLine at={Number(bits[0])} label={bits[1]} />
  if (kind === 'grid') return <Grid cols={Number(bits[0])} rows={Number(bits[1])} shaded={Number(bits[2])} />
  if (kind === 'poly') return <Poly name={bits[0]} />
  if (kind === 'angle') return <Angle deg={Number(bits[0])} />
  if (kind === 'pie') return <Pie parts={Number(bits[0])} hot={Number(bits[1])} />
  if (kind === 'dots') return <Dots cols={Number(bits[0] || 4)} rows={Number(bits[1] || 2)} spread={bits[0] === 'spread'} />
  if (kind === 'plane') return <Plane x={bits[0] === 'dist' ? 2 : Number(bits[0] || 2)} y={bits[0] === 'dist' ? 3 : Number(bits[1] || 3)} dist={bits[0] === 'dist'} />
  if (kind === 'places') return <Places digits={bits[0]} on={Number(bits[1])} />
  if (kind === 'steps') return <Steps n={Number(bits[0])} />
  if (kind === 'box') return <Box label={bits[0]} />
  if (kind === 'net') return <Net />
  if (kind === 'scale') return <Scale dir={bits[0] === 'down' ? 'down' : 'up'} />
  if (kind === 'sym') return <Symmetry />
  if (kind === 'rect') return <RectMark mark={bits[0] === 'peri' ? 'peri' : 'miss'} />
  if (kind === 'group') return <Group text={bits[0]} />
  if (kind === 'words') return <Words expr={bits[0] || '(2+5)×3'} />
  if (kind === 'frac') return <Fracs text={bits[0]} />
  return null
}

const SPECS: Record<string, string> = {
  '3.oa.a:mul': 'math|4 × 6 = 24',
  '3.oa.a:div': 'math|24 ÷ 6 = 4',
  '3.oa.a:mixed': 'math|3 × 4 + 2',
  '3.oa.b:comm': 'math|3 × 4 = 4 × 3',
  '3.oa.b:missing': 'math|3 × ? = 12',
  '3.oa.b:dist': 'math|3 × (2 + 4)',
  '3.oa.c:mul': 'dots|4;3',
  '3.oa.c:div': 'math|56 ÷ 8',
  '3.oa.c:mixed': 'math|6 × 7 + 5',
  '3.oa.d:twostep': 'steps|2',
  '3.oa.d:pattern': 'math|2, 4, 6, ?',
  '3.nbt.a:add': 'math|240 + 130',
  '3.nbt.a:sub': 'math|500 − 180',
  '3.nbt.a:round': 'two|347;→ 300',
  '3.nbt.a:times10': 'math|24 × 10',
  '3.nf.a:shade': 'fbar|4;3',
  '3.nf.a:name': 'frac|3/4',
  '3.nf.a:line': 'line|0.5;1/2',
  '3.nf.a:compare': 'frac|1/2 < 3/4',
  '3.nf.a:equiv': 'frac|1/2 = 2/4',
  '3.md.a:read': 'clock|3;0',
  '3.md.a:set': 'clock|7;30',
  '3.md.a:elapsed': 'two|2:10;→ 2:40',
  '3.md.a:mass': 'math|2 kg',
  '3.md.b:read': 'bars|22,48,34,58',
  '3.md.b:build': 'bars|16,28,40,52',
  '3.md.b:most': 'bars|18,24,62,20',
  '3.md.b:match': 'bars|40,40,28,40',
  '3.md.c:area': 'grid|4;3;12',
  '3.md.c:missing': 'rect|miss',
  '3.md.d:peri': 'rect|peri',
  '3.md.d:missing': 'rect|miss',
  '3.g.a:name': 'poly|pent',
  '3.g.a:partition': 'pie|4;4',
  '3.g.a:attribute': 'angle|90',
  '4.oa.a:two': 'steps|2',
  '4.oa.a:three': 'steps|3',
  '4.oa.b:factor': 'math|12 = 3 × 4',
  '4.oa.b:multiple': 'math|6, 12, 18',
  '4.oa.b:gcf': 'two|12, 18;→ 6',
  '4.oa.b:lcm': 'two|4, 6;→ 12',
  '4.oa.c:next': 'math|3, 6, 9, ?',
  '4.oa.c:rule': 'math|+ 3',
  '4.nbt.a:value': 'places|4582;1',
  '4.nbt.a:round': 'two|4,582;→ 5,000',
  '4.nbt.a:build': 'places|4582;0',
  '4.nbt.a:times': 'math|300 = 10 × 30',
  '4.nbt.b:add': 'math|1248 + 365',
  '4.nbt.b:sub': 'math|3000 − 476',
  '4.nbt.b:mul': 'math|23 × 14',
  '4.nbt.b:div': 'math|84 ÷ 4',
  '4.nf.a:equiv': 'frac|2/4 = 1/2',
  '4.nf.a:compare': 'frac|3/8 < 1/2',
  '4.nf.a:order': 'frac|1/4 1/2 3/4',
  '4.nf.b:add': 'frac|1/8 + 3/8',
  '4.nf.b:sub': 'frac|5/6 − 1/6',
  '4.nf.b:mixed': 'frac|2 1/4',
  '4.nf.b:mulwhole': 'frac|3 × 1/4',
  '4.nf.c:write': 'frac|3/10 = 0.3',
  '4.nf.c:compare': 'math|0.4 < 0.7',
  '4.nf.c:shade': 'grid|10;4;16',
  '4.md.a:metric': 'math|2 m = 200 cm',
  '4.md.a:time': 'math|2 h = 120 min',
  '4.md.a:custom': 'math|2 ft = 24 in',
  '4.md.b:count': 'dots|5;2',
  '4.md.b:sum': 'math|3 + 5 + 2',
  '4.md.c:classify': 'angle|90',
  '4.md.c:read': 'angle|50',
  '4.md.c:make': 'angle|120',
  '4.md.c:missing': 'poly|tri',
  '4.g.a:symmetry': 'sym',
  '4.g.a:classify': 'angle|90',
  '4.g.a:parallel': 'poly|para',
  '5.oa.a:eval': 'group|(2 + 5) × 3',
  '5.oa.a:words': 'words|(2+5)×3',
  '5.oa.a:sumprod': 'group|(2 + 5) × 3',
  '5.oa.a:diff': 'group|(8 − 3) × 2',
  '5.oa.a:three': 'math|(2 + 5) × 3 − 1',
  '5.oa.a:div': 'math|(8 + 4) ÷ 3',
  '5.nbt.a:compare': 'math|4.2 > 4.15',
  '5.nbt.a:round': 'two|3.46;→ 3.5',
  '5.nbt.a:times': 'math|3.4 × 10',
  '5.nbt.a:expand': 'math|3 + 0.4 + 0.02',
  '5.nbt.b:head': 'math|25 × 4',
  '5.nbt.b:mul': 'math|24 × 13',
  '5.nbt.b:div': 'math|96 ÷ 12',
  '5.nbt.b:adddec': 'math|2.4 + 1.35',
  '5.nbt.b:subdec': 'math|5.0 − 1.25',
  '5.nbt.b:muldec': 'math|1.2 × 3',
  '5.nbt.b:divdec': 'math|4.8 ÷ 1.2',
  '5.nbt.c:chart': 'places|2406;2',
  '5.nbt.c:neighbor': 'math|399  400  401',
  '5.nbt.c:compare': 'math|12400 > 12040',
  '5.nbt.c:order': 'math|3 < 12 < 40',
  '5.nbt.c:round': 'two|14600;→ 15000',
  '5.nbt.c:line': 'line|0.62',
  '5.nf.a:add': 'frac|1/2 + 1/3',
  '5.nf.a:sub': 'frac|3/4 − 1/6',
  '5.nf.a:mixed': 'frac|1 1/2 + 2/3',
  '5.nf.b:mul': 'frac|2/3 × 3/4',
  '5.nf.b:mulwhole': 'frac|1/3 × 12',
  '5.nf.b:divunit': 'frac|1/2 ÷ 1/8',
  '5.nf.b:divwhole': 'frac|3 ÷ 1/4',
  '5.md.a:metric': 'math|2.5 m',
  '5.md.a:compound': 'math|2 m 40 cm',
  '5.md.b:count': 'dots|6;2',
  '5.md.b:greater': 'line|0.72;>',
  '5.md.c:volume': 'box|3×2×4',
  '5.md.c:missing': 'box|?×2×4',
  '5.md.c:layers': 'box|layers',
  '5.md.d:read': 'bars|20,36,50,28',
  '5.md.d:most': 'bars|16,22,58,18',
  '5.md.d:match': 'bars|36,36,22,36',
  '5.md.d:build': 'bars|14,26,38,50',
  '5.g.a:plot': 'plane|2;3',
  '5.g.a:read': 'plane|4;1',
  '5.g.a:distance': 'plane|dist',
  '5.g.b:statement': 'poly|rect',
  '5.g.b:figure': 'poly|hex',
  '6.rp.a:build': 'math|2 : 3',
  '6.rp.a:missing': 'frac|2/3 = 4/?',
  '6.rp.a:unit': 'math|12 ÷ 3',
  '6.rp.a:percent': 'math|25% × 80',
  '6.ns.a:frac': 'frac|1/2 ÷ 1/4',
  '6.ns.a:whole': 'frac|3 ÷ 1/2',
  '6.ns.a:word': 'frac|1/2 ÷ 3',
  '6.ns.b:gcf': 'two|18, 24;→ 6',
  '6.ns.b:lcm': 'two|6, 8;→ 24',
  '6.ns.b:mul': 'math|1.5 × 2.4',
  '6.ns.b:div': 'math|3.6 ÷ 0.4',
  '6.ns.c:compare': 'math|−3 < −1',
  '6.ns.c:order': 'math|−4, −1, 2',
  '6.ns.c:plot': 'line|0.28;−2',
  '6.ns.c:abs': 'math||−4| = 4',
  '6.ee.a:eval': 'math|2x + 1',
  '6.ee.a:write': 'words|x + 2',
  '6.ee.a:dist': 'math|2(x + 3)',
  '6.ee.b:one': 'math|x + 4 = 9',
  '6.ee.b:two': 'math|2x + 1 = 9',
  '6.ee.b:ineq': 'math|x > 3',
  '6.ee.c:y': 'math|y = 2x + 1',
  '6.ee.c:pair': 'plane|2;5',
  '6.g.a:triangle': 'poly|tri',
  '6.g.a:para': 'poly|para',
  '6.g.a:volume': 'box',
  '6.g.a:surface': 'net',
  '6.sp.a:question': 'math|?',
  '6.sp.a:spread': 'dots|spread',
  '6.sp.b:mean': 'bars|20,40,30,50',
  '6.sp.b:median': 'math|2  4  7  9  11',
  '6.sp.b:range': 'math|11 − 2',
  '7.rp.a:proportion': 'frac|2/5 = 6/15',
  '7.rp.a:percent': 'math|30% × 50',
  '7.rp.a:change': 'two|40 → 50;+25%',
  '7.rp.a:tax': 'math|20 + 3',
  '7.ns.a:add': 'math|−3 + 5',
  '7.ns.a:sub': 'math|−2 − 4',
  '7.ns.a:mul': 'math|−3 × 4',
  '7.ns.a:div': 'math|−8 ÷ 2',
  '7.ns.a:int': 'math|−4, 0, 5',
  '7.ns.a:frac': 'frac|−1/2 + 3/4',
  '7.ee.a:expand': 'math|3(x + 2)',
  '7.ee.a:factor': 'math|3x + 6',
  '7.ee.b:two': 'math|3x − 2 = 10',
  '7.ee.b:dist': 'math|2(x + 1) = 10',
  '7.ee.b:ineq': 'math|2x > 6',
  '7.g.a:scale': 'scale|up',
  '7.g.a:down': 'scale|down',
  '7.g.a:area': 'math|3 × 3 = 9',
  '7.g.b:circ': 'poly|circle',
  '7.g.b:area': 'poly|disk',
  '7.g.b:complement': 'angle|90',
  '7.g.b:triangle': 'angle|70',
  '7.g.b:surface': 'net',
  '7.sp.c:simple': 'pie|4;1',
  '7.sp.c:complement': 'pie|4;3',
  '7.sp.c:compound': 'pie|8;2',
}

export function hasUnitPicture(skillId: string, value: string) {
  return Boolean(SPECS[`${skillId}:${value}`])
}

export function unitPicture(skillId: string, value: string) {
  return draw(SPECS[`${skillId}:${value}`] ?? '') ?? skillPicture(skillId)
}
