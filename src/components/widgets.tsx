import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type { Answer, Locale, Response } from '../lib/types'
import { PALETTE } from '../lib/types'
import { decimalKey, t, tx } from '../lib/i18n'
import { MathText } from './MathText'
import { ShadeBar } from './ShadeBar'
import { ClockFace, PlaneGrid, ShapeFig, planeMap } from './visuals'

function useKeys(onKey: (key: string) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const listen = (event: KeyboardEvent) => {
      if (document.querySelector('[data-answer-lock]')) return
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.key === 'Backspace') onKey('back')
      else if (event.key === '-' || event.key === '±') onKey('sign')
      else if (event.key === '.' || event.key === ',') onKey('dec')
      else if (/^\d$/.test(event.key)) onKey(event.key)
    }
    window.addEventListener('keydown', listen)
    return () => window.removeEventListener('keydown', listen)
  }, [enabled, onKey])
}

function Pad({ locale, allowDecimal, allowNegative, onKey }: { locale: Locale; allowDecimal?: boolean; allowNegative?: boolean; onKey: (key: string) => void }) {
  const dec = decimalKey(locale)
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', allowDecimal ? dec : allowNegative ? '±' : 'C', '0', '⌫']
  return (
    <div className="keypad">
      {keys.map((key) => (
        <button key={key} type="button" className="key" onClick={() => onKey(key === '⌫' ? 'back' : key === '±' ? 'sign' : key === dec ? 'dec' : key === 'C' ? 'clear' : key)}>
          {key}
        </button>
      ))}
      {allowDecimal && allowNegative ? (
        <button type="button" className="key wide" onClick={() => onKey('sign')}>±</button>
      ) : null}
    </div>
  )
}

function useEmit(onChange: (answer: Answer | null) => void) {
  const ref = useRef(onChange)
  ref.current = onChange
  return ref
}

// Typed text where only the newest character pops in. Keying it by length replays the pop on every key press.
function Typed({ text, empty = ' ' }: { text: string; empty?: string }) {
  if (!text) return <>{empty}</>
  return (
    <>
      {text.slice(0, -1)}
      <span key={text.length} className="digit-pop">{text.slice(-1)}</span>
    </>
  )
}

function parseNumeric(text: string) {
  if (!text || text === '-' || text === '.' || text === '-.') return null
  const value = Number(text)
  return Number.isFinite(value) ? value : null
}

export function AnswerWidget({ response, locale, onChange, initial, locked = false, reveal }: { response: Response; locale: Locale; onChange: (answer: Answer | null) => void; initial?: Answer | null; locked?: boolean; reveal?: Answer | null }) {
  let body: ReactNode = null
  if (response.type === 'number') body = <NumberWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'number' ? initial.value : null} />
  else if (response.type === 'fraction') body = <FractionWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'fraction' ? initial : null} />
  else if (response.type === 'choice') body = <ChoiceWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'choice' ? initial.id : ''} />
  else if (response.type === 'compare') body = <CompareWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'compare' ? initial.sign : null} />
  else if (response.type === 'order') body = <OrderWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'order' ? initial.ids : null} />
  else if (response.type === 'numberline') body = <LineWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'number' ? initial.value : null} />
  else if (response.type === 'coordinate') body = <PlaneWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'points' ? initial.points[0] ?? null : null} reveal={reveal?.kind === 'points' && locked ? reveal.points : undefined} />
  else if (response.type === 'shade') body = <ShadeWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'shade' ? initial.count : 0} />
  else if (response.type === 'clock') body = <ClockWidget onChange={onChange} locale={locale} initial={initial?.kind === 'clock' ? initial : null} />
  else if (response.type === 'chart-build') body = <ChartWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'chart' ? initial : null} />
  else if (response.type === 'angle') body = <AngleWidget onChange={onChange} initial={initial?.kind === 'angle' ? initial.degrees : 0} />
  else if (response.type === 'ratio') body = <RatioWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'ratio' ? initial : null} />
  else if (response.type === 'digits') body = <DigitsWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'digits' ? initial.digits : null} />
  else body = <MultiWidget response={response} locale={locale} onChange={onChange} initial={initial?.kind === 'multi' ? initial.parts : null} />
  return (
    <div className={locked ? 'widget-lock' : undefined} data-answer-lock={locked ? 'true' : undefined}>
      {body}
    </div>
  )
}

function applyNumber(current: string, key: string) {
  if (key === 'clear') return ''
  if (key === 'back') return current.slice(0, -1)
  if (key === 'sign') return current.startsWith('-') ? current.slice(1) : `-${current}`
  if (key === 'dec') return current.includes('.') ? current : `${current || '0'}.`
  if (current.replace('-', '').replace('.', '').length >= 8) return current
  return `${current}${key}`
}

function NumberWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'number' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: number | null }) {
  const [text, setText] = useState(initial == null ? '' : String(initial))
  const emit = useEmit(onChange)
  const push = (key: string) => setText((current) => applyNumber(current, key))
  useEffect(() => {
    const value = parseNumeric(text)
    if (response.allowNegative === false && text.startsWith('-')) emit.current(null)
    else emit.current(value == null ? null : { kind: 'number', value })
  }, [text, response.allowNegative, emit])
  useKeys(push, true)
  const shown = text.replace('.', decimalKey(locale))
  return (
    <div>
      <div className="entry"><Typed text={shown} /></div>
      <Pad locale={locale} allowDecimal={response.allowDecimal} allowNegative={response.allowNegative} onKey={push} />
    </div>
  )
}

function FractionWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'fraction' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: Extract<Answer, { kind: 'fraction' }> | null }) {
  const [field, setField] = useState<'n' | 'd' | 'w'>('n')
  const [parts, setParts] = useState(() => {
    if (!initial) return { w: '', n: '', d: '', neg: false }
    const whole = initial.whole ?? 0
    return {
      w: whole ? String(Math.abs(whole)) : '',
      n: String(Math.abs(initial.n)),
      d: String(initial.d),
      neg: whole < 0 || initial.n < 0,
    }
  })
  const emit = useEmit(onChange)
  useEffect(() => {
    const n = Number(parts.n)
    const d = Number(parts.d)
    const w = parts.w === '' ? 0 : Number(parts.w)
    if (!parts.n || !parts.d || !d) {
      emit.current(null)
      return
    }
    const whole = parts.neg ? -Math.abs(w || 0) : w
    const numer = parts.neg && whole === 0 ? -Math.abs(n) : Math.abs(n)
    emit.current({ kind: 'fraction', whole, n: numer, d })
  }, [parts, emit])
  const push = (key: string) => {
    setParts((current) => {
      const target = field === 'w' ? 'w' : field
      if (key === 'sign') return { ...current, neg: !current.neg }
      if (key === 'clear') return { ...current, [target]: '' }
      if (key === 'back') return { ...current, [target]: current[target].slice(0, -1) }
      if (key === 'dec' || current[target].length >= 3) return current
      return { ...current, [target]: `${current[target]}${key}` }
    })
  }
  useKeys(push, true)
  return (
    <div>
      <div className="fraction-entry">
        {response.allowNegative ? <button type="button" onClick={() => push('sign')}>{parts.neg ? '−' : '+'}</button> : null}
        {response.allowWhole ? (
          <button type="button" data-hot={field === 'w'} className="frac" onClick={() => setField('w')}><b><Typed text={parts.w} empty="0" /></b></button>
        ) : null}
        <span className="frac">
          <b><button type="button" data-hot={field === 'n'} onClick={() => setField('n')}><Typed text={parts.n} empty={t(locale, 'widget.num')} /></button></b>
          <i><button type="button" data-hot={field === 'd'} onClick={() => setField('d')}><Typed text={parts.d} empty={t(locale, 'widget.den')} /></button></i>
        </span>
      </div>
      <p className="fine hot-caption">{t(locale, 'widget.editing', { part: field === 'w' ? t(locale, 'widget.whole') : field === 'd' ? t(locale, 'widget.den') : t(locale, 'widget.num') })}</p>
      <Pad locale={locale} allowNegative={response.allowNegative} onKey={push} />
    </div>
  )
}

function ChoiceWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'choice' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: string }) {
  const [id, setId] = useState(initial)
  return (
    <div className="stack">
      {response.options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="choice"
          data-on={id === option.id}
          onClick={() => {
            setId(option.id)
            onChange({ kind: 'choice', id: option.id })
          }}
        >
          {option.shape ? <ShapeFig shape={option.shape} parts={option.parts} shaded={option.shaded} uneven={option.uneven} /> : null}
          <MathText text={tx(locale, option.label)} />
        </button>
      ))}
    </div>
  )
}

function CompareWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'compare' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: '<' | '=' | '>' | null }) {
  const [sign, setSign] = useState(initial)
  return (
    <div>
      <div className="expr"><MathText text={tx(locale, response.left)} /><span>{sign ?? '?'}</span><MathText text={tx(locale, response.right)} /></div>
      <div className="signs">
        {(['<', '=', '>'] as const).map((item) => (
          <button key={item} type="button" className="sign" data-on={sign === item} onClick={() => { setSign(item); onChange({ kind: 'compare', sign: item }) }}>{item}</button>
        ))}
      </div>
    </div>
  )
}

function OrderWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'order' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: string[] | null }) {
  const [ids, setIds] = useState(initial ?? response.items.map((item) => item.id))
  const emit = useEmit(onChange)
  useEffect(() => { emit.current({ kind: 'order', ids }) }, [ids, emit])
  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir
    if (next < 0 || next >= ids.length) return
    const copy = [...ids]
    const swap = copy[index]
    copy[index] = copy[next]
    copy[next] = swap
    setIds(copy)
  }
  return (
    <div className="stack">
      {ids.map((id, index) => {
        const item = response.items.find((entry) => entry.id === id)
        return (
          <div key={id} className="row">
            <div className="order-item" style={{ flex: 1 }}><MathText text={item ? tx(locale, item.label) : id} /></div>
            <button type="button" className="icon-btn" onClick={() => move(index, -1)} aria-label="up">↑</button>
            <button type="button" className="icon-btn" onClick={() => move(index, 1)} aria-label="down">↓</button>
          </div>
        )
      })}
    </div>
  )
}

function LineWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'numberline' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: number | null }) {
  const [value, setValue] = useState<number | null>(initial)
  const setFrom = (clientX: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const raw = response.min + ratio * (response.max - response.min)
    const steps = Math.round((raw - response.min) / response.step)
    const snapped = Math.min(response.max, Math.max(response.min, response.min + steps * response.step))
    const clean = Number(snapped.toFixed(4))
    setValue(clean)
    onChange({ kind: 'number', value: clean })
  }
  const x = value == null ? 20 : 20 + ((value - response.min) / (response.max - response.min)) * 280
  return (
    <svg viewBox="0 0 320 80" width="100%" style={{ touchAction: 'none' }}
      onPointerDown={(event) => setFrom(event.clientX, event.currentTarget)}
      onPointerMove={(event) => { if (event.buttons) setFrom(event.clientX, event.currentTarget) }}>
      <line x1="20" y1="40" x2="300" y2="40" stroke="currentColor" strokeWidth="3" />
      {/* The marker glides to each new place. Before the first tap it is a dashed ring at the start, so the line clearly needs a tap. */}
      <g className="nl-track" style={{ transform: `translateX(${x - 20}px)` }}>
        <circle cx="20" cy="40" r="12" className={value == null ? 'nl-marker unset' : 'nl-marker'} />
      </g>
      <text x="160" y="72" textAnchor="middle" fontSize="14">{value == null ? t(locale, 'widget.tapLine') : value}</text>
    </svg>
  )
}

function PlaneWidget({ response, locale, onChange, initial, reveal }: { response: Extract<Response, { type: 'coordinate' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: { x: number; y: number } | null; reveal?: { x: number; y: number }[] }) {
  const [point, setPoint] = useState(initial)
  // Each tap leaves a ripple where it landed. The counter gives every ripple its own key, so it replays on each tap.
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null)
  const taps = useRef(0)
  const map = planeMap(response.xMin, response.xMax, response.yMin, response.yMax)
  // The crosshair runs to the axes, or to the nearest edge when the plane does not reach an axis.
  const axisX = map.sx(Math.min(Math.max(0, response.xMin), response.xMax))
  const axisY = map.sy(Math.min(Math.max(0, response.yMin), response.yMax))
  const pick = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const raw = map.fromPixel(((event.clientX - rect.left) / rect.width) * map.w, ((event.clientY - rect.top) / rect.height) * map.h)
    const next = {
      x: Math.min(response.xMax, Math.max(response.xMin, raw.x)),
      y: Math.min(response.yMax, Math.max(response.yMin, raw.y)),
    }
    setPoint(next)
    taps.current += 1
    setRipple({ x: map.sx(next.x), y: map.sy(next.y), id: taps.current })
    onChange({ kind: 'points', points: [next] })
  }
  return (
    <div>
      <PlaneGrid xMin={response.xMin} xMax={response.xMax} yMin={response.yMin} yMax={response.yMax} onPointerDown={pick}>
        {point ? (
          <g>
            <line className="plane-cross" x1={map.sx(point.x)} y1={map.sy(point.y)} x2={map.sx(point.x)} y2={axisY} />
            <line className="plane-cross" x1={map.sx(point.x)} y1={map.sy(point.y)} x2={axisX} y2={map.sy(point.y)} />
            <circle cx={map.sx(point.x)} cy={map.sy(point.y)} r="7" fill="#e25b45" />
          </g>
        ) : null}
        {ripple ? <circle key={ripple.id} className="plane-ripple" cx={ripple.x} cy={ripple.y} r="7" /> : null}
        {reveal?.map((target, index) => (
          <circle key={`reveal-${index}`} cx={map.sx(target.x)} cy={map.sy(target.y)} r="12" fill="none" stroke="#2f9e44" strokeWidth="3" strokeDasharray="5 4" />
        ))}
      </PlaneGrid>
      <p className="fine plane-readout">{point ? `${t(locale, 'widget.mine')}: (${point.x}, ${point.y})` : t(locale, 'widget.tapPlane')}</p>
    </div>
  )
}

function ShadeWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'shade' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: number }) {
  const total = response.rows * response.cols
  const [on, setOn] = useState<boolean[]>(() => Array.from({ length: total }, (_, index) => index < initial))
  const toggle = (index: number) => {
    const next = [...on]
    next[index] = !next[index]
    setOn(next)
    onChange({ kind: 'shade', count: next.filter(Boolean).length })
  }
  return (
    <div>
      <div className="fine">{t(locale, 'widget.shaded', { n: on.filter(Boolean).length })}</div>
      <ShadeBar rows={response.rows} cols={response.cols} on={on} locale={locale} onToggle={toggle} />
    </div>
  )
}

function ClockWidget({ locale, onChange, initial }: { locale: Locale; onChange: (answer: Answer | null) => void; initial: { h: number; m: number } | null }) {
  const [hand, setHand] = useState<'h' | 'm'>('m')
  const [time, setTime] = useState(initial ?? { h: 12, m: 0 })
  const emit = useEmit(onChange)
  const handRef = useRef(hand)
  handRef.current = hand
  const apply = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI
    if (deg < 0) deg += 360
    setTime((current) => {
      const next = handRef.current === 'm'
        ? { ...current, m: Math.round(deg / 6) % 60 }
        : { ...current, h: Math.round(deg / 30) % 12 || 12 }
      emit.current({ kind: 'clock', ...next })
      return next
    })
  }
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button type="button" className="chip" data-on={hand === 'h'} onClick={() => setHand('h')}>{t(locale, 'widget.hours')}</button>
        <button type="button" className="chip" data-on={hand === 'm'} onClick={() => setHand('m')}>{t(locale, 'widget.minutes')}</button>
      </div>
      <div style={{ touchAction: 'none', display: 'inline-block' }} onPointerDown={apply} onPointerMove={(event) => { if (event.buttons) apply(event) }}>
        <ClockFace h={time.h} m={time.m} interactive />
      </div>
      <div className="entry">{time.h}:{String(time.m).padStart(2, '0')}</div>
    </div>
  )
}

function ChartWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'chart-build' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: Extract<Answer, { kind: 'chart' }> | null }) {
  const [values, setValues] = useState(initial?.values ?? response.labels.map(() => 0))
  const [colors, setColors] = useState(response.labels.map((_, index) => initial?.colors?.[index] || PALETTE[index % PALETTE.length].hex))
  const [axis, setAxis] = useState(initial?.axisMax || response.axisChoices[0] || 10)
  const [size, setSize] = useState<'s' | 'm' | 'l'>('m')
  const [style, setStyle] = useState<'bar' | 'line'>('bar')
  const [active, setActive] = useState(0)
  const emit = useEmit(onChange)
  useEffect(() => {
    emit.current({ kind: 'chart', values, colors, axisMax: axis, axisAtLeast: 0 })
  }, [values, colors, axis, emit])
  const height = size === 's' ? 120 : size === 'l' ? 260 : 180
  const paint = (index: number, clientY: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (rect.bottom - clientY) / rect.height))
    const value = Math.round(ratio * axis)
    setValues((current) => current.map((item, i) => (i === index ? Math.min(response.maxValue, value) : item)))
    setActive(index)
  }
  return (
    <div>
      <div className="row">
        <span className="fine">{t(locale, 'widget.axis')}</span>
        {response.axisChoices.map((choice) => <button key={choice} type="button" className="chip" data-on={axis === choice} onClick={() => setAxis(choice)}>{choice}</button>)}
      </div>
      <div className="row">
        <span className="fine">{t(locale, 'widget.size')}</span>
        {(['s', 'm', 'l'] as const).map((item) => <button key={item} type="button" className="chip" data-on={size === item} onClick={() => setSize(item)}>{t(locale, `size.${item}`)}</button>)}
        <button type="button" className="chip" data-on={style === 'bar'} onClick={() => setStyle('bar')}>{t(locale, 'widget.bars')}</button>
        <button type="button" className="chip" data-on={style === 'line'} onClick={() => setStyle('line')}>{t(locale, 'widget.line')}</button>
      </div>
      <div className="chart-frame">
        <div className="y-axis" style={{ height }} aria-hidden="true">
          <span>{axis}</span>
          <span>{Math.round(axis / 2)}</span>
          <span>0</span>
        </div>
        <div className={style === 'line' ? 'chart line-mode' : 'chart'} style={{ ['--chart-h' as string]: `${height}px` }}>
        {values.map((value, index) => (
          <div className="bar-col" key={index}>
            <div className="bar-hit" onPointerDown={(event) => paint(index, event.clientY, event.currentTarget)} onPointerMove={(event) => { if (event.buttons) paint(index, event.clientY, event.currentTarget) }}>
              <div className="bar-fill" style={{ height: `${axis ? (value / axis) * 100 : 0}%`, background: colors[index], opacity: style === 'line' ? 0.35 : 1 }} />
            </div>
            <b>{value}</b>
            <small>{tx(locale, response.labels[index])}</small>
          </div>
        ))}
        </div>
      </div>
      <div className="row">
        {PALETTE.map((color) => (
          <button key={color.id} type="button" className={colors[active] === color.hex ? 'swatch on' : 'swatch'} style={{ background: color.hex }} onClick={() => setColors((current) => current.map((item, index) => index === active ? color.hex : item))} aria-label={color.id} />
        ))}
      </div>
    </div>
  )
}

function AngleWidget({ onChange, initial }: { onChange: (answer: Answer | null) => void; initial: number }) {
  const [degrees, setDegrees] = useState(initial)
  const emit = useEmit(onChange)
  useEffect(() => { emit.current({ kind: 'angle', degrees }) }, [degrees, emit])
  const setFrom = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 240
    const y = ((event.clientY - rect.top) / rect.height) * 140
    const rad = Math.atan2(110 - y, x - 30)
    const next = Math.min(180, Math.max(0, Math.round((rad * 180) / Math.PI)))
    setDegrees(next)
    onChange({ kind: 'angle', degrees: next })
  }
  const rad = (degrees * Math.PI) / 180
  return (
    <div>
      <svg viewBox="0 0 240 140" width="100%" style={{ touchAction: 'none' }} onPointerDown={setFrom} onPointerMove={(event) => { if (event.buttons) setFrom(event) }}>
        <line x1="30" y1="110" x2="210" y2="110" stroke="currentColor" strokeWidth="3" />
        <line x1="30" y1="110" x2={30 + Math.cos(rad) * 110} y2={110 - Math.sin(rad) * 110} stroke="#e25b45" strokeWidth="4" />
      </svg>
      <div className="entry">{degrees}°</div>
    </div>
  )
}

function RatioWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'ratio' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: Extract<Answer, { kind: 'ratio' }> | null }) {
  const [pair, setPair] = useState(initial ? [initial.a, initial.b] : [1, 1])
  const emit = useEmit(onChange)
  useEffect(() => {
    emit.current(pair[0] > 0 && pair[1] > 0 ? { kind: 'ratio', a: pair[0], b: pair[1] } : null)
  }, [pair, emit])
  return (
    <div className="ratio">
      {[0, 1].map((side) => (
        <div key={side}>
          <div className="blocks">
            {Array.from({ length: pair[side] }, (_, index) => <div key={index} className="block on" style={{ width: 28, background: side ? '#0f766e' : '#e25b45' }} />)}
          </div>
          <div className="row">
            <button type="button" className="icon-btn" onClick={() => setPair((current) => current.map((value, index) => index === side ? Math.max(1, value - 1) : value) as [number, number])}>−</button>
            <b>{pair[side]}</b>
            <button type="button" className="icon-btn" onClick={() => setPair((current) => current.map((value, index) => index === side ? Math.min(response.max, value + 1) : value) as [number, number])}>+</button>
          </div>
        </div>
      ))}
      <div className="fine">{locale === 'de' ? 'Beide Seiten dürfen wachsen.' : locale === 'es' ? 'Los dos lados pueden crecer.' : 'Both sides can grow.'}</div>
    </div>
  )
}

function DigitsWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'digits' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: number[] | null }) {
  const [digits, setDigits] = useState(initial ?? response.columns.map(() => 0))
  const [active, setActive] = useState(0)
  const emit = useEmit(onChange)
  useEffect(() => { emit.current({ kind: 'digits', digits }) }, [digits, emit])
  const push = (key: string) => {
    if (!/^\d$/.test(key)) return
    setDigits((current) => current.map((digit, index) => index === active ? Number(key) : digit))
    setActive((index) => Math.min(response.columns.length - 1, index + 1))
  }
  useKeys(push, true)
  return (
    <div>
      <div className="row" style={{ justifyContent: 'center' }}>
        {response.columns.map((column, index) => (
          <button key={index} type="button" className="choice" data-on={active === index} onClick={() => setActive(index)}>
            <small>{tx(locale, column)}</small>
            <div className="score-num">{digits[index]}</div>
          </button>
        ))}
      </div>
      <Pad locale={locale} onKey={push} />
    </div>
  )
}

function MultiWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'multi' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: Record<string, number> | null }) {
  const [texts, setTexts] = useState<Record<string, string>>(() => {
    if (!initial) return {}
    return Object.fromEntries(Object.entries(initial).map(([key, value]) => [key, String(value)]))
  })
  const [active, setActive] = useState(response.fields[0]?.id ?? '')
  const field = response.fields.find((item) => item.id === active) ?? response.fields[0]
  const push = (key: string) => {
    setTexts((current) => {
      const prev = current[active] ?? ''
      let next = prev
      if (key === 'back') next = prev.slice(0, -1)
      else if (key === 'clear') next = ''
      else if (key === 'sign') next = prev.startsWith('-') ? prev.slice(1) : `-${prev}`
      else if (key === 'dec') next = prev.includes('.') ? prev : `${prev || '0'}.`
      else if (/^\d$/.test(key)) next = `${prev}${key}`
      const merged = { ...current, [active]: next }
      const parts: Record<string, number> = {}
      let ready = true
      for (const item of response.fields) {
        const value = parseNumeric(merged[item.id] ?? '')
        if (value == null) ready = false
        else parts[item.id] = value
      }
      onChange(ready ? { kind: 'multi', parts } : null)
      return merged
    })
  }
  useKeys(push, true)
  return (
    <div>
      <div className="row">
        {response.fields.map((item) => (
          <button key={item.id} type="button" className="choice" data-on={active === item.id} onClick={() => setActive(item.id)}>
            <small>{tx(locale, item.label)}</small>
            <b>{(texts[item.id] ?? '').replace('.', decimalKey(locale)) || '—'}</b>
          </button>
        ))}
      </div>
      {field ? <Pad locale={locale} allowDecimal={field.allowDecimal} allowNegative={field.allowNegative} onKey={push} /> : null}
    </div>
  )
}
