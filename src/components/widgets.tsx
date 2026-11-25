import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type { Answer, Locale, Response } from '../lib/types'
import { PALETTE } from '../lib/types'
import { decimalKey, t, tx } from '../lib/i18n'
import { formatNumber } from '../lib/math'
import { MathText } from './MathText'
import { ShadeBar } from './ShadeBar'
import { ClockFace, PlaneGrid, ShapeFig, planeMap } from './visuals'

function useKeys(onKey: (key: string) => void, enabled: boolean) {
  const ref = useRef(onKey)
  ref.current = onKey
  useEffect(() => {
    if (!enabled) return
    const listen = (event: KeyboardEvent) => {
      if (document.querySelector('[data-answer-lock]')) return
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.key === 'Backspace') ref.current('back')
      else if (event.key === '-' || event.key === '±') ref.current('sign')
      else if (event.key === '.' || event.key === ',') ref.current('dec')
      else if (event.key === '/' || event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') ref.current(event.key)
      else if (event.key === '<' || event.key === '=' || event.key === '>') ref.current(event.key)
      else if (/^\d$/.test(event.key)) ref.current(event.key)
    }
    window.addEventListener('keydown', listen)
    return () => window.removeEventListener('keydown', listen)
  }, [enabled])
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
// One wrapper keeps the whole string a single box, so a grid or flex parent cannot drop the last digit onto its own row.
function Typed({ text, empty = ' ' }: { text: string; empty?: string }) {
  if (!text) return <>{empty}</>
  return (
    <span className="typed">
      {text.slice(0, -1)}
      <span key={text.length} className="digit-pop">{text.slice(-1)}</span>
    </span>
  )
}

function longMark(length: number) {
  if (length >= 13) return '2'
  if (length >= 9) return '1'
  return undefined
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

function applyNumber(current: string, key: string, allowDecimal?: boolean, allowNegative?: boolean) {
  if (key === 'clear') return ''
  if (key === 'back') return current.slice(0, -1)
  if (key === 'sign') return allowNegative ? (current.startsWith('-') ? current.slice(1) : `-${current}`) : current
  if (key === 'dec') return !allowDecimal || current.includes('.') ? current : `${current || '0'}.`
  if (!/^\d$/.test(key)) return current
  // Fifteen places is the longest whole number the games build, plus one digit when rounding climbs to the next place.
  if (current.replace('-', '').replace('.', '').length >= 16) return current
  return `${current}${key}`
}

function NumberWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'number' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: number | null }) {
  const [text, setText] = useState(initial == null ? '' : String(initial))
  const emit = useEmit(onChange)
  const push = (key: string) => setText((current) => applyNumber(current, key, response.allowDecimal, response.allowNegative))
  useEffect(() => {
    const value = parseNumeric(text)
    if (!response.allowNegative && text.startsWith('-')) emit.current(null)
    else emit.current(value == null ? null : { kind: 'number', value })
  }, [text, response.allowNegative, emit])
  useKeys(push, true)
  const shown = text.replace('.', decimalKey(locale))
  return (
    <div>
      <div className="entry num" data-long={longMark(shown.length)}><Typed text={shown} /></div>
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
    if (key === '/' || key === 'ArrowDown') {
      setField((cur) => (cur === 'w' ? 'n' : 'd'))
      return
    }
    if (key === 'ArrowUp') {
      setField((cur) => (cur === 'd' ? 'n' : response.allowWhole ? 'w' : 'n'))
      return
    }
    setParts((current) => {
      const target = field === 'w' ? 'w' : field
      if (key === 'sign') return response.allowNegative ? { ...current, neg: !current.neg } : current
      if (key === 'clear') return { ...current, [target]: '' }
      if (key === 'back') return { ...current, [target]: current[target].slice(0, -1) }
      if (!/^\d$/.test(key) || current[target].length >= 5) return current
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
  const pick = (item: '<' | '=' | '>') => {
    setSign(item)
    onChange({ kind: 'compare', sign: item })
  }
  useKeys((key) => {
    if (key === '<' || key === '=' || key === '>') pick(key)
  }, true)
  return (
    <div>
      <div className="expr"><MathText text={tx(locale, response.left)} /><span>{sign ?? '?'}</span><MathText text={tx(locale, response.right)} /></div>
      <div className="signs">
        {(['<', '=', '>'] as const).map((item) => (
          <button key={item} type="button" className="sign" data-on={sign === item} onClick={() => pick(item)}>{item}</button>
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
            <button type="button" className="icon-btn" disabled={index === 0} onClick={() => move(index, -1)} aria-label={t(locale, 'test.up')}>↑</button>
            <button type="button" className="icon-btn" disabled={index === ids.length - 1} onClick={() => move(index, 1)} aria-label={t(locale, 'test.down')}>↓</button>
          </div>
        )
      })}
    </div>
  )
}

function LineWidget({ response, locale, onChange, initial }: { response: Extract<Response, { type: 'numberline' }>; locale: Locale; onChange: (answer: Answer | null) => void; initial: number | null }) {
  const [value, setValue] = useState<number | null>(initial)
  const span = response.max - response.min
  const stepCount = response.step > 0 ? Math.round(span / response.step) : 0
  const commit = (raw: number) => {
    const steps = Math.round((raw - response.min) / response.step)
    const snapped = Math.min(response.max, Math.max(response.min, response.min + steps * response.step))
    const clean = Number(snapped.toFixed(4))
    setValue(clean)
    onChange({ kind: 'number', value: clean })
  }
  const setFrom = (clientX: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect()
    const svgX = ((clientX - rect.left) / rect.width) * 320
    const ratio = Math.min(1, Math.max(0, (svgX - 20) / 280))
    commit(response.min + ratio * span)
  }
  useKeys((key) => {
    if (key === 'ArrowLeft') commit((value ?? response.min) - response.step)
    else if (key === 'ArrowRight') commit((value ?? response.min) + response.step)
  }, true)
  const formatVal = (v: number) => {
    if (response.fraction && response.step > 0) {
      const den = Math.round(1 / response.step)
      const num = Math.round(v * den)
      if (num === 0) return '0'
      if (num === den) return '1'
      return `${num}/${den}`
    }
    return Number.isInteger(v) ? formatNumber(locale, v) : formatNumber(locale, v)
  }
  const x = value == null ? 20 : 20 + ((value - response.min) / span) * 280
  const ticks = stepCount > 0 && stepCount <= 24 ? Array.from({ length: stepCount + 1 }, (_, i) => i) : [0, 1]
  return (
    <svg viewBox="0 0 320 82" width="100%" style={{ touchAction: 'none', cursor: 'pointer' }}
      onPointerDown={(event) => setFrom(event.clientX, event.currentTarget)}
      onPointerMove={(event) => { if (event.buttons) setFrom(event.clientX, event.currentTarget) }}>
      <line x1="20" y1="40" x2="300" y2="40" stroke="currentColor" strokeWidth="3" />
      {ticks.map((i) => {
        const txPos = stepCount > 0 && stepCount <= 24 ? 20 + (i / stepCount) * 280 : i === 0 ? 20 : 300
        const major = i === 0 || i === ticks.length - 1
        return <line key={i} x1={txPos} y1={major ? 30 : 34} x2={txPos} y2={major ? 50 : 46} stroke="currentColor" strokeWidth={major ? 2.5 : 1.5} opacity={major ? 1 : 0.55} />
      })}
      <text x="20" y="18" textAnchor="start" fontSize="11" fill="currentColor">{Number.isInteger(response.min) ? formatNumber(locale, response.min) : formatNumber(locale, response.min)}</text>
      <text x="300" y="18" textAnchor="end" fontSize="11" fill="currentColor">{Number.isInteger(response.max) ? formatNumber(locale, response.max) : formatNumber(locale, response.max)}</text>
      {/* The marker glides to each new place. Before the first tap it is a dashed ring at the start, so the line clearly needs a tap. */}
      <g className="nl-track" style={{ transform: `translateX(${x - 20}px)` }}>
        <circle cx="20" cy="40" r="11" className={value == null ? 'nl-marker unset' : 'nl-marker'} />
      </g>
      <text x="160" y="74" textAnchor="middle" fontSize="14" fill="currentColor">{value == null ? t(locale, 'widget.tapLine') : formatVal(value)}</text>
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
  const pick = (event: ReactPointerEvent<SVGSVGElement>, withRipple = true) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const raw = map.fromPixel(((event.clientX - rect.left) / rect.width) * map.w, ((event.clientY - rect.top) / rect.height) * map.h)
    const next = {
      x: Math.min(response.xMax, Math.max(response.xMin, raw.x)),
      y: Math.min(response.yMax, Math.max(response.yMin, raw.y)),
    }
    setPoint(next)
    if (withRipple) {
      taps.current += 1
      setRipple({ x: map.sx(next.x), y: map.sy(next.y), id: taps.current })
    }
    onChange({ kind: 'points', points: [next] })
  }
  return (
    <div>
      <PlaneGrid xMin={response.xMin} xMax={response.xMax} yMin={response.yMin} yMax={response.yMax} onPointerDown={(e) => pick(e, true)} onPointerMove={(e) => { if (e.buttons) pick(e, false) }}>
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
  useEffect(() => {
    emit.current({ kind: 'clock', ...time })
  }, [time, emit])
  const apply = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI
    if (deg < 0) deg += 360
    setTime((current) => handRef.current === 'm'
      ? { ...current, m: Math.round(deg / 6) % 60 }
      : { ...current, h: Math.round(deg / 30) % 12 || 12 })
  }
  const nudge = (delta: number) => {
    setTime((current) => hand === 'm'
      ? { ...current, m: (current.m + delta + 60) % 60 }
      : { ...current, h: ((current.h - 1 + delta + 12) % 12) + 1 })
  }
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button type="button" className="chip" data-on={hand === 'h'} onClick={() => setHand('h')}>{t(locale, 'widget.hours')}</button>
        <button type="button" className="chip" data-on={hand === 'm'} onClick={() => setHand('m')}>{t(locale, 'widget.minutes')}</button>
      </div>
      <div style={{ touchAction: 'none', display: 'inline-block', cursor: 'pointer' }} onPointerDown={apply} onPointerMove={(event) => { if (event.buttons) apply(event) }}>
        <ClockFace h={time.h} m={time.m} interactive />
      </div>
      <div className="entry">{time.h}:{String(time.m).padStart(2, '0')}</div>
      <div className="row" style={{ justifyContent: 'center' }}>
        {hand === 'm' ? <button type="button" className="chip" onClick={() => nudge(-5)}>−5</button> : null}
        <button type="button" className="chip" onClick={() => nudge(-1)}>−1</button>
        <button type="button" className="chip" onClick={() => nudge(1)}>+1</button>
        {hand === 'm' ? <button type="button" className="chip" onClick={() => nudge(5)}>+5</button> : null}
      </div>
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
  const height = size === 's' ? 120 : size === 'l' ? 240 : 170
  const paint = (index: number, clientY: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (rect.bottom - clientY) / rect.height))
    const step = response.step && response.step > 0 ? response.step : 1
    const value = Math.round((ratio * axis) / step) * step
    setValues((current) => current.map((item, i) => (i === index ? Math.min(response.maxValue, value) : item)))
    setActive(index)
  }
  const linePoints = values.map((v, i) => {
    const x = values.length <= 1 ? 50 : ((i + 0.5) / values.length) * 100
    const y = 100 - Math.min(100, axis ? (v / axis) * 100 : 0)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
  return (
    <div>
      <div className="row">
        <span className="fine">{t(locale, 'widget.axis')}</span>
        {response.axisChoices.map((choice) => <button key={choice} type="button" className="chip" data-on={axis === choice} onClick={() => setAxis(choice)}>{choice}</button>)}
      </div>
      <div className="row" style={{ marginTop: 6 }}>
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
        <div className={style === 'line' ? 'chart line-mode' : 'chart'} style={{ ['--chart-h' as string]: `${height}px`, position: 'relative' }}>
          {style === 'line' && values.length > 1 ? (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', inset: '8px 4px 36px', width: 'calc(100% - 8px)', height: 'calc(100% - 44px)', pointerEvents: 'none', zIndex: 1 }}>
              <polyline points={linePoints} fill="none" stroke="var(--teal)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </svg>
          ) : null}
          {values.map((value, index) => (
            <div className="bar-col" key={index} data-on={active === index} onClick={() => setActive(index)}>
              <div className="bar-hit" onPointerDown={(event) => paint(index, event.clientY, event.currentTarget)} onPointerMove={(event) => { if (event.buttons) paint(index, event.clientY, event.currentTarget) }}>
                <div className="bar-fill" style={{ height: `${Math.min(100, axis ? (value / axis) * 100 : 0)}%`, background: colors[index], opacity: style === 'line' ? 0.3 : 1 }} />
              </div>
              <b>{value}</b>
              <small>{tx(locale, response.labels[index])}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <button type="button" className="icon-btn" aria-label={t(locale, 'widget.lower')} onClick={() => {
          const step = response.step && response.step > 0 ? response.step : 1
          setValues((current) => current.map((item, index) => index === active ? Math.max(0, item - step) : item))
        }}>−</button>
        <button type="button" className="icon-btn" aria-label={t(locale, 'widget.raise')} onClick={() => {
          const step = response.step && response.step > 0 ? response.step : 1
          setValues((current) => current.map((item, index) => index === active ? Math.min(response.maxValue, item + step) : item))
        }}>+</button>
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
    const rad = Math.atan2(110 - y, x - 120)
    const next = Math.min(180, Math.max(0, Math.round((rad * 180) / Math.PI)))
    setDegrees(next)
  }
  const nudge = (delta: number) => setDegrees((d) => Math.min(180, Math.max(0, d + delta)))
  const rad = (degrees * Math.PI) / 180
  const rx = 120 + Math.cos(rad) * 90
  const ry = 110 - Math.sin(rad) * 90
  const arcX = 120 + Math.cos(rad) * 28
  const arcY = 110 - Math.sin(rad) * 28
  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 240 140" width="100%" style={{ maxWidth: 320, touchAction: 'none', cursor: 'pointer' }} onPointerDown={setFrom} onPointerMove={(event) => { if (event.buttons) setFrom(event) }}>
        <path d="M30 110 A90 90 0 0 1 210 110" fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="4 4" />
        {[0, 30, 60, 90, 120, 150, 180].map((mark) => {
          const a = (mark * Math.PI) / 180
          return <line key={mark} x1={120 + Math.cos(a) * 84} y1={110 - Math.sin(a) * 84} x2={120 + Math.cos(a) * 92} y2={110 - Math.sin(a) * 92} stroke="var(--ink-soft)" strokeWidth="1.5" />
        })}
        {degrees > 0 ? <path d={`M148 110 A28 28 0 0 0 ${arcX.toFixed(1)} ${arcY.toFixed(1)}`} fill="none" stroke="#e25b45" strokeWidth="2.5" opacity="0.55" /> : null}
        <line x1="120" y1="110" x2="210" y2="110" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="120" y1="110" x2={rx} y2={ry} stroke="#e25b45" strokeWidth="4" strokeLinecap="round" />
        <circle cx="120" cy="110" r="4.5" fill="currentColor" />
      </svg>
      <div className="entry">{degrees}°</div>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button type="button" className="chip" onClick={() => nudge(-5)}>−5°</button>
        <button type="button" className="chip" onClick={() => nudge(-1)}>−1°</button>
        <button type="button" className="chip" onClick={() => nudge(1)}>+1°</button>
        <button type="button" className="chip" onClick={() => nudge(5)}>+5°</button>
      </div>
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
  const chart = useRef<HTMLDivElement>(null)
  const emit = useEmit(onChange)
  useEffect(() => { emit.current({ kind: 'digits', digits }) }, [digits, emit])
  useEffect(() => {
    const scroller = chart.current
    const cell = scroller?.querySelector<HTMLElement>('[data-on="true"]')
    if (!scroller || !cell) return
    const box = scroller.getBoundingClientRect()
    const item = cell.getBoundingClientRect()
    if (item.left < box.left - 1 || item.right > box.right + 1) {
      scroller.scrollBy({ left: item.left - box.left - (box.width - item.width) / 2, behavior: 'smooth' })
    }
  }, [active])
  const push = (key: string) => {
    if (key === 'clear') {
      setDigits(response.columns.map(() => 0))
      setActive(0)
      return
    }
    if (key === 'back') {
      setDigits((current) => current.map((digit, index) => index === active ? 0 : digit))
      setActive((index) => Math.max(0, index - 1))
      return
    }
    if (key === 'ArrowLeft') {
      setActive((index) => Math.max(0, index - 1))
      return
    }
    if (key === 'ArrowRight') {
      setActive((index) => Math.min(response.columns.length - 1, index + 1))
      return
    }
    if (!/^\d$/.test(key)) return
    setDigits((current) => current.map((digit, index) => index === active ? Number(key) : digit))
    setActive((index) => Math.min(response.columns.length - 1, index + 1))
  }
  useKeys(push, true)
  return (
    <div>
      <div className="place-chart" ref={chart}>
        {response.columns.map((column, index) => (
          <button key={index} type="button" className="place-col" data-on={active === index} onClick={() => setActive(index)}>
            <small>{tx(locale, column)}</small>
            <span className="place-digit">{digits[index]}</span>
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
  const emit = useEmit(onChange)
  useEffect(() => {
    const parts: Record<string, number> = {}
    let ready = true
    for (const item of response.fields) {
      const value = parseNumeric(texts[item.id] ?? '')
      if (value == null) ready = false
      else parts[item.id] = value
    }
    emit.current(ready ? { kind: 'multi', parts } : null)
  }, [texts, response.fields, emit])
  const push = (key: string) => {
    if (!field) return
    setTexts((current) => {
      const prev = current[active] ?? ''
      const next = applyNumber(prev, key, field.allowDecimal, field.allowNegative)
      return next === prev ? current : { ...current, [active]: next }
    })
  }
  useKeys(push, true)
  return (
    <div>
      <div className="field-row">
        {response.fields.map((item) => {
          const shown = (texts[item.id] ?? '').replace('.', decimalKey(locale))
          return (
            <button key={item.id} type="button" className="field-card" data-on={active === item.id} data-long={longMark(shown.length)} onClick={() => setActive(item.id)}>
              <small>{tx(locale, item.label)}</small>
              <b>{shown || '—'}</b>
            </button>
          )
        })}
      </div>
      {field ? <Pad locale={locale} allowDecimal={field.allowDecimal} allowNegative={field.allowNegative} onKey={push} /> : null}
    </div>
  )
}
