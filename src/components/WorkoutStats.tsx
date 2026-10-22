import { useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { getSkill } from '../data/skills'
import { workoutSnapshot, type CalendarDay, type UnitTrack } from '../engine/workout'
import { t, tx } from '../lib/i18n'
import { localeTag } from '../lib/math'
import type { Heat } from '../lib/units'
import { unitTitle } from '../lib/units'
import { useStore } from '../state'

const DAY = 86400000
const W = 680
const H = 236
const PAD_L = 40
const PAD_R = 12
const PAD_T = 14
const PAD_B = 26

function percent(value: number | null) {
  return value == null ? '–' : `${Math.round(value * 100)}%`
}

function formatDay(day: number, locale: 'en' | 'de' | 'es', weekday: boolean) {
  return new Intl.DateTimeFormat(localeTag(locale), {
    weekday: weekday ? 'short' : undefined,
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(day * DAY))
}

function formatMonth(day: number, locale: 'en' | 'de' | 'es') {
  return new Intl.DateTimeFormat(localeTag(locale), { month: 'short', timeZone: 'UTC' }).format(new Date(day * DAY))
}

function weekdayLabels(locale: 'en' | 'de' | 'es') {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(2024, 0, 1 + index))
    return new Intl.DateTimeFormat(localeTag(locale), { weekday: 'short', timeZone: 'UTC' }).format(date).replace('.', '').slice(0, 2)
  })
}

function clock(ms: number, locale: 'en' | 'de' | 'es') {
  if (ms <= 0) return t(locale, 'work.time.mins', { n: 0 })
  const total = Math.max(1, Math.round(ms / 60000))
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  if (hours <= 0) return t(locale, 'work.time.mins', { n: total })
  return t(locale, 'work.time.hours', { h: hours, m: minutes })
}

function timeParts(ms: number) {
  const total = ms <= 0 ? 0 : Math.max(1, Math.round(ms / 60000))
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  if (hours <= 0) return { big: String(total), unit: 'min' as const }
  return { big: `${hours}:${String(minutes).padStart(2, '0')}`, unit: 'hour' as const }
}

function yAt(share: number) {
  const plotH = H - PAD_T - PAD_B
  return PAD_T + plotH * (1 - share)
}

function xAt(index: number, count: number) {
  const plotW = W - PAD_L - PAD_R
  if (count <= 1) return PAD_L + plotW / 2
  return PAD_L + (index / (count - 1)) * plotW
}

function linePath(values: (number | null)[], count: number) {
  let path = ''
  let drawing = false
  values.forEach((value, index) => {
    if (value == null) {
      drawing = false
      return
    }
    path += `${drawing ? 'L' : 'M'}${xAt(index, count).toFixed(1)} ${yAt(value).toFixed(1)} `
    drawing = true
  })
  return path
}

function heatRank(heat: Heat) {
  if (heat === 'red') return 0
  if (heat === 'yellow') return 1
  if (heat === 'green') return 2
  return 3
}

// With a long pin list, open the lines that still need work and leave the rest one tap away.
function defaultVisible(units: UnitTrack[]) {
  const map: Record<string, boolean> = {}
  if (units.length <= 6) {
    for (const unit of units) map[unit.key] = true
    return map
  }
  const picked = [...units].sort((a, b) => heatRank(a.heat) - heatRank(b.heat)).slice(0, 6)
  const on = new Set(picked.map((unit) => unit.key))
  for (const unit of units) {
    if (unit.heat === 'red' || unit.heat === 'yellow') on.add(unit.key)
    map[unit.key] = on.has(unit.key)
  }
  return map
}

function unitColor(index: number) {
  return `var(--wk-${(index % 8) + 1})`
}

export function WorkoutStats() {
  const { locale, data } = useStore()
  const attempts = data.attempts
  const pins = data.pins ?? []
  const snapshot = useMemo(() => workoutSnapshot(attempts, pins), [attempts, pins])
  const [focus, setFocus] = useState<number | null>(null)
  const [override, setOverride] = useState<Record<string, boolean>>({})
  const selected = focus ?? snapshot.today
  const defaults = defaultVisible(snapshot.units)
  const shown = (key: string) => (key in override ? override[key] : key === 'overall' ? true : defaults[key] ?? false)
  const toggle = (key: string) => setOverride((current) => {
    const on = key in current ? current[key] : key === 'overall' ? true : defaults[key] ?? false
    return { ...current, [key]: !on }
  })

  const labels = weekdayLabels(locale)
  const day = snapshot.byDay.get(selected) ?? { count: 0, correct: 0, wrong: 0, timeMs: 0 }
  const spent = timeParts(snapshot.timeMs)
  const share = snapshot.questions ? Math.round((snapshot.correct / snapshot.questions) * 100) : null
  const redShare = snapshot.questions ? Math.round((snapshot.wrong / snapshot.questions) * 100) : null
  const heatNote = snapshot.units.length === 0
    ? t(locale, 'work.stat.heat.nopins')
    : snapshot.red + snapshot.yellow > 0
      ? t(locale, 'work.stat.heat.split', { r: snapshot.red, y: snapshot.yellow })
      : snapshot.units.every((unit) => unit.heat === 'green')
        ? t(locale, 'work.stat.heat.clear')
        : t(locale, 'work.stat.heat.quiet')

  return (
    <div className="wk">
      <section className="card pad wk-card" aria-labelledby="wk-board">
        <div className="wk-head">
          <div>
            <h2 id="wk-board">{t(locale, 'work.board')}</h2>
            <p className="fine">{t(locale, 'work.cal.sub')}</p>
          </div>
        </div>
        <div className="wk-kpis">
          <article className="wk-kpi" data-tone="teal">
            <small>{t(locale, 'work.stat.days')}</small>
            <b>{snapshot.activeDays}</b>
            <span>{t(locale, 'work.stat.days.of', { n: snapshot.span })}</span>
          </article>
          <article className="wk-kpi" data-tone="indigo">
            <small>{t(locale, 'work.stat.questions')}</small>
            <b>{snapshot.questions}</b>
            <span>{share == null ? '–' : t(locale, 'work.stat.rate', { n: share })}</span>
          </article>
          <article className="wk-kpi" data-tone="teal">
            <small>{t(locale, 'work.stat.correct')}</small>
            <b>{snapshot.correct}</b>
            <span>{snapshot.questions ? t(locale, 'work.stat.of', { n: snapshot.questions }) : '–'}</span>
          </article>
          <article className="wk-kpi" data-tone="coral">
            <small>{t(locale, 'work.stat.wrong')}</small>
            <b>{snapshot.wrong}</b>
            <span>{redShare == null ? '–' : t(locale, 'work.stat.share', { n: redShare })}</span>
          </article>
          <article className="wk-kpi" data-tone="gold">
            <small>{t(locale, 'work.stat.time')}</small>
            <b>{spent.big}</b>
            <span>{t(locale, spent.unit === 'hour' ? 'work.time.unit.hour' : 'work.time.unit.min')}</span>
          </article>
        </div>
        <div className="wk-cal-row">
          <div className="wk-cal-wrap">
            <div className="wk-cal" style={{ ['--weeks' as string]: snapshot.weeks.length }} role="group" aria-label={t(locale, 'work.cal.aria')}>
              <span className="wk-corner" />
              {snapshot.weeks.map((week) => (
                <span key={`m-${week.days[0].day}`} className="wk-month" aria-hidden="true">
                  {week.labelDay == null ? '' : formatMonth(week.labelDay, locale)}
                </span>
              ))}
              {labels.map((label, dow) => (
                <DowRow
                  key={label + dow}
                  label={label}
                  dow={dow}
                  weeks={snapshot.weeks}
                  locale={locale}
                  selected={selected}
                  today={snapshot.today}
                  onPick={setFocus}
                />
              ))}
            </div>
            <div className="wk-scale" aria-hidden="true">
              <span>{t(locale, 'work.cal.less')}</span>
              {[0, 1, 2, 3, 4].map((level) => <i key={level} className="wk-pip" data-level={level} />)}
              <span>{t(locale, 'work.cal.more')}</span>
            </div>
          </div>
          <div className="wk-day">
            <small>{formatDay(selected, locale, true)}</small>
            <strong className="wk-today">{selected === snapshot.today ? t(locale, 'work.today') : ''}</strong>
            <b>{day.count}</b>
            <span className="wk-day-label">{day.count ? t(locale, 'work.cal.count') : t(locale, 'work.cal.rest')}</span>
            {day.count ? (
              <>
                <div className="wk-mix" aria-hidden="true">
                  <i className="ok" style={{ width: `${(day.correct / day.count) * 100}%` }} />
                  <i className="no" style={{ width: `${(day.wrong / day.count) * 100}%` }} />
                </div>
                <div className="wk-facts">
                  <span><b>{day.correct}</b> {t(locale, 'work.stat.correct')}</span>
                  <span><b>{day.wrong}</b> {t(locale, 'work.stat.wrong')}</span>
                  <span><b>{clock(day.timeMs, locale)}</b></span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <Progress
        locale={locale}
        snapshot={snapshot}
        selected={selected}
        shown={shown}
        onToggle={toggle}
        onPick={setFocus}
        heatNote={heatNote}
      />
    </div>
  )
}

function DowRow({
  label,
  dow,
  weeks,
  locale,
  selected,
  today,
  onPick,
}: {
  label: string
  dow: number
  weeks: { days: CalendarDay[] }[]
  locale: 'en' | 'de' | 'es'
  selected: number
  today: number
  onPick: (day: number) => void
}) {
  return (
    <>
      <span className="wk-dow" aria-hidden="true">{label}</span>
      {weeks.map((week) => {
        const cell = week.days[dow]
        if (!cell.inSpan) return <span key={cell.day} className="wk-pad" />
        const name = cell.count
          ? t(locale, 'work.cal.cell', { date: formatDay(cell.day, locale, true), n: cell.count, c: cell.correct, w: cell.wrong })
          : t(locale, 'work.cal.cell.empty', { date: formatDay(cell.day, locale, true) })
        return (
          <button
            key={cell.day}
            id={`wk-${cell.day}`}
            type="button"
            className="wk-cell"
            data-level={cell.level}
            data-today={cell.day === today}
            data-on={cell.day === selected}
            aria-label={name}
            aria-current={cell.day === selected ? 'date' : undefined}
            tabIndex={cell.day === selected ? 0 : -1}
            onPointerEnter={(event) => { if (event.pointerType === 'mouse') onPick(cell.day) }}
            onFocus={() => onPick(cell.day)}
            onClick={() => onPick(cell.day)}
            onKeyDown={(event) => moveDay(event, cell.day, onPick)}
          />
        )
      })}
    </>
  )
}

function moveDay(event: KeyboardEvent<HTMLButtonElement>, day: number, onPick: (day: number) => void) {
  const step = event.key === 'ArrowRight' ? 7 : event.key === 'ArrowLeft' ? -7 : event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
  if (!step) return
  event.preventDefault()
  const next = document.getElementById(`wk-${day + step}`)
  if (!(next instanceof HTMLElement)) return
  onPick(day + step)
  next.focus()
}

function Progress({
  locale,
  snapshot,
  selected,
  shown,
  onToggle,
  onPick,
  heatNote,
}: {
  locale: 'en' | 'de' | 'es'
  snapshot: ReturnType<typeof workoutSnapshot>
  selected: number
  shown: (key: string) => boolean
  onToggle: (key: string) => void
  onPick: (day: number) => void
  heatNote: string
}) {
  const index = Math.max(0, Math.min(snapshot.days.length - 1, selected - snapshot.first))
  const count = snapshot.days.length
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B
  const overallOn = shown('overall')
  const latestOverall = snapshot.overall[snapshot.overall.length - 1] ?? null
  const hasLine = snapshot.overall.some((value) => value != null) || snapshot.units.some((unit) => unit.values.some((value) => value != null))
  const tracks = snapshot.units.map((unit, order) => {
    const skill = getSkill(unit.skillId)
    const title = skill ? unitTitle(skill, unit.knobs) : null
    const name = title ? tx(locale, title) : skill ? tx(locale, skill.title) : unit.skillId
    return { unit, name, code: skill?.code ?? '', color: unitColor(order), on: shown(unit.key) }
  })
  const named = [
    { key: 'overall', name: t(locale, 'work.lines.overall'), color: 'var(--ink)', value: snapshot.overall[index] ?? null, on: overallOn },
    ...tracks.map((track) => ({ key: track.unit.key, name: track.name, color: track.color, value: track.unit.values[index] ?? null, on: track.on })),
  ].filter((item) => item.on && item.value != null)
  const tone = snapshot.red > 0 ? 'hot' : snapshot.yellow > 0 ? 'warm' : 'calm'

  function dayFrom(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    if (!rect.width) return null
    const x = ((event.clientX - rect.left) / rect.width) * W
    const t = (x - PAD_L) / plotW
    if (t < -0.04 || t > 1.04) return null
    const at = Math.max(0, Math.min(count - 1, Math.round(t * (count - 1))))
    return snapshot.days[at] ?? null
  }

  const marks = [0, Math.floor((count - 1) / 2), count - 1]

  return (
    <section className="card pad wk-card" aria-labelledby="wk-lines">
      <div className="wk-head">
        <div>
          <h2 id="wk-lines">{t(locale, 'work.lines.title')}</h2>
          <p className="fine">{t(locale, 'work.lines.sub')}</p>
        </div>
        <div className="wk-status" data-tone={tone}>
          <b>{snapshot.red + snapshot.yellow}</b>
          <span>
            {t(locale, 'work.stat.heat')}
            <small>{heatNote}</small>
          </span>
        </div>
      </div>

      <div className="wk-toggles">
        <button
          type="button"
          className="wk-toggle"
          data-on={overallOn}
          aria-pressed={overallOn}
          style={{ ['--swatch' as string]: 'var(--ink)' }}
          onClick={() => onToggle('overall')}
        >
          <i className="wk-swatch line" />
          <span className="wk-toggle-name">{t(locale, 'work.lines.overall')}</span>
          <em>{percent(latestOverall)}</em>
        </button>
        {tracks.map((track) => (
          <button
            key={track.unit.key}
            type="button"
            className="wk-toggle"
            data-on={track.on}
            aria-pressed={track.on}
            style={{ ['--swatch' as string]: track.color }}
            title={track.unit.rate == null ? `${track.code} · ${track.name}` : `${track.code} · ${track.name} · ${t(locale, 'work.rate', { n: Math.round((track.unit.rate ?? 0) * 100), m: track.unit.seen })}`}
            onClick={() => onToggle(track.unit.key)}
          >
            <i className="wk-swatch" />
            <span className="wk-toggle-name">{track.name}</span>
            {track.code ? <small>{track.code}</small> : null}
            <em data-heat={track.unit.heat}>{percent(track.unit.rate)}</em>
          </button>
        ))}
      </div>

      <div className="wk-readout">
        <b>{formatDay(selected, locale, true)}</b>
        <span className="wk-readout-meta">{(snapshot.byDay.get(selected)?.count ?? 0) ? t(locale, 'work.read.count', { n: snapshot.byDay.get(selected)?.count ?? 0 }) : t(locale, 'work.cal.rest')}</span>
        {named.map((item) => (
          <span key={item.key} className="wk-read">
            <i style={{ ['--swatch' as string]: item.color }} />
            {item.name}
            <strong>{percent(item.value)}</strong>
          </span>
        ))}
        {!named.length && (snapshot.byDay.get(selected)?.count ?? 0) > 0 ? <span className="wk-readout-meta">{t(locale, 'work.lines.none')}</span> : null}
      </div>

      <div className="wk-plot">
        <svg
          className="wk-chart"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={t(locale, 'work.lines.aria')}
          onPointerMove={(event) => {
            if (event.pointerType === 'touch') return
            const day = dayFrom(event)
            if (day != null) onPick(day)
          }}
          onPointerUp={(event) => {
            const day = dayFrom(event)
            if (day != null) onPick(day)
          }}
        >
          <rect className="wk-band-high" x={PAD_L} y={yAt(1)} width={plotW} height={yAt(0.9) - yAt(1)} />
          <rect className="wk-band-mid" x={PAD_L} y={yAt(0.9)} width={plotW} height={yAt(0.7) - yAt(0.9)} />
          <rect className="wk-band-low" x={PAD_L} y={yAt(0.7)} width={plotW} height={yAt(0) - yAt(0.7)} />
          {[0, 0.7, 0.9, 1].map((share) => {
            const y = yAt(share)
            const threshold = share === 0.7 || share === 0.9
            return (
              <g key={share}>
                <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} className={threshold ? 'wk-threshold' : 'wk-grid'} />
                <text x={PAD_L - 8} y={y + 4} className="wk-axis" textAnchor="end">{Math.round(share * 100)}%</text>
              </g>
            )
          })}
          {tracks.map((track, order) => track.on && track.unit.values.some((value) => value != null) ? (
            <path key={track.unit.key} d={linePath(track.unit.values, count)} pathLength={1} className="wk-line" style={{ stroke: track.color, ['--i' as string]: order }} />
          ) : null)}
          {overallOn && snapshot.overall.some((value) => value != null) ? (
            <path d={linePath(snapshot.overall, count)} pathLength={1} className="wk-line overall" style={{ ['--i' as string]: tracks.length }} />
          ) : null}
          {hasLine ? <line className="wk-cross" x1={xAt(index, count)} x2={xAt(index, count)} y1={PAD_T} y2={PAD_T + plotH} /> : null}
          {tracks.map((track) => {
            const value = track.on ? track.unit.values[index] : null
            if (value == null) return null
            return <circle key={track.unit.key} cx={xAt(index, count)} cy={yAt(value)} r={4} className="wk-node" style={{ fill: track.color }} />
          })}
          {overallOn && snapshot.overall[index] != null ? (
            <circle cx={xAt(index, count)} cy={yAt(snapshot.overall[index] as number)} r={4.5} className="wk-node overall" />
          ) : null}
          {marks.map((mark, order) => {
            const day = snapshot.days[mark]
            if (day == null || marks.indexOf(mark) !== order) return null
            const anchor = mark === 0 ? 'start' : mark === count - 1 ? 'end' : 'middle'
            const x = mark === 0 ? PAD_L : mark === count - 1 ? W - PAD_R : xAt(mark, count)
            return <text key={mark} x={x} y={H - 6} className="wk-axis" textAnchor={anchor}>{formatDay(day, locale, false)}</text>
          })}
          <rect className="wk-hit" x={PAD_L} y={PAD_T} width={plotW} height={plotH} />
          {!hasLine ? <text className="wk-empty" x={PAD_L + plotW / 2} y={PAD_T + plotH / 2} textAnchor="middle">{t(locale, 'work.lines.empty')}</text> : null}
        </svg>
      </div>
      <div className="wk-key">
        <span><i data-band="low" /> {t(locale, 'work.band.low')}</span>
        <span><i data-band="mid" /> {t(locale, 'work.band.mid')}</span>
        <span><i data-band="high" /> {t(locale, 'work.band.high')}</span>
      </div>
    </section>
  )
}
