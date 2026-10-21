import { useState } from 'react'
import { DOMAIN_COLOR, getSkill, SKILLS } from '../data/skills'
import { suggest } from '../engine/insights'
import {
  accuracyOf,
  attemptsIn,
  buckets,
  domainRows,
  missBreakdown,
  previousWindow,
  recentAttempts,
  skillRows,
  testsIn,
  timeSpent,
  activeDays,
  windowFor,
  type Bucket,
  type RangeDays,
  type SkillRow,
} from '../engine/analytics'
import { DOMAIN_ORDER, type Attempt, type DomainId, type Locale } from '../lib/types'
import { t, tx } from '../lib/i18n'
import { localeTag } from '../lib/math'
import { levelKey } from '../lib/levels'
import { useStore } from '../state'

const DAY_MS = 86400000
const RANGES: RangeDays[] = [7, 30, 90, 0]
const PAGE = 30
const W = 640
const H = 200
const PAD_L = 34
const PAD_R = 12
const PAD_T = 14
const PAD_B = 28

function clock(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function percent(value: number | null) {
  return value === null ? '–' : `${Math.round(value * 100)}%`
}

// Change against the previous period: points for accuracy, plain counts for questions and tests.
function Delta({ now, before, points = false }: { now: number | null; before: number | null; points?: boolean }) {
  if (now === null || before === null) return null
  const diff = points ? Math.round((now - before) * 100) : now - before
  if (diff === 0) return <span className="st-delta" data-dir="flat">— 0</span>
  return <span className="st-delta" data-dir={diff > 0 ? 'up' : 'down'}>{diff > 0 ? '▲' : '▼'} {Math.abs(diff)}{points ? ' pts' : ''}</span>
}

export function Stats() {
  const { locale, data, setRoute, requestStatsPrint } = useStore()
  const profile = data.profile
  const [range, setRange] = useState<RangeDays>(30)
  const [domain, setDomain] = useState<DomainId | 'all'>('all')
  const [shown, setShown] = useState(PAGE)
  if (!profile) return null
  if (!data.attempts.length && !data.tests.length) {
    return (
      <div>
        <h1>{t(locale, 'nav.stats')}</h1>
        <p className="muted">{t(locale, 'stats.empty')}</p>
        <button type="button" className="primary" onClick={() => setRoute({ name: 'practice' })}>{t(locale, 'home.practice')}</button>
      </div>
    )
  }

  const win = windowFor(range, data.attempts)
  const before = previousWindow(win)
  const scoped = domain === 'all' ? data.attempts : data.attempts.filter((item) => getSkill(item.skillId)?.domain === domain)
  const current = attemptsIn(scoped, win)
  const prior = attemptsIn(scoped, before)
  const series = buckets(current, win)
  const unit = t(locale, win.size === 1 ? 'stats.unit.day' : win.size === 7 ? 'stats.unit.week' : 'stats.unit.month')
  const accuracy = accuracyOf(current)
  const accuracyBefore = accuracyOf(prior)
  const tests = testsIn(data.tests, win)
  const testsBefore = testsIn(data.tests, before)
  const subjects = domainRows(data.attempts, win)
  const skills = skillRows(scoped, win)
  const strengths = skills.filter((row) => row.total >= 4 && row.accuracy !== null && row.accuracy >= 0.85).slice(0, 3)
  const growth = skills.filter((row) => row.total >= 3 && row.accuracy !== null && row.accuracy < 0.7).sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0)).slice(0, 3)
  const ideas = suggest(data.attempts, profile.grade).slice(0, 2)
  const mistakes = missBreakdown(current)
  const worstMiss = mistakes.kinds[0]?.count ?? 0
  const seen = recentAttempts(current)
  const presentDomains = DOMAIN_ORDER.filter((item) => data.attempts.some((attempt) => getSkill(attempt.skillId)?.domain === item))
  const dateLabel = (day: number) => new Intl.DateTimeFormat(localeTag(locale), { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(day * DAY_MS))
  const rangeLabel = (bucket: Bucket) => (bucket.days > 1 ? `${dateLabel(bucket.first)} – ${dateLabel(bucket.first + bucket.days - 1)}` : dateLabel(bucket.first))

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="kicker">{profile.name}</p>
          <h1>{t(locale, 'stats.report')}</h1>
        </div>
        <button type="button" className="ghost" onClick={() => requestStatsPrint()}>{t(locale, 'stats.print')}</button>
      </div>

      <div className="st-toolbar">
        <div className="segment" role="radiogroup" aria-label={t(locale, 'stats.range')}>
          {RANGES.map((option) => (
            <button key={option} type="button" role="radio" aria-checked={range === option} data-on={range === option} onClick={() => { setRange(option); setShown(PAGE) }}>
              {t(locale, `stats.range.${option}`)}
            </button>
          ))}
        </div>
        <div className="row" role="radiogroup" aria-label={t(locale, 'stats.subjects')}>
          <button type="button" className="chip" role="radio" aria-checked={domain === 'all'} data-on={domain === 'all'} onClick={() => setDomain('all')}>{t(locale, 'stats.subject.all')}</button>
          {presentDomains.map((item) => (
            <button key={item} type="button" className="chip" role="radio" aria-checked={domain === item} data-on={domain === item} onClick={() => setDomain(item)}>
              <i className="dot" style={{ background: DOMAIN_COLOR[item] }} /> {t(locale, `domain.${item}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="st-kpis">
        <article className="card st-kpi">
          <small>{t(locale, 'stats.kpi.questions')}</small>
          <b>{current.length}</b>
          <Delta now={current.length} before={prior.length} />
        </article>
        <article className="card st-kpi">
          <small>{t(locale, 'stats.accuracy')}</small>
          <b>{percent(accuracy)}</b>
          <Delta now={accuracy} before={accuracyBefore} points />
        </article>
        <article className="card st-kpi">
          <small>{t(locale, 'stats.kpi.days')}</small>
          <b>{activeDays(current)}<em> / {win.span}</em></b>
        </article>
        <article className="card st-kpi">
          <small>{t(locale, 'sum.time')}</small>
          <b>{clock(timeSpent(current))}</b>
        </article>
        <article className="card st-kpi">
          <small>{t(locale, 'stats.tests')}</small>
          <b>{tests.length}</b>
          <Delta now={tests.length} before={testsBefore.length} />
        </article>
      </div>

      <section className="card pad st-card">
        <div className="st-head">
          <h2>{t(locale, 'stats.practice.title')}</h2>
          <div className="st-legend">
            <span><i className="st-key correct" /> {t(locale, 'stats.legend.correct')}</span>
            <span><i className="st-key wrong" /> {t(locale, 'stats.legend.missed')}</span>
          </div>
        </div>
        <p className="fine">{t(locale, 'stats.practice.sub', { unit })}</p>
        {current.length ? (
          <div className="st-scroll">
            <svg className="st-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(locale, 'stats.practice.title')}>
              <PracticeBars series={series} max={Math.max(1, ...series.map((bucket) => bucket.total))} />
              <XLabels series={series} label={rangeLabel} />
            </svg>
          </div>
        ) : <p className="muted">{t(locale, 'stats.noData')}</p>}
      </section>

      <section className="card pad st-card">
        <div className="st-head">
          <h2>{t(locale, 'stats.accuracy.title')}</h2>
        </div>
        {series.some((bucket) => bucket.accuracy !== null) ? (
          <div className="st-scroll">
            <svg className="st-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(locale, 'stats.accuracy.title')}>
              <AccuracyLine series={series} />
              <XLabels series={series} label={rangeLabel} />
            </svg>
          </div>
        ) : <p className="muted">{t(locale, 'stats.noData')}</p>}
      </section>

      <div className="st-grid2">
        <section className="card pad st-card">
          <h2>{t(locale, 'stats.mistakes')}</h2>
          {mistakes.kinds.length ? (
            <div className="st-bars">
              {mistakes.kinds.map((item, index) => (
                <div key={item.kind} className="st-hrow" style={{ ['--i' as string]: index }}>
                  <span>{t(locale, `miss.${item.kind}`)}</span>
                  <div className="st-htrack"><i style={{ width: `${(item.count / worstMiss) * 100}%` }} /></div>
                  <b>{item.count}</b>
                </div>
              ))}
            </div>
          ) : <p className="muted">{t(locale, 'stats.mistakes.none')}</p>}
          {mistakes.unrecorded ? <p className="fine">{t(locale, 'stats.mistakes.unrecorded', { n: mistakes.unrecorded })}</p> : null}
        </section>

        <section className="card pad st-card">
          <h2>{t(locale, 'stats.subjects')}</h2>
          {subjects.length ? (
            <div className="st-subjects">
              {subjects.map((row) => (
                <button key={row.domain} type="button" className="st-subject" onClick={() => setDomain(row.domain)} data-on={domain === row.domain}>
                  <i className="dot" style={{ background: DOMAIN_COLOR[row.domain] }} />
                  <span>{t(locale, `domain.${row.domain}`)}</span>
                  <Spark series={row.series} color={DOMAIN_COLOR[row.domain]} />
                  <b>{percent(row.accuracy)}</b>
                  <Delta now={row.accuracy} before={row.previous} points />
                </button>
              ))}
            </div>
          ) : <p className="muted">{t(locale, 'stats.noData')}</p>}
        </section>
      </div>

      <div className="split" style={{ marginTop: 14 }}>
        <section className="card pad st-card">
          <h2>{t(locale, 'stats.strengths')}</h2>
          <SkillList rows={strengths} empty={t(locale, 'stats.none')} locale={locale} onOpen={(skillId) => setRoute({ name: 'play', skillId, auto: true, difficulty: 5 })} />
        </section>
        <section className="card pad st-card">
          <h2>{t(locale, 'stats.growth')}</h2>
          <SkillList rows={growth} empty={t(locale, 'stats.none')} locale={locale} onOpen={(skillId) => setRoute({ name: 'play', skillId, auto: true, difficulty: 2 })} />
        </section>
      </div>

      <section className="card pad st-card" style={{ marginTop: 14 }}>
        <h2>{t(locale, 'stats.skills')}</h2>
        {skills.length ? (
          <div className="st-table">
            <div className="st-tr st-th">
              <span>{t(locale, 'stats.col.skill')}</span>
              <span>{t(locale, 'stats.col.questions')}</span>
              <span>{t(locale, 'stats.accuracy')}</span>
              <span>{t(locale, 'stats.col.change')}</span>
              <span>{t(locale, 'stats.col.last')}</span>
            </div>
            {skills.map((row) => <SkillLine key={row.skillId} row={row} locale={locale} onOpen={() => setRoute({ name: 'play', skillId: row.skillId, auto: true, difficulty: 3 })} />)}
          </div>
        ) : <p className="muted">{t(locale, 'stats.noData')}</p>}
      </section>

      {ideas.length ? (
        <section style={{ marginTop: 14 }}>
          <h2>{t(locale, 'stats.next')}</h2>
          <div className="catalog">
            {ideas.map((idea) => {
              const skill = getSkill(idea.skillId)
              if (!skill) return null
              return (
                <button key={idea.skillId + idea.reason} type="button" className="skill-card" style={{ ['--wash' as string]: DOMAIN_COLOR[skill.domain] }} onClick={() => setRoute({ name: 'play', skillId: skill.id, auto: true, difficulty: idea.difficulty })}>
                  <small>{t(locale, `reason.${idea.reason}`)}</small>
                  <b>{tx(locale, skill.title)}</b>
                  <span>{t(locale, levelKey(idea.difficulty))}</span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="card pad st-card" style={{ marginTop: 14 }}>
        <div className="st-head">
          <h2>{t(locale, 'stats.seen.title')}</h2>
          <small className="fine">{t(locale, 'stats.seen.count', { shown: Math.min(shown, seen.length), total: seen.length })}</small>
        </div>
        {seen.length ? (
          <div className="st-seen">
            {seen.slice(0, shown).map((item) => <SeenRow key={item.id} item={item} locale={locale} />)}
            {shown < seen.length ? (
              <button type="button" className="ghost" onClick={() => setShown((count) => count + PAGE)}>{t(locale, 'stats.seen.more')}</button>
            ) : null}
          </div>
        ) : <p className="muted">{t(locale, 'stats.seen.none')}</p>}
      </section>

      <h2 style={{ marginTop: 16 }}>{t(locale, 'stats.tests')}</h2>
      {tests.length === 0 ? <p className="muted">{t(locale, 'stats.none')}</p> : null}
      <div className="stack">
        {[...tests].reverse().slice(0, 6).map((test) => {
          const scored = test.correct.filter(Boolean).length
          return (
            <button key={test.id} type="button" className="sum-row" onClick={() => setRoute({ name: 'summary', id: test.id })}>
              <span>{scored}/{test.questions.length}</span>
              <span>{tx(locale, test.blueprint.title) || t(locale, 'home.test')}</span>
              <small>{new Date(test.finishedAt).toLocaleDateString(localeTag(locale))}</small>
              <small>{clock(test.times.reduce((sum, item) => sum + item, 0))}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PracticeBars({ series, max }: { series: Bucket[]; max: number }) {
  const plotH = H - PAD_T - PAD_B
  const plotW = W - PAD_L - PAD_R
  const step = plotW / Math.max(1, series.length)
  const barW = Math.max(3, Math.min(34, step * 0.66))
  const base = PAD_T + plotH
  return (
    <g>
      {[0, 0.5, 1].map((share) => {
        const y = PAD_T + plotH * (1 - share)
        return (
          <g key={share}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} className="st-grid" />
            <text x={PAD_L - 6} y={y + 4} className="st-axis" textAnchor="end">{Math.round(max * share)}</text>
          </g>
        )
      })}
      {series.map((bucket, index) => {
        const x = PAD_L + index * step + (step - barW) / 2
        const correctH = (bucket.correct / max) * plotH
        const wrongH = (bucket.wrong / max) * plotH
        return (
          <g key={bucket.first} className="st-bar" style={{ ['--i' as string]: index }}>
            <rect className="st-correct" x={x} y={base - correctH} width={barW} height={correctH} />
            <rect className="st-wrong" x={x} y={base - correctH - wrongH} width={barW} height={wrongH} />
            <title>{`${bucket.correct} ✓ · ${bucket.wrong} ×`}</title>
          </g>
        )
      })}
    </g>
  )
}

function AccuracyLine({ series }: { series: Bucket[] }) {
  const plotH = H - PAD_T - PAD_B
  const plotW = W - PAD_L - PAD_R
  const step = plotW / Math.max(1, series.length)
  const points = series.map((bucket, index) => ({
    x: PAD_L + index * step + step / 2,
    y: bucket.accuracy === null ? null : PAD_T + plotH * (1 - bucket.accuracy),
    index,
  }))
  let path = ''
  let pen = false
  for (const point of points) {
    if (point.y === null) {
      pen = false
      continue
    }
    path += `${pen ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)} `
    pen = true
  }
  return (
    <g>
      {[0, 0.5, 1].map((share) => {
        const y = PAD_T + plotH * (1 - share)
        return (
          <g key={share}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} className="st-grid" />
            <text x={PAD_L - 6} y={y + 4} className="st-axis" textAnchor="end">{Math.round(share * 100)}%</text>
          </g>
        )
      })}
      <path d={path} pathLength={1} className="st-line" />
      {points.map((point) => point.y === null ? null : (
        <circle key={point.index} cx={point.x} cy={point.y} r={4} className="st-dot" style={{ ['--i' as string]: point.index }} />
      ))}
    </g>
  )
}

function XLabels({ series, label }: { series: Bucket[]; label: (bucket: Bucket) => string }) {
  const plotW = W - PAD_L - PAD_R
  const step = plotW / Math.max(1, series.length)
  const picks = [...new Set([0, Math.floor((series.length - 1) / 2), series.length - 1])]
  return (
    <g>
      {picks.map((index) => {
        const bucket = series[index]
        if (!bucket) return null
        const anchor = index === 0 ? 'start' : index === series.length - 1 ? 'end' : 'middle'
        const x = index === 0 ? PAD_L : index === series.length - 1 ? PAD_L + plotW : PAD_L + index * step + step / 2
        return <text key={index} x={x} y={H - 6} className="st-axis" textAnchor={anchor}>{label(bucket)}</text>
      })}
    </g>
  )
}

function Spark({ series, color }: { series: (number | null)[]; color: string }) {
  const w = 96
  const h = 28
  const step = w / Math.max(1, series.length - 1)
  let path = ''
  let pen = false
  series.forEach((value, index) => {
    if (value === null) {
      pen = false
      return
    }
    path += `${pen ? 'L' : 'M'}${(index * step).toFixed(1)} ${(h - 3 - value * (h - 6)).toFixed(1)} `
    pen = true
  })
  return (
    <svg className="st-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={path} pathLength={1} className="st-line thin" style={{ stroke: color }} />
    </svg>
  )
}

function SkillLine({ row, locale, onOpen }: { row: SkillRow; locale: Locale; onOpen: () => void }) {
  const skill = getSkill(row.skillId)
  if (!skill) return null
  const change = row.accuracy !== null && row.previous !== null ? Math.round((row.accuracy - row.previous) * 100) : null
  return (
    <button type="button" className="st-tr" onClick={onOpen}>
      <span className="st-skill">
        <i className="dot" style={{ background: DOMAIN_COLOR[skill.domain] }} />
        <span>{tx(locale, skill.title)}</span>
        <small>{skill.code}</small>
      </span>
      <span>{row.total}</span>
      <span><b>{percent(row.accuracy)}</b></span>
      <span>{change === null ? '–' : <span className="st-delta" data-dir={change === 0 ? 'flat' : change > 0 ? 'up' : 'down'}>{change === 0 ? '— 0' : `${change > 0 ? '▲' : '▼'} ${Math.abs(change)} pts`}</span>}</span>
      <span><small>{new Date(row.last).toLocaleDateString(localeTag(locale), { day: 'numeric', month: 'short' })}</small></span>
    </button>
  )
}

function SeenRow({ item, locale }: { item: Attempt; locale: Locale }) {
  const skill = getSkill(item.skillId)
  const when = new Date(item.at).toLocaleString(localeTag(locale), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const verdict = item.correct ? t(locale, 'stats.result.correct') : item.miss ? t(locale, `miss.${item.miss}`) : t(locale, 'stats.result.incorrect')
  return (
    <article className="st-seen-row" data-ok={item.correct}>
      <div className="st-seen-head">
        <span className="fine">{when}</span>
        {skill ? <small>{skill.code}</small> : null}
        <b className="st-verdict">{verdict}</b>
      </div>
      {item.prompt ? <p className="st-prompt">{item.prompt}</p> : skill ? <p className="st-prompt">{tx(locale, skill.title)}</p> : null}
      {!item.correct && item.given ? <p className="fine">{t(locale, 'stats.seen.given')}: <b>{item.given}</b></p> : null}
      {item.expected ? <p className="fine">{t(locale, 'stats.seen.expected')}: <b>{item.expected}</b></p> : null}
    </article>
  )
}

function SkillList({ rows, empty, locale, onOpen }: { rows: SkillRow[]; empty: string; locale: Locale; onOpen: (id: string) => void }) {
  if (!rows.length) return <p className="muted">{empty}</p>
  return (
    <div className="stack">
      {rows.map((row) => {
        const skill = SKILLS.find((item) => item.id === row.skillId)
        if (!skill) return null
        return (
          <button key={row.skillId} type="button" className="sum-row slim" onClick={() => onOpen(row.skillId)}>
            <i className="dot" style={{ background: DOMAIN_COLOR[skill.domain] }} />
            <span>{tx(locale, skill.title)}</span>
            <small>{skill.code}</small>
          </button>
        )
      })}
    </div>
  )
}
